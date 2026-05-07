"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown, ArrowUp, ArrowUpDown, Search,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import { AddSellerDrawer } from "@/components/admin/add-seller-drawer";
import {
  SCRAPER_HEALTH,
  ACQUISITION_KPIS,
  ESCALATIONS,
  AGENT_STATS,
  FUNNEL_STEPS,
  OFFER_PERFORMANCE,
} from "@/lib/admin/acquisition-mock-data";
import type { LeadStatus } from "@/lib/admin/acquisition-mock-data";

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
function Topbar({ selectedCount, onAddSeller }: { selectedCount: number; onAddSeller: () => void }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2">
        <span
          className="cursor-pointer"
          style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }}
          onClick={() => router.push("/admin")}
        >Admin</span>
        <span style={{ color: T.textDim, fontSize: 13 }}>/</span>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Sellers Management</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-[6px] rounded-[8px] transition-colors hover:opacity-80"
          style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }}
          onClick={() => console.log("export")}
        >Export</button>
        <button
          className="px-3 py-[6px] rounded-[8px] transition-colors"
          style={{
            background: T.bgRow, border: `1px solid ${T.border}`,
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
            color: T.textSecondary,
            opacity: selectedCount === 0 ? 0.4 : 1,
            cursor: selectedCount === 0 ? "default" : "pointer",
          }}
          onClick={() => { if (selectedCount > 0) console.log("assign selected"); }}
        >Assign selected</button>
        <button
          className="px-[14px] py-[6px] rounded-[8px] transition-colors hover:opacity-80"
          style={{ background: "#0A2A26", color: T.teal200, border: `1px solid ${T.indigo}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }}
          onClick={onAddSeller}
        >+ Add seller</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SCRAPER HEALTH STRIP                                               */
/* ================================================================== */
function ScraperHealthStrip() {
  const S = SCRAPER_HEALTH;
  const isRunning = S.status === "running";
  const statusLabel = isRunning ? "Running" : S.status === "error" ? "Error" : "Idle";
  const statusColor = isRunning ? T.teal200 : S.status === "error" ? T.red : T.textMuted;
  const statusDot = isRunning ? T.green : S.status === "error" ? T.red : T.textDim;
  const cards = [
    { label: "SCRAPER STATUS", value: statusLabel, valueColor: statusColor, sub: S.lastRunMinutesAgo > 0 ? `Last run ${S.lastRunMinutesAgo} min ago` : "Not yet run", dot: statusDot },
    { label: "LISTINGS FOUND TODAY", value: S.listingsFoundToday.toLocaleString(), valueColor: S.listingsFoundToday > 0 ? T.textPrimary : T.textMuted, sub: S.listingsDelta, dot: S.listingsFoundToday > 0 ? T.green : T.textDim },
    { label: "OUTREACH SENT TODAY", value: S.outreachSentToday.toString(), valueColor: S.outreachSentToday > 0 ? T.textPrimary : T.textMuted, sub: `${S.outreachQueued} queued`, dot: S.outreachSentToday > 0 ? T.green : T.textDim },
    { label: "NEXT SCRAPER RUN", value: S.nextRunMinutes > 0 ? `${S.nextRunMinutes} min` : "—", valueColor: S.nextRunMinutes > 0 ? T.amber : T.textMuted, sub: S.nextRunTargets > 0 ? `Targeting ${S.nextRunTargets} make/models` : "Not scheduled", dot: S.nextRunMinutes > 0 ? "#FCD34D" : T.textDim },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
      {cards.map((c, i) => (
        <div key={i} className="flex items-center gap-[10px] px-3 py-[10px] rounded-[10px]" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.dot }} />
          <div className="min-w-0">
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{c.label}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 18, lineHeight: 1.1, color: c.valueColor }}>{c.value}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP                                                          */
/* ================================================================== */
function KpiStrip() {
  const K = ACQUISITION_KPIS;
  const empty = K.activeSellers === 0;
  const cards = [
    { label: "ACTIVE SELLERS", value: K.activeSellers.toString(), valueColor: empty ? T.textMuted : T.textPrimary, delta: empty ? "No data yet" : "In pipeline today", deltaColor: T.textMuted },
    { label: "NEW THIS WEEK", value: K.newThisWeek.toString(), valueColor: K.newThisWeek > 0 ? T.green : T.textMuted, delta: K.newThisWeek > 0 ? `↑ ${K.newThisWeekDelta} vs last week` : "—", deltaColor: K.newThisWeek > 0 ? T.green : T.textMuted },
    { label: "AWAITING KYC", value: K.awaitingKyc.toString(), valueColor: K.awaitingKyc > 0 ? T.amber : T.textMuted, delta: K.awaitingKyc > 0 ? `${K.awaitingKycOverdue} overdue · staff action` : "None pending", deltaColor: K.awaitingKyc > 0 ? T.amber : T.textMuted },
    { label: "LIVE CONSIGNMENTS", value: K.liveConsignments.toString(), valueColor: K.liveConsignments > 0 ? T.teal200 : T.textMuted, delta: K.liveConsignments > 0 ? `${K.liveConsignmentsPct}% of active sellers` : "—", deltaColor: K.liveConsignments > 0 ? T.teal200 : T.textMuted },
    { label: "AWAITING PAYOUT", value: K.awaitingPayout.toString(), valueColor: K.awaitingPayout > 0 ? T.red : T.textMuted, delta: K.awaitingPayout > 0 ? `Oldest ${K.awaitingPayoutOldestDays}d · post-sale` : "None outstanding", deltaColor: K.awaitingPayout > 0 ? T.red : T.textMuted },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {cards.map((c, i) => (
        <div
          key={i}
          className="px-[14px] py-[11px] rounded-[10px] transition-colors duration-200"
          style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = T.indigoBorder)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
        >
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em", color: c.valueColor }}>{c.value}</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: c.deltaColor, marginTop: 3 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  LEAD TABLE                                                         */
/* ================================================================== */
type SortKey = "score" | "askingPrice" | null;
type SortDir = "asc" | "desc";
type FilterKey = LeadStatus | "all";

const filterPills: { label: string; value: FilterKey }[] = [
  { label: "All", value: "all" },
  { label: "Escalated", value: "escalated" },
  { label: "Responded", value: "responded" },
  { label: "Negotiating", value: "negotiating" },
  { label: "Accepted", value: "accepted" },
];

function scoreBadge(score: number) {
  let bg = T.bgRow, color = T.textMuted;
  if (score >= 80) { bg = T.greenBg; color = T.green; }
  else if (score >= 60) { bg = T.amberBg; color = T.amber; }
  return (
    <span className="inline-flex items-center justify-center rounded-[6px]" style={{ width: 34, height: 22, background: bg, color, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 11 }}>
      {score}
    </span>
  );
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    new:         { bg: "#0A1A2A", color: T.teal200, label: "New" },
    contacted:   { bg: T.indigo,  color: T.teal200, label: "Contacted" },
    responded:   { bg: "#0D1E10", color: T.green,   label: "Responded" },
    negotiating: { bg: T.amberBg, color: T.amber,   label: "Negotiating" },
    accepted:    { bg: T.greenBg, color: T.green,   label: "Accepted" },
    escalated:   { bg: T.redBg,   color: T.red,     label: "Escalated" },
  };
  const s = map[status] ?? { bg: T.bgRow, color: T.textMuted, label: status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
  return (
    <span className="inline-flex items-center rounded-full px-2 py-[2px]" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>
      {s.label}
    </span>
  );
}

function aiActionColor(status: string): string {
  if (status === "escalated" || status === "responded" || status === "negotiating") return T.teal200;
  return T.textMuted;
}

function formatPrice(p: number): string {
  return "£" + p.toLocaleString();
}

function LeadTable({
  activeFilter, setActiveFilter,
  searchQuery, setSearchQuery,
  sortKey, setSortKey,
  sortDir, setSortDir,
  selectedLeads, setSelectedLeads,
  refreshKey,
}: {
  activeFilter: FilterKey; setActiveFilter: (f: FilterKey) => void;
  searchQuery: string; setSearchQuery: (s: string) => void;
  sortKey: SortKey; setSortKey: (k: SortKey) => void;
  sortDir: SortDir; setSortDir: (d: SortDir) => void;
  selectedLeads: string[]; setSelectedLeads: (ids: string[]) => void;
  refreshKey: number;
}) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [apiLeads, setApiLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/leads")
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setApiLeads(data.leads ?? []); })
      .catch(err => { if (!cancelled) console.error("[LeadTable] fetch failed:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Adapt API rows → table-row shape used below
  const adapted = useMemo(() => apiLeads.map(l => ({
    id: l.id,
    score: l.score ?? 0,
    sellerName: l.seller || `${l.firstName ?? ""} ${l.lastName ?? ""}`.trim() || "Unknown",
    location: l.location || "—",
    year: l.vehicleYear ?? 0,
    make: l.vehicleMake ?? "",
    model: l.vehicleModel ?? "",
    askingPrice: l.askingPriceGbp ?? 0,
    offerPrice: 0,
    status: l.rawStatus,
    aiAction: "",
  })), [apiLeads]);

  // Filter
  let filtered = adapted;
  if (activeFilter !== "all") filtered = filtered.filter(l => l.status === activeFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(l =>
      `${l.year} ${l.make} ${l.model} ${l.sellerName}`.toLowerCase().includes(q)
    );
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const va = sortKey === "score" ? a.score : a.askingPrice;
    const vb = sortKey === "score" ? b.score : b.askingPrice;
    return sortDir === "desc" ? vb - va : va - vb;
  });

  // Select-all indeterminate
  const allVisible = sorted.map(l => l.id);
  const allSelected = allVisible.length > 0 && allVisible.every(id => selectedLeads.includes(id));
  const someSelected = !allSelected && allVisible.some(id => selectedLeads.includes(id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    if (allSelected) setSelectedLeads(selectedLeads.filter(id => !allVisible.includes(id)));
    else setSelectedLeads([...new Set([...selectedLeads, ...allVisible])]);
  };

  const toggleOne = (id: string) => {
    setSelectedLeads(
      selectedLeads.includes(id) ? selectedLeads.filter(x => x !== id) : [...selectedLeads, id]
    );
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey === col) {
      return sortDir === "desc"
        ? <ArrowDown size={12} style={{ color: T.teal200 }} />
        : <ArrowUp size={12} style={{ color: T.teal200 }} />;
    }
    return <ArrowUpDown size={12} style={{ color: T.textDim }} />;
  };

  return (
    <div className="rounded-[10px] overflow-hidden min-w-0" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Sellers pipeline</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textMuted }}>{sorted.length} sellers</span>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 px-[14px] py-[6px]">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2" style={{ color: T.textDim }} />
          <input
            type="text"
            placeholder="Search sellers, VIN, make/model…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-[5px] rounded-[8px] outline-none"
            style={{ background: T.bgCard, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}
          />
        </div>
        {filterPills.map(p => (
          <button
            key={p.value}
            onClick={() => setActiveFilter(p.value)}
            className="px-[10px] py-1 rounded-[7px] transition-colors"
            style={{
              background: activeFilter === p.value ? T.indigo : T.bgRow,
              color: activeFilter === p.value ? T.teal200 : T.textMuted,
              border: `1px solid ${activeFilter === p.value ? T.indigo : T.border}`,
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11,
            }}
          >{p.label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 700, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 30 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 78 }} />
            <col style={{ width: 74 }} />
            <col style={{ width: 95 }} />
            <col style={{ width: 145 }} />
            <col style={{ width: 70 }} />
          </colgroup>
          <thead>
            <tr>
              <th className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar }}>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  style={{ accentColor: T.teal }}
                />
              </th>
              <th
                className="px-[10px] py-[7px] text-left cursor-pointer select-none"
                style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}
                onClick={() => handleSort("score")}
              >
                <span className="inline-flex items-center gap-1">Score <SortIcon col="score" /></span>
              </th>
              {["Seller", "Vehicle", "Asking", "Offer", "Status", "AI action", "Age"].map((h) => (
                <th
                  key={h}
                  className={`px-[10px] py-[7px] text-left ${h === "Asking" ? "cursor-pointer select-none" : ""}`}
                  style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}
                  onClick={h === "Asking" ? () => handleSort("askingPrice") : undefined}
                >
                  {h === "Asking" ? (
                    <span className="inline-flex items-center gap-1">{h} <SortIcon col="askingPrice" /></span>
                  ) : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>
                  {loading ? "Loading…" : apiLeads.length === 0 ? "No leads in the database yet" : "No leads match this filter"}
                </td>
              </tr>
            )}
            {sorted.map((lead, idx) => (
              <tr
                key={lead.id}
                className="cursor-pointer transition-colors duration-150"
                style={{ background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = T.bgHover)); }}
                onMouseLeave={e => { e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = "transparent")); }}
                onClick={() => { console.log("navigate", lead.id); router.push(`/admin/sellers-management/${lead.id}`); }}
              >
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => toggleOne(lead.id)}
                    style={{ accentColor: T.teal }}
                  />
                </td>
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  {scoreBadge(lead.score)}
                </td>
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary }}>{lead.sellerName}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>{lead.location}</div>
                </td>
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontSize: 11, color: T.textSecondary }}>
                  {lead.year} {lead.make} {lead.model}
                </td>
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary }}>
                  {formatPrice(lead.askingPrice)}
                </td>
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.teal200 }}>
                  {formatPrice(lead.offerPrice)}
                </td>
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  {statusBadge(lead.status)}
                </td>
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  <span
                    className="block truncate"
                    style={{ maxWidth: 140, fontFamily: "var(--font-body)", fontSize: 11, color: aiActionColor(lead.status) }}
                    title={lead.aiAction}
                  >{lead.aiAction}</span>
                </td>
                <td className="px-[10px] py-2 align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>
                  {lead.ageLabel}
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
/*  ESCALATION PANEL                                                   */
/* ================================================================== */
function EscalationPanel() {
  const router = useRouter();
  const severityStyles: Record<string, { bg: string; color: string; label: string }> = {
    now:    { bg: T.redBg,   color: T.red,    label: "NOW" },
    high:   { bg: T.amberBg, color: T.amber,  label: "HIGH" },
    medium: { bg: T.indigo,  color: T.teal200, label: "MED" },
  };

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Escalations</span>
        <span className="ml-2 rounded-full px-2 py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>
          {ESCALATIONS.length} open
        </span>
      </div>
      <div className="px-[14px]">
        {ESCALATIONS.length === 0 && (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No escalations.</div>
        )}
        {ESCALATIONS.map((esc, idx) => {
          const sev = severityStyles[esc.severity];
          return (
            <div
              key={esc.id}
              className="flex items-start gap-2 py-2 cursor-pointer transition-colors duration-150"
              style={{ borderBottom: idx < ESCALATIONS.length - 1 ? `1px solid ${T.border}` : "none" }}
              onClick={() => { console.log("escalation", esc.id); router.push(`/admin/sellers-management/${esc.id}`); }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0C1020")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span className="flex-shrink-0 mt-[1px] rounded-full px-[7px] py-[2px]" style={{ background: sev.bg, color: sev.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>
                {sev.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary }}>{esc.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 1 }}>{esc.sub}</div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.teal200, marginTop: 3 }}>{esc.agentNote}</div>
              </div>
              <span className="flex-shrink-0 mt-[2px]" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim }}>{esc.ageLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AGENT STATUS PANEL                                                 */
/* ================================================================== */
function AgentStatusPanel() {
  const dotColor: Record<string, string> = { live: T.green, paused: "#FCD34D", error: T.red };

  const pausedCount = AGENT_STATS.filter(a => a.status === "paused").length;
  const errorCount = AGENT_STATS.filter(a => a.status === "error").length;
  let badgeText = AGENT_STATS.length === 0 ? "Idle" : "All running";
  let badgeColor: string = AGENT_STATS.length === 0 ? T.textMuted : T.green;
  if (errorCount > 0) { badgeText = `${errorCount} error`; badgeColor = T.red; }
  else if (pausedCount > 0) { badgeText = `${pausedCount} paused`; badgeColor = T.amber; }

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>AI agent status</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: badgeColor }}>{badgeText}</span>
      </div>
      <div className="px-[14px]">
        {AGENT_STATS.length === 0 && (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No agents running.</div>
        )}
        {AGENT_STATS.map((agent, idx) => (
          <div key={agent.name} className="flex items-center gap-2 py-[7px]" style={{ borderBottom: idx < AGENT_STATS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: dotColor[agent.status] }} />
            <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }}>{agent.name}</span>
            <span className="flex-1 text-right" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{agent.stat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  FUNNEL PANEL                                                       */
/* ================================================================== */
function FunnelPanel() {
  const maxVal = 1840;
  const valueColors: Record<string, string> = {
    "Scraped": T.teal200,
    "Hot/Warm": T.textPrimary,
    "Outreached": T.textPrimary,
    "Responded": T.green,
    "Negotiating": T.amber,
    "Accepted": T.green,
  };

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Today&apos;s funnel</span>
      </div>
      <div className="px-[14px]">
        {FUNNEL_STEPS.length === 0 && (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No funnel data yet.</div>
        )}
        {FUNNEL_STEPS.map((step, idx) => {
          const pct = Math.round((step.value / maxVal) * 100);
          return (
            <div key={step.label} className="flex items-center gap-2 py-[7px]" style={{ borderBottom: idx < FUNNEL_STEPS.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span className="flex-shrink-0" style={{ width: 80, fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{step.label}</span>
              <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: T.bgRow }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: step.fill }} />
              </div>
              <span className="text-right" style={{ minWidth: 32, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: valueColors[step.label] || T.textPrimary }}>
                {step.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  OFFER PERFORMANCE PANEL                                            */
/* ================================================================== */
function OfferPerformancePanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Offer performance</span>
      </div>
      <div className="px-[14px]">
        {OFFER_PERFORMANCE.length === 0 && (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No offer activity yet.</div>
        )}
        {OFFER_PERFORMANCE.map((row, idx) => (
          <div key={row.label} className="flex items-center py-[7px]" style={{ borderBottom: idx < OFFER_PERFORMANCE.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textSecondary }}>{row.label}</span>
            <span className="text-right" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function AcquisitionPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [addSellerOpen, setAddSellerOpen] = useState(false);
  const [leadsRefreshKey, setLeadsRefreshKey] = useState(0);

  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar selectedCount={selectedLeads.length} onAddSeller={() => setAddSellerOpen(true)} />
        <div className="flex-1 flex flex-col gap-[10px] p-[16px_20px] overflow-x-hidden">
          <ScraperHealthStrip />
          <KpiStrip />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 10 }}>
            <LeadTable
              activeFilter={activeFilter} setActiveFilter={setActiveFilter}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              sortKey={sortKey} setSortKey={setSortKey}
              sortDir={sortDir} setSortDir={setSortDir}
              selectedLeads={selectedLeads} setSelectedLeads={setSelectedLeads}
              refreshKey={leadsRefreshKey}
            />
            <div className="flex flex-col gap-[10px]">
              <EscalationPanel />
              <AgentStatusPanel />
              <FunnelPanel />
              <OfferPerformancePanel />
            </div>
          </div>
        </div>
      </div>
      <AddSellerDrawer
        open={addSellerOpen}
        onClose={() => setAddSellerOpen(false)}
        onCreated={() => setLeadsRefreshKey(k => k + 1)}
      />
    </div>
  );
}
