import { prisma } from "../config/prisma.js";

export async function getReports() {
  const [totalUsers, poolAggregate, charities, subscriptionCharityTotals, donationTotals, publishedDraws] =
    await Promise.all([
      prisma.user.count(),
      prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { poolAmount: true } }),
      prisma.charity.findMany({ select: { id: true, name: true } }),
      prisma.payment.groupBy({
        by: ["subscriptionId"],
        where: { status: "SUCCEEDED" },
        _sum: { charityAmount: true },
      }),
      prisma.donation.groupBy({ by: ["charityId"], _sum: { amount: true } }),
      prisma.draw.findMany({
        where: { status: "PUBLISHED" },
        select: { drawMonth: true, poolFiveMatch: true, poolFourMatch: true, poolThreeMatch: true },
        orderBy: { drawMonth: "asc" },
      }),
    ]);

  // subscriptionCharityTotals is grouped by subscriptionId, but we need it grouped by charityId —
  // resolve each subscription's charity in one query, then fold the sums together in JS.
  const subscriptionIds = subscriptionCharityTotals.map((row) => row.subscriptionId);
  const subscriptions = await prisma.subscription.findMany({
    where: { id: { in: subscriptionIds } },
    select: { id: true, charityId: true },
  });
  const charityIdBySubscriptionId = new Map(subscriptions.map((s) => [s.id, s.charityId]));

  const charitySubscriptionTotal = new Map();
  for (const row of subscriptionCharityTotals) {
    const charityId = charityIdBySubscriptionId.get(row.subscriptionId);
    if (!charityId) continue;
    const current = charitySubscriptionTotal.get(charityId) || 0;
    charitySubscriptionTotal.set(charityId, current + Number(row._sum.charityAmount || 0));
  }

  const donationByCharity = new Map(
    donationTotals.map((row) => [row.charityId, Number(row._sum.amount || 0)])
  );

  const charityContributions = charities
    .map((charity) => ({
      charityName: charity.name,
      total: (charitySubscriptionTotal.get(charity.id) || 0) + (donationByCharity.get(charity.id) || 0),
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    totalUsers,
    totalPrizePool: Number(poolAggregate._sum.poolAmount || 0),
    charityContributions,
    drawStatistics: publishedDraws.map((d) => ({
      drawMonth: d.drawMonth,
      total: Number(d.poolFiveMatch) + Number(d.poolFourMatch) + Number(d.poolThreeMatch),
    })),
  };
}
