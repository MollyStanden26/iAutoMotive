import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/me — everything the seller portal needs to render.
 *
 * Returns the signed-in seller's profile, their latest Consignment with the
 * cost-breakdown fields admin/support can edit, the live Vehicle (including
 * the `currentStage` that drives the "Where your car is right now" stepper),
 * the photos to render in the gallery + financial estimator, the price
 * history rows for the /seller/vehicle Price History card, the buyer-offer
 * negotiation entries from the originating Lead, the seller-visible
 * documents, and the derived escrow / release condition checklist.
 *
 * 401 if there's no session, 403 if the session isn't a seller.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    const payload = await verifySessionToken(token);
    if (!payload) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (payload.role !== "seller") {
      return NextResponse.json({ error: "Seller account required" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      include: { sellerProfile: true },
    });
    if (!user || !user.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const consignment = await prisma.consignment.findFirst({
      where: { sellerId: user.sellerProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        lot: { select: { name: true, city: true } },
      },
    });

    let photos: { id: string; url: string; isPrimary: boolean; sortOrder: number }[] = [];
    let priceHistory: { changedAt: string; previousPriceGbp: number | null; priceGbp: number; reason: string | null }[] = [];
    let documents: { id: string; documentType: string; title: string; cdnUrl: string | null; signedAt: string | null; createdAt: string }[] = [];
    let offers: { id: string; offerType: string; offeredPriceGbp: number; status: string; offeredAt: string; respondedAt: string | null; notes: string | null }[] = [];
    let hpiClear = false;

    if (consignment?.vehicle) {
      const media = await prisma.mediaFile.findMany({
        where: { entityType: "vehicle", entityId: consignment.vehicle.id },
        orderBy: { sortOrder: "asc" },
        select: { id: true, cdnUrl: true, isPrimary: true, sortOrder: true },
      });
      photos = media.map(m => ({ id: m.id, url: m.cdnUrl, isPrimary: m.isPrimary, sortOrder: m.sortOrder ?? 0 }));

      const history = await prisma.vehiclePriceHistory.findMany({
        where: { vehicleId: consignment.vehicle.id },
        orderBy: { changedAt: "asc" },
        select: { changedAt: true, previousPriceGbp: true, priceGbp: true, changeReason: true },
      });
      priceHistory = history.map(h => ({
        changedAt: h.changedAt.toISOString(),
        previousPriceGbp: h.previousPriceGbp,
        priceGbp: h.priceGbp,
        reason: h.changeReason,
      }));

      const docs = await prisma.document.findMany({
        where: {
          OR: [
            { entityType: "vehicle", entityId: consignment.vehicle.id },
            { entityType: "consignment", entityId: consignment.id },
          ],
          isCurrent: true,
        },
        orderBy: { createdAt: "asc" },
        select: { id: true, documentType: true, title: true, cdnUrl: true, signedBySellerAt: true, createdAt: true },
      });
      documents = docs.map(d => ({
        id: d.id,
        documentType: d.documentType,
        title: d.title,
        cdnUrl: d.cdnUrl,
        signedAt: d.signedBySellerAt?.toISOString() ?? null,
        createdAt: d.createdAt.toISOString(),
      }));

      const hpi = await prisma.hpiCheck.findUnique({
        where: { vehicleId: consignment.vehicle.id },
        select: { isClear: true },
      });
      hpiClear = !!hpi?.isClear;
    }

    if (consignment?.leadId) {
      const offerRows = await prisma.leadOffer.findMany({
        where: { leadId: consignment.leadId },
        orderBy: { offeredAt: "asc" },
        select: { id: true, offerType: true, offeredPriceGbp: true, status: true, offeredAt: true, respondedAt: true, notes: true },
      });
      offers = offerRows.map(o => ({
        id: o.id,
        offerType: o.offerType,
        offeredPriceGbp: o.offeredPriceGbp,
        status: o.status,
        offeredAt: o.offeredAt.toISOString(),
        respondedAt: o.respondedAt?.toISOString() ?? null,
        notes: o.notes,
      }));
    }

    // Derive the release-condition checklist from existing data + admin-edited
    // fields. The seller sees these as "what needs to happen before payout."
    const escrow = consignment ? [
      { id: "agreement_signed", label: "Consignment agreement signed", isMet: !!consignment.agreementSignedAt, metAt: consignment.agreementSignedAt?.toISOString() ?? null },
      { id: "hpi_clear",         label: "HPI clear — confirmed at intake", isMet: hpiClear, metAt: null },
      { id: "v5c_notified",      label: "V5C transfer notified to DVLA", isMet: !!consignment.v5cNotifiedAt, metAt: consignment.v5cNotifiedAt?.toISOString() ?? null },
      { id: "return_window",     label: "7-day buyer return window expired", isMet: consignment.returnWindowExpiresAt ? consignment.returnWindowExpiresAt.getTime() <= Date.now() : false, metAt: consignment.returnWindowExpiresAt?.toISOString() ?? null },
      { id: "no_disputes",       label: "No open disputes on the deal", isMet: !consignment.disputesOpen, metAt: null },
    ] : [];

    return NextResponse.json({
      seller: {
        id: user.id,
        email: user.email,
        firstName: user.sellerProfile.firstName,
        lastName: user.sellerProfile.lastName,
        payoutMethod: user.sellerProfile.payoutMethod,
        consignmentAgreementUrl: user.sellerProfile.consignmentAgreementUrl,
      },
      consignment: consignment ? {
        id: consignment.id,
        status: consignment.status,
        agreedListingPriceGbp: consignment.agreedListingPriceGbp,
        platformFeeGbp:        consignment.platformFeeGbp ?? 0,
        reconMechanicalGbp:    consignment.reconMechanicalGbp ?? 0,
        reconDetailGbp:        consignment.reconDetailGbp ?? 0,
        transportGbp:          consignment.transportGbp ?? 0,
        lot: consignment.lot ? `${consignment.lot.name}, ${consignment.lot.city ?? ""}`.trim() : null,
        listedAt: consignment.listedAt?.toISOString() ?? null,
        agreementSignedAt: consignment.agreementSignedAt?.toISOString() ?? null,
      } : null,
      vehicle: consignment?.vehicle ? {
        id: consignment.vehicle.id,
        registration: consignment.vehicle.registration,
        year: consignment.vehicle.year,
        make: consignment.vehicle.make,
        model: consignment.vehicle.model,
        trim: consignment.vehicle.trim,
        currentStage: consignment.vehicle.currentStage,
        listingPriceGbp: consignment.vehicle.listingPriceGbp,
        mileageAtIntake: consignment.vehicle.mileageAtIntake,
        exteriorColour: consignment.vehicle.exteriorColour,
        fuelType: consignment.vehicle.fuelType,
        transmission: consignment.vehicle.transmission,
        ownersCountAtIntake: consignment.vehicle.ownersCountAtIntake,
        conditionGrade: consignment.vehicle.conditionGrade,
        serviceHistoryType: consignment.vehicle.serviceHistoryType,
      } : null,
      photos,
      priceHistory,
      offers,
      documents,
      escrow,
    });
  } catch (error) {
    console.error("[GET /api/seller/me]", error);
    return NextResponse.json({ error: "Failed to load seller data" }, { status: 500 });
  }
}
