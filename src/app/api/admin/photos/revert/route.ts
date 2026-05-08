import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/photos/revert — body: { mediaIds: string[] }
 *
 * Restores each row's cdnUrl to the originalCdnUrl snapshot taken on the
 * first PhotoRoom pass, then clears originalCdnUrl. Lets photo editors
 * undo a background-replacement run when the result looks worse than the
 * raw shot, without having to re-upload anything.
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

  const rows = await prisma.mediaFile.findMany({
    where: { id: { in: ids }, originalCdnUrl: { not: null } },
    select: { id: true, originalCdnUrl: true },
  });

  for (const r of rows) {
    if (!r.originalCdnUrl) continue;
    await prisma.mediaFile.update({
      where: { id: r.id },
      data: {
        cdnUrl: r.originalCdnUrl,
        storageKey: r.originalCdnUrl,
        originalCdnUrl: null,
      },
    });
  }

  return NextResponse.json({ ok: true, reverted: rows.length });
}
