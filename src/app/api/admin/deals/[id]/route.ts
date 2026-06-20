import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/deals/[id] — full detail for the deal drawer: the deal, the
 * car (pulled from the originating lead), its now-in-inventory status, and the
 * lot it's stored at. Sales reps can only read their own deals.
 */

const STAGE_MAP: Record<string, { stage: string; stageKey: string }> = {
  reserved:          { stage: "Reserved",      stageKey: "res" },
  identity_verified: { stage: "ID verified",   stageKey: "idv" },
  documents_sent:    { stage: "Docs sent",     stageKey: "docs" },
  documents_signed:  { stage: "Awaiting sign", stageKey: "sign" },
  funded:            { stage: "Funded",        stageKey: "fund" },
  delivered:         { stage: "Delivered",     stageKey: "del" },
  in_return_window:  { stage: "Delivered",     stageKey: "del" },
  closed:            { stage: "Closed",        stageKey: "closed" },
  returned:          { stage: "Closed",        stageKey: "closed" },
  cancelled:         { stage: "Closed",        stageKey: "closed" },
};

const pounds = (pence: number | null | undefined) =>
  pence === null || pence === undefined ? null : Math.round(pence / 100);

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(_request);
  if (!guard.ok) return guard.response;

  try {
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        vehicle: { select: { year: true, make: true, model: true, registration: true, mileageAtIntake: true } },
        lead: {
          select: {
            vehicleReg: true, vehicleVin: true, vehicleYear: true, vehicleMake: true,
            vehicleModel: true, vehicleTrim: true, vehicleMileage: true,
            vehicleBodyType: true, vehicleFuelType: true, vehicleTransmission: true,
            locationPostcode: true, scrapedImageUrls: true,
          },
        },
      },
    });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    if (guard.user.role === "sales" && deal.assignedTo !== guard.user.id) {
      return NextResponse.json({ error: "Not your deal" }, { status: 403 });
    }

    const stage = STAGE_MAP[deal.status] ?? STAGE_MAP.reserved;
    const lead = deal.lead;
    const photos = Array.isArray(lead?.scrapedImageUrls) ? (lead!.scrapedImageUrls as string[]).slice(0, 8) : [];

    return NextResponse.json({
      detail: {
        id: deal.id,
        status: deal.status,
        stage: stage.stage,
        stageKey: stage.stageKey,
        salePriceGbp: pounds(deal.salePriceGbp ?? deal.askingPriceGbp),
        askingPriceGbp: pounds(deal.askingPriceGbp),
        buyer: deal.buyerId ? "Buyer assigned" : null,
        collectedAt: deal.createdAt.toISOString(),
        // Inventory
        inInventory: true,
        location: deal.location ?? null,
        // Car (prefer the real vehicle record, then the originating lead, then snapshot)
        year: deal.vehicle?.year ?? lead?.vehicleYear ?? deal.vehicleYear ?? null,
        make: deal.vehicle?.make ?? lead?.vehicleMake ?? deal.vehicleMake ?? null,
        model: deal.vehicle?.model ?? lead?.vehicleModel ?? deal.vehicleModel ?? null,
        trim: lead?.vehicleTrim ?? null,
        reg: deal.vehicle?.registration ?? lead?.vehicleReg ?? null,
        vin: lead?.vehicleVin ?? null,
        mileage: deal.vehicle?.mileageAtIntake ?? lead?.vehicleMileage ?? null,
        bodyType: lead?.vehicleBodyType ?? null,
        fuelType: lead?.vehicleFuelType ?? null,
        transmission: lead?.vehicleTransmission ?? null,
        // Origin
        sellerName: deal.sellerName ?? null,
        sellerArea: lead?.locationPostcode ?? null,
        leadId: deal.leadId ?? null,
        photos,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/deals/[id]]", error);
    return NextResponse.json({ error: "Failed to load deal" }, { status: 500 });
  }
}
