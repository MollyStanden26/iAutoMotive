import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/photos — list every vehicle that has at least one photo,
 * grouped with its MediaFile rows. Drives the /admin/photo-editor screen:
 *   - ?vehicleId=… returns just that one vehicle's photos
 *   - no param returns the full inventory list (most-recently-listed first)
 */
export async function GET(req: NextRequest) {
  const guard = await requireRole(req, ["super-admin", "site-manager", "recon-tech"]);
  if (!guard.ok) return guard.response;

  const vehicleId = req.nextUrl.searchParams.get("vehicleId");

  if (vehicleId) {
    const v = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { mediaFiles: { orderBy: { sortOrder: "asc" } } },
    });
    if (!v) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    return NextResponse.json({
      vehicle: {
        id: v.id, registration: v.registration, year: v.year,
        make: v.make, model: v.model, trim: v.trim,
        photos: v.mediaFiles.map(m => ({
          id: m.id,
          cdnUrl: m.cdnUrl,
          originalCdnUrl: m.originalCdnUrl,
          isPrimary: m.isPrimary,
          isProcessed: !!m.originalCdnUrl,
          sortOrder: m.sortOrder ?? 0,
          mimeType: m.mimeType,
        })),
      },
    });
  }

  // List inventory with photo counts. Limit to 200 — the editor isn't a
  // browse surface, just a workspace to pick from.
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { mediaFiles: { select: { id: true, isPrimary: true, originalCdnUrl: true, cdnUrl: true } } },
  });

  return NextResponse.json({
    vehicles: vehicles.map(v => {
      const primary = v.mediaFiles.find(m => m.isPrimary) ?? v.mediaFiles[0];
      const total = v.mediaFiles.length;
      const processed = v.mediaFiles.filter(m => m.originalCdnUrl).length;
      return {
        id: v.id,
        registration: v.registration,
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim,
        photoCount: total,
        processedCount: processed,
        rawCount: total - processed,
        primaryCdnUrl: primary?.cdnUrl ?? null,
      };
    }),
  });
}
