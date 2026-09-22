import { prisma } from "../config/prisma.js";

export class EventError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createEvent(charityId, { title, description, eventDate, imageUrl }) {
  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity) {
    throw new EventError("Charity not found", 404);
  }
  return prisma.charityEvent.create({
    data: { charityId, title, description, eventDate: new Date(eventDate), imageUrl: imageUrl || null },
  });
}

export async function updateEvent(id, { title, description, eventDate, imageUrl }) {
  const existing = await prisma.charityEvent.findUnique({ where: { id } });
  if (!existing) {
    throw new EventError("Event not found", 404);
  }
  return prisma.charityEvent.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
  });
}

export async function deleteEvent(id) {
  const existing = await prisma.charityEvent.findUnique({ where: { id } });
  if (!existing) {
    throw new EventError("Event not found", 404);
  }
  await prisma.charityEvent.delete({ where: { id } });
}
