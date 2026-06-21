import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/crm/stats — headline counts for the CRM overview KPI row.
 *
 * Sales reps see only their own figures (leads/calls/deals assigned to them);
 * other staff see the whole desk. Stage counts are current-column counts, so
 * moving a lead into a stage increases that stage's number.
 */
export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  try {
    const isSales = guard.user.role === "sales";
    const leadWhere = isSales ? { assignedTo: guard.user.id } : {};
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const now = new Date();

    const [contacted, offersSent, dialsToday, signedToday, overdueLeads] = await Promise.all([
      prisma.lead.count({ where: { ...leadWhere, pipelineStage: "contacted" } }),
      prisma.lead.count({ where: { ...leadWhere, pipelineStage: "contract_sent" } }),
      prisma.callSession.count({
        where: { initiatedAt: { gte: startOfToday }, ...(isSales ? { repId: guard.user.id } : {}) },
      }),
      prisma.deal.count({
        where: { createdAt: { gte: startOfToday }, ...(isSales ? { assignedTo: guard.user.id } : {}) },
      }),
      prisma.leadOutreachLog.findMany({
        where: { nextContactAt: { lt: now }, ...(isSales ? { staffId: guard.user.id } : {}) },
        distinct: ["leadId"],
        select: { leadId: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        dialsToday,
        contacted,
        offersSent,
        signedToday,
        callbacksOverdue: overdueLeads.length,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/crm/stats]", error);
    return NextResponse.json({ error: "Failed to load CRM stats" }, { status: 500 });
  }
}
