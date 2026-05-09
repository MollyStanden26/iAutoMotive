import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { compositeCarOnBackdrop } from "@/lib/openai/refine-car-photo";
import { saveUploadBuffer } from "@/lib/storage/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// gpt-image-1 high-quality is 20–30s per image and the admin can batch up
// to 16 in a single click — worst case ~8 minutes. The 300s ceiling here
// is Vercel's hard cap for a serverless function.
export const maxDuration = 300;

/**
 * Backdrop file lookup. Designers can drop the asset under any of these
 * extensions; first hit wins. Same convention used since the PhotoRoom
 * era so swapping designs is still a single-file change.
 */
const BACKDROP_CANDIDATES = ["png", "jpg", "jpeg", "webp"].map(ext =>
  path.join(process.cwd(), "public", "images", `iautomotive-backdrop.${ext}`)
);

async function loadBackdrop(): Promise<{ buffer: Buffer; filename: string }> {
  for (const candidate of BACKDROP_CANDIDATES) {
    try {
      const buffer = await readFile(candidate);
      return { buffer, filename: path.basename(candidate) };
    } catch {
      // try next extension
    }
  }
  throw new Error(
    "Backdrop missing — drop a file at public/images/iautomotive-backdrop.{png,jpg,jpeg,webp}"
  );
}

/**
 * Fetch the raw car bytes for a MediaFile row. Handles both Vercel Blob
 * URLs (prod) and local /uploads/* paths (dev).
 */
async function loadCarPhoto(sourceUrl: string): Promise<Buffer> {
  if (sourceUrl.startsWith("http")) {
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`Source fetch ${res.status}: ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  }
  const fullPath = path.join(process.cwd(), "public", sourceUrl);
  return readFile(fullPath);
}

/**
 * POST /api/admin/photos/replace-background
 *
 * Body: { mediaIds: string[] }
 *
 * Single-pass GPT compositor: for each MediaFile id, fetch the original
 * raw photo, load the iAutoMotive Studio backdrop from disk, hand both
 * to gpt-image-1's multi-image edit endpoint with a fixed prompt asking
 * it to place the car in the studio with floor contact + matched
 * lighting + brand mark preserved, and persist the resulting PNG.
 *
 * Raw URL is preserved on `originalCdnUrl` (only on first pass) so the
 * editor's "Revert" button can roll back to the unprocessed shot.
 *
 * Returns one row per id with { ok, error?, cdnUrl? } so the UI can
 * surface partial successes when individual photos fail.
 */
export async function POST(req: NextRequest) {
  // Photo editing is gated to roles that already have the "photo-editor"
  // RBAC permission (super-admin, site-manager, recon-tech).
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

  // Read the backdrop once for the whole batch — same bytes go to every
  // photo in this run, no point re-reading per id.
  let backdrop: { buffer: Buffer; filename: string };
  try {
    backdrop = await loadBackdrop();
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

  // Sequential — gpt-image-1's rate limits don't tolerate parallel requests
  // on most accounts, and we'd rather take the wall-clock hit than half
  // the batch failing.
  const results: { id: string; ok: boolean; cdnUrl?: string; error?: string }[] = [];
  for (const id of ids) {
    const row = byId.get(id);
    if (!row) {
      results.push({ id, ok: false, error: "MediaFile not found" });
      continue;
    }
    // Always reprocess from the original raw upload. If we've been through
    // the pipeline once, originalCdnUrl is the raw; otherwise cdnUrl IS
    // the raw.
    const sourceUrl = row.originalCdnUrl ?? row.cdnUrl;
    if (!sourceUrl) {
      results.push({ id, ok: false, error: "No source URL" });
      continue;
    }

    try {
      const carBuffer = await loadCarPhoto(sourceUrl);
      const out = await compositeCarOnBackdrop(carBuffer, backdrop.buffer, backdrop.filename);

      const ext = out.mimeType.includes("jpeg") ? "jpg" : "png";
      const token = crypto.randomBytes(8).toString("hex");
      const key = `vehicles/composited/${row.entityId}/${token}.${ext}`;
      const newUrl = await saveUploadBuffer(out.buffer, key, out.mimeType);

      await prisma.mediaFile.update({
        where: { id },
        data: {
          cdnUrl: newUrl,
          storageKey: newUrl,
          mimeType: out.mimeType,
          // First pass — preserve the raw upload URL. Subsequent passes
          // keep the same originalCdnUrl so revert always lands on raw.
          originalCdnUrl: row.originalCdnUrl ?? row.cdnUrl,
        },
      });
      results.push({ id, ok: true, cdnUrl: newUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown OpenAI error";
      // Log so future param-shape mishaps surface in dev/Vercel logs without
      // a manual probe — the page only sees the summary status.
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
