/**
 * One-shot DB rename: Lot 1 — Birmingham → Lot 1 — Beaumont House (Banbury).
 *
 * The Lots row was seeded with the old Birmingham facility details.
 * Settings UI defaults + scraper getOrCreateLot now point at Beaumont
 * House; this script aligns the existing row in the production DB so
 * vehicles/consignments already pointing at it surface the new address
 * everywhere.
 *
 * Idempotent — if the row is already Beaumont House, it's a no-op.
 *
 * Run from worktree root:
 *   node --env-file=.env scripts/rename-lot1-to-beaumont.mjs
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BIRMINGHAM_MATCHERS = [
  { name: { contains: "Birmingham", mode: "insensitive" } },
  { city: { equals: "Birmingham", mode: "insensitive" } },
];

const NEW = {
  name: "Lot 1 — Beaumont House",
  addressLine1: "310 Beaumont House, Beaumont Road",
  city: "Banbury",
  postcode: "OX16 1RH",
  capacityVehicles: 60,
};

const matches = await prisma.lot.findMany({ where: { OR: BIRMINGHAM_MATCHERS } });
console.log(`Found ${matches.length} candidate lot row(s).`);
for (const m of matches) {
  console.log(`  ${m.id}  ${m.name}  (${m.city}, ${m.postcode})`);
}

let updated = 0;
for (const m of matches) {
  await prisma.lot.update({ where: { id: m.id }, data: NEW });
  updated++;
}

console.log(`Updated ${updated} row(s) to:`, NEW);
await prisma.$disconnect();
