import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/crm/callbacks — leads that need a callback (rep-scoped).
 *
 * A lead qualifies when its most recent outreach log carries a nextContactAt
 * (logging a later touch without one clears it) and the lead isn't collected.
 * `overdue` = nextContactAt is in the past. Sorted overdue-first, then soonest
 * due. Rows match the dialler's lead shape so they feed both the CRM callbacks
 * drawer and the dialler's Callbacks queue.
 */
export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  try {
    const isSales = guard.user.role === "sales";

    // Latest outreach log per lead (logs are scanned newest-first).
    const logs = await prisma.leadOutreachLog.findMany({
      where: isSales ? { staffId: guard.user.id } : {},
      orderBy: { contactedAt: "desc" },
      select: { leadId: true, nextContactAt: true },
    });
    const latestByLead = new Map<string, Date | null>();
    for (const l of logs) {
      if (!latestByLead.has(l.leadId)) latestByLead.set(l.leadId, l.nextContactAt);
    }
    const dueLeadIds = [...latestByLead.entries()].filter(([, d]) => d != null).map(([id]) => id);
    if (dueLeadIds.length === 0) return NextResponse.json({ callbacks: [] });

    const leads = await prisma.lead.findMany({
      where: {
        id: { in: dueLeadIds },
        pipelineStage: { not: "collected" },
        ...(isSales ? { assignedTo: guard.user.id } : {}),
      },
      select: {
        id: true, sellerFirstName: true, sellerLastName: true, sellerPhone: true,
        scoutScore: true, vehicleYear: true, vehicleMake: true, vehicleModel: true,
        vehicleTrim: true, vehicleMileage: true, askingPriceGbp: true, pipelineStage: true,
      },
    });

    const now = Date.now();
    const rows = leads.map(l => {
      const due = latestByLead.get(l.id) as Date;
      return {
        id: l.id,
        seller: [l.sellerFirstName, l.sellerLastName].filter(Boolean).join(" ") || "New lead",
        phone: l.sellerPhone ?? null,
        score: l.scoutScore ?? 0,
        vehicleYear: l.vehicleYear ?? null,
        vehicleMake: l.vehicleMake ?? null,
        vehicleModel: l.vehicleModel ?? null,
        vehicleTrim: l.vehicleTrim ?? null,
        vehicleMileage: l.vehicleMileage ?? null,
        askingPriceGbp: l.askingPriceGbp ? Math.round(l.askingPriceGbp / 100) : null,
        lastContact: null,
        pipelineStage: l.pipelineStage,
        nextContactAt: due.toISOString(),
        overdue: due.getTime() < now,
      };
    });
    rows.sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return a.nextContactAt < b.nextContactAt ? -1 : 1;
    });

    return NextResponse.json({ callbacks: rows });
  } catch (error) {
    console.error("[GET /api/admin/crm/callbacks]", error);
    return NextResponse.json({ error: "Failed to load callbacks" }, { status: 500 });
  }
}
