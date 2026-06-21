import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";
import { commissionForDealValue } from "@/lib/admin/commission";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics?period=7days|30days|mtd|90days|ytd
 * Real metrics for the Overview / Acquisition / Inventory tabs (no mock).
 */

const INVENTORY_STATUSES = ["reserved", "identity_verified", "documents_sent", "documents_signed"];
const CLOSED_STATUSES = ["closed", "returned", "cancelled"];
const LIVE_STAGES_EXCLUDE = ["sold", "returned", "withdrawn"];
const RESPONDED_OUTCOMES = ["connected", "interested", "callback_requested"];
const STAGE_BUCKETS: { label: string; statuses: string[] }[] = [
  { label: "Reserved", statuses: ["reserved"] },
  { label: "ID verified", statuses: ["identity_verified"] },
  { label: "Docs sent", statuses: ["documents_sent", "documents_signed"] },
  { label: "Funded", statuses: ["funded"] },
  { label: "Delivered", statuses: ["delivered", "in_return_window"] },
  { label: "Closed", statuses: ["closed", "returned", "cancelled"] },
];

function periodStart(period: string, now: Date): Date {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  switch (period) {
    case "30days": d.setDate(d.getDate() - 29); return d;
    case "mtd": d.setDate(1); return d;
    case "90days": d.setDate(d.getDate() - 89); return d;
    case "ytd": return new Date(now.getFullYear(), 0, 1);
    default: d.setDate(d.getDate() - 6); return d; // 7days
  }
}

