import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { segmentCarPhoto } from "@/lib/photoroom/segment";
import { compositeOnBackdrop } from "@/lib/photo-editor/composite";
import { saveUploadBuffer } from "@/lib/storage/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Segmentation is ~3–8s per image and the sharp composite is sub-second,
// so 16 photos fit comfortably under Vercel's 300s ceiling.
export const maxDuration = 300;

/**
 * Backdrop file lookup. Designers can drop the asset under any of these
 * extensions; first hit wins.
 */
const BACKDROP_CANDIDATES = ["png", "jpg", "jpeg", "webp"].map(ext =>
  path.join(process.cwd(), "public", "images", `iautomotive-backdrop.${ext}`)
);

async function loadBackdrop(): Promise<Buffer> {
  for (const candidate of BACKDROP_CANDIDATES) {
    try {
      return await readFile(candidate);
    } catch {
      // try next extension
    }
  }
  throw new Error(
    "Backdrop missing — drop a file at public/images/iautomotive-backdrop.{png,jpg,jpeg,webp}"
  );
}

/**
 * POST /api/admin/photos/replace-background
 *
 * Body: { mediaIds: string[] }
 *
 * Two-stage deterministic pipeline:
 *
 *   1. PhotoRoom segments the car out of the raw photo, returns a
 *      transparent PNG with a soft contact shadow baked in. The car's
 *      pixels are preserved byte-for-byte — no AI re-rendering.
 *
 *   2. sharp pastes the cutout onto the iAutoMotive Studio backdrop
 *      at a fixed position and scale (78% of canvas width, 4% from
 *      the bottom edge), producing a 1536×1024 PNG.
 *
 * Output is identical run-to-run for the same inputs — no model
 * temperature, no prompt drift, no colour shift on the bodywork.
 *
 * Raw URL is preserved on `originalCdnUrl` (only on first pass) so
 * Revert always rolls back to the unprocessed shot.
 */
export async function POST(req: NextRequest) {
  const guard = await requireRole(req, ["super-admin", "site-manager", "recon-tech"]);
  if (!guard.ok) return guard.response;

  let body: { mediaIds?: unknown };
  try { body = await req.json(); } catch { body = {}; }

  const ids = Array.isArray(body.mediaIds)
    ? body.mediaIds.filter((v): v is string => typeof v === "string")
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "mediaIds[] required" }, { status: 400 });
  }
  if (ids.length > 16) {
    return NextResponse.json({ error: "Process at most 16 photos per request" }, { status: 400 });
  }

  // Load backdrop once for the whole batch.
  let backdropBuffer: Buffer;
  try {
    backdropBuffer = await loadBackdrop();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load backdrop" },
      { status: 500 }
    );
  }

  const rows = await prisma.mediaFile.findMany({
    where: { id: { in: ids } },
    select: { id: true, cdnUrl: true, originalCdnUrl: true, entityId: true, mimeType: true },
  });
  const byId = new Map(rows.map(r => [r.id, r]));

  // Sequential — PhotoRoom's free tier doesn't tolerate parallel calls
  // and the wall-clock cost is fine for batch sizes this small.
  const results: { id: string; ok: boolean; cdnUrl?: string; error?: string }[] = [];
  for (const id of ids) {
    const row = byId.get(id);
    if (!row) {
      results.push({ id, ok: false, error: "MediaFile not found" });
      continue;
    }
    // Always reprocess from the raw upload. originalCdnUrl is set on the
    // first pass, so subsequent runs reach the same source bytes.
    const sourceUrl = row.originalCdnUrl ?? row.cdnUrl;
    if (!sourceUrl) {
      results.push({ id, ok: false, error: "No source URL" });
      continue;
    }

    try {
      // Stage 1: segment the car out (PhotoRoom). For absolute URLs we
      // pass the URL so PhotoRoom can fetch directly; for local
      // /uploads/* paths we read the file and pass the buffer (PhotoRoom
      // can't reach localhost).
      const cutout = sourceUrl.startsWith("http")
        ? await segmentCarPhoto({ url: sourceUrl })
        : await segmentCarPhoto({
            buffer: await readFile(path.join(process.cwd(), "public", sourceUrl)),
          });

      // Stage 2: paste cutout onto backdrop at fixed position + scale
      // (deterministic, no AI). Result is the canvas size from
      // composite.ts (1536×1024 PNG).
      const out = await compositeOnBackdrop(cutout.buffer, backdropBuffer);

      const token = crypto.randomBytes(8).toString("hex");
      const key = `vehicles/composited/${row.entityId}/${token}.png`;
      const newUrl = await saveUploadBuffer(out.buffer, key, out.mimeType);

      await prisma.mediaFile.update({
        where: { id },
        data: {
          cdnUrl: newUrl,
          storageKey: newUrl,
          mimeType: out.mimeType,
          // First pass — preserve the raw upload URL so Revert works.
          originalCdnUrl: row.originalCdnUrl ?? row.cdnUrl,
        },
      });
      results.push({ id, ok: true, cdnUrl: newUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown processing error";
      console.error(`[replace-background ${id}]`, msg);
      results.push({ id, ok: false, error: msg });
    }
  }

  const okCount = results.filter(r => r.ok).length;
  return NextResponse.json({
    ok: okCount > 0,
    processed: okCount,
    total: ids.length,
    results,
  }, { status: okCount === 0 ? 502 : 200 });
}
