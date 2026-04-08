"use client";

import React, { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Trophy, Target, BarChart3,
  Users, Phone, Clock, AlertTriangle, ChevronDown, ChevronRight,
  ArrowLeft, Calendar, Award, Flag,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  repPerformance,
  teamTargets,
  weeklyHistory,
  outcomeDistribution,
} from "@/lib/admin/performance-mock-data";
import type { RepPerformance, TeamTarget } from "@/lib/admin/performance-mock-data";

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
/*  CRM TOPBAR                                                         */
/* ================================================================== */
const crmTabs = [
  { label: "Pipeline",    href: "/admin/crm" },
  { label: "Dialler",     href: "/admin/crm/dialler" },
  { label: "Calls",       href: "/admin/crm/calls" },
  { label: "Scripts",     href: "/admin/crm/scripts" },
  { label: "Performance", href: "/admin/crm/performance" },
];

function PerformanceTopbar() {
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
        <span className="font-heading font-[800] text-[17px]" style={{ color: T.textPrimary }}>Performance</span>
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
function PerformanceKpiRow() {
  const totalDialsToday = repPerformance.reduce((s, r) => s + r.dialsToday, 0);
  const avgContactRate = Math.round(repPerformance.reduce((s, r) => s + r.contactRate, 0) / repPerformance.length);
  const offersWeek = repPerformance.reduce((s, r) => s + r.offersWeek, 0);
  const signedWeek = repPerformance.reduce((s, r) => s + r.signedWeek, 0);
  const revenueWeek = repPerformance.reduce((s, r) => s + r.revenueWeek, 0);

  const kpis = [
    { label: "Total Dials Today", value: totalDialsToday.toString(), delta: "+12% vs yesterday", deltaType: "up" as const, icon: Phone },
    { label: "Team Contact Rate", value: `${avgContactRate}%`, delta: "On target", deltaType: "up" as const, icon: Users },
    { label: "Offers Sent (Week)", value: offersWeek.toString(), delta: "+4 ahead of target", deltaType: "up" as const, icon: Target },
    { label: "Deals Signed (Week)", value: signedWeek.toString(), delta: "3 behind target", deltaType: "down" as const, icon: Trophy },
    { label: "Revenue This Week", value: formatCurrency(revenueWeek), delta: "86% of target", deltaType: "up" as const, icon: BarChart3 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
      {kpis.map(kpi => {
        const Icon = kpi.icon;
        const deltaColor = kpi.deltaType === "up" ? T.green : T.red;
        const DeltaIcon = kpi.deltaType === "up" ? TrendingUp : TrendingDown;
        return (
          <div
            key={kpi.label}
            className="rounded-[14px] px-[16px] py-[14px]"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            <div className="flex items-center gap-2 mb-[6px]">
              <Icon size={14} style={{ color: T.textMuted }} />
              <span className="font-body font-semibold text-[11px] uppercase tracking-wider" style={{ color: T.textMuted }}>
                {kpi.label}
              </span>
            </div>
            <div className="font-heading font-[800] text-[26px] leading-none mb-[4px]" style={{ color: T.textPrimary }}>
              {kpi.value}
            </div>
            <div className="flex items-center gap-1">
              <DeltaIcon size={12} style={{ color: deltaColor }} />
              <span className="font-body text-[11px] font-semibold" style={{ color: deltaColor }}>
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
    const pct = (val / target) * 100;
    if (pct >= 90) return T.green;
    if (pct >= 70) return T.amber;
    return T.red;
  }

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="flex items-center px-[16px] py-[12px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <Trophy size={15} style={{ color: T.amber }} />
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Rep Leaderboard
        </span>
        <div className="flex rounded-[8px] p-[2px]" style={{ background: T.bgRow }}>
          {timeRanges.map(tr => (
            <button
              key={tr.key}
              onClick={() => setTimeRange(tr.key)}
              className="px-2.5 py-1 rounded-[6px] font-body text-[11px] font-semibold"
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

      {/* Column headers */}
      <div
        className="px-[16px] py-[8px]"
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
      <div className="px-[16px]">
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="mb-3">
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
  );
}

/* ================================================================== */
/*  TEAM TARGETS PANEL                                                 */
/* ================================================================== */
function TeamTargetsPanel() {
  const onTrackCount = teamTargets.filter(t => {
    const pct = (t.actual / t.target) * 100;
    return pct >= 90;
  }).length;

  function formatTargetValue(t: TeamTarget, val: number): string {
    if (t.unit === "currency") return formatCurrency(val);
    if (t.unit === "percent") return `${val}%`;
    return val.toString();
  }

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[16px] py-[12px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <Target size={15} style={{ color: T.teal200 }} />
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Team Targets
        </span>
        <span className="font-body font-bold text-[11px]" style={{ color: T.green }}>
          {onTrackCount} of {teamTargets.length} on track
        </span>
      </div>
      <div className="px-[16px] py-[12px]">
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
  const maxCount = Math.max(...outcomeDistribution.map(o => o.count));

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[16px] py-[12px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <BarChart3 size={15} style={{ color: T.teal200 }} />
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Call Outcome Distribution
        </span>
        <span className="font-body text-[11px]" style={{ color: T.textMuted }}>This week</span>
      </div>
      <div className="px-[16px] py-[12px]">
        {outcomeDistribution.map((o, i) => {
          const width = maxCount > 0 ? (o.count / maxCount) * 100 : 0;
          const color = OUTCOME_COLORS[o.outcome] || T.textMuted;
          return (
            <div key={o.outcome} className={`flex items-center gap-3 ${i < outcomeDistribution.length - 1 ? "mb-[8px]" : ""}`}>
              <span className="font-body text-[11px] w-[160px] flex-shrink-0 text-right" style={{ color: T.textMuted }}>
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
  const maxDials = Math.max(...weeklyHistory.flatMap(w => w.reps.map(r => r.dials)));
  const barMaxH = 48;

  const REP_COLORS: Record<string, string> = {
    "Sarah K.": T.teal200,
    "James T.": T.indigo,
    "Emma R.":  T.green,
    "Liam P.":  T.amber,
  };

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[16px] py-[12px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <Calendar size={15} style={{ color: T.teal200 }} />
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Weekly Trends
        </span>
      </div>
      <div className="px-[16px] py-[12px]">
        {/* Legend */}
        <div className="flex gap-4 mb-3">
          {Object.entries(REP_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="w-[8px] h-[8px] rounded-[2px]" style={{ background: color }} />
              <span className="font-body text-[10px]" style={{ color: T.textMuted }}>{name}</span>
            </div>
          ))}
        </div>

        {/* Bars per week */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
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
                val: formatCurrencyShort(Math.round(weeklyHistory.reduce((s, w) => s + w.reps.reduce((ss, r) => ss + r.revenue, 0), 0) / 4)),
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
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COACHING ALERTS                                                    */
/* ================================================================== */
function CoachingAlerts() {
  const flagged = repPerformance.filter(r => r.coachingFlag !== "none");
  if (flagged.length === 0) return null;

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[16px] py-[12px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <AlertTriangle size={15} style={{ color: T.amber }} />
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Coaching Alerts
        </span>
        <span className="font-body text-[11px]" style={{ color: T.textMuted }}>
          {flagged.length} flag{flagged.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="px-[16px] py-[10px]">
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
              <div className="flex items-center gap-2 mb-1">
                <span className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>
                  {rep.name}
                </span>
                <span
                  className="font-body font-bold text-[10px] px-[6px] py-[2px] rounded-[4px]"
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
    <div className="flex h-screen overflow-hidden" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PerformanceTopbar />
        <div className="flex-1 overflow-y-auto px-[22px] py-[18px]">
          {/* KPI Row */}
          <div className="mb-[18px]">
            <PerformanceKpiRow />
          </div>

          {/* Main Grid: Leaderboard + Targets */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }} className="mb-[18px]">
            <RepLeaderboard />
            <TeamTargetsPanel />
          </div>

          {/* Secondary Grid: Outcomes + Weekly Trends */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }} className="mb-[18px]">
            <OutcomeBreakdown />
            <WeeklyTrends />
          </div>

          {/* Coaching Alerts */}
          <div className="mb-[18px]">
            <CoachingAlerts />
          </div>
        </div>
      </div>
    </div>
  );
}
