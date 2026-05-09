/**
 * One-shot migration: every MediaFile / Document / SellerProfile row whose
 * cdnUrl (or equivalent) starts with /uploads/ refers to a file that lives
 * only on the dev machine's filesystem. Production Vercel can never serve
 * those — its filesystem is ephemeral. This script reads each file from
 * local public/uploads/, uploads it to Vercel Blob, and rewrites the DB
 * row to point at the Blob URL.
 *
 * Run from the worktree root with:
 *   node --env-file=.env --env-file=.env.production scripts/migrate-uploads-to-blob.mjs
 *
 * Idempotent — already-migrated rows (cdnUrl starts with `https://`) are
 * skipped.
 */

import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

const PUBLIC_DIR = path.join(process.cwd(), "public");

let stats = { mediaOk: 0, mediaSkipped: 0, mediaMissing: 0, docOk: 0, docSkipped: 0, docMissing: 0, sellerOk: 0, sellerSkipped: 0 };

/** Upload one local file to Blob and return the public URL. Throws if the
 *  file isn't on disk. The Blob key reuses the upload sub-path so we don't
 *  re-collide tokens. */
async function uploadOne(uploadsRelativePath) {
  // /uploads/vehicles/abc/x.jpg  →  vehicles/abc/x.jpg
  const key = uploadsRelativePath.replace(/^\/?uploads\/?/, "");
  const fullPath = path.join(PUBLIC_DIR, "uploads", key);
  const bytes = await readFile(fullPath);
  const blob = await put(key, bytes, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true, // re-running the migration is fine; same key, same bytes
    contentType: guessMime(key),
  });
  return blob.url;
}

function guessMime(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ({
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp",
    ".pdf": "application/pdf",
  })[ext] ?? "application/octet-stream";
}

async function migrateMedia() {
  const rows = await prisma.mediaFile.findMany({
    where: { OR: [{ cdnUrl: { startsWith: "/uploads/" } }, { storageKey: { startsWith: "/uploads/" } }] },
    select: { id: true, cdnUrl: true, storageKey: true, originalCdnUrl: true },
  });
  console.log(`MediaFile: ${rows.length} candidates`);
  for (const row of rows) {
    try {
      const newCdn = row.cdnUrl?.startsWith("/uploads/") ? await uploadOne(row.cdnUrl) : row.cdnUrl;
      const newKey = row.storageKey?.startsWith("/uploads/") ? await uploadOne(row.storageKey) : row.storageKey;
      const newOriginal = row.originalCdnUrl?.startsWith("/uploads/")
        ? await uploadOne(row.originalCdnUrl).catch(() => row.originalCdnUrl) // missing originals shouldn't block the row
        : row.originalCdnUrl;
      await prisma.mediaFile.update({
        where: { id: row.id },
        data: { cdnUrl: newCdn, storageKey: newKey, originalCdnUrl: newOriginal },
      });
      stats.mediaOk++;
      process.stdout.write(".");
    } catch (err) {
      if (err?.code === "ENOENT") { stats.mediaMissing++; process.stdout.write("?"); }
      else { stats.mediaSkipped++; process.stdout.write("!"); console.error(`\n  ${row.id}:`, err?.message ?? err); }
    }
  }
  process.stdout.write("\n");
}

async function migrateDocuments() {
  const rows = await prisma.document.findMany({
    where: { OR: [{ cdnUrl: { startsWith: "/uploads/" } }, { storageKey: { startsWith: "/uploads/" } }] },
    select: { id: true, cdnUrl: true, storageKey: true },
  });
  console.log(`Document: ${rows.length} candidates`);
  for (const row of rows) {
    try {
      const newCdn = row.cdnUrl?.startsWith("/uploads/") ? await uploadOne(row.cdnUrl) : row.cdnUrl;
      const newKey = row.storageKey?.startsWith("/uploads/") ? await uploadOne(row.storageKey) : row.storageKey;
      await prisma.document.update({
        where: { id: row.id },
        data: { cdnUrl: newCdn, storageKey: newKey },
      });
      stats.docOk++;
      process.stdout.write(".");
    } catch (err) {
      if (err?.code === "ENOENT") { stats.docMissing++; process.stdout.write("?"); }
      else { stats.docSkipped++; process.stdout.write("!"); console.error(`\n  ${row.id}:`, err?.message ?? err); }
    }
  }
  process.stdout.write("\n");
}

async function migrateSellerProfiles() {
  const rows = await prisma.sellerProfile.findMany({
    where: { consignmentAgreementUrl: { startsWith: "/uploads/" } },
    select: { id: true, consignmentAgreementUrl: true },
  });
  console.log(`SellerProfile: ${rows.length} candidates`);
  for (const row of rows) {
    try {
      const url = row.consignmentAgreementUrl;
      const newUrl = await uploadOne(url);
      await prisma.sellerProfile.update({
        where: { id: row.id },
        data: { consignmentAgreementUrl: newUrl },
      });
      stats.sellerOk++;
      process.stdout.write(".");
    } catch (err) {
      stats.sellerSkipped++;
      process.stdout.write("!");
      console.error(`\n  ${row.id}:`, err?.message ?? err);
    }
  }
  process.stdout.write("\n");
}

console.log("Starting upload-to-blob migration. BLOB token detected:", !!process.env.BLOB_READ_WRITE_TOKEN);

await migrateMedia();
await migrateDocuments();
await migrateSellerProfiles();

console.log("\nDone.", stats);
await prisma.$disconnect();
