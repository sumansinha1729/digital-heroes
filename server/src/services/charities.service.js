import { prisma } from "../config/prisma.js";

export async function listCharities() {
  return prisma.charity.findMany({ orderBy: [{ isFeatured: "desc" }, { name: "asc" }] });
}
