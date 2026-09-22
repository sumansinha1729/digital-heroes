import { prisma } from "../config/prisma.js";
import { uploadWinnerProof, getSignedProofUrl } from "./storage.service.js";

export class WinnerError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function attachSignedProofUrl(winner) {
  if (!winner.proofUrl) return winner;
  const signedUrl = await getSignedProofUrl(winner.proofUrl);
  return { ...winner, proofUrl: signedUrl };
}

export async function getMyWinners(userId) {
  const winners = await prisma.drawWinner.findMany({
    where: { userId },
    include: { draw: { select: { drawMonth: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(winners.map(attachSignedProofUrl));
}

async function getOwnedWinner(userId, winnerId) {
  const winner = await prisma.drawWinner.findUnique({ where: { id: winnerId } });
  if (!winner || winner.userId !== userId) {
    throw new WinnerError("Winner record not found", 404);
  }
  return winner;
}

export async function submitProof(userId, winnerId, file) {
  const winner = await getOwnedWinner(userId, winnerId);

  if (winner.verificationStatus === "APPROVED") {
    throw new WinnerError("This win has already been approved", 409);
  }

  const path = await uploadWinnerProof(winnerId, file);

  return prisma.drawWinner.update({
    where: { id: winnerId },
    data: { proofUrl: path, verificationStatus: "PENDING" },
  });
}

export async function listAdminWinners({ status } = {}) {
  const winners = await prisma.drawWinner.findMany({
    where: status ? { verificationStatus: status } : undefined,
    include: {
      user: { select: { fullName: true, email: true } },
      draw: { select: { drawMonth: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(winners.map(attachSignedProofUrl));
}

async function getWinnerOrThrow(winnerId) {
  const winner = await prisma.drawWinner.findUnique({ where: { id: winnerId } });
  if (!winner) {
    throw new WinnerError("Winner record not found", 404);
  }
  return winner;
}

export async function approveWinner(adminId, winnerId) {
  const winner = await getWinnerOrThrow(winnerId);
  if (!winner.proofUrl) {
    throw new WinnerError("This winner has not submitted proof yet", 400);
  }

  return prisma.drawWinner.update({
    where: { id: winnerId },
    data: {
      verificationStatus: "APPROVED",
      reviewedByAdminId: adminId,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
  });
}

export async function rejectWinner(adminId, winnerId, reason) {
  await getWinnerOrThrow(winnerId);

  return prisma.drawWinner.update({
    where: { id: winnerId },
    data: {
      verificationStatus: "REJECTED",
      reviewedByAdminId: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    },
  });
}

export async function markWinnerPaid(winnerId) {
  const winner = await getWinnerOrThrow(winnerId);
  if (winner.verificationStatus !== "APPROVED") {
    throw new WinnerError("Only approved winners can be marked as paid", 400);
  }

  return prisma.drawWinner.update({
    where: { id: winnerId },
    data: { payoutStatus: "PAID" },
  });
}
