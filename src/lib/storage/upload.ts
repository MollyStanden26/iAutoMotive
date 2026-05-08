import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { put, del } from "@vercel/blob";

/**
 * File-storage abstraction with two backends:
 *
 *  • **Vercel Blob** when `BLOB_READ_WRITE_TOKEN` is set — required in
 *    production. Vercel's serverless filesystem isn't writable across
 *    deploys, so any photo or PDF written to public/uploads/ disappears
 *    on the next push. Vercel Blob persists, returns a public CDN URL,
 *    and is region-replicated.
 *
 *  • **Local filesystem** as a dev fallback — keeps `npm run dev` working
 *    without any cloud setup. Files land in public/uploads/<key>.
 *
 * Each endpoint (vehicle photos, consignment PDFs, seller-portal photos)
 * calls saveUpload() with a stable storage key; the returned URL is what
 * goes into Prisma. deleteUpload() handles the inverse for either backend.
 *
 * To enable Blob in production:
 *   1. Vercel dashboard → Storage → Create → Blob
 *   2. Connect to the project (auto-injects BLOB_READ_WRITE_TOKEN)
 *   3. Redeploy — no code changes required
 */

function isBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Save a single file. The key is the storage path (e.g.
 * `vehicles/abc123/front_34.jpg`) and is used verbatim by both backends.
 *
 * Returns a public URL — for Blob this is `https://*.public.blob.vercel-storage.com/<key>`,
 * for the filesystem fallback this is `/uploads/<key>` (Next.js serves
 * `public/` at the root).
 */
export async function saveUpload(file: File, key: string): Promise<string> {
  if (isBlobEnabled()) {
    // `addRandomSuffix: false` keeps URLs predictable per key; callers are
    // expected to make their keys unique (we already use random tokens).
    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "application/octet-stream",
    });
    return blob.url;
  }

  // Local filesystem fallback — same layout as before this helper existed.
  const fullPath = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${key}`;
}

/**
 * Save raw bytes (e.g. a Buffer from `arrayBuffer()`). Same return contract
 * as saveUpload(). Used by routes that have already read the body.
 */
export async function saveUploadBuffer(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<string> {
  if (isBlobEnabled()) {
    const blob = await put(key, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: mimeType,
    });
    return blob.url;
  }
  const fullPath = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
  return `/uploads/${key}`;
}

/**
 * Best-effort delete. Accepts the URL that saveUpload() returned and routes
 * to the right backend. Failures are swallowed because the DB row is the
 * source of truth — a stale file is preferable to a 500 from the API.
 */
export async function deleteUpload(url: string): Promise<void> {
  try {
    if (url.startsWith("http")) {
      // Vercel Blob URL — the SDK accepts the full URL directly.
      await del(url);
      return;
    }
    if (url.startsWith("/uploads/")) {
      const fullPath = path.join(process.cwd(), "public", url);
      await unlink(fullPath);
    }
  } catch {
    // intentionally silent — see jsdoc above
  }
}
