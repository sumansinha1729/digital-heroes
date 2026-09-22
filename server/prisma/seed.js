import { prisma } from "../src/config/prisma.js";

const CHARITIES = [
  {
    name: "Greenfield Youth Trust",
    description:
      "Funds free golf coaching, equipment, and course access for young players from low-income families across India.",
    isFeatured: true,
  },
  {
    name: "Fairway Futures Foundation",
    description:
      "Supports junior golf scholarships and mentorship programs for promising amateur players.",
    isFeatured: false,
  },
  {
    name: "Open Greens Initiative",
    description:
      "Works to make golf courses and driving ranges accessible to people with disabilities.",
    isFeatured: false,
  },
  {
    name: "Caddie Careers Program",
    description:
      "Provides vocational training and career pathways for caddies and golf course groundstaff.",
    isFeatured: false,
  },
];

async function main() {
  let created = 0;
  for (const charity of CHARITIES) {
    const existing = await prisma.charity.findFirst({ where: { name: charity.name } });
    if (existing) continue;
    await prisma.charity.create({ data: charity });
    created++;
  }
  console.log(`Seeded ${created} new charities (${CHARITIES.length - created} already existed).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
