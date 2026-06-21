import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/deals — deals for the Deals pipeline page.
 *
 * Returns rows in the shape the page renders (see deals-mock-data `Deal`).
 * Deals created from a collected lead have no buyer yet, so they render with a
 * snapshot of the car. Sales reps see only their own deals.
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

function ageLabel(d: Date): string {
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
  try {
    const where = guard.user.role === "sales" ? { assignedTo: guard.user.id } : {};
    const deals = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { vehicle: { select: { year: true, make: true, model: true } } },
    });

    // Which of these deals already have a signed contract uploaded.
    const contractDocs = await prisma.document.findMany({
      where: {
        entityType: "deal",
        entityId: { in: deals.map(d => d.id) },
        documentType: "consignment_agreement",
        isCurrent: true,
      },
      select: { entityId: true },
    });
    const withContract = new Set(contractDocs.map(c => c.entityId));

    const rows = deals.map(d => {
      const stage = STAGE_MAP[d.status] ?? STAGE_MAP.reserved;
      const salePence = d.salePriceGbp ?? d.askingPriceGbp ?? 0;
      return {
        id: d.id,
        year: d.vehicle?.year ?? d.vehicleYear ?? 0,
        make: d.vehicle?.make ?? d.vehicleMake ?? "—",
        model: d.vehicle?.model ?? d.vehicleModel ?? "",
        buyer: d.buyerId ? "Buyer assigned" : "Awaiting buyer",
        stage: stage.stage,
        stageKey: stage.stageKey,
        healthScore: 80,
        salePrice: Math.round(salePence / 100),
        gpu: 0,
        fundingStatus: "Pending",
        fundingKey: "pending",
        openedLabel: ageLabel(d.createdAt),
        hasContract: withContract.has(d.id),
      };
    });

    return NextResponse.json({ deals: rows });
  } catch (error) {
    console.error("[GET /api/admin/deals]", error);
    return NextResponse.json({ error: "Failed to load deals" }, { status: 500 });
  }
}
