import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";
import type { CallOutcome } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/crm/performance — headline figures for the CRM Performance KPI
 * row, scoped to the individual rep (sales see only their own activity).
 *
 *  • dialsToday / dialsYesterday — calls placed (for the day-over-day delta)
 *  • contactRate — connected calls / total calls this week
 *  • offersOut — leads currently in the Contract Sent stage (awaiting signature)
 *  • signedWeek / revenueWeekPence — deals collected (signed) this week + their value
 */

const CONNECTED_OUTCOMES: CallOutcome[] = [
  "connected_positive", "connected_neutral", "connected_not_interested", "callback_requested", "converted",
];

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  try {
    const isSales = guard.user.role === "sales";
    const leadWhere = isSales ? { assignedTo: guard.user.id } : {};
    const callWhere = isSales ? { repId: guard.user.id } : {};
    const dealWhere = isSales ? { assignedTo: guard.user.id } : {};

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday); // Monday 00:00
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfToday.getDay() + 6) % 7));

    const [dialsToday, dialsYesterday, callsThisWeek, connectedThisWeek, offersOut, signedWeek, revenueAgg] =
      await Promise.all([
        prisma.callSession.count({ where: { ...callWhere, initiatedAt: { gte: startOfToday } } }),
        prisma.callSession.count({ where: { ...callWhere, initiatedAt: { gte: startOfYesterday, lt: startOfToday } } }),
        prisma.callSession.count({ where: { ...callWhere, initiatedAt: { gte: startOfWeek } } }),
        prisma.callSession.count({ where: { ...callWhere, initiatedAt: { gte: startOfWeek }, outcome: { in: CONNECTED_OUTCOMES } } }),
        prisma.lead.count({ where: { ...leadWhere, pipelineStage: "contract_sent" } }),
        prisma.deal.count({ where: { ...dealWhere, createdAt: { gte: startOfWeek } } }),
        prisma.deal.aggregate({ where: { ...dealWhere, createdAt: { gte: startOfWeek } }, _sum: { salePriceGbp: true } }),
      ]);

    const contactRate = callsThisWeek > 0 ? Math.round((connectedThisWeek / callsThisWeek) * 100) : 0;

    return NextResponse.json({
      stats: {
        dialsToday,
        dialsYesterday,
        contactRate,
        connectedThisWeek,
        callsThisWeek,
        offersOut,
        signedWeek,
        revenueWeekPence: revenueAgg._sum.salePriceGbp ?? 0,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/crm/performance]", error);
    return NextResponse.json({ error: "Failed to load performance stats" }, { status: 500 });
  }
}