function buildBuckets(start: Date, now: Date) {
  const startD = new Date(start); startD.setHours(0, 0, 0, 0);
  const spanDays = Math.floor((now.getTime() - startD.getTime()) / 86400000) + 1;
  const weekly = spanDays > 31;
  const stepMs = (weekly ? 7 : 1) * 86400000;
  const buckets: { start: number; end: number; label: string; outreach: number; responded: number; deals: number }[] = [];
  for (let t = startD.getTime(); t <= now.getTime(); t += stepMs) {
    const d = new Date(t);
    const label = weekly ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
    buckets.push({ start: t, end: t + stepMs, label, outreach: 0, responded: 0, deals: 0 });
  }
  return buckets;
}
function bucketIndex(buckets: { start: number; end: number }[], t: number): number {
  return buckets.findIndex(b => t >= b.start && t < b.end);
}

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  try {
    const period = new URL(request.url).searchParams.get("period") ?? "7days";
    const now = new Date();
    const start = periodStart(period, now);

    const [deals, vehicles, leads, outreach, lots] = await Promise.all([
      prisma.deal.findMany({ select: { id: true, status: true, salePriceGbp: true, askingPriceGbp: true, createdAt: true } }),
      prisma.vehicle.findMany({ select: { currentStage: true, lotId: true, listedAt: true, collectedAt: true, createdAt: true } }),
      prisma.lead.findMany({ select: { id: true, scoutScore: true, autotraderListingId: true, pipelineStage: true, vehicleMake: true, vehicleModel: true } }),
      prisma.leadOutreachLog.findMany({ select: { leadId: true, contactedAt: true, outcome: true } }),
      prisma.lot.findMany({ select: { id: true, name: true, capacityVehicles: true } }),
    ]);

    const poundsOf = (p: number | null | undefined) => (p ? Math.round(p / 100) : 0);
    const dealValue = (d: { salePriceGbp: number | null; askingPriceGbp: number | null }) => poundsOf(d.salePriceGbp ?? d.askingPriceGbp);

    // ---- Deals ----
    const openDeals = deals.filter(d => !CLOSED_STATUSES.includes(d.status));
    const pipelineValueGbp = openDeals.reduce((s, d) => s + dealValue(d), 0);
    const estCommissionGbp = openDeals.reduce((s, d) => s + commissionForDealValue(dealValue(d)), 0);
    const dealsCollected = deals.filter(d => d.createdAt >= start).length;
    const dealsByStage = STAGE_BUCKETS.map(b => ({ label: b.label, count: deals.filter(d => b.statuses.includes(d.status)).length }));

    // ---- Vehicles ----
    const liveVehicles = vehicles.filter(v => !LIVE_STAGES_EXCLUDE.includes(v.currentStage));
    const vehicleAge = (v: { listedAt: Date | null; collectedAt: Date | null; createdAt: Date }) =>
      Math.floor((now.getTime() - (v.listedAt ?? v.collectedAt ?? v.createdAt).getTime()) / 86400000);
    const ageBuckets = [
      { label: "0–14 days", min: 0, max: 14 }, { label: "15–30 days", min: 15, max: 30 },
      { label: "31–45 days", min: 31, max: 45 }, { label: "46–60 days", min: 46, max: 60 },
      { label: ">60 days", min: 61, max: Infinity },
    ].map(b => ({ label: b.label, count: liveVehicles.filter(v => { const a = vehicleAge(v); return a >= b.min && a <= b.max; }).length }));
    const avgDaysOnLot = liveVehicles.length ? Math.round(liveVehicles.reduce((s, v) => s + vehicleAge(v), 0) / liveVehicles.length) : 0;
    const aging45 = liveVehicles.filter(v => vehicleAge(v) > 45).length;
    const vehiclesByStage = Object.entries(
      liveVehicles.reduce<Record<string, number>>((acc, v) => { acc[v.currentStage] = (acc[v.currentStage] ?? 0) + 1; return acc; }, {})
    ).map(([stage, count]) => ({ label: stage.replace(/_/g, " "), count })).sort((a, b) => b.count - a.count);
    const lotCapacity = lots.map(l => {
      const count = liveVehicles.filter(v => v.lotId === l.id).length;
      return { name: l.name, vehicles: count, capacityPct: l.capacityVehicles ? Math.round((count / l.capacityVehicles) * 100) : 0 };
    });

    // ---- Leads / acquisition ----
    const totalLeads = leads.length;
    const scored = leads.filter(l => l.scoutScore != null).length;
    const outreachLeadIds = new Set(outreach.map(o => o.leadId));
    const respondedLeadIds = new Set(outreach.filter(o => RESPONDED_OUTCOMES.includes(o.outcome)).map(o => o.leadId));
    const contacted = outreachLeadIds.size;
    const responded = respondedLeadIds.size;
    const signed = deals.length; // every deal originated from a signed/collected lead
    const collected = leads.filter(l => l.pipelineStage === "collected").length;
    const pct = (n: number) => (totalLeads ? Math.round((n / totalLeads) * 1000) / 10 : 0);
    const funnel = [
      { label: "Leads", value: totalLeads, pct: 100 },
      { label: "Scored", value: scored, pct: pct(scored) },
      { label: "Contacted", value: contacted, pct: pct(contacted) },
      { label: "Responded", value: responded, pct: pct(responded) },
      { label: "Signed", value: signed, pct: pct(signed) },
      { label: "Collected", value: collected, pct: pct(collected) },
    ];
    const outreachSent = outreach.filter(o => o.contactedAt >= start).length;
    const responseRatePct = outreachSent ? Math.round((outreach.filter(o => o.contactedAt >= start && RESPONDED_OUTCOMES.includes(o.outcome)).length / outreachSent) * 100) : 0;
    const leadSources = (() => {
      const at = leads.filter(l => l.autotraderListingId).length;
      return [{ label: "AutoTrader", value: at }, { label: "Manual / other", value: totalLeads - at }];
    })();
    const topModels = Object.values(
      leads.reduce<Record<string, { name: string; total: number; scoreSum: number; scoreN: number }>>((acc, l) => {
        const name = [l.vehicleMake, l.vehicleModel].filter(Boolean).join(" ") || "Unknown";
        acc[name] ??= { name, total: 0, scoreSum: 0, scoreN: 0 };
        acc[name].total++;
        if (l.scoutScore != null) { acc[name].scoreSum += l.scoutScore; acc[name].scoreN++; }
        return acc;
      }, {})
    ).map(m => ({ name: m.name, count: m.total, avgScore: m.scoreN ? Math.round(m.scoreSum / m.scoreN) : 0 }))
      .sort((a, b) => b.count - a.count).slice(0, 6);

    // ---- Time series (deals collected; outreach vs responses) ----
    const buckets = buildBuckets(start, now);
    deals.forEach(d => { const i = bucketIndex(buckets, d.createdAt.getTime()); if (i >= 0) buckets[i].deals++; });
    outreach.forEach(o => {
      const i = bucketIndex(buckets, o.contactedAt.getTime());
      if (i >= 0) { buckets[i].outreach++; if (RESPONDED_OUTCOMES.includes(o.outcome)) buckets[i].responded++; }
    });
    const dealsCollectedSeries = buckets.map(b => ({ label: b.label, count: b.deals }));
    const outreachSeries = buckets.map(b => ({ label: b.label, outreach: b.outreach, responded: b.responded }));

    return NextResponse.json({
      period,
      overview: {
        kpis: { pipelineValueGbp, activeDeals: openDeals.length, dealsCollected, vehiclesLive: liveVehicles.length, leadsContacted: contacted, estCommissionGbp },
        dealsCollectedSeries, funnel, dealsByStage, inventoryAge: ageBuckets,
      },
      acquisition: {
        kpis: { totalLeads, scored, outreachSent, responseRatePct, signed },
        outreachSeries, leadSources, topModels,
      },
      inventory: {
        kpis: { vehiclesLive: liveVehicles.length, avgDaysOnLot, aging45, lots: lots.length },
        ageBuckets, vehiclesByStage, lotCapacity,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
