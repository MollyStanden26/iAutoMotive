import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";
import { saveUpload, deleteUpload } from "@/lib/storage/upload";

export const dynamic = "force-dynamic";

/**
 * Signed-contract upload for a deal. The PDF is stored as a Document
 * (entityType=deal, documentType=consignment_agreement, isCurrent=true) and the
 * deal's documentsSignedAt is stamped.
 *
 * POST accepts two shapes (mirrors the vehicle intake):
 *   • application/json  { url, name, size } — file already streamed straight to
 *     Vercel Blob from the client (prod path, avoids the 4.5 MB function cap).
 *   • multipart/form-data with a `file` field — dev fallback; saved via saveUpload.
 *
 * DELETE removes the current signed contract.
 */

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const DOC_TYPE = "consignment_agreement" as const;

async function loadOwnedDeal(id: string, guard: { user: { id: string; role: string } }) {
  const deal = await prisma.deal.findUnique({ where: { id }, select: { id: true, assignedTo: true } });
  if (!deal) return { error: NextResponse.json({ error: "Deal not found" }, { status: 404 }) };
  if (guard.user.role === "sales" && deal.assignedTo !== guard.user.id) {
    return { error: NextResponse.json({ error: "Not your deal" }, { status: 403 }) };
  }
  return { deal };
}

function randomHex(bytes = 8): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  const owned = await loadOwnedDeal(params.id, guard);
  if (owned.error) return owned.error;

  let cdnUrl: string;
  let storageKey: string | null = null;
  let title: string;
  let fileSizeBytes: number | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      // Direct-to-Blob path — the client already uploaded; we just record it.
      const body = (await request.json()) as { url?: string; name?: string; size?: number };
      if (!body.url || !/^https?:\/\//.test(body.url)) {
        return NextResponse.json({ error: "Missing upload url" }, { status: 400 });
      }
      cdnUrl = body.url;
      title = (body.name || "Signed contract.pdf").slice(0, 200);
      fileSizeBytes = typeof body.size === "number" ? body.size : null;
    } else if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Contract must be a PDF" }, { status: 400 });
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: "PDF exceeds 8 MB" }, { status: 400 });
      }
      storageKey = `contracts/${params.id}/${randomHex()}.pdf`;
      cdnUrl = await saveUpload(file, storageKey);
      title = (file.name || "Signed contract.pdf").slice(0, 200);
      fileSizeBytes = file.size;
    } else {
      return NextResponse.json({ error: "Expected multipart/form-data or application/json" }, { status: 415 });
    }
  } catch (e) {
    console.error("[POST deal contract]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Supersede any previous signed contract for this deal.
  const prev = await prisma.document.findFirst({
    where: { entityType: "deal", entityId: params.id, documentType: DOC_TYPE, isCurrent: true },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  await prisma.document.updateMany({
    where: { entityType: "deal", entityId: params.id, documentType: DOC_TYPE, isCurrent: true },
    data: { isCurrent: false },
  });

  const now = new Date();
  const doc = await prisma.document.create({
    data: {
      entityType: "deal",
      entityId: params.id,
      documentType: DOC_TYPE,
      title,
      cdnUrl,
      storageKey,
      fileSizeBytes,
      version: (prev?.version ?? 0) + 1,
      isCurrent: true,
      signedBySellerAt: now,
      uploadedBy: guard.user.id,
    },
  });

  await prisma.deal.update({ where: { id: params.id }, data: { documentsSignedAt: now } });

  return NextResponse.json({
    ok: true,
    contract: { url: doc.cdnUrl, name: doc.title, sizeBytes: doc.fileSizeBytes, uploadedAt: doc.createdAt.toISOString() },
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  const owned = await loadOwnedDeal(params.id, guard);
  if (owned.error) return owned.error;

  const doc = await prisma.document.findFirst({
    where: { entityType: "deal", entityId: params.id, documentType: DOC_TYPE, isCurrent: true },
    orderBy: { version: "desc" },
  });
  if (doc) {
    if (doc.cdnUrl) await deleteUpload(doc.cdnUrl);
    await prisma.document.delete({ where: { id: doc.id } });
  }
  await prisma.deal.update({ where: { id: params.id }, data: { documentsSignedAt: null } });

  return NextResponse.json({ ok: true });
}
