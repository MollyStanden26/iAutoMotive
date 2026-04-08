"use client";

import React, { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, PhoneIncoming, PhoneOutgoing, Search,
  Play, ChevronDown, ChevronRight, PhoneOff,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  CALL_LOG,
  CALLER_PROFILES,
  OUTCOME_LABELS,
  OUTCOME_COLORS,
} from "@/lib/admin/calls-mock-data";
import type { CallLogRecord } from "@/lib/admin/calls-mock-data";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const T = {
  bgPage:        "#0B111E",
  bgCard:        "#0D1525",
  bgSidebar:     "#070D18",
  bgRow:         "#111D30",
  bgHover:       "#0C1428",
  border:        "#1E2D4A",
  border2:       "#111D30",
  textPrimary:   "#F1F5F9",
  textSecondary: "#C5CDD8",
  textMuted:     "#94A3BB",
  textDim:       "#A0AEBF",
  teal:          "#008C7C",
  teal200:       "#4DD9C7",
  green:         "#34D399",
  greenBg:       "#0B2B1A",
  amber:         "#F5A623",
  amberBg:       "#2B1A00",
  red:           "#F87171",
  redBg:         "#2B0F0F",
  indigo:        "#A78BFA",
  indigoBg:      "#1A1040",
  navy:          "#0F1724",
};

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */
function formatDuration(s: number): string {
  if (s === 0) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${months[d.getMonth()]} ${hh}:${mm}`;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "..." : s;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date("2026-04-08T17:00:00.000Z");
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  const weekStart = new Date("2026-04-06T00:00:00.000Z"); // Monday Apr 6
  return d >= weekStart;
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  return d.getMonth() === 3 && d.getFullYear() === 2026; // April 2026
}

/* ================================================================== */
/*  CRM TOPBAR (calls variant)                                         */
/* ================================================================== */
const crmTabs = [
  { label: "Pipeline",    href: "/admin/crm" },
  { label: "Dialler",     href: "/admin/crm/dialler" },
  { label: "Calls",       href: "/admin/crm/calls" },
  { label: "Scripts",     href: "/admin/crm/scripts" },
  { label: "Performance", href: "/admin/crm/performance" },
];

function CallsTopbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-3 px-[22px]"
      style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mr-3">
        <span className="cursor-pointer font-body text-[13px]" style={{ color: T.textDim }} onClick={() => router.push("/admin")}>
          Admin
        </span>
        <span style={{ color: T.textDim }} className="text-[13px]">/</span>
        <span className="cursor-pointer font-body text-[13px]" style={{ color: T.textDim }} onClick={() => router.push("/admin/crm")}>
          CRM
        </span>
        <span style={{ color: T.textDim }} className="text-[13px]">/</span>
        <span className="font-heading font-[800] text-[17px]" style={{ color: T.textPrimary }}>Calls</span>
      </div>

      {/* Tab nav */}
      <div className="flex-1 flex justify-center">
        <div className="flex rounded-[10px] p-[3px]" style={{ background: T.bgRow }}>
          {crmTabs.map(tab => {
            const active = pathname === tab.href || (tab.href !== "/admin/crm" && pathname.startsWith(tab.href));
            return (
              <button
                key={tab.label}
                onClick={() => router.push(tab.href)}
                className="px-3 py-1.5 rounded-[8px] font-body text-[12px] font-semibold transition-colors duration-150"
                style={{
                  background: active ? T.bgCard : "transparent",
                  color: active ? T.textPrimary : T.textMuted,
                  border: "none", cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/admin/crm"
        className="flex items-center gap-1.5 font-body text-[12px] font-semibold no-underline"
        style={{ color: T.textMuted }}
      >
        <ArrowLeft size={14} />
        Back to CRM
      </Link>
    </div>
  );
}

/* ================================================================== */
/*  KPI ROW                                                            */
/* ================================================================== */
function CallsKpiRow({ data }: { data: CallLogRecord[] }) {
  const totalCalls = data.length;
  const connected = data.filter(c => c.duration > 0);
  const avgDuration = connected.length > 0
    ? Math.round(connected.reduce((sum, c) => sum + c.duration, 0) / connected.length)
    : 0;
  const contactRate = totalCalls > 0
    ? Math.round((connected.length / totalCalls) * 100)
    : 0;
  const conversions = data.filter(c => c.outcome === "converted").length;
  const conversionRate = totalCalls > 0
    ? Math.round((conversions / totalCalls) * 100)
    : 0;

  const kpis = [
    { label: "Total Calls", value: String(totalCalls), color: T.textPrimary, delta: `${data.filter(c => isToday(c.timestamp)).length} today` },
    { label: "Avg Duration", value: formatDuration(avgDuration), color: T.teal200, delta: "connected calls" },
    { label: "Contact Rate", value: `${contactRate}%`, color: contactRate >= 60 ? T.green : T.amber, delta: `${connected.length} of ${totalCalls} reached` },
    { label: "Conversion Rate", value: `${conversionRate}%`, color: conversionRate >= 10 ? T.green : T.amber, delta: `${conversions} converted` },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
      {kpis.map(kpi => (
        <div
          key={kpi.label}
          className="rounded-[14px] px-[15px] py-[13px]"
          style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        >
          <div
            className="font-body font-bold text-[10px] uppercase tracking-widest mb-[7px]"
            style={{ color: T.textDim }}
          >
            {kpi.label}
          </div>
          <div
            className="font-heading font-black text-[30px] leading-none tracking-tight mb-1"
            style={{ color: kpi.color }}
          >
            {kpi.value}
          </div>
          <div
            className="font-body font-semibold text-[11px]"
            style={{ color: T.textMuted }}
          >
            {kpi.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  FILTER BAR                                                         */
/* ================================================================== */
function CallsFilterBar({
  callerFilter, setCallerFilter,
  outcomeFilter, setOutcomeFilter,
  directionFilter, setDirectionFilter,
  dateFilter, setDateFilter,
  searchQuery, setSearchQuery,
}: {
  callerFilter: string; setCallerFilter: (v: string) => void;
  outcomeFilter: string; setOutcomeFilter: (v: string) => void;
  directionFilter: string; setDirectionFilter: (v: string) => void;
  dateFilter: string; setDateFilter: (v: string) => void;
  searchQuery: string; setSearchQuery: (v: string) => void;
}) {
  const selectStyle: React.CSSProperties = {
    background: T.bgRow,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "4px 8px",
    fontSize: 12,
    color: T.textSecondary,
    outline: "none",
  };

  const datePills = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  return (
    <div
      className="rounded-[14px] px-[15px] py-[11px] flex items-center gap-2 flex-wrap"
      style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
    >
      {/* Selects */}
      <select style={selectStyle} value={callerFilter} onChange={e => setCallerFilter(e.target.value)}>
        <option value="all">All callers</option>
        {CALLER_PROFILES.map(cp => (
          <option key={cp.initials} value={cp.name}>{cp.name}</option>
        ))}
      </select>

      <select style={selectStyle} value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value)}>
        <option value="all">All outcomes</option>
        {Object.entries(OUTCOME_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <select style={selectStyle} value={directionFilter} onChange={e => setDirectionFilter(e.target.value)}>
        <option value="all">All directions</option>
        <option value="outbound">Outbound</option>
        <option value="inbound">Inbound</option>
      </select>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />

      {/* Date pills */}
      <div className="flex gap-1">
        {datePills.map(pill => (
          <button
            key={pill.key}
            onClick={() => setDateFilter(pill.key)}
            className="px-2.5 py-1 rounded-[8px] font-body text-[11px] font-semibold transition-colors duration-150"
            style={{
              background: dateFilter === pill.key ? T.bgCard : "transparent",
              color: dateFilter === pill.key ? T.textPrimary : T.textMuted,
              border: dateFilter === pill.key ? `1px solid ${T.border}` : "1px solid transparent",
              cursor: "pointer",
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1" style={{ background: T.bgRow, border: `1px solid ${T.border}` }}>
        <Search size={13} style={{ color: T.textDim }} />
        <input
          type="text"
          placeholder="Search seller or phone..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none font-body text-[12px]"
          style={{ color: T.textSecondary, width: 170 }}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  EXPANDED CALL ROW                                                  */
/* ================================================================== */
function ExpandedCallRow({ call }: { call: CallLogRecord }) {
  const timelineSteps = ["Initiated", "Ringing", "Answered", "Ended"];
  const wasAnswered = call.duration > 0;
  const activeSteps = wasAnswered ? 4 : 2;

  return (
    <tr>
      <td colSpan={9} style={{ background: T.bgRow, padding: 0 }}>
        <div className="px-[18px] py-[14px] flex flex-col gap-3">
          {/* Full notes */}
          <div>
            <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-1" style={{ color: T.textDim }}>
              Disposition Notes
            </div>
            <div className="font-body text-[13px] leading-relaxed" style={{ color: T.textSecondary }}>
              {call.notes}
            </div>
          </div>

          {/* Recording player placeholder */}
          {call.hasRecording && (
            <div>
              <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.textDim }}>
                Recording
              </div>
              <div className="flex items-center gap-3 rounded-[10px] px-3 py-2" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
                <button
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 28, height: 28, background: T.teal, border: "none", cursor: "pointer" }}
                >
                  <Play size={13} style={{ color: "#fff", marginLeft: 1 }} />
                </button>
                {/* Waveform bars */}
                <div className="flex items-end gap-[2px]" style={{ height: 24 }}>
                  {Array.from({ length: 32 }).map((_, i) => {
                    const h = 4 + Math.floor(Math.random() * 18);
                    return (
                      <div
                        key={i}
                        style={{
                          width: 2,
                          height: h,
                          borderRadius: 1,
                          background: i < 8 ? T.teal : T.border,
                          opacity: i < 8 ? 1 : 0.5,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="font-mono text-[11px] ml-auto" style={{ color: T.textMuted }}>
                  0:00 / {formatDuration(call.duration)}
                </span>
              </div>
            </div>
          )}

          {/* Call timeline */}
          <div>
            <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.textDim }}>
              Call Timeline
            </div>
            <div className="flex items-center gap-0">
              {timelineSteps.map((step, i) => {
                const active = i < activeSteps;
                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className="flex items-center justify-center rounded-full font-body font-bold text-[9px]"
                        style={{
                          width: 22, height: 22,
                          background: active ? T.teal : T.bgCard,
                          color: active ? "#fff" : T.textDim,
                          border: `1px solid ${active ? T.teal : T.border}`,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span className="font-body text-[10px] mt-1" style={{ color: active ? T.textSecondary : T.textDim }}>
                        {step}
                      </span>
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div
                        style={{
                          width: 32, height: 2, margin: "0 4px",
                          background: i < activeSteps - 1 ? T.teal : T.border,
                          marginBottom: 16,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 font-body font-semibold text-[12px] transition-opacity duration-150"
              style={{ background: T.teal, color: "#fff", border: "none", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <Phone size={13} />
              Call again
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ================================================================== */
/*  EMPTY STATE                                                        */
/* ================================================================== */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <tr>
      <td colSpan={9} className="text-center py-16">
        <div className="flex flex-col items-center gap-2">
          <PhoneOff size={32} style={{ color: T.textDim }} />
          <span className="font-body text-[14px] font-semibold" style={{ color: T.textMuted }}>
            No calls match your filters
          </span>
          <button
            onClick={onReset}
            className="font-body text-[12px] font-semibold bg-transparent border-none cursor-pointer"
            style={{ color: T.teal200 }}
          >
            Reset filters
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ================================================================== */
/*  CALLS TABLE                                                        */
/* ================================================================== */
function CallsTable({
  data,
  expandedRow,
  setExpandedRow,
  onReset,
}: {
  data: CallLogRecord[];
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  onReset: () => void;
}) {
  const columns = [
    { label: "Date / Time", width: "11%" },
    { label: "Dir", width: "6%" },
    { label: "Caller", width: "12%" },
    { label: "Seller", width: "14%" },
    { label: "Vehicle", width: "16%" },
    { label: "Duration", width: "7%" },
    { label: "Outcome", width: "11%" },
    { label: "Notes", width: "16%" },
    { label: "Rec", width: "7%" },
  ];

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div
        className="flex items-center px-[15px] py-[11px]"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Call Log
        </span>
        <span className="font-body text-[11px]" style={{ color: T.textMuted }}>
          {data.length} {data.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout: "fixed", minWidth: 860 }}>
          <colgroup>
            {columns.map(col => (
              <col key={col.label} style={{ width: col.width }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {columns.map((col, i) => (
                <th
                  key={col.label}
                  className="font-body font-bold text-[10px] uppercase tracking-widest text-left pb-2 pt-2 px-[10px]"
                  style={{ color: T.textDim, paddingLeft: i === 0 ? 14 : undefined }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <EmptyState onReset={onReset} />
            ) : (
              data.map((call, i) => {
                const isExpanded = expandedRow === call.id;
                const oc = OUTCOME_COLORS[call.outcome] || { color: T.textMuted, bg: T.bgRow };
                const ol = OUTCOME_LABELS[call.outcome] || call.outcome;

                return (
                  <React.Fragment key={call.id}>
                    <tr
                      className="cursor-pointer transition-colors duration-150"
                      style={{ borderBottom: `1px solid ${T.border2}` }}
                      onClick={() => setExpandedRow(isExpanded ? null : call.id)}
                      onMouseEnter={e => (e.currentTarget.style.background = T.bgHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Date/Time */}
                      <td className="py-[9px] px-[10px] pl-[14px]">
                        <div className="flex items-center gap-1">
                          {isExpanded
                            ? <ChevronDown size={12} style={{ color: T.textDim }} />
                            : <ChevronRight size={12} style={{ color: T.textDim }} />
                          }
                          <span className="font-mono text-[11px]" style={{ color: T.textSecondary }}>
                            {formatTimestamp(call.timestamp)}
                          </span>
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="py-[9px] px-[10px]">
                        {call.direction === "outbound" ? (
                          <PhoneOutgoing size={14} style={{ color: T.teal }} />
                        ) : (
                          <PhoneIncoming size={14} style={{ color: T.green }} />
                        )}
                      </td>

                      {/* Caller */}
                      <td className="py-[9px] px-[10px]">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="flex items-center justify-center rounded-full font-body font-bold text-[9px]"
                            style={{
                              width: 28, height: 28, minWidth: 28,
                              background: call.callerBg,
                              color: "#fff",
                            }}
                          >
                            {call.callerInitials}
                          </div>
                          <span className="font-body text-[12px] font-semibold" style={{ color: T.textSecondary }}>
                            {call.callerName}
                          </span>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="py-[9px] px-[10px]">
                        <div className="font-body text-[12px] font-semibold" style={{ color: T.textPrimary }}>
                          {call.sellerName}
                        </div>
                        <div className="font-mono text-[10px]" style={{ color: T.textDim }}>
                          {call.sellerPhone}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-[9px] px-[10px]">
                        <span className="font-body text-[11px]" style={{ color: T.textMuted }}>
                          {call.vehicleSummary}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-[9px] px-[10px]">
                        <span className="font-mono text-[11px]" style={{ color: call.duration > 0 ? T.textSecondary : T.textDim }}>
                          {formatDuration(call.duration)}
                        </span>
                      </td>

                      {/* Outcome */}
                      <td className="py-[9px] px-[10px]">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 font-body font-semibold text-[10px]"
                          style={{ background: oc.bg, color: oc.color }}
                        >
                          {ol}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-[9px] px-[10px]">
                        <span className="font-body text-[11px]" style={{ color: T.textDim }}>
                          {truncate(call.notes, 40)}
                        </span>
                      </td>

                      {/* Recording */}
                      <td className="py-[9px] px-[10px]">
                        {call.hasRecording ? (
                          <button
                            className="flex items-center justify-center rounded-[6px] transition-colors duration-150"
                            style={{
                              width: 26, height: 26,
                              background: T.bgRow,
                              border: `1px solid ${T.border}`,
                              cursor: "pointer",
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              setExpandedRow(isExpanded ? null : call.id);
                            }}
                          >
                            <Play size={11} style={{ color: T.teal200, marginLeft: 1 }} />
                          </button>
                        ) : (
                          <span style={{ color: T.textDim }}>—</span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && <ExpandedCallRow call={call} />}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE ASSEMBLY                                                      */
/* ================================================================== */

export default function CrmCallsPage() {
  const [callerFilter, setCallerFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return CALL_LOG.filter(call => {
      if (callerFilter !== "all" && call.callerName !== callerFilter) return false;
      if (outcomeFilter !== "all" && call.outcome !== outcomeFilter) return false;
      if (directionFilter !== "all" && call.direction !== directionFilter) return false;
      if (dateFilter === "today" && !isToday(call.timestamp)) return false;
      if (dateFilter === "week" && !isThisWeek(call.timestamp)) return false;
      if (dateFilter === "month" && !isThisMonth(call.timestamp)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !call.sellerName.toLowerCase().includes(q) &&
          !call.sellerPhone.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [callerFilter, outcomeFilter, directionFilter, dateFilter, searchQuery]);

  const resetFilters = () => {
    setCallerFilter("all");
    setOutcomeFilter("all");
    setDirectionFilter("all");
    setDateFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <CallsTopbar />
        <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto overflow-x-hidden">
          <CallsKpiRow data={filteredData} />
          <CallsFilterBar
            callerFilter={callerFilter} setCallerFilter={setCallerFilter}
            outcomeFilter={outcomeFilter} setOutcomeFilter={setOutcomeFilter}
            directionFilter={directionFilter} setDirectionFilter={setDirectionFilter}
            dateFilter={dateFilter} setDateFilter={setDateFilter}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          />
          <CallsTable
            data={filteredData}
            expandedRow={expandedRow}
            setExpandedRow={setExpandedRow}
            onReset={resetFilters}
          />
        </div>
      </div>
    </div>
  );
}
