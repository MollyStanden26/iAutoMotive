"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Minus, Trophy, Target, BarChart3,
  Users, Phone, AlertTriangle, ChevronDown, ChevronRight,
  Calendar, Award, Flag,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import { CrmTopbar } from "@/components/admin/crm-topbar";
import {
  repPerformance,
  teamTargets,
  weeklyHistory,
  outcomeDistribution,
} from "@/lib/admin/performance-mock-data";
import type { TeamTarget } from "@/lib/admin/performance-mock-data";

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
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatCurrency(pence: number): string {
  const pounds = Math.round(pence / 100);
  return `\u00A3${pounds.toLocaleString("en-GB")}`;
}

function formatCurrencyShort(pounds: number): string {
  return `\u00A3${pounds.toLocaleString("en-GB")}`;
}

function pctOf(actual: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((actual / target) * 100), 100);
}

function barColorFn(pct: number): string {
  if (pct >= 90) return T.green;
  if (pct >= 70) return T.amber;
  return T.red;
}

/* ================================================================== */
/*  EMPTY STATE                                                        */
/* ================================================================== */
function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-[28px]"
      style={{ color: T.textMuted }}
    >
      <BarChart3 size={22} style={{ color: T.textDim, marginBottom: 8, opacity: 0.6 }} />
      <span className="font-body text-[12px]" style={{ color: T.textMuted }}>{message}</span>
    </div>
  );
}

/* ================================================================== */
/*  OUTCOME COLORS                                                     */
/* ================================================================== */
const OUTCOME_COLORS: Record<string, string> = {
  "No Answer":                     "#64748B",
  "Voicemail Left":                "#8B5CF6",
  "Contacted \u2014 Interested":   T.teal200,
  "Contacted \u2014 Not Interested": T.amber,
  "Callback Booked":               T.indigo,
  "Offer Sent":                    T.green,
  "Wrong Number":                  T.red,
  "Signed":                        "#22D3EE",
  "Other":                         "#475569",
};

/* ================================================================== */
/*  KPI ROW                                                            */
/* ================================================================== */
interface PerfStats {
  dialsToday: number; dialsYesterday: number; contactRate: number;
  connectedThisWeek: number; callsThisWeek: number;
  offersOut: number; signedWeek: number; revenueWeekPence: number;
}
type DeltaType = "up" | "down" | "neutral";

