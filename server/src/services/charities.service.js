import { prisma } from "../config/prisma.js";

export class CharityError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function listCharities({ search } = {}) {
  return prisma.charity.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });
}

export async function getFeaturedCharity() {
  return prisma.charity.findFirst({ where: { isFeatured: true }, orderBy: { createdAt: "asc" } });
}

export async function getCharityById(id) {
  const charity = await prisma.charity.findUnique({
    where: { id },
    include: { events: { orderBy: { eventDate: "asc" } } },
  });
  if (!charity) {
    throw new CharityError("Charity not found", 404);
  }
  return charity;
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getCharityStats(charityId) {
  const monthStart = startOfCurrentMonth();

  const [donationTotal, paymentTotal] = await Promise.all([
    prisma.donation.aggregate({
      where: { charityId, createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        subscription: { charityId },
        paidAt: { gte: monthStart },
        status: "SUCCEEDED",
      },
      _sum: { charityAmount: true },
    }),
  ]);

  const donations = Number(donationTotal._sum.amount || 0);
  const subscriptionShare = Number(paymentTotal._sum.charityAmount || 0);

  return { totalRaisedThisMonth: donations + subscriptionShare };
}

export async function createCharity({ name, description, imageUrl, isFeatured }) {
  return prisma.charity.create({
    data: { name, description, imageUrl: imageUrl || null, isFeatured: Boolean(isFeatured) },
  });
}

export async function updateCharity(id, { name, description, imageUrl, isFeatured }) {
  const existing = await prisma.charity.findUnique({ where: { id } });
  if (!existing) {
    throw new CharityError("Charity not found", 404);
  }
  return prisma.charity.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
    },
  });
}

export async function deleteCharity(id) {
  const existing = await prisma.charity.findUnique({ where: { id } });
  if (!existing) {
    throw new CharityError("Charity not found", 404);
  }
  const inUse = await prisma.subscription.findFirst({ where: { charityId: id } });
  if (inUse) {
    throw new CharityError("Cannot delete a charity with active or past subscriptions", 409);
  }
  await prisma.charity.delete({ where: { id } });
}
