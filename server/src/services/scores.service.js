import { prisma } from "../config/prisma.js";
import { enterDrawIfEligible } from "./draws.service.js";

const RECENT_SCORES_LIMIT = 5;

export class ScoreError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function listRecentScores(userId) {
  return prisma.score.findMany({
    where: { userId },
    orderBy: { scoreDate: "desc" },
    take: RECENT_SCORES_LIMIT,
  });
}

export async function createScore(userId, { scoreValue, scoreDate }) {
  let score;
  try {
    score = await prisma.score.create({
      data: { userId, scoreValue, scoreDate: new Date(scoreDate) },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new ScoreError("A score already exists for this date — edit or delete it instead", 409);
    }
    throw err;
  }

  // Per D15/D16: this is a no-op unless an admin has already created a DRAFT draw whose
  // period covers today. A score always saves successfully regardless of draw entry outcome.
  await enterDrawIfEligible(userId);

  return score;
}

async function getOwnedScore(userId, scoreId) {
  const score = await prisma.score.findUnique({ where: { id: scoreId } });
  if (!score || score.userId !== userId) {
    throw new ScoreError("Score not found", 404);
  }
  return score;
}

export async function updateScore(userId, scoreId, { scoreValue, scoreDate }) {
  await getOwnedScore(userId, scoreId);

  try {
    return await prisma.score.update({
      where: { id: scoreId },
      data: { scoreValue, scoreDate: new Date(scoreDate) },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new ScoreError("A score already exists for this date — edit or delete it instead", 409);
    }
    throw err;
  }
}

export async function deleteScore(userId, scoreId) {
  await getOwnedScore(userId, scoreId);
  await prisma.score.delete({ where: { id: scoreId } });
}