function PerformanceKpiRow() {
  const [s, setS] = useState<PerfStats | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/crm/performance", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) setS(d.stats ?? null); })
      .catch(err => { if (!cancelled) console.error("[PerformanceKpiRow] fetch failed:", err); });
    return () => { cancelled = true; };
  }, []);

  const dialsToday = s?.dialsToday ?? 0;
  const dialsYesterday = s?.dialsYesterday ?? 0;
  const dialsPct = dialsYesterday > 0 ? Math.round(((dialsToday - dialsYesterday) / dialsYesterday) * 100) : null;
  const dialsDelta = dialsPct !== null
    ? { delta: `${dialsPct >= 0 ? "+" : ""}${dialsPct}% vs yesterday`, deltaType: (dialsPct >= 0 ? "up" : "down") as DeltaType }
    : { delta: dialsToday > 0 ? "none yesterday" : "No dials yet", deltaType: "neutral" as DeltaType };

  const signed = s?.signedWeek ?? 0;
  const kpis: { label: string; value: string; delta: string; deltaType: DeltaType; icon: typeof Phone }[] = [
    { label: "Dials Today", value: dialsToday.toString(), ...dialsDelta, icon: Phone },
    { label: "Contact Rate", value: `${s?.contactRate ?? 0}%`,
      delta: (s?.callsThisWeek ?? 0) > 0 ? `${s?.connectedThisWeek}/${s?.callsThisWeek} connected this wk` : "No calls this week",
      deltaType: "neutral", icon: Users },
    { label: "Offers Out", value: (s?.offersOut ?? 0).toString(),
      delta: (s?.offersOut ?? 0) > 0 ? "awaiting signature" : "None out", deltaType: "neutral", icon: Target },
    { label: "Deals Signed (Week)", value: signed.toString(),
      delta: signed > 0 ? "this week" : "None this week", deltaType: signed > 0 ? "up" : "neutral", icon: Trophy },
    { label: "Revenue This Week", value: formatCurrency(s?.revenueWeekPence ?? 0),
      delta: signed > 0 ? `from ${signed} deal${signed > 1 ? "s" : ""}` : "No deals this week", deltaType: "neutral", icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map(kpi => {
        const Icon = kpi.icon;
        const deltaColor = kpi.deltaType === "up" ? T.green : kpi.deltaType === "down" ? T.red : T.textMuted;
        const DeltaIcon = kpi.deltaType === "up" ? TrendingUp : kpi.deltaType === "down" ? TrendingDown : Minus;
        return (
          <div
            key={kpi.label}
            className="rounded-[14px] px-3 py-3 sm:px-4 sm:py-[14px] min-w-0"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            <div className="flex items-center gap-2 mb-[6px] min-w-0">
              <Icon size={14} style={{ color: T.textMuted, flexShrink: 0 }} />
              <span className="font-body font-semibold text-[11px] uppercase tracking-wider truncate" style={{ color: T.textMuted }}>
                {kpi.label}
              </span>
            </div>
            <div className="font-heading font-[800] text-2xl sm:text-3xl leading-none mb-[4px]" style={{ color: T.textPrimary }}>
              {kpi.value}
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <DeltaIcon size={12} style={{ color: deltaColor, flexShrink: 0 }} />
              <span className="font-body text-[11px] font-semibold truncate" style={{ color: deltaColor }}>
                {kpi.delta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  REP LEADERBOARD                                                    */
/* ================================================================== */
type SortKey = "rank" | "dialsToday" | "contactsToday" | "contactRate" | "offersToday" | "signedToday" | "avgCallDuration";
type TimeRange = "week" | "month" | "all";

function RepLeaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  const sorted = useMemo(() => {
    const arr = [...repPerformance];
    arr.sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortAsc ? va - vb : vb - va;
    });
    return arr;
  }, [sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "rank");
    }
  }

  const columns: { key: SortKey; label: string; w: string; sortable: boolean }[] = [
    { key: "rank",            label: "#",            w: "36px",  sortable: true },
    { key: "rank",            label: "Rep",          w: "1fr",   sortable: false },
    { key: "dialsToday",      label: "Dials",        w: "64px",  sortable: true },
    { key: "contactsToday",   label: "Contacts",     w: "72px",  sortable: true },
    { key: "contactRate",     label: "Contact %",    w: "76px",  sortable: true },
    { key: "offersToday",     label: "Offers",       w: "60px",  sortable: true },
    { key: "signedToday",     label: "Signed",       w: "60px",  sortable: true },
    { key: "avgCallDuration", label: "Avg Duration", w: "90px",  sortable: true },
  ];

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  function rateColor(val: number, target: number): string {
    const pct = target > 0 ? (val / target) * 100 : 0;
    if (pct >= 90) return T.green;
    if (pct >= 70) return T.amber;
    return T.red;
  }

  return (
    <div className="rounded-[14px] overflow-hidden min-w-0" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="flex flex-wrap items-center px-3 sm:px-4 py-3 gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <Trophy size={15} style={{ color: T.amber, flexShrink: 0 }} />
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0 truncate" style={{ color: T.textPrimary }}>
          Rep Leaderboard
        </span>
        <div className="flex rounded-[8px] p-[2px]" style={{ background: T.bgRow }}>
          {timeRanges.map(tr => (
            <button
              key={tr.key}
              onClick={() => setTimeRange(tr.key)}
              className="px-2 sm:px-2.5 py-1 rounded-[6px] font-body text-[11px] font-semibold whitespace-nowrap"
              style={{
                background: timeRange === tr.key ? T.bgCard : "transparent",
                color: timeRange === tr.key ? T.textPrimary : T.textMuted,
                border: "none", cursor: "pointer",
              }}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable table region */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="min-w-[640px]">
      {/* Column headers */}
      <div
        className="px-3 sm:px-4 py-[8px]"
        style={{
          display: "grid",
          gridTemplateColumns: columns.map(c => c.w).join(" "),
          gap: 8,
          borderBottom: `1px solid ${T.border2}`,
        }}
      >
        {columns.map((col, i) => (
          <button
            key={`${col.label}-${i}`}
            onClick={() => col.sortable ? handleSort(col.key) : undefined}
            className="font-body font-bold text-[10px] uppercase tracking-widest text-left bg-transparent border-none p-0"
            style={{ color: sortKey === col.key && col.sortable ? T.teal200 : T.textDim, cursor: col.sortable ? "pointer" : "default" }}
          >
            {col.label}
            {sortKey === col.key && col.sortable && (
              <span style={{ color: T.teal200, marginLeft: 2 }}>{sortAsc ? "\u2191" : "\u2193"}</span>
            )}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="px-3 sm:px-4">
        {sorted.length === 0 && <EmptyState message="No rep performance data yet" />}
        {sorted.map((rep, idx) => {
          const isExpanded = expandedId === rep.id;
          const dialPct = pctOf(rep.dialsToday, rep.dailyDialTarget);
          const dialColor = rateColor(rep.dialsToday, rep.dailyDialTarget);
          const crColor = rep.contactRate >= 30 ? T.green : rep.contactRate >= 22 ? T.amber : T.red;

          return (
            <div key={rep.id}>
              {/* Main row */}
              <div
                className="py-[10px] items-center cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : rep.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: columns.map(c => c.w).join(" "),
                  gap: 8,
                  borderBottom: idx < sorted.length - 1 && !isExpanded ? `1px solid ${T.border2}` : "none",
                  background: isExpanded ? T.bgRow : "transparent",
                  borderRadius: isExpanded ? "8px 8px 0 0" : 0,
                  padding: isExpanded ? "10px 8px" : "10px 0",
                  margin: isExpanded ? "0 -4px" : 0,
                }}
              >
                {/* Rank */}
                <span
                  className="font-heading font-[800] text-[14px] text-center"
                  style={{ color: rep.rank === 1 ? T.amber : T.textDim }}
                >
                  {rep.rank}
                </span>

                {/* Rep info */}
                <div className="flex items-center gap-[8px] min-w-0">
                  <div
                    className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 font-body font-[800] text-[11px] text-white"
                    style={{ background: rep.avatarBg }}
                  >
                    {rep.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>
                        {rep.name}
                      </span>
                      {rep.coachingFlag === "positive" && (
                        <Award size={12} style={{ color: T.green }} />
                      )}
                      {rep.coachingFlag === "needs_coaching" && (
                        <Flag size={12} style={{ color: T.red }} />
                      )}
                    </div>
                    <span className="font-body text-[11px]" style={{ color: T.textMuted }}>
                      {rep.avgCallsPerHour} calls/hr
                    </span>
                  </div>
                  {isExpanded
                    ? <ChevronDown size={14} style={{ color: T.textMuted, flexShrink: 0 }} />
                    : <ChevronRight size={14} style={{ color: T.textMuted, flexShrink: 0 }} />
                  }
                </div>

                {/* Dials */}
                <span className="font-heading font-[800] text-[14px]" style={{ color: dialColor }}>
                  {rep.dialsToday}
                </span>

                {/* Contacts */}
                <span className="font-heading font-bold text-[13px]" style={{ color: T.textSecondary }}>
                  {rep.contactsToday}
                </span>

                {/* Contact % */}
                <span className="font-heading font-bold text-[13px]" style={{ color: crColor }}>
                  {rep.contactRate}%
                </span>

                {/* Offers */}
                <span className="font-heading font-bold text-[13px]" style={{ color: T.textSecondary }}>
                  {rep.offersToday}
                </span>

                {/* Signed */}
                <span className="font-heading font-bold text-[13px]" style={{ color: rep.signedToday > 0 ? T.green : T.textMuted }}>
                  {rep.signedToday}
                </span>

                {/* Avg Duration */}
                <span className="font-mono text-[12px]" style={{ color: T.textSecondary }}>
                  {formatDuration(rep.avgCallDuration)}
                </span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  className="px-[12px] pb-[14px] pt-[4px]"
                  style={{
                    background: T.bgRow,
                    margin: "0 -4px",
                    borderRadius: "0 0 8px 8px",
                    borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none",
                  }}
                >
                  {/* Weekly stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                    {[
                      { label: "Dials (week)", val: rep.dialsWeek.toString(), color: T.teal200 },
                      { label: "Contacts (week)", val: rep.contactsWeek.toString(), color: T.textPrimary },
                      { label: "Signed (week)", val: rep.signedWeek.toString(), color: T.green },
                      { label: "Revenue (week)", val: formatCurrency(rep.revenueWeek), color: T.teal200 },
                    ].map(s => (
                      <div key={s.label} className="rounded-[8px] px-[10px] py-[8px]" style={{ background: T.bgCard }}>
                        <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-1" style={{ color: T.textDim }}>{s.label}</div>
                        <div className="font-heading font-[800] text-[16px]" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Targets progress */}
                  <div className="mb-3">
                    <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-2" style={{ color: T.textDim }}>Targets vs Actual</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Daily dial target */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-body text-[11px]" style={{ color: T.textMuted }}>Daily dials</span>
                          <span className="font-body font-bold text-[11px]" style={{ color: dialColor }}>{rep.dialsToday} / {rep.dailyDialTarget}</span>
                        </div>
                        <div className="h-[4px] rounded-full overflow-hidden" style={{ background: T.bgCard }}>
                          <div className="h-full rounded-full" style={{ width: `${dialPct}%`, background: dialColor }} />
                        </div>
                      </div>
                      {/* Weekly signed target */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-body text-[11px]" style={{ color: T.textMuted }}>Signed (week)</span>
                          <span className="font-body font-bold text-[11px]" style={{ color: rep.signedWeek >= rep.weeklySignedTarget ? T.green : T.amber }}>
                            {rep.signedWeek} / {rep.weeklySignedTarget}
                          </span>
                        </div>
                        <div className="h-[4px] rounded-full overflow-hidden" style={{ background: T.bgCard }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pctOf(rep.signedWeek, rep.weeklySignedTarget)}%`,
                              background: rep.signedWeek >= rep.weeklySignedTarget ? T.green : T.amber,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sparkline trend */}
                  <div className="mb-3">
                    <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-2" style={{ color: T.textDim }}>7-Day Dial Trend</div>
                    <div className="flex items-end gap-[3px]" style={{ height: 36 }}>
                      {rep.weeklyTrend.map((val, i) => {
                        const max = Math.max(...rep.weeklyTrend);
                        const h = max > 0 ? (val / max) * 32 + 4 : 4;
                        const isLast = i === rep.weeklyTrend.length - 1;
                        return (
                          <div
                            key={i}
                            className="rounded-[2px]"
                            style={{
                              width: 5,
                              height: h,
                              background: isLast ? T.teal200 : T.teal,
                              opacity: isLast ? 1 : 0.6,
                            }}
                          />
                        );
                      })}
                      <span className="font-mono text-[10px] ml-2" style={{ color: T.textMuted }}>
                        {rep.weeklyTrend[rep.weeklyTrend.length - 1]} today
                      </span>
                    </div>
                  </div>

                  {/* Coaching note */}
                  {rep.coachingFlag !== "none" && (
                    <div
                      className="rounded-[8px] px-[10px] py-[8px]"
                      style={{
                        background: rep.coachingFlag === "positive" ? T.greenBg : T.redBg,
                        border: `1px solid ${rep.coachingFlag === "positive" ? T.green : T.red}22`,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {rep.coachingFlag === "positive"
                          ? <Award size={12} style={{ color: T.green }} />
                          : <Flag size={12} style={{ color: T.red }} />
                        }
                        <span className="font-body font-bold text-[11px]" style={{ color: rep.coachingFlag === "positive" ? T.green : T.red }}>
                          {rep.coachingFlag === "positive" ? "Top Performer Note" : "Coaching Required"}
                        </span>
                      </div>
                      <p className="font-body text-[12px] m-0" style={{ color: T.textSecondary, lineHeight: 1.4 }}>
                        {rep.coachingNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TEAM TARGETS PANEL                                                 */
/* ================================================================== */
function TeamTargetsPanel() {
  const onTrackCount = teamTargets.filter(t => {
    const pct = t.target > 0 ? (t.actual / t.target) * 100 : 0;
    return pct >= 90;
  }).length;

  function formatTargetValue(t: TeamTarget, val: number): string {
    if (t.unit === "currency") return formatCurrency(val);
    if (t.unit === "percent") return `${val}%`;
    return val.toString();
  }

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-3 sm:px-4 py-3 gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <Target size={15} style={{ color: T.teal200, flexShrink: 0 }} />
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0 truncate" style={{ color: T.textPrimary }}>
          Team Targets
        </span>
        <span className="font-body font-bold text-[11px] whitespace-nowrap" style={{ color: T.green }}>
          {onTrackCount} of {teamTargets.length} on track
        </span>
      </div>
      <div className="px-3 sm:px-4 py-3">
        {teamTargets.length === 0 && <EmptyState message="No team targets set yet" />}
        {teamTargets.map((t, i) => {
          const pct = pctOf(t.actual, t.target);
          const bColor = barColorFn(pct);
          const TrendIcon = t.trend === "up" ? TrendingUp : t.trend === "down" ? TrendingDown : TrendingUp;
          const trendColor = t.trend === "up" ? T.green : t.trend === "down" ? T.red : T.textMuted;

          return (
            <div key={t.label} className={i < teamTargets.length - 1 ? "mb-[14px]" : ""}>
              <div className="flex justify-between mb-[3px]">
                <span className="font-body font-semibold text-[11px]" style={{ color: T.textMuted }}>{t.label}</span>
                <span className="font-body font-bold text-[11px]" style={{ color: bColor }}>
                  {formatTargetValue(t, t.actual)} / {formatTargetValue(t, t.target)}
                </span>
              </div>
              <div className="h-[5px] rounded-full overflow-hidden mb-[4px]" style={{ background: T.bgRow }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: bColor }} />
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon size={11} style={{ color: trendColor }} />
                <span className="font-body text-[10px]" style={{ color: trendColor }}>{t.trendValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  OUTCOME BREAKDOWN                                                  */
/* ================================================================== */
function OutcomeBreakdown() {
  const maxCount = outcomeDistribution.length === 0
    ? 0
    : Math.max(...outcomeDistribution.map(o => o.count));

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-3 sm:px-4 py-3 gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <BarChart3 size={15} style={{ color: T.teal200, flexShrink: 0 }} />
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0 truncate" style={{ color: T.textPrimary }}>
          Call Outcome Distribution
        </span>
        <span className="font-body text-[11px] whitespace-nowrap" style={{ color: T.textMuted }}>This week</span>
      </div>
      <div className="px-3 sm:px-4 py-3">
        {outcomeDistribution.length === 0 && <EmptyState message="No call outcomes yet" />}
        {outcomeDistribution.map((o, i) => {
          const width = maxCount > 0 ? (o.count / maxCount) * 100 : 0;
          const color = OUTCOME_COLORS[o.outcome] || T.textMuted;
          return (
            <div key={o.outcome} className={`flex items-center gap-2 sm:gap-3 ${i < outcomeDistribution.length - 1 ? "mb-[8px]" : ""}`}>
              <span className="font-body text-[11px] w-[100px] sm:w-[160px] flex-shrink-0 text-right truncate" style={{ color: T.textMuted }}>
                {o.outcome}
              </span>
              <div className="flex-1 h-[14px] rounded-[3px] overflow-hidden" style={{ background: T.bgRow }}>
                <div
                  className="h-full rounded-[3px] transition-all duration-300"
                  style={{ width: `${width}%`, background: color, opacity: 0.85 }}
                />
              </div>
              <span className="font-mono text-[11px] w-[36px] text-right flex-shrink-0" style={{ color: T.textSecondary }}>
                {o.count}
              </span>
              <span className="font-mono text-[10px] w-[42px] text-right flex-shrink-0" style={{ color: T.textDim }}>
                {o.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  WEEKLY TRENDS                                                      */
/* ================================================================== */
function WeeklyTrends() {
  const allDials = weeklyHistory.flatMap(w => w.reps.map(r => r.dials));
  const maxDials = allDials.length === 0 ? 0 : Math.max(...allDials);
  const barMaxH = 48;
  const weekCount = weeklyHistory.length;

  const REP_COLORS: Record<string, string> = {
    "Sarah K.": T.teal200,
    "James T.": T.indigo,
    "Emma R.":  T.green,
    "Liam P.":  T.amber,
  };

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-3 sm:px-4 py-3 gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <Calendar size={15} style={{ color: T.teal200, flexShrink: 0 }} />
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0 truncate" style={{ color: T.textPrimary }}>
          Weekly Trends
        </span>
      </div>
      <div className="px-3 sm:px-4 py-3">
        {weekCount === 0 && <EmptyState message="No weekly history yet" />}
        {weekCount > 0 && (
        <>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
          {Object.entries(REP_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="w-[8px] h-[8px] rounded-[2px]" style={{ background: color }} />
              <span className="font-body text-[10px]" style={{ color: T.textMuted }}>{name}</span>
            </div>
          ))}
        </div>

        {/* Bars per week */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {weeklyHistory.map(wk => {
            const weekTotal = wk.reps.reduce((s, r) => s + r.dials, 0);
            return (
              <div key={wk.week}>
                <div className="flex items-end gap-[4px] justify-center" style={{ height: barMaxH + 8 }}>
                  {wk.reps.map(r => {
                    const h = maxDials > 0 ? (r.dials / maxDials) * barMaxH + 4 : 4;
                    return (
                      <div
                        key={r.name}
                        className="rounded-t-[3px]"
                        title={`${r.name}: ${r.dials} dials`}
                        style={{
                          width: 14,
                          height: h,
                          background: REP_COLORS[r.name] || T.textMuted,
                          opacity: 0.85,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="text-center mt-1">
                  <div className="font-heading font-[800] text-[12px]" style={{ color: T.textPrimary }}>{wk.week}</div>
                  <div className="font-body text-[10px]" style={{ color: T.textMuted }}>{weekTotal} dials</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary row */}
        <div className="mt-3 pt-[10px]" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                label: "Total Signed (4wk)",
                val: weeklyHistory.reduce((s, w) => s + w.reps.reduce((ss, r) => ss + r.signed, 0), 0).toString(),
                color: T.green,
              },
              {
                label: "Total Dials (4wk)",
                val: weeklyHistory.reduce((s, w) => s + w.reps.reduce((ss, r) => ss + r.dials, 0), 0).toString(),
                color: T.teal200,
              },
              {
                label: "Avg Revenue/Wk",
                val: formatCurrencyShort(weekCount === 0 ? 0 : Math.round(weeklyHistory.reduce((s, w) => s + w.reps.reduce((ss, r) => ss + r.revenue, 0), 0) / weekCount)),
                color: T.amber,
              },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-body font-bold text-[10px] uppercase tracking-widest" style={{ color: T.textDim }}>{s.label}</div>
                <div className="font-heading font-[800] text-[16px] mt-0.5" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COACHING ALERTS                                                    */
/* ================================================================== */
function CoachingAlerts() {
  const flagged = repPerformance.filter(r => r.coachingFlag !== "none");

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-3 sm:px-4 py-3 gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <AlertTriangle size={15} style={{ color: T.amber, flexShrink: 0 }} />
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0 truncate" style={{ color: T.textPrimary }}>
          Coaching Alerts
        </span>
        <span className="font-body text-[11px] whitespace-nowrap" style={{ color: T.textMuted }}>
          {flagged.length} flag{flagged.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="px-3 sm:px-4 py-[10px]">
        {flagged.length === 0 && <EmptyState message="No coaching flags yet" />}
        {flagged.map((rep, i) => (
          <div
            key={rep.id}
            className="flex items-start gap-3 py-[10px]"
            style={{ borderBottom: i < flagged.length - 1 ? `1px solid ${T.border2}` : "none" }}
          >
            {/* Avatar */}
            <div
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 font-body font-[800] text-[12px] text-white mt-0.5"
              style={{ background: rep.avatarBg }}
            >
              {rep.initials}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <span className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>
                  {rep.name}
                </span>
                <span
                  className="font-body font-bold text-[10px] px-[6px] py-[2px] rounded-[4px] whitespace-nowrap"
                  style={{
                    background: rep.coachingFlag === "positive" ? T.greenBg : T.redBg,
                    color: rep.coachingFlag === "positive" ? T.green : T.red,
                  }}
                >
                  {rep.coachingFlag === "positive" ? "TOP PERFORMER" : "NEEDS COACHING"}
                </span>
              </div>
              <p className="font-body text-[12px] m-0 mb-2" style={{ color: T.textSecondary, lineHeight: 1.4 }}>
                {rep.coachingNote}
              </p>
              <button
                className="font-body font-semibold text-[11px] px-[12px] py-[5px] rounded-[100px] border-none cursor-pointer"
                style={{
                  background: rep.coachingFlag === "positive" ? T.teal : T.red,
                  color: "#FFFFFF",
                }}
              >
                {rep.coachingFlag === "positive" ? "Share with Team" : "Schedule 1:1"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function PerformancePage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CrmTopbar title="Performance" />
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {/* KPI Row */}
          <div className="mb-3 lg:mb-4">
            <PerformanceKpiRow />
          </div>

          {/* Main Grid: Leaderboard + Targets */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3 lg:gap-4 mb-3 lg:mb-4">
            <RepLeaderboard />
            <TeamTargetsPanel />
          </div>

          {/* Secondary Grid: Outcomes + Weekly Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3 lg:gap-4 mb-3 lg:mb-4">
            <OutcomeBreakdown />
            <WeeklyTrends />
          </div>

          {/* Coaching Alerts */}
          <div className="mb-3 lg:mb-4">
            <CoachingAlerts />
          </div>
        </div>
      </div>
    </div>
  );
}
