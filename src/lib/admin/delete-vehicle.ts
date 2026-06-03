import { prisma } from "@/lib/db/prisma";
import { deleteUpload } from "@/lib/storage/upload";

/**
 * Tear down a vehicle and every row that hangs off it. Shared by the per-id
 * DELETE route and the bulk-delete route so the cleanup can't drift.
 *
 * WHY THIS IS EXPLICIT AND NOT "just vehicle.delete()":
 * Almost every model that references Vehicle does so with a REQUIRED relation
 * and NO `onDelete: Cascade` (only VehicleSpec + VehicleFeature cascade). With
 * MongoDB, Prisma emulates referential integrity in the app layer and will
 * refuse `vehicle.delete()` while any required child still points at it
 * ("would violate the required relation ... between Consignment and Vehicle").
 * So we delete children first, in dependency order (leaves → root).
 *
 * Dependency tree (REQ = required FK that blocks deletion of its parent):
 *   Vehicle
 *   ├─ VehicleSpec, VehicleFeature            (cascade — deleted explicitly anyway)
 *   ├─ VehiclePriceHistory, VehicleStatusHistory, VehicleDamageItem,
 *   │  HpiCheck, VehicleWishlist, VehicleView, BuyerEnquiry   (REQ, direct leaves)
 *   ├─ ReconStage (REQ) ─→ ReconWorkItem (REQ)
 *   ├─ Deal (REQ) ─→ FinanceApplication (REQ), EscrowCondition (REQ), Payout (REQ)
 *   └─ Consignment (REQ) ─→ also parents ReconStage, Deal, Payout
 *   Polymorphic (no FK): MediaFile, Document  (matched by entityType+entityId)
 *   Optional FK: LotSlot.vehicleId            (nulled — slot is forecourt geometry)
 *               Lead.convertedTo{Vehicle,Consignment}Id (left dangling; history)
 *
 * The whole teardown runs in one interactive transaction so a mid-way failure
 * rolls back rather than leaving a half-deleted vehicle. Blob cleanup (photos +
 * PDFs) is best-effort and runs only AFTER the DB transaction commits.
 *
 * Returns the deleted vehicle's id + registration, or null if no vehicle with
 * that id exists.
 */
export async function deleteVehicleCascade(
  vehicleId: string
): Promise<{ id: string; registration: string } | null> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return null;

  // Gather child ids needed to delete second-order rows, plus the Blob URLs,
  // BEFORE we start deleting anything.
  const consignment = await prisma.consignment.findUnique({
    where: { vehicleId: vehicle.id },
    select: { id: true },
  });
  const deals = await prisma.deal.findMany({
    where: { vehicleId: vehicle.id },
    select: { id: true },
  });
  const reconStages = await prisma.reconStage.findMany({
    where: { vehicleId: vehicle.id },
    select: { id: true },
  });
  const dealIds = deals.map(d => d.id);
  const reconStageIds = reconStages.map(r => r.id);
  const consignmentIds = consignment ? [consignment.id] : [];

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

  await prisma.$transaction(async (tx) => {
    // ── Second-order leaves (children of Deal / ReconStage) ──
    if (reconStageIds.length) {
      await tx.reconWorkItem.deleteMany({ where: { reconStageId: { in: reconStageIds } } });
    }
    if (dealIds.length) {
      await tx.financeApplication.deleteMany({ where: { dealId: { in: dealIds } } });
      await tx.escrowCondition.deleteMany({ where: { dealId: { in: dealIds } } });
    }
    // Payout hangs off both Deal and Consignment — clear by either FK.
    if (dealIds.length || consignmentIds.length) {
      await tx.payout.deleteMany({
        where: {
          OR: [
            ...(dealIds.length ? [{ dealId: { in: dealIds } }] : []),
            ...(consignmentIds.length ? [{ consignmentId: { in: consignmentIds } }] : []),
          ],
        },
      });
    }

    // ── First-order children of Vehicle (and Consignment) ──
    await tx.reconStage.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.deal.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.consignment.deleteMany({ where: { vehicleId: vehicle.id } });

    await tx.hpiCheck.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.vehiclePriceHistory.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.vehicleStatusHistory.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.vehicleDamageItem.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.vehicleWishlist.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.vehicleView.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.buyerEnquiry.deleteMany({ where: { vehicleId: vehicle.id } });

    // These two cascade automatically, but deleting explicitly keeps the
    // teardown self-contained and order-independent.
    await tx.vehicleSpec.deleteMany({ where: { vehicleId: vehicle.id } });
    await tx.vehicleFeature.deleteMany({ where: { vehicleId: vehicle.id } });

    // Polymorphic media/docs (no FK — matched by entityType+entityId).
    await tx.mediaFile.deleteMany({ where: { entityType: "vehicle", entityId: vehicle.id } });
    await tx.document.deleteMany({ where: { entityType: "vehicle", entityId: vehicle.id } });

    // Optional FK — keep the slot, drop the link.
    await tx.lotSlot.updateMany({ where: { vehicleId: vehicle.id }, data: { vehicleId: null } });

    // Finally the vehicle itself — all required children are gone now.
    await tx.vehicle.delete({ where: { id: vehicle.id } });
  });

  // Best-effort Blob cleanup AFTER the DB commit. deleteUpload swallows its
  // own errors; the extra .catch is belt-and-braces so one bad URL can't
  // reject the batch.
  await Promise.all(blobUrls.map(url => deleteUpload(url).catch(() => {})));

  return { id: vehicle.id, registration: vehicle.registration };
}
