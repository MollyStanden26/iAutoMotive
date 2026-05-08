import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

/** Friendly "X days ago" / "today" / "just now" — used in the Latest updates feed. */
function relativeTime(d: Date): string {
  const ms = Date.now() - d.getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

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
    let activity = { views7d: 0, saves: 0, enquiries7d: 0 };
    let lastPriceChangeAt: string | null = null;
    let stageHistory: { fromStage: string | null; toStage: string; changedAt: string }[] = [];

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

      // Buyer-activity counts. Views/enquiries are 7-day windows; saves are
      // a running total because wishlist saves don't expire — that matches
      // what other marketplaces show their sellers ("12 saves").
      const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);
      const [views7d, saves, enquiries7d] = await Promise.all([
        prisma.vehicleView.count({
          where: { vehicleId: consignment.vehicle.id, viewedAt: { gte: sevenDaysAgo } },
        }),
        prisma.vehicleWishlist.count({ where: { vehicleId: consignment.vehicle.id } }),
        prisma.buyerEnquiry.count({
          where: { vehicleId: consignment.vehicle.id, createdAt: { gte: sevenDaysAgo } },
        }),
      ]);
      activity = { views7d, saves, enquiries7d };

      if (priceHistory.length > 0) {
        lastPriceChangeAt = priceHistory[priceHistory.length - 1].changedAt;
      }

      const stageRows = await prisma.vehicleStatusHistory.findMany({
        where: { vehicleId: consignment.vehicle.id },
        orderBy: { changedAt: "desc" },
        take: 10,
        select: { fromStage: true, toStage: true, changedAt: true },
      });
      stageHistory = stageRows.map(s => ({
        fromStage: s.fromStage,
        toStage: s.toStage,
        changedAt: s.changedAt.toISOString(),
      }));
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

    // Derive a unified "Latest updates" feed: price changes, stage transitions,
    // offers received, and the listing-went-live event. Most recent first,
    // capped at 6 entries — enough to feel alive without scrolling pressure.
    type Update = { id: string; dotColor: "teal" | "green" | "amber"; text: string; at: Date };
    const updates: Update[] = [];
    for (const h of priceHistory) {
      const prev = h.previousPriceGbp;
      const next = h.priceGbp;
      const dir = prev != null && next < prev ? "reduced" : prev != null ? "raised" : null;
      const text = dir
        ? `Price ${dir} from £${Math.round((prev ?? 0) / 100).toLocaleString("en-GB")} to £${Math.round(next / 100).toLocaleString("en-GB")}${h.reason ? ` — ${h.reason}` : ""}`
        : `Price set to £${Math.round(next / 100).toLocaleString("en-GB")}`;
      updates.push({ id: `p-${h.changedAt}`, dotColor: dir === "reduced" ? "amber" : "teal", text, at: new Date(h.changedAt) });
    }
    for (const s of stageHistory) {
      const label = s.toStage.replace(/_/g, " ");
      updates.push({ id: `s-${s.changedAt}`, dotColor: "teal", text: `Stage updated to ${label}`, at: new Date(s.changedAt) });
    }
    for (const o of offers) {
      updates.push({
        id: `o-${o.id}`,
        dotColor: o.status === "accepted" ? "green" : "teal",
        text: `Buyer offer ${o.status}: £${Math.round(o.offeredPriceGbp / 100).toLocaleString("en-GB")}${o.notes ? ` — ${o.notes}` : ""}`,
        at: new Date(o.offeredAt),
      });
    }
    if (consignment?.listedAt) {
      updates.push({
        id: "listed",
        dotColor: "green",
        text: `Your vehicle is live on AutoTrader and the iAutoMotive storefront. ${activity.views7d} views in the last 7 days.`,
        at: consignment.listedAt,
      });
    }
    updates.sort((a, b) => b.at.getTime() - a.at.getTime());
    const updatesPayload = updates.slice(0, 6).map(u => ({
      id: u.id,
      dotColor: u.dotColor,
      text: u.text,
      timestamp: relativeTime(u.at),
    }));

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
      activity,
      lastPriceChangeAt,
      updates: updatesPayload,
    });
  } catch (error) {
    console.error("[GET /api/seller/me]", error);
    return NextResponse.json({ error: "Failed to load seller data" }, { status: 500 });
  }
}
