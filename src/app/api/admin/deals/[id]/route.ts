import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff, requireRole } from "@/lib/auth/require-role";

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
        assignedRep: { select: { id: true, email: true, staffProfile: { select: { firstName: true, lastName: true } } } },
        lead: {
          select: {
            vehicleReg: true, vehicleVin: true, vehicleYear: true, vehicleMake: true,
            vehicleModel: true, vehicleTrim: true, vehicleMileage: true,
            vehicleBodyType: true, vehicleFuelType: true, vehicleTransmission: true,
            locationPostcode: true, scrapedImageUrls: true,
            sellerFirstName: true, sellerLastName: true, sellerPhone: true, sellerEmail: true,
            doNotCall: true, doNotSms: true,
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

    // Current signed contract (consignment agreement) for this deal, if any.
    const contractDoc = await prisma.document.findFirst({
      where: { entityType: "deal", entityId: deal.id, documentType: "consignment_agreement", isCurrent: true },
      orderBy: { version: "desc" },
      select: { cdnUrl: true, title: true, fileSizeBytes: true, createdAt: true },
    });
    const contract = contractDoc?.cdnUrl
      ? { url: contractDoc.cdnUrl, name: contractDoc.title, sizeBytes: contractDoc.fileSizeBytes, uploadedAt: contractDoc.createdAt.toISOString() }
      : null;

    return NextResponse.json({
      detail: {
        id: deal.id,
        status: deal.status,
        stage: stage.stage,
        stageKey: stage.stageKey,
        salePriceGbp: pounds(deal.salePriceGbp ?? deal.askingPriceGbp),
        askingPriceGbp: pounds(deal.askingPriceGbp),
        buyer: deal.buyerId ? "Buyer assigned" : null,
        // Salesperson (deal owner) — for the admin/manager view.
        ownerId: deal.assignedTo ?? null,
        ownerName: deal.assignedRep
          ? ([deal.assignedRep.staffProfile?.firstName, deal.assignedRep.staffProfile?.lastName].filter(Boolean).join(" ") || deal.assignedRep.email)
          : null,
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
        // Seller (the collected lead is now the consignor on this deal)
        sellerName: deal.sellerName
          ?? ([lead?.sellerFirstName, lead?.sellerLastName].filter(Boolean).join(" ") || null),
        sellerArea: lead?.locationPostcode ?? null,
        sellerPhone: lead?.sellerPhone ?? null,
        sellerEmail: lead?.sellerEmail ?? null,
        doNotCall: lead?.doNotCall ?? false,
        doNotSms: lead?.doNotSms ?? false,
        leadId: deal.leadId ?? null,
        photos,
        // Signed contract
        contract,
        documentsSignedAt: deal.documentsSignedAt ? deal.documentsSignedAt.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/deals/[id]]", error);
    return NextResponse.json({ error: "Failed to load deal" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/deals/[id] — reassign the deal's salesperson (owner).
 * Manager action (super-admin / site-manager), à la Salesforce "Change Owner".
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole(request, ["super-admin", "site-manager"]);
  if (!guard.ok) return guard.response;

  let body: { assignedTo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (body.assignedTo === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const assignedTo = body.assignedTo ? String(body.assignedTo) : null;

  const deal = await prisma.deal.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  // Validate the new owner is a real staff user (sales-side roles own deals).
  if (assignedTo) {
    const rep = await prisma.user.findUnique({ where: { id: assignedTo }, select: { id: true, role: true } });
    if (!rep) return NextResponse.json({ error: "Salesperson not found" }, { status: 400 });
  }

  try {
    await prisma.deal.update({ where: { id: params.id }, data: { assignedTo } });
    const updated = await prisma.deal.findUnique({
      where: { id: params.id },
      select: { assignedTo: true, assignedRep: { select: { email: true, staffProfile: { select: { firstName: true, lastName: true } } } } },
    });
    const ownerName = updated?.assignedRep
      ? ([updated.assignedRep.staffProfile?.firstName, updated.assignedRep.staffProfile?.lastName].filter(Boolean).join(" ") || updated.assignedRep.email)
      : null;
    return NextResponse.json({ ok: true, ownerId: updated?.assignedTo ?? null, ownerName });
  } catch (error) {
    console.error("[PATCH /api/admin/deals/[id]]", error);
    return NextResponse.json({ error: "Failed to reassign deal" }, { status: 500 });
  }
}
