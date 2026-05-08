import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/sellers/[id]/photos — upload one or more photos for the
 * seller's active vehicle. Files are stored under /public/uploads/vehicles/
 * (same convention as the AddVehicle drawer) and a MediaFile row is created
 * per file.
 *
 * Multipart body: photos[] (one or many files).
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { sellerProfile: true },
    });
    if (!user || user.role !== "seller" || !user.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }
    const consignment = await prisma.consignment.findFirst({
      where: { sellerId: user.sellerProfile.id },
      orderBy: { createdAt: "desc" },
      include: { vehicle: true },
    });
    if (!consignment?.vehicle) {
      return NextResponse.json({ error: "Seller has no vehicle to attach photos to" }, { status: 400 });
    }

    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }
    const form = await req.formData();
    const files = form.getAll("photos").filter((v): v is File => v instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No photos uploaded" }, { status: 400 });
    }

    const token = crypto.randomBytes(8).toString("hex");
    const baseDir = path.join(process.cwd(), "public", "uploads", "vehicles", token);
    await mkdir(baseDir, { recursive: true });

    // Continue sortOrder past existing photos so new ones append.
    const existing = await prisma.mediaFile.count({
      where: { entityType: "vehicle", entityId: consignment.vehicle.id },
    });

    const created: { id: string; url: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const filename = `seller-${i}.${ext}`;
      const fullPath = path.join(baseDir, filename);
      await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));
      const url = `/uploads/vehicles/${token}/${filename}`;

      const row = await prisma.mediaFile.create({
        data: {
          entityType: "vehicle",
          entityId: consignment.vehicle.id,
          category: "exterior_front_34",
          cdnUrl: url,
          storageKey: url,
          mimeType: file.type || "image/jpeg",
          fileSizeBytes: file.size,
          isPrimary: existing === 0 && i === 0,
          sortOrder: existing + i,
        },
      });
      created.push({ id: row.id, url });
    }

    return NextResponse.json({ ok: true, created });
  } catch (error) {
    console.error("[POST /api/admin/sellers/:id/photos]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/sellers/[id]/photos?mediaId=… — remove one photo from
 * the seller's vehicle. Re-promotes another photo to primary if the deleted
 * one was the primary, so the seller's gallery never ends up with nothing
 * marked.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  try {
    const mediaId = req.nextUrl.searchParams.get("mediaId");
    if (!mediaId) return NextResponse.json({ error: "mediaId required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { sellerProfile: true },
    });
    if (!user || user.role !== "seller" || !user.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }
    const consignment = await prisma.consignment.findFirst({
      where: { sellerId: user.sellerProfile.id },
      orderBy: { createdAt: "desc" },
    });
    if (!consignment?.vehicleId) {
      return NextResponse.json({ error: "Seller has no vehicle" }, { status: 400 });
    }

    const media = await prisma.mediaFile.findUnique({ where: { id: mediaId } });
    if (!media || media.entityType !== "vehicle" || media.entityId !== consignment.vehicleId) {
      return NextResponse.json({ error: "Photo not found for this seller" }, { status: 404 });
    }

    await prisma.mediaFile.delete({ where: { id: mediaId } });

    if (media.cdnUrl?.startsWith("/uploads/")) {
      try {
        await unlink(path.join(process.cwd(), "public", media.cdnUrl));
      } catch {
        // File already gone or never written — DB row is what matters.
      }
    }

    if (media.isPrimary) {
      const next = await prisma.mediaFile.findFirst({
        where: { entityType: "vehicle", entityId: consignment.vehicleId },
        orderBy: { sortOrder: "asc" },
      });
      if (next) {
        await prisma.mediaFile.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/sellers/:id/photos]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/sellers/[id]/photos — set a photo as the primary. Body:
 * { mediaId }. Clears `isPrimary` from all other photos on the same vehicle.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  try {
    const body = await req.json().catch(() => ({}));
    const mediaId = typeof body.mediaId === "string" ? body.mediaId : null;
    if (!mediaId) return NextResponse.json({ error: "mediaId required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { sellerProfile: true },
    });
    if (!user || user.role !== "seller" || !user.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }
    const consignment = await prisma.consignment.findFirst({
      where: { sellerId: user.sellerProfile.id },
      orderBy: { createdAt: "desc" },
    });
    if (!consignment?.vehicleId) {
      return NextResponse.json({ error: "Seller has no vehicle" }, { status: 400 });
    }

    const media = await prisma.mediaFile.findUnique({ where: { id: mediaId } });
    if (!media || media.entityType !== "vehicle" || media.entityId !== consignment.vehicleId) {
      return NextResponse.json({ error: "Photo not found for this seller" }, { status: 404 });
    }

    await prisma.mediaFile.updateMany({
      where: { entityType: "vehicle", entityId: consignment.vehicleId, isPrimary: true },
      data: { isPrimary: false },
    });
    await prisma.mediaFile.update({ where: { id: mediaId }, data: { isPrimary: true } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/admin/sellers/:id/photos]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
