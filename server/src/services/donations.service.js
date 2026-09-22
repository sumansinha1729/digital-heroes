import { prisma } from "../config/prisma.js";

export class DonationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createDonation(userId, { charityId, amount }) {
  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity) {
    throw new DonationError("Charity not found", 404);
  }

  return prisma.donation.create({
    data: { userId, charityId, amount },
  });
}
