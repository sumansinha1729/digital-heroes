import { prisma } from "../config/prisma.js";

export class DrawError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const NUMBERS_PER_ENTRY = 5;
const NUMBER_MIN = 1;
const NUMBER_MAX = 45;

function generateUniqueRandomNumbers(count, min, max) {
  const pool = [];
  for (let n = min; n <= max; n++) pool.push(n);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

// Called after a score is successfully saved. If a DRAFT draw exists whose period covers
// today, and this user doesn't already have an entry in it, creates one with 5 random unique
// numbers (1-45). Silent no-op otherwise — most score submissions won't hit either condition,
// and that's normal, not an error (see D15/D16).
export async function enterDrawIfEligible(userId) {
  const now = new Date();
  const draft = await prisma.draw.findFirst({
    where: { status: "DRAFT", periodStart: { lte: now }, periodEnd: { gte: now } },
  });
  if (!draft) return null;

  const existingEntry = await prisma.drawEntry.findUnique({
    where: { drawId_userId: { drawId: draft.id, userId } },
  });
  if (existingEntry) return existingEntry;

  const numbers = generateUniqueRandomNumbers(NUMBERS_PER_ENTRY, NUMBER_MIN, NUMBER_MAX);

  try {
    return await prisma.drawEntry.create({
      data: { drawId: draft.id, userId, numbers },
    });
  } catch (err) {
    if (err.code === "P2002") {
      // Same race shape as D21: another concurrent score submission already created the entry.
      return prisma.drawEntry.findUniqueOrThrow({
        where: { drawId_userId: { drawId: draft.id, userId } },
      });
    }
    throw err;
  }
}

export async function getMyUpcomingEntry(userId) {
  const now = new Date();
  const draw = await prisma.draw.findFirst({
    where: { status: { in: ["DRAFT", "SIMULATED"] }, periodStart: { lte: now }, periodEnd: { gte: now } },
  });
  if (!draw) return { draw: null, entry: null };

  const entry = await prisma.drawEntry.findUnique({
    where: { drawId_userId: { drawId: draw.id, userId } },
  });
  return { draw, entry };
}

export async function listDraws() {
  return prisma.draw.findMany({ orderBy: { drawMonth: "desc" } });
}

export async function getDrawById(id) {
  const draw = await prisma.draw.findUnique({ where: { id } });
  if (!draw) {
    throw new DrawError("Draw not found", 404);
  }
  return draw;
}

// D23: rollover only flows from the most recently PUBLISHED draw's unclaimed 5-match pool.
async function computeJackpotRolloverIn() {
  const lastPublished = await prisma.draw.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
  if (!lastPublished) return 0;

  const fiveMatchWinnerCount = await prisma.drawWinner.count({
    where: { drawId: lastPublished.id, matchTier: "FIVE_MATCH" },
  });
  if (fiveMatchWinnerCount > 0) return 0;

  return Number(lastPublished.poolFiveMatch) + Number(lastPublished.jackpotRolloverIn);
}

const POOL_SHARE = { FIVE_MATCH: 0.4, FOUR_MATCH: 0.35, THREE_MATCH: 0.25 };
const MIN_MATCHES_TO_WIN = 3;

function countMatches(entryNumbers, winningNumbers) {
  const winningSet = new Set(winningNumbers);
  return entryNumbers.filter((n) => winningSet.has(n)).length;
}

function tierForMatchCount(matchCount) {
  if (matchCount === 5) return "FIVE_MATCH";
  if (matchCount === 4) return "FOUR_MATCH";
  if (matchCount === 3) return "THREE_MATCH";
  return null;
}

function roundToPaise(amount) {
  return Math.round(amount * 100) / 100;
}

// Sums Payment.poolAmount for SUCCEEDED payments within the draw's period, then splits it into
// the three tier pools per the fixed 40/35/25 share. The 5-match tier additionally carries in
// whatever jackpotRolloverIn was computed when this draw was created (D23).
async function computeTierPools(draw) {
  const paymentTotal = await prisma.payment.aggregate({
    where: {
      status: "SUCCEEDED",
      paidAt: { gte: draw.periodStart, lte: draw.periodEnd },
    },
    _sum: { poolAmount: true },
  });
  const periodPool = Number(paymentTotal._sum.poolAmount || 0);

  return {
    poolFiveMatch: roundToPaise(periodPool * POOL_SHARE.FIVE_MATCH + Number(draw.jackpotRolloverIn)),
    poolFourMatch: roundToPaise(periodPool * POOL_SHARE.FOUR_MATCH),
    poolThreeMatch: roundToPaise(periodPool * POOL_SHARE.THREE_MATCH),
  };
}

// Groups this draw's entries by match tier against a given set of winning numbers. Returns both
// a summary (used by simulate's preview and by publish to build DrawWinner rows) and the raw
// per-user winners list.
async function computeTierResults(drawId, winningNumbers) {
  const entries = await prisma.drawEntry.findMany({ where: { drawId } });

  const winnersByTier = { FIVE_MATCH: [], FOUR_MATCH: [], THREE_MATCH: [] };
  for (const entry of entries) {
    const matchCount = countMatches(entry.numbers, winningNumbers);
    const tier = tierForMatchCount(matchCount);
    if (tier) winnersByTier[tier].push(entry);
  }
  return winnersByTier;
}

function buildPreview(winnersByTier, tierPools) {
  const tiers = ["FIVE_MATCH", "FOUR_MATCH", "THREE_MATCH"];
  const poolByTier = {
    FIVE_MATCH: tierPools.poolFiveMatch,
    FOUR_MATCH: tierPools.poolFourMatch,
    THREE_MATCH: tierPools.poolThreeMatch,
  };

  return tiers.map((tier) => {
    const winnerCount = winnersByTier[tier].length;
    const pool = poolByTier[tier];
    const prizePerWinner = winnerCount > 0 ? roundToPaise(pool / winnerCount) : 0;
    return { tier, winnerCount, poolAmount: pool, prizePerWinner };
  });
}

export async function simulateDraw(id) {
  const draw = await getDrawById(id);
  if (draw.status === "PUBLISHED") {
    throw new DrawError("This draw has already been published", 409);
  }

  const winningNumbers = generateUniqueRandomNumbers(NUMBERS_PER_ENTRY, NUMBER_MIN, NUMBER_MAX);
  const tierPools = await computeTierPools(draw);
  const winnersByTier = await computeTierResults(id, winningNumbers);
  const preview = buildPreview(winnersByTier, tierPools);

  const updatedDraw = await prisma.draw.update({
    where: { id },
    data: {
      status: "SIMULATED",
      winningNumbers,
      poolFiveMatch: tierPools.poolFiveMatch,
      poolFourMatch: tierPools.poolFourMatch,
      poolThreeMatch: tierPools.poolThreeMatch,
      simulatedAt: new Date(),
    },
  });

  return { draw: updatedDraw, preview };
}

export async function publishDraw(id) {
  const draw = await getDrawById(id);
  if (draw.status !== "SIMULATED") {
    throw new DrawError("A draw must be simulated before it can be published", 400);
  }
  if (!draw.winningNumbers || draw.winningNumbers.length === 0) {
    throw new DrawError("This draw has no simulated winning numbers", 400);
  }

  const winnersByTier = await computeTierResults(id, draw.winningNumbers);
  const tierPools = {
    poolFiveMatch: Number(draw.poolFiveMatch),
    poolFourMatch: Number(draw.poolFourMatch),
    poolThreeMatch: Number(draw.poolThreeMatch),
  };
  const poolByTier = {
    FIVE_MATCH: tierPools.poolFiveMatch,
    FOUR_MATCH: tierPools.poolFourMatch,
    THREE_MATCH: tierPools.poolThreeMatch,
  };

  return prisma.$transaction(async (tx) => {
    const stillSimulated = await tx.draw.findUnique({ where: { id } });
    if (!stillSimulated || stillSimulated.status !== "SIMULATED") {
      throw new DrawError("This draw is no longer awaiting publish", 409);
    }

    for (const tier of ["FIVE_MATCH", "FOUR_MATCH", "THREE_MATCH"]) {
      const winners = winnersByTier[tier];
      if (winners.length === 0) continue;

      const prizePerWinner = roundToPaise(poolByTier[tier] / winners.length);
      for (const entry of winners) {
        await tx.drawWinner.create({
          data: {
            drawId: id,
            userId: entry.userId,
            matchTier: tier,
            prizeAmount: prizePerWinner,
            verificationStatus: "PENDING",
            payoutStatus: "PENDING",
          },
        });
      }
    }

    return tx.draw.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  });
}

export async function createDraw({ drawMonth, periodStart, periodEnd, logicType }) {
  if (logicType && logicType !== "RANDOM") {
    throw new DrawError("Only RANDOM draw logic is supported in this release", 400);
  }

  const jackpotRolloverIn = await computeJackpotRolloverIn();

  try {
    return await prisma.draw.create({
      data: {
        drawMonth: new Date(drawMonth),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        logicType: "RANDOM",
        status: "DRAFT",
        jackpotRolloverIn,
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new DrawError("A draw already exists for this month", 409);
    }
    throw err;
  }
}
