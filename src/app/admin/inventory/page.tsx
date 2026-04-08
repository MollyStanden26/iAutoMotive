"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  INVENTORY_KPIS, LOTS, VEHICLES, RECON_STAGES, RECON_MAX,
  AGING_BUCKETS, PRICING_LOG, TRANSFER_RECS,
} from "@/lib/admin/inventory-mock-data";
import type { VehicleFilter, InventoryVehicle } from "@/lib/admin/inventory-mock-data";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const T = {
  bgPage:      "#0B111E",
  bgCard:      "#0D1525",
  bgSidebar:   "#070D18",
  bgRow:       "#111D30",
  bgHover:     "#0C1428",
  border:      "#1E2D4A",
  border2:     "#0F1828",
  textPrimary: "#F1F5F9",
  textSecondary: "#8492A8",
  textMuted:   "#6B7A90",
  textDim:     "#4A556B",
  teal:        "#008C7C",
  teal200:     "#4DD9C7",
  green:       "#34D399",
  greenBg:     "#0B2B1A",
  amber:       "#F5A623",
  amberBg:     "#2B1A00",
  red:         "#F87171",
  redBg:       "#2B0F0F",
  indigo:      "#0A1A2E",
  indigoBorder: "#1E3A5F",
};

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
function Topbar({ selectedCount }: { selectedCount: number }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2">
        <span className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }} onClick={() => router.push("/admin")}>Admin</span>
        <span style={{ color: T.textDim, fontSize: 13 }}>/</span>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Inventory</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("export inventory CSV")}>Export CSV</button>
        <button className="px-3 py-[6px] rounded-[8px]" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary, opacity: selectedCount === 0 ? 0.4 : 1, cursor: selectedCount === 0 ? "default" : "pointer", pointerEvents: selectedCount === 0 ? "none" : "auto" }} onClick={() => console.log("bulk reprice", selectedCount)}>Bulk reprice</button>
        <button className="px-[14px] py-[6px] rounded-[8px] hover:opacity-80" style={{ background: "#0A2A26", color: T.teal200, border: `1px solid ${T.indigo}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }} onClick={() => router.push("/admin/inventory/intake")}>+ Add vehicle</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP                                                          */
/* ================================================================== */
function KpiStrip() {
  const K = INVENTORY_KPIS;
  const cards = [
    { label: "TOTAL STOCK", value: K.totalStock.toString(), valueColor: T.textPrimary, delta: "Across 3 lots", deltaColor: T.textMuted },
    { label: "FRONT-LINE LIVE", value: K.frontLineLive.toString(), valueColor: T.teal200, delta: `${K.frontLinePct}% of stock`, deltaColor: T.green },
    { label: "IN RECON", value: K.inRecon.toString(), valueColor: T.amber, delta: `${K.reconOverdue} overdue SLA`, deltaColor: T.amber },
    { label: "AVG DAYS ON LOT", value: K.avgDaysOnLot.toString(), valueColor: T.green, delta: `↓ ${Math.abs(K.avgDaysDelta)}d vs last week`, deltaColor: T.green },
    { label: "AT RISK (>45D)", value: K.atRisk.toString(), valueColor: T.red, delta: "Action needed", deltaColor: T.red },
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
/*  LOT HEALTH PANEL                                                   */
/* ================================================================== */
function LotHealthPanel() {
  const barColor = (pct: number) => pct >= 85 ? T.red : pct >= 70 ? T.amber : T.green;
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Lot health</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: "10px 14px" }}>
        {LOTS.map(lot => (
          <div key={lot.name} className="px-3 py-[10px] rounded-[10px]" style={{ background: T.bgSidebar, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-1">
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: T.teal200 }}>{lot.name} {lot.city}</span>
              {lot.capacityPct >= 85 && (
                <span className="rounded-full px-[7px] py-[2px] ml-[6px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>Near capacity</span>
              )}
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 20, color: T.textPrimary }}>{lot.count}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>/ {lot.capacity}</span>
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 2 }}>{lot.capacityPct}% capacity · {lot.inRecon} in recon</div>
            <div className="mt-[6px] h-[5px] rounded-full overflow-hidden" style={{ background: T.bgRow }}>
              <div className="h-full rounded-full" style={{ width: `${lot.capacityPct}%`, background: barColor(lot.capacityPct) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  VEHICLE TABLE                                                      */
/* ================================================================== */
type SortDir = "asc" | "desc";

const filterPills: { label: string; value: VehicleFilter }[] = [
  { label: "All", value: "all" },
  { label: "Front-line", value: "live" },
  { label: "In recon", value: "recon" },
  { label: "At risk", value: "risk" },
  { label: "Lot 1", value: "lot1" },
  { label: "Lot 2", value: "lot2" },
  { label: "Lot 3", value: "lot3" },
];

function dayBadge(days: number) {
  let bg = T.greenBg, color = T.green;
  if (days > 45) { bg = T.redBg; color = T.red; }
  else if (days >= 15) { bg = T.amberBg; color = T.amber; }
  return (
    <span className="inline-flex items-center justify-center rounded-[5px]" style={{ minWidth: 36, height: 20, background: bg, color, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 11 }}>
      {days}d
    </span>
  );
}

function stageBadge(stage: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    live:    { bg: "#0A1A2A", color: T.teal200, label: "Front-line" },
    recon:   { bg: T.amberBg, color: T.amber,   label: "In recon" },
    ready:   { bg: "#0D1E10", color: T.green,    label: "Listing ready" },
    arrived: { bg: T.bgRow,   color: T.textMuted, label: "Arrived" },
    mech:    { bg: T.redBg,   color: T.red,      label: "In mechanical" },
    photo:   { bg: T.indigo,  color: T.teal200,  label: "Photography" },
  };
  const s = map[stage] || map.live;
  return (
    <span className="inline-flex items-center rounded-full px-[7px] py-[2px]" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>
      {s.label}
    </span>
  );
}

function aiRecColor(listPrice: number, aiRecPrice: number): string {
  if (aiRecPrice < listPrice) return T.red;
  if (aiRecPrice > listPrice) return T.green;
  return T.textMuted;
}

function aiActionColor(cls: string): string {
  if (cls === "decay") return T.red;
  if (cls === "flag") return T.amber;
  return T.textMuted;
}

function formatPrice(p: number): string {
  return "£" + p.toLocaleString();
}

function VehicleTable({
  activeFilter, setActiveFilter,
  searchQuery, setSearchQuery,
  sortDir, setSortDir,
  selectedVehicles, setSelectedVehicles,
}: {
  activeFilter: VehicleFilter; setActiveFilter: (f: VehicleFilter) => void;
  searchQuery: string; setSearchQuery: (s: string) => void;
  sortDir: SortDir; setSortDir: (d: SortDir) => void;
  selectedVehicles: string[]; setSelectedVehicles: (ids: string[]) => void;
}) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Filter
  let filtered = VEHICLES;
  if (activeFilter === "live") filtered = filtered.filter(v => v.stage === "live");
  else if (activeFilter === "recon") filtered = filtered.filter(v => ["recon", "arrived", "mech", "photo", "ready"].includes(v.stage));
  else if (activeFilter === "risk") filtered = filtered.filter(v => v.days > 30 || v.risk === "high");
  else if (activeFilter === "lot1") filtered = filtered.filter(v => v.lot === "Lot 1");
  else if (activeFilter === "lot2") filtered = filtered.filter(v => v.lot === "Lot 2");
  else if (activeFilter === "lot3") filtered = filtered.filter(v => v.lot === "Lot 3");

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(v => `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(q));
  }

  // Sort by days
  const sorted = [...filtered].sort((a, b) => sortDir === "desc" ? b.days - a.days : a.days - b.days);

  // Select-all
  const allVisible = sorted.map(v => v.id);
  const allSelected = allVisible.length > 0 && allVisible.every(id => selectedVehicles.includes(id));
  const someSelected = !allSelected && allVisible.some(id => selectedVehicles.includes(id));

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggleAll = () => {
    if (allSelected) setSelectedVehicles(selectedVehicles.filter(id => !allVisible.includes(id)));
    else setSelectedVehicles([...new Set([...selectedVehicles, ...allVisible])]);
  };
  const toggleOne = (id: string) => {
    setSelectedVehicles(selectedVehicles.includes(id) ? selectedVehicles.filter(x => x !== id) : [...selectedVehicles, id]);
  };

  return (
    <div className="rounded-[10px] overflow-hidden min-w-0" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Vehicle inventory</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textMuted }}>{sorted.length} vehicles</span>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-[6px] flex-wrap px-[14px] py-[6px]">
        <div className="relative" style={{ width: 180 }}>
          <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2" style={{ color: T.textDim }} />
          <input type="text" placeholder="Search VIN, make/model…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1 rounded-[8px] outline-none" style={{ background: T.bgCard, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }} />
        </div>
        {filterPills.map(p => (
          <button key={p.value} onClick={() => setActiveFilter(p.value)} className="px-[9px] py-1 rounded-[7px] transition-colors" style={{ background: activeFilter === p.value ? T.indigo : T.bgRow, color: activeFilter === p.value ? T.teal200 : T.textMuted, border: `1px solid ${activeFilter === p.value ? T.indigo : T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11 }}>{p.label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 700, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 30 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 78 }} />
            <col style={{ width: 85 }} />
            <col style={{ width: 82 }} />
            <col style={{ width: 76 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 56 }} />
          </colgroup>
          <thead>
            <tr>
              <th className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar }}>
                <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: T.teal }} />
              </th>
              <th className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>Vehicle</th>
              <th className="px-[10px] py-[7px] text-left cursor-pointer select-none" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }} onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}>
                <span className="inline-flex items-center gap-1">Days {sortDir === "desc" ? <ArrowDown size={12} style={{ color: T.teal200 }} /> : <ArrowUp size={12} style={{ color: T.teal200 }} />}</span>
              </th>
              {["Stage", "List price", "AI rec", "AI action", "Lot"].map(h => (
                <th key={h} className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((v, idx) => (
              <tr key={v.id} className="cursor-pointer transition-colors duration-150"
                onMouseEnter={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = T.bgHover))}
                onMouseLeave={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = "transparent"))}
                onClick={() => { console.log("navigate", v.vin); router.push(`/admin/inventory/${v.vin}`); }}
              >
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }} onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedVehicles.includes(v.id)} onChange={() => toggleOne(v.id)} style={{ accentColor: T.teal }} />
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary }}>
                  {v.year} {v.make} {v.model}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  {dayBadge(v.days)}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  {stageBadge(v.stage)}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary }}>
                  {formatPrice(v.listPrice)}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: aiRecColor(v.listPrice, v.aiRecPrice) }}>
                  {formatPrice(v.aiRecPrice)}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  <span className="block truncate" style={{ maxWidth: 130, fontFamily: "var(--font-body)", fontSize: 11, color: aiActionColor(v.aiActionClass) }} title={v.aiAction}>{v.aiAction}</span>
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>
                  {v.lot}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  RECON PIPELINE PANEL                                               */
/* ================================================================== */
function ReconPipelinePanel() {
  const totalOverdue = RECON_STAGES.reduce((s, r) => s + r.overdue, 0);
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Recon pipeline</span>
        {totalOverdue > 0 && (
          <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{totalOverdue} overdue</span>
        )}
      </div>
      <div className="px-[14px]">
        {RECON_STAGES.map((stage, idx) => {
          const pct = Math.round((stage.count / RECON_MAX) * 100);
          return (
            <div key={stage.label} className="flex items-center gap-2 py-[6px]" style={{ borderBottom: idx < RECON_STAGES.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span className="flex-shrink-0" style={{ width: 96, fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{stage.label}</span>
              <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: T.bgRow }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: stage.fillColor }} />
              </div>
              <span className="text-right" style={{ minWidth: 24, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: stage.valueColor }}>{stage.count}</span>
              {stage.overdue > 0 && (
                <span className="rounded-full px-[6px] py-[1px] flex-shrink-0" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{stage.overdue} overdue</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AGING AT-RISK PANEL                                                */
/* ================================================================== */
function AgingPanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Aging at risk</span>
      </div>
      <div className="px-[14px]">
        {AGING_BUCKETS.map((b, idx) => (
          <div key={b.label} className="flex items-center gap-2 py-[6px]" style={{ borderBottom: idx < AGING_BUCKETS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: b.labelColor }}>{b.label}</span>
            <span className="text-right" style={{ minWidth: 28, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, color: b.labelColor }}>{b.count}</span>
            <span className="rounded-full px-[7px] py-[1px] flex-shrink-0" style={{ background: b.actionBg, color: b.actionTextColor, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{b.actionText}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AI PRICING LOG PANEL                                               */
/* ================================================================== */
function PricingLogPanel() {
  const dotColors: Record<string, string> = { red: T.red, amber: T.amber, teal: T.teal200 };
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>AI pricing log</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>Today</span>
      </div>
      <div className="px-[14px]">
        {PRICING_LOG.map((row, idx) => (
          <div key={idx} className="flex items-start gap-2 py-[6px]" style={{ borderBottom: idx < PRICING_LOG.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[4px]" style={{ background: dotColors[row.dotColor] }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.vehicle}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{row.sub}</div>
            </div>
            <span className="flex-shrink-0 text-right" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: row.valueColor }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TRANSFER RECOMMENDATIONS PANEL                                     */
/* ================================================================== */
function TransferPanel({ approvedIds, onApprove }: { approvedIds: string[]; onApprove: (id: string) => void }) {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Transfer recommendations</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.amberBg, color: T.amber, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{TRANSFER_RECS.length} pending</span>
      </div>
      <div className="px-[14px]">
        {TRANSFER_RECS.map((rec, idx) => {
          const approved = approvedIds.includes(rec.id);
          return (
            <div key={rec.id} className="flex items-center gap-2 py-[7px] transition-colors duration-150" style={{ borderBottom: idx < TRANSFER_RECS.length - 1 ? `1px solid ${T.border}` : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0C1020")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{rec.vehicle}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{rec.from} → {rec.to} · {rec.sub}</div>
              </div>
              <button
                className="flex-shrink-0 rounded-[6px] px-2 py-[2px] transition-colors"
                style={{
                  background: approved ? T.bgRow : T.indigo,
                  color: approved ? T.textMuted : T.teal200,
                  border: `1px solid ${approved ? T.border : T.indigo}`,
                  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
                  opacity: approved ? 0.6 : 1,
                  pointerEvents: approved ? "none" : "auto",
                  cursor: approved ? "default" : "pointer",
                }}
                onClick={() => {
                  // TODO: Real build: POST to /api/transfers/:id/approve
                  console.log("approve transfer", rec.id);
                  onApprove(rec.id);
                }}
              >
                {approved ? "Approved ✓" : "Approve"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function InventoryPage() {
  const [activeFilter, setActiveFilter] = useState<VehicleFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar selectedCount={selectedVehicles.length} />
        <div className="flex-1 flex flex-col gap-[10px] overflow-x-hidden" style={{ padding: "14px 20px" }}>
          <KpiStrip />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 292px", gap: 10 }}>
            {/* Left column */}
            <div className="flex flex-col gap-[10px] min-w-0">
              <LotHealthPanel />
              <VehicleTable
                activeFilter={activeFilter} setActiveFilter={setActiveFilter}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                sortDir={sortDir} setSortDir={setSortDir}
                selectedVehicles={selectedVehicles} setSelectedVehicles={setSelectedVehicles}
              />
            </div>
            {/* Right column */}
            <div className="flex flex-col gap-[10px]">
              <ReconPipelinePanel />
              <AgingPanel />
              <PricingLogPanel />
              <TransferPanel approvedIds={approvedIds} onApprove={id => setApprovedIds(prev => [...prev, id])} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
