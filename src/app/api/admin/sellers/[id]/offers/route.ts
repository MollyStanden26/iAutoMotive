import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

const OFFER_TYPES = ["initial", "counter_iauto", "counter_seller", "final"] as const;
const OFFER_STATUSES = ["pending", "accepted", "rejected", "countered", "expired"] as const;

/**
 * POST /api/admin/sellers/[id]/offers — log a new buyer-offer entry on the
 * seller's most recent consignment. Writes a LeadOffer row keyed to the
 * consignment's originating lead; surfaces immediately on the seller's
 * /seller/vehicle "Offer & negotiation history" panel via /api/seller/me.
 *
 * Body: { offerType, offeredPriceGbp (pence), status?, notes? }.
 *
 * 400 when the consignment came in directly (no lead) — the LeadOffer
 * model requires a leadId. Direct-consignment offers will land in a
 * future ConsignmentOffer model.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  try {
    const body = await req.json().catch(() => ({}));

    const offerType = String(body.offerType ?? "");
    if (!(OFFER_TYPES as readonly string[]).includes(offerType)) {
      return NextResponse.json({ error: `offerType must be one of: ${OFFER_TYPES.join(", ")}` }, { status: 400 });
    }
    const status = body.status ? String(body.status) : "pending";
    if (!(OFFER_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${OFFER_STATUSES.join(", ")}` }, { status: 400 });
    }
    const offeredPriceGbp = Number(body.offeredPriceGbp);
    if (!Number.isFinite(offeredPriceGbp) || offeredPriceGbp <= 0) {
      return NextResponse.json({ error: "offeredPriceGbp must be a positive number (pence)" }, { status: 400 });
    }
    const notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

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
      select: { id: true, leadId: true },
    });
    if (!consignment) {
      return NextResponse.json({ error: "Seller has no consignment to attach an offer to" }, { status: 400 });
    }
    if (!consignment.leadId) {
      return NextResponse.json({
        error: "This consignment was created directly (no source lead) — direct-consignment offers will land in a future schema update.",
      }, { status: 400 });
    }

    const offer = await prisma.leadOffer.create({
      data: {
        leadId: consignment.leadId,
        staffId: guard.user.id,
        offerType: offerType as typeof OFFER_TYPES[number],
        offeredPriceGbp: Math.round(offeredPriceGbp),
        status: status as typeof OFFER_STATUSES[number],
        notes,
      },
    });

    return NextResponse.json({
      ok: true,
      offer: {
        id: offer.id,
        offerType: offer.offerType,
        offeredPriceGbp: offer.offeredPriceGbp,
        status: offer.status,
        offeredAt: offer.offeredAt.toISOString(),
        notes: offer.notes,
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/sellers/:id/offers]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
