import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";
import { commissionForDealValue } from "@/lib/admin/commission";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/command-centre — real metrics for the admin dashboard.
 * Everything here is computed from live deals / vehicles / leads (no mock).
 */

const INVENTORY_STATUSES = ["reserved", "identity_verified", "documents_sent", "documents_signed"];
const CLOSED_STATUSES = ["closed", "returned", "cancelled"];
const PIPELINE_BUCKETS: { label: string; statuses: string[] }[] = [
  { label: "Reserved", statuses: ["reserved"] },
  { label: "Finance pending", statuses: ["identity_verified"] },
  { label: "Docs outstanding", statuses: ["documents_sent", "documents_signed"] },
  { label: "Awaiting delivery", statuses: ["funded"] },
  { label: "Payout pending", statuses: ["delivered", "in_return_window"] },
];

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  try {
    const now = new Date();
    const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
    const start14 = new Date(startToday); start14.setDate(start14.getDate() - 13);

    const [deals, finApps, vehiclesInStock, vehiclesTotal, overdueLogs, leadsInPipeline] = await Promise.all([
      prisma.deal.findMany({ select: { id: true, status: true, salePriceGbp: true, askingPriceGbp: true, createdAt: true, vehicleMake: true, vehicleModel: true, vehicleYear: true } }),
      prisma.financeApplication.findMany({ select: { dealId: true } }),
      // "In stock" = still in the lifecycle, not sold/returned/withdrawn.
      // (Filter by stage, not soldAt — seeded rows have soldAt absent, which
      // Mongo's null filter wouldn't match.)
      prisma.vehicle.count({ where: { currentStage: { notIn: ["sold", "returned", "withdrawn"] } } }),
      prisma.vehicle.count(),
      prisma.leadOutreachLog.findMany({ where: { nextContactAt: { lt: now } }, distinct: ["leadId"], select: { leadId: true } }),
      prisma.lead.count({ where: { pipelineStage: { not: null } } }),
    ]);

    const financed = new Set(finApps.map(f => f.dealId));
    const poundsOf = (p: number | null | undefined) => (p ? Math.round(p / 100) : 0);
    const dealValue = (d: { salePriceGbp: number | null; askingPriceGbp: number | null }) => poundsOf(d.salePriceGbp ?? d.askingPriceGbp);

    const openDeals = deals.filter(d => !CLOSED_STATUSES.includes(d.status));
    const pipelineValueGbp = openDeals.reduce((s, d) => s + dealValue(d), 0);
    const estCommissionGbp = openDeals.reduce((s, d) => s + commissionForDealValue(dealValue(d)), 0);
    const signedToday = deals.filter(d => d.createdAt >= startToday).length;

    const dealPipeline = PIPELINE_BUCKETS.map(b => {
      const ds = deals.filter(d => b.statuses.includes(d.status));
      return { label: b.label, count: ds.length, valueGbp: ds.reduce((s, d) => s + dealValue(d), 0) };
    });

    // At-risk: still in inventory > 30 days after collection and not on finance.
    const atRiskDeals = deals.filter(d =>
      INVENTORY_STATUSES.includes(d.status) &&
      Math.floor((now.getTime() - d.createdAt.getTime()) / 86400000) > 30 &&
      !financed.has(d.id));

    // 14-day "deals collected" series.
    const series = Array.from({ length: 14 }, (_, i) => {
      const dd = new Date(start14); dd.setDate(start14.getDate() + i);
      return { label: ["S", "M", "T", "W", "T", "F", "S"][dd.getDay()], count: 0 };
    });
    deals.forEach(d => {
      const idx = Math.floor((d.createdAt.getTime() - start14.getTime()) / 86400000);
      if (idx >= 0 && idx < 14) series[idx].count++;
    });

    const overdueCallbacks = overdueLogs.length;

    const score = Math.max(0, Math.min(100, 100 - atRiskDeals.length * 6 - overdueCallbacks * 4));
    const chips: { label: string; variant: "green" | "amber" | "red" }[] = [];
    if (atRiskDeals.length > 0) chips.push({ label: `${atRiskDeals.length} at-risk deal${atRiskDeals.length > 1 ? "s" : ""}`, variant: "amber" });
    if (overdueCallbacks > 0) chips.push({ label: `${overdueCallbacks} callback${overdueCallbacks > 1 ? "s" : ""} overdue`, variant: "red" });
    chips.push({ label: openDeals.length > 0 ? `${openDeals.length} active deals` : "No active deals", variant: "green" });

    const alerts: { variant: "red" | "amber"; message: string }[] = [];
    atRiskDeals.forEach(d => alerts.push({
      variant: "amber",
      message: `Aging inventory — <strong>${[d.vehicleYear, d.vehicleMake, d.vehicleModel].filter(Boolean).join(" ")}</strong> in stock over 30 days with no finance buyer.`,
    }));
    if (overdueCallbacks > 0) alerts.push({
      variant: overdueCallbacks >= 3 ? "red" : "amber",
      message: `<strong>${overdueCallbacks} callback${overdueCallbacks > 1 ? "s" : ""}</strong> overdue across the team.`,
    });

    return NextResponse.json({
      stats: {
        pipelineValueGbp, activeDeals: openDeals.length, estCommissionGbp, signedToday,
        vehiclesInStock, vehiclesTotal, leadsInPipeline,
        dealPipeline, dealsCollected14d: series, overdueCallbacks,
        health: { score, chips }, alerts,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/command-centre]", error);
    return NextResponse.json({ error: "Failed to load command centre" }, { status: 500 });
  }
}
