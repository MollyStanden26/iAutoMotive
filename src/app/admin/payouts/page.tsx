"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown, ArrowUp, ArrowUpDown, Search,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  PAYOUTS_KPIS, PAYOUT_QUEUE, ESCROW_ROWS, OVERDUE_ALERTS,
  LIEN_ROWS, DISBURSEMENT_ROWS, TAX_ROWS, waitingToHours,
} from "@/lib/admin/payouts-mock-data";
import type { PayoutStatus, DisbursementMethod, PayoutFilter } from "@/lib/admin/payouts-mock-data";

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
function Topbar({ selectedPayouts, readySelected }: { selectedPayouts: string[]; readySelected: boolean }) {
  const router = useRouter();
  const processDisabled = selectedPayouts.length === 0 || !readySelected;
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2">
        <span className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }} onClick={() => router.push("/admin")}>Admin</span>
        <span style={{ color: T.textDim, fontSize: 13 }}>/</span>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Payouts</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("export payouts CSV")}>Export CSV</button>
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => router.push("/admin/analytics?tab=payouts")}>Payout report</button>
        <button className="px-[14px] py-[6px] rounded-[8px]" style={{ background: "#0A2A26", color: T.teal200, border: `1px solid ${T.indigo}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, opacity: processDisabled ? 0.4 : 1, cursor: processDisabled ? "not-allowed" : "pointer" }} onClick={() => { if (!processDisabled) console.log("process", selectedPayouts); }}>Process selected</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP                                                          */
/* ================================================================== */
function KpiStrip() {
  const K = PAYOUTS_KPIS;
  const cards = [
    { label: "IN ESCROW", value: `\u00a3${(K.inEscrow / 1000).toFixed(1)}k`, valueColor: T.teal200, delta: "9 deals \u00b7 awaiting release", deltaColor: T.textMuted },
    { label: "READY TO PAY", value: `\u00a3${(K.readyToPay / 1000).toFixed(1)}k`, valueColor: T.green, delta: `${K.readyToPayCount} sellers \u00b7 conditions met`, deltaColor: T.green },
    { label: "OVERDUE", value: K.overdue.toString(), valueColor: T.red, delta: "Breaching 48h SLA", deltaColor: T.red },
    { label: "PAID TODAY", value: `\u00a3${(K.paidToday / 1000).toFixed(1)}k`, valueColor: T.teal200, delta: `${K.paidTodayCount} sellers`, deltaColor: T.green },
    { label: "AVG PAYOUT TIME", value: `${K.avgPayoutDays}d`, valueColor: T.green, delta: `\u2193 ${Math.abs(K.avgPayoutDelta)}d vs last week`, deltaColor: T.green },
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
/*  HELPERS                                                            */
/* ================================================================== */
function formatPrice(p: number): string { return "\u00a3" + p.toLocaleString(); }

const STATUS_PRIORITY: Record<PayoutStatus, number> = { overdue: 0, lien: 1, ready: 2, escrow: 3, paid: 4 };

function statusBadge(status: PayoutStatus) {
  const map: Record<PayoutStatus, { bg: string; color: string; label: string }> = {
    ready:  { bg: "#0A2A26", color: T.green, label: "Ready" },
    escrow: { bg: T.indigo,  color: T.teal200, label: "Escrow" },
    lien:   { bg: T.amberBg, color: T.amber, label: "Lien" },
    overdue:{ bg: T.redBg,   color: T.red, label: "Overdue" },
    paid:   { bg: T.greenBg, color: T.green, label: "Paid" },
  };
  const s = map[status];
  return <span className="inline-flex items-center rounded-full px-[7px] py-[2px]" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{s.label}</span>;
}

function methodBadge(method: DisbursementMethod) {
  const map: Record<DisbursementMethod, { bg: string; color: string }> = {
    RTP:  { bg: "#0A2A26", color: T.green },
    ACH:  { bg: "#0A1A2A", color: T.teal200 },
    Wire: { bg: T.amberBg, color: T.amber },
    BACS: { bg: T.indigo,  color: T.teal200 },
  };
  const s = map[method];
  return <span className="inline-flex items-center rounded-full px-[7px] py-[2px]" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{method}</span>;
}

function waitingBadge(label: string) {
  const hrs = waitingToHours(label);
  let bg = T.greenBg, color = T.green;
  if (hrs >= 48) { bg = T.redBg; color = T.red; }
  else if (hrs >= 24) { bg = T.amberBg; color = T.amber; }
  return (
    <span className="inline-flex items-center justify-center rounded-[5px]" style={{ minWidth: 34, height: 20, background: bg, color, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 11 }}>{label}</span>
  );
}

function conditionsBar(met: number, total: number) {
  const pct = (met / total) * 100;
  let color = T.red;
  if (met === total) color = T.green;
  else if (met >= 3) color = "#FCD34D";
  return (
    <div className="flex items-center gap-1">
      <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: T.bgRow }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ minWidth: 24, textAlign: "right", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color }}>{met}/{total}</span>
    </div>
  );
}

/* ================================================================== */
/*  PAYOUT TABLE                                                       */
/* ================================================================== */
const filterPills: { label: string; value: PayoutFilter }[] = [
  { label: "All", value: "all" },
  { label: "Ready to pay", value: "ready" },
  { label: "Overdue", value: "overdue" },
  { label: "Lien pending", value: "lien" },
  { label: "In escrow", value: "escrow" },
];

function PayoutTable({
  activeFilter, setActiveFilter,
  searchQuery, setSearchQuery,
  selectedPayouts, setSelectedPayouts,
}: {
  activeFilter: PayoutFilter; setActiveFilter: (f: PayoutFilter) => void;
  searchQuery: string; setSearchQuery: (s: string) => void;
  selectedPayouts: string[]; setSelectedPayouts: (ids: string[]) => void;
}) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Filter
  let filtered = PAYOUT_QUEUE;
  if (activeFilter === "ready") filtered = filtered.filter(p => p.status === "ready");
  else if (activeFilter === "overdue") filtered = filtered.filter(p => p.status === "overdue");
  else if (activeFilter === "lien") filtered = filtered.filter(p => p.status === "lien");
  else if (activeFilter === "escrow") filtered = filtered.filter(p => p.status === "escrow");

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => `${p.seller} ${p.vehicle}`.toLowerCase().includes(q));
  }

  // Default sort: status priority, then waiting hours desc
  const sorted = [...filtered].sort((a, b) => {
    const sp = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (sp !== 0) return sp;
    return waitingToHours(b.waitingLabel) - waitingToHours(a.waitingLabel);
  });

  const allVisible = sorted.map(p => p.id);
  const allSelected = allVisible.length > 0 && allVisible.every(id => selectedPayouts.includes(id));
  const someSelected = !allSelected && allVisible.some(id => selectedPayouts.includes(id));

  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected; }, [someSelected]);

  const toggleAll = () => {
    if (allSelected) setSelectedPayouts(selectedPayouts.filter(id => !allVisible.includes(id)));
    else setSelectedPayouts([...new Set([...selectedPayouts, ...allVisible])]);
  };
  const toggleOne = (id: string) => setSelectedPayouts(selectedPayouts.includes(id) ? selectedPayouts.filter(x => x !== id) : [...selectedPayouts, id]);

  return (
    <div className="rounded-[10px] overflow-hidden min-w-0" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Payout queue</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textMuted }}>{sorted.length} payouts</span>
      </div>
      <div className="flex items-center gap-[6px] flex-wrap px-[14px] py-[6px]">
        <div className="relative" style={{ width: 160 }}>
          <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2" style={{ color: T.textDim }} />
          <input type="text" placeholder="Search seller, vehicle\u2026" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1 rounded-[8px] outline-none" style={{ background: T.bgCard, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }} />
        </div>
        {filterPills.map(p => (
          <button key={p.value} onClick={() => setActiveFilter(p.value)} className="px-[9px] py-1 rounded-[7px] transition-colors" style={{ background: activeFilter === p.value ? T.indigo : T.bgRow, color: activeFilter === p.value ? T.teal200 : T.textMuted, border: `1px solid ${activeFilter === p.value ? T.indigo : T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11 }}>{p.label}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 700, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 30 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 78 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 74 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 88 }} />
          </colgroup>
          <thead>
            <tr>
              <th className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar }}>
                <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: T.teal }} />
              </th>
              {["Seller", "Vehicle", "Net payout", "Status", "Method", "Waiting", "Conditions"].map(h => (
                <th key={h} className="px-[10px] py-[7px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((payout, idx) => (
              <tr key={payout.id} className="cursor-pointer transition-colors duration-150"
                onMouseEnter={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = T.bgHover))}
                onMouseLeave={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = "transparent"))}
                onClick={() => { console.log("navigate payout", payout.id); router.push(`/admin/payouts/${payout.id}`); }}
              >
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }} onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedPayouts.includes(payout.id)} onChange={() => toggleOne(payout.id)} style={{ accentColor: T.teal }} />
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary }}>
                  {payout.seller}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontSize: 11, color: T.textSecondary }}>
                  {payout.vehicle}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.teal200 }}>
                  {formatPrice(payout.netPayout)}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  {statusBadge(payout.status)}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  {methodBadge(payout.method)}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  {waitingBadge(payout.waitingLabel)}
                </td>
                <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  {conditionsBar(payout.condsMet, payout.condsTotal)}
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
/*  ESCROW TRACKER PANEL                                               */
/* ================================================================== */
function EscrowTrackerPanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Escrow tracker</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.teal200 }}>{"\u00a3"}82.3k held</span>
      </div>
      <div className="px-[14px]">
        {ESCROW_ROWS.map((row, idx) => (
          <div key={row.id} className="flex items-start gap-2 py-[7px]" style={{ borderBottom: idx < ESCROW_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.sellerVehicle}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{row.sub}</div>
              <div className="flex gap-1 mt-[4px] flex-wrap">
                {row.conditions.map((c, ci) => (
                  <span key={ci} className="rounded-[4px] px-[5px] py-[1px]" style={{
                    background: c.status === "met" ? T.greenBg : T.bgRow,
                    color: c.status === "met" ? T.green : T.textMuted,
                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9,
                  }}>
                    {c.status === "met" ? "\u2713" : "\u23f3"} {c.label}
                  </span>
                ))}
              </div>
            </div>
            <span className="flex-shrink-0 text-right" style={{ minWidth: 60, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: row.amountColor }}>{formatPrice(row.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  OVERDUE ALERTS PANEL                                               */
/* ================================================================== */
function OverdueAlertsPanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Overdue alerts</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{OVERDUE_ALERTS.length} overdue</span>
      </div>
      <div className="px-[14px]">
        {OVERDUE_ALERTS.map((alert, idx) => (
          <div key={alert.id} className="flex items-start gap-2 py-[7px]" style={{ borderBottom: idx < OVERDUE_ALERTS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span className="flex-shrink-0 mt-[1px] rounded-full px-[7px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{alert.waitingLabel}</span>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{alert.sellerVehicle}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{alert.stallReason}</div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: T.teal200, marginTop: 2 }}>{alert.recommendedAction}</div>
            </div>
            <span className="flex-shrink-0 text-right" style={{ minWidth: 28, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 11, color: T.red }}>{alert.waitingLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LIEN PAYOFF PANEL                                                  */
/* ================================================================== */
function LienPayoffPanel() {
  const pendingCount = LIEN_ROWS.filter(r => r.status === "pending").length;
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Lien payoffs</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.amberBg, color: T.amber, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{pendingCount} pending</span>
      </div>
      <div className="px-[14px]">
        {LIEN_ROWS.map((row, idx) => (
          <div key={row.id} className="flex items-center gap-2 py-[6px]" style={{ borderBottom: idx < LIEN_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div className="flex-1 min-w-0">
              <div className="truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.sellerVehicle}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>Lienholder: {row.lienholder} {"\u00b7"} {row.note}</div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0" style={{ minWidth: 60 }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: row.status === "pending" ? T.amber : T.green }}>{formatPrice(row.amount)}</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: row.status === "pending" ? T.amber : T.green }}>{row.status === "pending" ? "Pending" : "Released"}</span>
            </div>
          </div>
        ))}
        {/* Footer stats */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 6, marginTop: 2 }}>
          <div className="flex items-center py-[3px]">
            <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Payoffs processed this month</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.teal200 }}>3</span>
          </div>
          <div className="flex items-center py-[3px]">
            <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Avg payoff processing time</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.green }}>18 hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DISBURSEMENT METHODS PANEL                                         */
/* ================================================================== */
function DisbursementPanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Disbursement methods</span>
      </div>
      <div className="px-[14px]">
        {DISBURSEMENT_ROWS.map((row, idx) => (
          <div key={row.method} className="flex items-center gap-2 py-[6px]" style={{ borderBottom: idx < DISBURSEMENT_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            {methodBadge(row.method)}
            <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textSecondary }}>{row.fullName}</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary, minWidth: 22, textAlign: "center" }}>{row.count}</span>
            <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 80, height: 5, background: T.bgRow }}>
              <div className="h-full rounded-full" style={{ width: `${row.barPct}%`, background: row.barColor }} />
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, minWidth: 58, textAlign: "right", color: row.amountColor }}>{"\u00a3"}{(row.totalAmount / 1000).toFixed(1)}k</span>
          </div>
        ))}
        {/* Footer */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 6, marginTop: 2 }}>
          <div className="flex items-center py-[3px]">
            <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Failed payments (7d)</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.red }}>1 {"\u2014"} retry pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAX COMPLIANCE PANEL                                               */
