/**
 * Bulk-runs every raw vehicle photo through the photo editor pipeline:
 *   1. PhotoRoom segments the car (transparent PNG with soft shadow)
 *   2. sharp pastes onto the iAutoMotive Studio backdrop at fixed
 *      position + scale (composite.ts knobs)
 *   3. Result lands on Vercel Blob; cdnUrl + storageKey on the
 *      MediaFile row update; raw URL preserved on originalCdnUrl
 *
 * "Raw" = MediaFile rows with originalCdnUrl=null (never been through
 * the pipeline). Already-processed rows are skipped — re-run is fast
 * because there's nothing to do.
 *
 * Run from worktree root:
 *   node --env-file=.env scripts/process-all-raw-photos.mjs
 *
 * Sequential (PhotoRoom rate limits don't tolerate parallelism).
 * ~3–8s per photo via PhotoRoom + ~0.5s sharp + ~0.5s Blob upload.
 */

import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const prisma = new PrismaClient();

// Match the API route's behaviour by reading the same backdrop file the
// admin page uses, in the same priority order.
const BACKDROP_CANDIDATES = ["png", "jpg", "jpeg", "webp"].map(ext =>
  path.join(process.cwd(), "public", "images", `iautomotive-backdrop.${ext}`)
);

// Same constants as src/lib/photo-editor/composite.ts. Inlined so this
// script doesn't need a TS build step. If you tune the route's knobs,
// update these here too (or refactor both onto a shared helper).
const TARGET_WIDTH = 1600;
const CAR_WIDTH_RATIO = 0.78;
const BOTTOM_MARGIN_RATIO = 0.04;

async function loadBackdrop() {
  for (const candidate of BACKDROP_CANDIDATES) {
    try { return await readFile(candidate); } catch { /* next */ }
  }
  throw new Error("Backdrop not found in public/images/iautomotive-backdrop.{png,jpg,jpeg,webp}");
}

async function segmentWithPhotoRoom(input) {
  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) throw new Error("PHOTOROOM_API_KEY missing in env");
  const form = new FormData();
  if (input.buffer) {
    form.append("imageFile", new Blob([new Uint8Array(input.buffer)], { type: "image/png" }), "car.png");
  } else if (input.url) {
    form.append("imageUrl", input.url);
  } else {
    throw new Error("segmentWithPhotoRoom: pass buffer or url");
  }
  form.append("background.color", "transparent");
  form.append("shadow.mode", "ai.soft");
  form.append("outputSize", "originalImage");

  const res = await fetch("https://image-api.photoroom.com/v2/edit", {
    method: "POST",
    headers: { "x-api-key": apiKey, Accept: "image/png" },
    body: form,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`PhotoRoom ${res.status}: ${t.slice(0, 200) || res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function compositeOnBackdrop(cutoutBuffer, backdropBuffer) {
  const bdMeta = await sharp(backdropBuffer).metadata();
  const bdWidth = bdMeta.width ?? TARGET_WIDTH;
  const bdHeight = bdMeta.height ?? Math.round(TARGET_WIDTH * 0.625);
  const aspect = bdWidth / bdHeight;
  const canvasWidth = Math.min(bdWidth, TARGET_WIDTH);
  const canvasHeight = Math.round(canvasWidth / aspect);

  const backdrop = await sharp(backdropBuffer).resize(canvasWidth, canvasHeight, { fit: "fill" }).toBuffer();
  const targetCarWidth = Math.round(canvasWidth * CAR_WIDTH_RATIO);
  const car = await sharp(cutoutBuffer).resize({ width: targetCarWidth }).toBuffer();
  const carMeta = await sharp(car).metadata();
  const carWidth = carMeta.width ?? targetCarWidth;
  const carHeight = carMeta.height ?? targetCarWidth;
  const left = Math.max(0, Math.round((canvasWidth - carWidth) / 2));
  const bottomMargin = Math.round(canvasHeight * BOTTOM_MARGIN_RATIO);
  const top = Math.max(0, canvasHeight - carHeight - bottomMargin);
  return sharp(backdrop)
    .composite([{ input: car, top, left }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function loadCarBytes(cdnUrl) {
  if (cdnUrl.startsWith("http")) {
    const res = await fetch(cdnUrl);
    if (!res.ok) throw new Error(`Source fetch ${res.status}: ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  }
  return readFile(path.join(process.cwd(), "public", cdnUrl));
}

const stats = { processed: 0, skipped: 0, failed: 0 };

console.log("Loading backdrop…");
const backdropBuffer = await loadBackdrop();
console.log(`Backdrop loaded (${backdropBuffer.length} bytes)`);

console.log("Querying raw MediaFile rows…");
const rows = await prisma.mediaFile.findMany({
  where: { entityType: "vehicle", originalCdnUrl: null },
  select: { id: true, cdnUrl: true, entityId: true, isPrimary: true },
  orderBy: [{ entityId: "asc" }, { sortOrder: "asc" }],
});
console.log(`${rows.length} raw photos to process.\n`);

for (const [i, row] of rows.entries()) {
  const label = `[${i + 1}/${rows.length} ${row.id}${row.isPrimary ? " (HERO)" : ""}]`;
  if (!row.cdnUrl) { console.log(`${label} skip — no cdnUrl`); stats.skipped++; continue; }

  try {
    const carBytes = await loadCarBytes(row.cdnUrl);
    const cutout = await segmentWithPhotoRoom(
      row.cdnUrl.startsWith("http") ? { url: row.cdnUrl } : { buffer: carBytes }
    );
    const composited = await compositeOnBackdrop(cutout, backdropBuffer);

    const token = crypto.randomBytes(8).toString("hex");
    const key = `vehicles/composited/${row.entityId}/${token}.png`;
    const blob = await put(key, composited, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/png",
    });

    await prisma.mediaFile.update({
      where: { id: row.id },
      data: {
        cdnUrl: blob.url,
        storageKey: blob.url,
        mimeType: "image/png",
        originalCdnUrl: row.cdnUrl, // first-pass — preserve raw for Revert
      },
    });
    stats.processed++;
    console.log(`${label} ✓`);
  } catch (err) {
    stats.failed++;
    console.error(`${label} ✗ ${err?.message ?? err}`);
  }
}

console.log("\nDone.", stats);
await prisma.$disconnect();
