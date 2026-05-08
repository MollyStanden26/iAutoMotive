import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { replaceBackground } from "@/lib/photoroom/client";
import { saveUploadBuffer } from "@/lib/storage/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// PhotoRoom can take 5–15s per image and the admin can batch up to 8 in a
// single click — bump the request timeout above Next's default.
export const maxDuration = 300;

/**
 * POST /api/admin/photos/replace-background
 *
 * Body: { mediaIds: string[], background?: { color?, url? } }
 *
 * For each MediaFile id, fetch the original photo (or use the absolute URL
 * directly), pass it through PhotoRoom, persist the result to Vercel Blob,
 * and update the row so cdnUrl points at the processed image. The original
 * URL is preserved on `originalCdnUrl` (only on first pass — re-running
 * doesn't clobber it) so the photo-editor UI can offer a "Revert" action.
 *
 * Returns one row per id with { ok, error?, cdnUrl? } so the UI can mark
 * partial successes when a few images fail.
 */
export async function POST(req: NextRequest) {
  // Photo editing is gated to roles that already have the "photo-editor"
  // RBAC permission (super-admin, site-manager, recon-tech).
  const guard = await requireRole(req, ["super-admin", "site-manager", "recon-tech"]);
  if (!guard.ok) return guard.response;

  let body: { mediaIds?: unknown; background?: { color?: string; url?: string } };
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

  const rows = await prisma.mediaFile.findMany({
    where: { id: { in: ids } },
    select: { id: true, cdnUrl: true, originalCdnUrl: true, entityId: true, mimeType: true },
  });
  const byId = new Map(rows.map(r => [r.id, r]));

  // Process sequentially. PhotoRoom's free tier has a low concurrent-request
  // ceiling and we'd rather take the wall-clock hit than have half the
  // batch fail with rate-limit errors.
  const results: { id: string; ok: boolean; cdnUrl?: string; error?: string }[] = [];
  for (const id of ids) {
    const row = byId.get(id);
    if (!row) {
      results.push({ id, ok: false, error: "MediaFile not found" });
      continue;
    }
    // Always reprocess from the original raw upload. If we've already been
    // through PhotoRoom once, originalCdnUrl is set; otherwise cdnUrl IS
    // the original.
    const sourceUrl = row.originalCdnUrl ?? row.cdnUrl;
    if (!sourceUrl) {
      results.push({ id, ok: false, error: "No source URL" });
      continue;
    }

    try {
      // PhotoRoom can fetch by URL only when the URL is publicly reachable.
      // Local /uploads/* paths aren't, so download and pass the buffer in
      // those cases.
      let sourceBuffer: Buffer | undefined;
      let absoluteUrl: string | undefined;
      if (sourceUrl.startsWith("http")) {
        absoluteUrl = sourceUrl;
      } else {
        // Local path during dev — read from public/.
        const path = await import("node:path");
        const fs = await import("node:fs/promises");
        const fullPath = path.join(process.cwd(), "public", sourceUrl);
        sourceBuffer = await fs.readFile(fullPath);
      }

      const out = await replaceBackground({
        sourceUrl: absoluteUrl,
        sourceBuffer,
        background: body.background,
      });

      const ext = out.mimeType.includes("jpeg") ? "jpg" : "png";
      const token = crypto.randomBytes(8).toString("hex");
      const key = `vehicles/processed/${row.entityId}/${token}.${ext}`;
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
      results.push({
        id, ok: false,
        error: err instanceof Error ? err.message : "Unknown PhotoRoom error",
      });
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
