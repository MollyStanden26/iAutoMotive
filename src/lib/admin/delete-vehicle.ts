import { prisma } from "@/lib/db/prisma";
import { deleteUpload } from "@/lib/storage/upload";

/**
 * Tear down a vehicle and its directly-attached rows. Shared by the per-id
 * DELETE route and the bulk-delete route so the cleanup logic can't drift
 * between the two.
 *
 *  • MediaFile and Document are polymorphic (entityType + entityId, no FK)
 *    so they're deleted explicitly.
 *  • LotSlot.vehicleId is nulled out — the slot is forecourt geometry that
 *    outlives any one car.
 *  • Consignment, Deal, ConsignmentFeature are removed by Prisma's
 *    `onDelete: Cascade` when the Vehicle row is deleted.
 *  • Blob cleanup (photos + PDFs) is best-effort and runs *after* the DB
 *    delete commits. The DB row is the source of truth; a stale Blob beats
 *    a 500 that leaves the vehicle half-deleted.
 *
 * Returns the deleted vehicle's id + registration, or null if no vehicle
 * with that id exists (so callers can report "not found" without throwing).
 */
export async function deleteVehicleCascade(
  vehicleId: string
): Promise<{ id: string; registration: string } | null> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return null;

  // Collect Blob URLs BEFORE deleting their DB rows.
  const media = await prisma.mediaFile.findMany({
    where: { entityType: "vehicle", entityId: vehicle.id },
    select: { cdnUrl: true },
  });
  const docs = await prisma.document.findMany({
    where: { entityType: "vehicle", entityId: vehicle.id },
    select: { cdnUrl: true },
  });
  const blobUrls = [...media, ...docs]
    .map(r => r.cdnUrl)
    .filter((u): u is string => typeof u === "string" && u.length > 0);

  await prisma.mediaFile.deleteMany({
    where: { entityType: "vehicle", entityId: vehicle.id },
  });
  await prisma.document.deleteMany({
    where: { entityType: "vehicle", entityId: vehicle.id },
  });
  await prisma.lotSlot.updateMany({
    where: { vehicleId: vehicle.id },
    data: { vehicleId: null },
  });
  await prisma.vehicle.delete({ where: { id: vehicle.id } });

  // Best-effort Blob cleanup. deleteUpload swallows its own errors; the
  // extra .catch is belt-and-braces so one bad URL can't reject the batch.
  await Promise.all(blobUrls.map(url => deleteUpload(url).catch(() => {})));

  return { id: vehicle.id, registration: vehicle.registration };
}
