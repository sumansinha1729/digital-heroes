import { prisma } from "../config/prisma.js";

export class UserError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function listUsers({ search } = {}) {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { fullName: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserDetail(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      scores: { orderBy: { scoreDate: "desc" }, take: 5 },
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { charity: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!user) {
    throw new UserError("User not found", 404);
  }
  return user;
}

export async function updateUser(id, { fullName, role }) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new UserError("User not found", 404);
  }
  if (role && role !== "SUBSCRIBER" && role !== "ADMIN") {
    throw new UserError("role must be SUBSCRIBER or ADMIN", 400);
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(role !== undefined && { role }),
    },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });
}

export async function updateUserSubscription(userId, { status, charityId, charityPercentage }) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (!subscription) {
    throw new UserError("This user has no active subscription", 404);
  }

  return prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      ...(status !== undefined && { status }),
      ...(charityId !== undefined && { charityId }),
      ...(charityPercentage !== undefined && { charityPercentage }),
    },
  });
}
