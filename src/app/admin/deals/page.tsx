"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown, ArrowUp, ArrowUpDown, Search,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import { AddDealDrawer } from "@/components/admin/add-deal-drawer";
import {
  DEALS_KPIS, PIPELINE_STAGES, DEALS,
  AT_RISK_DEALS, FUNDING_ROWS, DOC_STATUS_ROWS, COMPLIANCE_ROWS,
} from "@/lib/admin/deals-mock-data";
import type { Deal, DealFilter, DealStage, FundingStatus } from "@/lib/admin/deals-mock-data";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const T = {
  bgPage: "#0B111E", bgCard: "#0D1525", bgSidebar: "#070D18",
  bgRow: "#111D30", bgHover: "#0C1428", border: "#1E2D4A", border2: "#0F1828",
  textPrimary: "#F1F5F9", textSecondary: "#8492A8", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7",
  green: "#34D399", greenBg: "#0B2B1A",
  amber: "#F5A623", amberBg: "#2B1A00",
  red: "#F87171", redBg: "#2B0F0F",
  indigo: "#0A1A2E", indigoBorder: "#1E3A5F",
};

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
function Topbar({ selectedCount, onNewDeal }: { selectedCount: number; onNewDeal: () => void }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2">
        <span className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }} onClick={() => router.push("/admin")}>Admin</span>
        <span style={{ color: T.textDim, fontSize: 13 }}>/</span>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Deals</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("export deals CSV", selectedCount > 0 ? selectedCount : "all")}>Export CSV</button>
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => router.push("/admin/analytics?tab=revenue")}>Revenue report</button>
        <button className="px-[14px] py-[6px] rounded-[8px] hover:opacity-80" style={{ background: "#0A2A26", color: T.teal200, border: `1px solid ${T.indigo}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }} onClick={onNewDeal}>+ New deal</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP                                                          */
/* ================================================================== */
function KpiStrip() {
  const K = DEALS_KPIS;
  const cards = [
    { label: "LIVE DEALS", value: K.liveDeals.toString(), valueColor: K.liveDeals > 0 ? T.textPrimary : T.textMuted, delta: K.liveDeals > 0 ? "Active pipeline" : "No data yet", deltaColor: T.textMuted },
    { label: "PIPELINE VALUE", value: K.pipelineValue > 0 ? `£${Math.round(K.pipelineValue / 1000)}k` : "—", valueColor: K.pipelineValue > 0 ? T.teal200 : T.textMuted, delta: "Gross vehicle value", deltaColor: T.textMuted },
    { label: "EST. PLATFORM FEE", value: K.estPlatformFee > 0 ? `£${(K.estPlatformFee / 1000).toFixed(1)}k` : "£0", valueColor: T.green, delta: "No commission fee", deltaColor: T.green },
    { label: "AT RISK", value: K.atRisk.toString(), valueColor: K.atRisk > 0 ? T.red : T.textMuted, delta: K.atRisk > 0 ? "AI health score <50" : "None flagged", deltaColor: K.atRisk > 0 ? T.red : T.textMuted },
    { label: "CLOSED TODAY", value: K.closedToday.toString(), valueColor: K.closedToday > 0 ? T.teal200 : T.textMuted, delta: K.closedTodayRevenue > 0 ? `£${(K.closedTodayRevenue / 1000).toFixed(1)}k revenue` : "—", deltaColor: K.closedToday > 0 ? T.green : T.textMuted },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {cards.map((c, i) => (
        <div key={i} className="px-[14px] py-[11px] rounded-[10px] transition-colors duration-200" style={{ background: T.bgCard, border: `1px solid ${T.border}` }} onMouseEnter={e => (e.currentTarget.style.borderColor = T.indigoBorder)} onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em", color: c.valueColor }}>{c.value}</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: c.deltaColor, marginTop: 3 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  PIPELINE STRIP                                                     */
/* ================================================================== */
function PipelineStrip() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
      {PIPELINE_STAGES.map(s => (
        <div key={s.label} className="rounded-[10px] px-[10px] py-[9px] text-center" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 18, lineHeight: 1, color: s.countColor }}>{s.count}</div>
          <div className="truncate" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 3 }}>{s.label}</div>
          <div className="mt-[6px] h-[3px] rounded-full" style={{ background: s.barColor }} />
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */
function formatPrice(p: number): string { return "£" + p.toLocaleString(); }

function openedToMinutes(label: string): number {
  const num = parseFloat(label);
  if (label.endsWith("d")) return num * 1440;
  if (label.endsWith("h")) return num * 60;
  return num;
}

function stageBadge(stage: DealStage) {
  const map: Record<DealStage, { bg: string; color: string }> = {
    "Reserved":      { bg: "#0A1A2A", color: T.teal200 },
    "ID verified":   { bg: T.indigo,  color: T.teal200 },
    "Docs sent":     { bg: "#1A1A0A", color: T.amber },
    "Awaiting sign": { bg: "#1A1A0A", color: T.amber },
    "Submitted":     { bg: "#1A1A0A", color: T.amber },
    "Funded":        { bg: "#0A2A26", color: T.green },
    "Delivered":     { bg: "#0A2A26", color: T.green },
    "Closed":        { bg: T.greenBg, color: T.green },
  };
  const s = map[stage];
  return <span className="inline-flex items-center rounded-full px-[7px] py-[2px]" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{stage}</span>;
}

function healthBadge(score: number) {
  let bg = T.redBg, color = T.red;
  if (score >= 70) { bg = T.greenBg; color = T.green; }
  else if (score >= 50) { bg = T.amberBg; color = T.amber; }
  return <span className="inline-flex items-center justify-center rounded-[5px]" style={{ minWidth: 32, height: 20, background: bg, color, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 11 }}>{score}</span>;
}

function fundingBadge(status: FundingStatus) {
  const map: Record<FundingStatus, { bg: string; color: string }> = {
    "Approved":  { bg: T.greenBg, color: T.green },
    "Pending":   { bg: T.amberBg, color: T.amber },
    "Stip req.": { bg: T.amberBg, color: T.amber },
    "Submitted": { bg: T.bgRow,   color: T.textMuted },
    "Awaiting":  { bg: T.bgRow,   color: T.textMuted },
    "Pre-qual":  { bg: T.bgRow,   color: T.textMuted },
    "Declined":  { bg: T.redBg,   color: T.red },
    "Cash":      { bg: "#0A1A2A", color: T.teal200 },
    "Funded":    { bg: T.greenBg, color: T.green },
  };
  const s = map[status];
  return <span className="inline-flex items-center rounded-full px-[7px] py-[2px]" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{status}</span>;
}

/* ================================================================== */
/*  DEAL TABLE                                                         */
/* ================================================================== */
type SortKey = "health" | "opened" | null;
type SortDir = "asc" | "desc";

const filterPills: { label: string; value: DealFilter }[] = [
  { label: "All", value: "all" },
  { label: "At risk", value: "risk" },
  { label: "Awaiting funding", value: "fund" },
  { label: "Docs pending", value: "docs" },
  { label: "Closed today", value: "today" },
];

function DealsTable({
  activeFilter, setActiveFilter,
  searchQuery, setSearchQuery,
  sortKey, setSortKey, sortDir, setSortDir,
  selectedDeals, setSelectedDeals,
}: {
  activeFilter: DealFilter; setActiveFilter: (f: DealFilter) => void;
  searchQuery: string; setSearchQuery: (s: string) => void;
  sortKey: SortKey; setSortKey: (k: SortKey) => void;
  sortDir: SortDir; setSortDir: (d: SortDir) => void;
  selectedDeals: string[]; setSelectedDeals: (ids: string[]) => void;
}) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Filter
  let filtered = DEALS;
  if (activeFilter === "risk") filtered = filtered.filter(d => d.healthScore < 50);
  else if (activeFilter === "fund") filtered = filtered.filter(d => ["pending", "wait", "declined"].includes(d.fundingKey));
  else if (activeFilter === "docs") filtered = filtered.filter(d => ["docs", "sign"].includes(d.stageKey));
  else if (activeFilter === "today") filtered = filtered.filter(d => d.stageKey === "del");

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d => `${d.year} ${d.make} ${d.model} ${d.buyer}`.toLowerCase().includes(q));
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    if (sortKey === "health") return sortDir === "asc" ? a.healthScore - b.healthScore : b.healthScore - a.healthScore;
    const am = openedToMinutes(a.openedLabel), bm = openedToMinutes(b.openedLabel);
    return sortDir === "asc" ? bm - am : am - bm; // asc = oldest first (largest minutes)
  });

  const allVisible = sorted.map(d => d.id);
  const allSelected = allVisible.length > 0 && allVisible.every(id => selectedDeals.includes(id));
  const someSelected = !allSelected && allVisible.some(id => selectedDeals.includes(id));

  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected; }, [someSelected]);

  const toggleAll = () => {
    if (allSelected) setSelectedDeals(selectedDeals.filter(id => !allVisible.includes(id)));
    else setSelectedDeals([...new Set([...selectedDeals, ...allVisible])]);
  };
  const toggleOne = (id: string) => setSelectedDeals(selectedDeals.includes(id) ? selectedDeals.filter(x => x !== id) : [...selectedDeals, id]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "health" ? "asc" : "desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey === col) return sortDir === "asc" ? <ArrowUp size={12} style={{ color: T.teal200 }} /> : <ArrowDown size={12} style={{ color: T.teal200 }} />;
    return <ArrowUpDown size={12} style={{ color: T.textDim }} />;
  };

  return (
    <div className="rounded-[10px] overflow-hidden min-w-0" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Live deals</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textMuted }}>{sorted.length} deals</span>
      </div>
      <div className="flex items-center gap-[6px] flex-wrap px-[14px] py-[6px]">
        <div className="relative" style={{ width: 160 }}>
          <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2" style={{ color: T.textDim }} />
          <input type="text" placeholder="Search buyer, vehicle, deal…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1 rounded-[8px] outline-none" style={{ background: T.bgCard, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }} />
        </div>
        {filterPills.map(p => (
          <button key={p.value} onClick={() => setActiveFilter(p.value)} className="px-[9px] py-1 rounded-[7px] transition-colors" style={{ background: activeFilter === p.value ? T.indigo : T.bgRow, color: activeFilter === p.value ? T.teal200 : T.textMuted, border: `1px solid ${activeFilter === p.value ? T.indigo : T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11 }}>{p.label}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 700, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 30 }} /><col style={{ width: 155 }} /><col style={{ width: 110 }} /><col style={{ width: 88 }} /><col style={{ width: 70 }} /><col style={{ width: 72 }} /><col style={{ width: 62 }} /><col style={{ width: 90 }} /><col style={{ width: 72 }} />
          </colgroup>
          <thead>
            <tr>
              <th className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar }}>
                <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: T.teal }} />
              </th>
              {["Vehicle", "Buyer", "Stage"].map(h => (
                <th key={h} className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
              <th className="px-[10px] py-[7px] text-left cursor-pointer select-none" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }} onClick={() => handleSort("health")}>
                <span className="inline-flex items-center gap-1">Health <SortIcon col="health" /></span>
              </th>
              <th className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>Price</th>
              <th className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>GPU</th>
              <th className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>Funding</th>
              <th className="px-[10px] py-[7px] text-left cursor-pointer select-none" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }} onClick={() => handleSort("opened")}>
                <span className="inline-flex items-center gap-1">Opened <SortIcon col="opened" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((deal, idx) => (
              <tr key={deal.id} className="cursor-pointer transition-colors duration-150"
                onMouseEnter={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = T.bgHover))}
                onMouseLeave={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = "transparent"))}
                onClick={() => { console.log("navigate deal", deal.id); router.push(`/admin/deals/${deal.id}`); }}
              >
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }} onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedDeals.includes(deal.id)} onChange={() => toggleOne(deal.id)} style={{ accentColor: T.teal }} />
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary }}>
                  {deal.year} {deal.make} {deal.model}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontSize: 11, color: T.textSecondary }}>{deal.buyer}</td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>{stageBadge(deal.stage)}</td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>{healthBadge(deal.healthScore)}</td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary }}>{formatPrice(deal.salePrice)}</td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.green }}>{formatPrice(deal.gpu)}</td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>{fundingBadge(deal.fundingStatus)}</td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{deal.openedLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AT-RISK PANEL                                                      */
/* ================================================================== */
function AtRiskPanel() {
  const router = useRouter();
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>At-risk deals</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{AT_RISK_DEALS.length} flagged</span>
      </div>
      <div className="px-[14px]">
        {AT_RISK_DEALS.length === 0 && (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No at-risk deals.</div>
        )}
        {AT_RISK_DEALS.map((d, idx) => (
          <div key={d.id} className="flex items-start gap-2 py-[7px] cursor-pointer transition-colors duration-150"
            style={{ borderBottom: idx < AT_RISK_DEALS.length - 1 ? `1px solid ${T.border}` : "none" }}
            onClick={() => router.push(`/admin/deals/${d.id}`)}
            onMouseEnter={e => (e.currentTarget.style.background = "#0C1020")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span className="flex-shrink-0 mt-[1px] rounded-full px-[7px] py-[2px]" style={{ background: d.severity === "HIGH" ? T.redBg : T.amberBg, color: d.severity === "HIGH" ? T.red : T.amber, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{d.severity}</span>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{d.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{d.stallReason}</div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: T.teal200, marginTop: 2 }}>{d.recommendedAction}</div>
            </div>
            <span className="flex-shrink-0 text-right" style={{ minWidth: 28, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 11, color: d.severity === "HIGH" ? T.red : T.amber }}>{d.healthScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  FUNDING TRACKER PANEL                                              */
/* ================================================================== */
function FundingTrackerPanel() {
  const pendingCount = FUNDING_ROWS.filter(r => ["pending", "wait"].includes(r.fundingKey)).length;
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Funding tracker</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.amberBg, color: T.amber, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{pendingCount} pending</span>
      </div>
      <div className="px-[14px]">
        {FUNDING_ROWS.length === 0 && (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No funding activity.</div>
        )}
        {FUNDING_ROWS.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2 py-[6px]" style={{ borderBottom: idx < FUNDING_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span className="flex-1 truncate" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textSecondary }}>{row.dealTitle}</span>
            <span className="flex-shrink-0">{fundingBadge(row.status)}</span>
            <span className="flex-shrink-0 text-right" style={{ minWidth: 28, fontFamily: "var(--font-body)", fontSize: 10, color: row.ageColor }}>{row.ageLabel}</span>
          </div>
        ))}
        {FUNDING_ROWS.length > 0 && (
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 6, marginTop: 2 }}>
            <div className="flex items-center py-[3px]">
              <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Avg lender response time</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textMuted }}>—</span>
            </div>
            <div className="flex items-center py-[3px]">
              <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Deals flagged &gt;72h</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textMuted }}>—</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DOCUMENT STATUS PANEL                                              */
/* ================================================================== */
function DocStatusPanel() {
  const blockedCount = DOC_STATUS_ROWS.filter(r => r.dotColor === "red").length;
  const dotColors: Record<string, string> = { red: T.red, amber: T.amber, green: T.green };
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Document status</span>
        {blockedCount > 0 && <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{blockedCount} blocked</span>}
      </div>
      <div className="px-[14px]">
        {DOC_STATUS_ROWS.length === 0 && (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No document tracking.</div>
        )}
        {DOC_STATUS_ROWS.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2 py-[6px] cursor-pointer transition-colors duration-150"
            style={{ borderBottom: idx < DOC_STATUS_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0C1020")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: dotColors[row.dotColor] }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.dealTitle}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{row.sub}</div>
            </div>
            <span className="flex-shrink-0" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: row.statusColor }}>{row.statusLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COMPLIANCE PANEL                                                   */
/* ================================================================== */
function CompliancePanel() {
  const allPassing = COMPLIANCE_ROWS.every(r => r.passing);
  const failCount = COMPLIANCE_ROWS.filter(r => !r.passing).length;
  const empty = COMPLIANCE_ROWS.length === 0;
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Compliance</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: empty ? T.textMuted : allPassing ? T.green : T.red }}>
          {empty ? "Idle" : allPassing ? "All deals clear" : `${failCount} issues`}
        </span>
      </div>
      <div className="px-[14px]">
        {empty && (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No deals to check.</div>
        )}
        {COMPLIANCE_ROWS.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2 py-[7px]" style={{ borderBottom: idx < COMPLIANCE_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div className="flex items-center justify-center rounded-[4px] flex-shrink-0" style={{ width: 18, height: 18, background: row.passing ? T.greenBg : T.redBg, color: row.passing ? T.green : T.red, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 9 }}>
              {row.passing ? "✓" : "!"}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{row.sub}</div>
            </div>
            <span className="flex-shrink-0" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: row.passing ? T.green : T.red }}>{row.statusLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function DealsPage() {
  const [activeFilter, setActiveFilter] = useState<DealFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("health");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [newDealOpen, setNewDealOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar selectedCount={selectedDeals.length} onNewDeal={() => setNewDealOpen(true)} />
        <div className="flex-1 flex flex-col gap-[10px] overflow-x-hidden" style={{ padding: "14px 20px" }}>
          <KpiStrip />
          <PipelineStrip />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 296px", gap: 10 }}>
            <DealsTable
              activeFilter={activeFilter} setActiveFilter={setActiveFilter}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              sortKey={sortKey} setSortKey={setSortKey}
              sortDir={sortDir} setSortDir={setSortDir}
              selectedDeals={selectedDeals} setSelectedDeals={setSelectedDeals}
            />
            <div className="flex flex-col gap-[10px]">
              <AtRiskPanel />
              <FundingTrackerPanel />
              <DocStatusPanel />
              <CompliancePanel />
            </div>
          </div>
        </div>
      </div>
      <AddDealDrawer open={newDealOpen} onClose={() => setNewDealOpen(false)} />
    </div>
  );
}
