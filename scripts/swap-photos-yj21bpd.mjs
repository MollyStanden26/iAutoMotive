/**
 * One-shot: swap four already-composited photos on a specific vehicle
 * for the four PNGs the user dropped in tmp-replace/{1,2,3,4}.png.
 *
 * Old blob URLs (current MediaFile.cdnUrl values) are matched by their
 * filename hash. New PNGs go to fresh blob keys; MediaFile.cdnUrl +
 * storageKey are updated in place; old blobs are deleted last so the
 * DB always points at a real object.
 *
 * Run from worktree root:
 *   node --env-file=.env scripts/swap-photos-yj21bpd.mjs
 */

import { PrismaClient } from "@prisma/client";
import { put, del } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const prisma = new PrismaClient();

const VEHICLE_ID = "6a0432a4c4ee8f65802c4192";

// Map: tmp-replace filename → old blob hash (last segment of the URL).
// Order = the order the user selected the four images in chat.
const SWAPS = [
  { newFile: "1.png", oldHash: "94137ccdb731ab7b" },
  { newFile: "2.png", oldHash: "19ad81674f041baf" },
  { newFile: "3.png", oldHash: "fff2d0013f9b6698" },
  { newFile: "4.png", oldHash: "0e226941dce10c2e" },
];

const TMP_DIR = path.join(process.cwd(), "tmp-replace");

let ok = 0, miss = 0, fail = 0;

for (const { newFile, oldHash } of SWAPS) {
  try {
    const row = await prisma.mediaFile.findFirst({
      where: {
        entityType: "vehicle",
        entityId: VEHICLE_ID,
        cdnUrl: { contains: oldHash },
      },
    });
    if (!row) {
      console.warn(`✗ no MediaFile found for hash ${oldHash}`);
      miss++;
      continue;
    }
    console.log(`→ ${oldHash}  →  MediaFile ${row.id}${row.isPrimary ? " (HERO)" : ""}`);

    const newBytes = await readFile(path.join(TMP_DIR, newFile));
    const token = crypto.randomBytes(8).toString("hex");
    const newKey = `vehicles/composited/${VEHICLE_ID}/${token}.png`;
    const blob = await put(newKey, newBytes, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/png",
    });

    const oldUrl = row.cdnUrl;
    await prisma.mediaFile.update({
      where: { id: row.id },
      data: {
        cdnUrl: blob.url,
        storageKey: blob.url,
        mimeType: "image/png",
        fileSizeBytes: newBytes.length,
        // Reset originalCdnUrl so the photo editor doesn't offer to
        // "Revert" back to the now-replaced previous shot.
        originalCdnUrl: null,
      },
    });

    // Best-effort delete of the old blob so storage doesn't bloat.
    try { await del(oldUrl); } catch (e) { /* tolerated */ }

    console.log(`  ↑ uploaded ${newFile} → ${blob.url}`);
    ok++;
  } catch (err) {
    console.error(`✗ swap ${newFile} failed:`, err?.message ?? err);
    fail++;
  }
}

console.log(`\nDone — ok=${ok} miss=${miss} fail=${fail}`);
await prisma.$disconnect();