/* ================================================================== */
function TaxCompliancePanel() {
  // TODO: Update threshold and deadline from HMRC guidance API when available.
  const hasRed = TAX_ROWS.some(r => r.dotColor === "red");
  const amberCount = TAX_ROWS.filter(r => r.dotColor === "amber").length;
  let headerLabel = "All clear";
  let headerColor = T.green;
  if (hasRed) { headerLabel = "1 active"; headerColor = T.red; }
  else if (amberCount > 0) { headerLabel = `${amberCount} warning`; headerColor = T.amber; }

  const dotColors: Record<string, string> = { green: T.green, red: T.red, amber: T.amber, muted: T.textMuted };

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Tax compliance</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: headerColor }}>{headerLabel}</span>
      </div>
      <div className="px-[14px]">
        {TAX_ROWS.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2 py-[6px]" style={{ borderBottom: idx < TAX_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: dotColors[row.dotColor] }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.title}</div>
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
/*  PAGE                                                               */
/* ================================================================== */
export default function PayoutsPage() {
  const [activeFilter, setActiveFilter] = useState<PayoutFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);

  // Check if any selected payouts have "ready" status
  const readySelected = selectedPayouts.some(id => {
    const p = PAYOUT_QUEUE.find(q => q.id === id);
    return p && p.status === "ready";
  });

  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar selectedPayouts={selectedPayouts} readySelected={readySelected} />
        <div className="flex-1 flex flex-col gap-[10px] overflow-x-hidden" style={{ padding: "14px 20px" }}>
          <KpiStrip />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 292px", gap: 10 }}>
            <PayoutTable
              activeFilter={activeFilter} setActiveFilter={setActiveFilter}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              selectedPayouts={selectedPayouts} setSelectedPayouts={setSelectedPayouts}
            />
            <div className="flex flex-col gap-[10px]">
              <EscrowTrackerPanel />
              <OverdueAlertsPanel />
              <LienPayoffPanel />
              <DisbursementPanel />
              <TaxCompliancePanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
