"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  STAFF_KPIS, ROLE_COUNTS, LEADERBOARD, LIVE_NOW,
  COACHING_FLAGS, ACCESS_ROWS, staffPeriodLabel,
} from "@/lib/admin/staff-mock-data";
import type { PeriodType, RoleType, Permission } from "@/lib/admin/staff-mock-data";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const T = {
  bgPage: "#0B111E", bgCard: "#0D1525", bgSidebar: "#070D18",
  bgRow: "#111D30", bgHover: "#0C1428", border: "#1E2D4A", border2: "#0F1828",
  textPrimary: "#F1F5F9", textSecondary: "#8492A8", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7",
  green: "#34D399", greenBg: "#0B2B1A",
  amber: "#FCD34D", amberBg: "#2B1A00",
  red: "#F87171", redBg: "#2B0F0F",
  indigo: "#0A1A2E", indigoBorder: "#1E3A5F",
  underBg: "#0F0C00", underBorder: "#1A1200", underHover: "#1A1000",
};

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
function Topbar({ period, setPeriod }: { period: PeriodType; setPeriod: (p: PeriodType) => void }) {
  const router = useRouter();
  const periods: { label: string; value: PeriodType }[] = [
    { label: "Today", value: "today" }, { label: "Last 7d", value: "last7d" },
    { label: "MTD", value: "mtd" }, { label: "QTD", value: "qtd" },
  ];
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }} onClick={() => router.push("/admin")}>Admin</span>
          <span style={{ color: T.textDim, fontSize: 13 }}>/</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Staff</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {periods.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} className="rounded-[6px] px-[10px] py-[4px] transition-colors" style={{
              background: period === p.value ? "#0A1A2E" : "#111D30",
              border: `1px solid ${period === p.value ? "#172D4D" : T.border}`,
              color: period === p.value ? T.teal200 : T.textMuted,
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11,
            }}>{p.label}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("export roster")}>Export roster</button>
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("audit log")}>Audit log</button>
        <button className="px-[14px] py-[6px] rounded-[8px] hover:opacity-80" style={{ background: "#0A2A26", color: T.teal200, border: "1px solid #1E3A34", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }} onClick={() => console.log("add staff")}>+ Add staff</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP                                                          */
/* ================================================================== */
function KpiStrip() {
  const K = STAFF_KPIS;
  const cards = [
    { label: "TOTAL STAFF", value: K.totalStaff.toString(), valueColor: T.textPrimary, delta: "Across 3 lots", deltaColor: T.textMuted },
    { label: "ACTIVE NOW", value: K.activeNow.toString(), valueColor: T.teal200, delta: `${K.activePct}% of team online`, deltaColor: T.green },
    { label: "ON TARGET", value: K.onTarget.toString(), valueColor: T.green, delta: `${K.onTargetPct}% this week`, deltaColor: T.green },
    { label: "UNDERPERFORMING", value: K.underperforming.toString(), valueColor: T.red, delta: "Action needed", deltaColor: T.red },
    { label: "AVG SLA COMPLIANCE", value: `${K.avgSlaCompliance}%`, valueColor: T.green, delta: "Last 7 days", deltaColor: T.textMuted },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {cards.map((c, i) => (
        <div key={i} className="px-[14px] py-[11px] rounded-[10px] transition-colors duration-200" style={{ background: T.bgCard, border: `1px solid ${T.border}` }} onMouseEnter={e => (e.currentTarget.style.borderColor = T.indigoBorder)} onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22, lineHeight: 1, letterSpacing: "-0.02em", color: c.valueColor }}>{c.value}</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: c.deltaColor, marginTop: 3 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */
function roleBadge(role: RoleType) {
  const map: Record<RoleType, { bg: string; color: string }> = {
    "Sales":       { bg: "#0A1D1A", color: T.teal200 },
    "Lot Manager": { bg: T.indigo,  color: T.textMuted },
    "Finance":     { bg: "#1A0520", color: "#C080F0" },
    "Recon Tech":  { bg: T.amberBg, color: T.amber },
    "Super Admin": { bg: "#0A2A26", color: T.teal200 },
    "Read Only":   { bg: T.bgRow,   color: T.textMuted },
  };
  const s = map[role];
  const label = role === "Lot Manager" ? "Lot Mgr" : role;
  return <span className="inline-flex items-center rounded-full px-[7px] py-[2px]" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>{label}</span>;
}

function metricColor(value: number | null, type: "deals" | "resp" | "sla" | "score"): string {
  if (value === null) return T.textMuted;
  if (type === "deals") { if (value >= 6) return T.green; if (value >= 4) return T.teal200; if (value <= 3) return T.red; return T.textMuted; }
  if (type === "resp") { if (value >= 85) return T.green; if (value >= 75) return T.teal200; if (value < 65) return T.red; return T.textMuted; }
  if (type === "sla") { if (value >= 88) return T.green; if (value >= 80) return T.teal200; if (value >= 70) return T.amber; if (value < 70) return T.red; return T.textMuted; }
  if (type === "score") { if (value >= 80) return T.green; if (value >= 65) return T.teal200; if (value >= 60) return T.amber; return T.red; }
  return T.textMuted;
}

function permColor(perm: Permission): string {
  if (perm === "Full") return T.green;
  if (perm === "Read/write" || perm === "Stage only") return T.teal200;
  if (perm === "View") return T.textMuted;
  return T.textDim;
}

/* ================================================================== */
/*  LEADERBOARD                                                        */
/* ================================================================== */
function StaffLeaderboard({ period }: { period: PeriodType }) {
  // TODO: wire to period-specific API endpoint when backend is ready
  const router = useRouter();
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Performance leaderboard — {staffPeriodLabel(period)}</span>
        <span className="ml-auto rounded-full px-[7px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>4 under target</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 560, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 28 }} /><col style={{ width: 140 }} /><col style={{ width: 80 }} />
            <col style={{ width: 54 }} /><col style={{ width: 60 }} /><col style={{ width: 68 }} />
            <col style={{ width: 64 }} /><col style={{ width: 60 }} />
          </colgroup>
          <thead>
            <tr>
              {["#", "Name", "Role", "Deals", "Resp %", "Avg GPU", "SLA", "Score"].map(h => (
                <th key={h} className="px-[8px] py-[6px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((e, idx) => {
              const isU = e.isUnderperformer;
              const rowBg = isU ? T.underBg : "transparent";
              const rowBorder = isU ? T.underBorder : (idx < LEADERBOARD.length - 1 ? T.border2 : "transparent");
              return (
                <tr key={e.id} className="cursor-pointer transition-colors duration-150"
                  onMouseEnter={ev => ev.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = isU ? T.underHover : T.bgHover))}
                  onMouseLeave={ev => ev.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = rowBg))}
                  onClick={() => router.push(`/admin/staff/${e.id}`)}
                >
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-heading)", fontWeight: isU ? 800 : 600, fontSize: 11, color: isU ? T.amber : T.textDim }}>{e.rank}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontWeight: isU ? 700 : 600, fontSize: 11, color: isU ? T.amber : T.textPrimary }}>{e.name}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}` }}>{roleBadge(e.role)}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: e.deals === null ? T.textMuted : metricColor(e.deals, "deals") }}>{e.deals === null ? "—" : e.deals}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: metricColor(e.responseRate, "resp") }}>{e.responseRate !== null ? `${e.responseRate}%` : "—"}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: e.avgGpu === null ? T.textMuted : metricColor(e.score, "score") }}>{e.avgGpu === null ? "—" : `£${e.avgGpu.toLocaleString()}`}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: metricColor(e.slaCompliance, "sla") }}>{e.slaCompliance}%</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: isU ? 13 : 11, color: metricColor(e.score, "score") }}>{e.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-[14px] py-[7px]" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim }}>Showing 9 of 24 staff · sorted by performance score · rows with amber names are below weekly target threshold</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STAFF ROSTER                                                       */
/* ================================================================== */
function StaffRoster({ period }: { period: PeriodType }) {
  // TODO: wire to period-specific API endpoint when backend is ready
  const router = useRouter();
  const roster = LEADERBOARD.slice(0, 8); // Show first 8

  function loginColor(n: number): string { if (n >= 7) return T.green; if (n >= 5) return T.teal200; if (n >= 3) return T.textMuted; return T.red; }
  function lastActiveColor(l: string): string { if (l === "Now") return T.green; if (l.includes("h ago")) return T.amber; return T.textMuted; }

  const statusBadge = (s: string, isU: boolean) => {
    if (isU) return <span className="rounded-full px-[7px] py-[2px]" style={{ background: T.amberBg, color: T.amber, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>Below target</span>;
    if (s === "active") return <span className="rounded-full px-[7px] py-[2px]" style={{ background: T.greenBg, color: T.green, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>Active</span>;
    if (s === "offline") return <span className="rounded-full px-[7px] py-[2px]" style={{ background: T.indigo, color: T.textMuted, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>Offline</span>;
    return <span className="rounded-full px-[7px] py-[2px]" style={{ background: T.bgRow, color: T.textMuted, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>On leave</span>;
  };

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Staff roster — all 24 members</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textMuted }}>All lots · All roles</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 520, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 130 }} /><col style={{ width: 80 }} /><col style={{ width: 90 }} />
            <col style={{ width: 60 }} /><col style={{ width: 60 }} /><col style={{ width: 54 }} /><col style={{ width: 80 }} />
          </colgroup>
          <thead>
            <tr>
              {["Name", "Role", "Lot(s)", "Logins", "Last", "SLA", "Status"].map(h => (
                <th key={h} className="px-[8px] py-[6px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.map((e, idx) => {
              const isU = e.isUnderperformer;
              const rowBg = isU ? T.underBg : "transparent";
              const rowBorder = isU ? T.underBorder : (idx < roster.length - 1 ? T.border2 : "transparent");
              return (
                <tr key={e.id} className="cursor-pointer transition-colors duration-150"
                  onMouseEnter={ev => ev.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = isU ? T.underHover : T.bgHover))}
                  onMouseLeave={ev => ev.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = rowBg))}
                  onClick={() => router.push(`/admin/staff/${e.id}`)}
                >
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontWeight: isU ? 700 : 600, fontSize: 11, color: isU ? T.amber : T.textPrimary }}>{e.name}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}` }}>{roleBadge(e.role)}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{e.lots.join(", ")}</td>
                  <td className="px-[8px] py-[6px] align-middle text-center" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: loginColor(e.logins7d) }}>{e.logins7d}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontSize: 11, color: lastActiveColor(e.lastActive) }}>{e.lastActive}</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: metricColor(e.slaCompliance, "sla") }}>{e.slaCompliance}%</td>
                  <td className="px-[8px] py-[6px] align-middle" style={{ background: rowBg, borderBottom: `1px solid ${rowBorder}` }}>{statusBadge(e.status, isU)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-[14px] py-[7px]" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim }}>Showing 8 of 24 · Click row to view full profile · Filter by lot or role using controls above</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LIVE NOW PANEL                                                     */
/* ================================================================== */
function LiveNowPanel() {
  const avatarBg: Record<string, string> = { Sales: "#0A2A26", "Lot Manager": T.indigo, Finance: "#1A0520" };
  const avatarColor: Record<string, string> = { Sales: T.teal200, "Lot Manager": T.textMuted, Finance: "#C080F0" };
  const dotColor: Record<string, string> = { active: T.green, "on-call": T.green, idle: T.amber };
  const statusLabel: Record<string, { text: string; color: string }> = { active: { text: "Active", color: T.green }, "on-call": { text: "On call", color: T.teal200 }, idle: { text: "Idle", color: T.amber } };

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Live now</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.greenBg, color: T.green, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>11 online</span>
      </div>
      <div>
        {LIVE_NOW.map((entry, idx) => {
          const isU = entry.isUnderperformer;
          const abg = isU ? "#1A0A00" : (avatarBg[entry.role] || T.bgRow);
          const acol = isU ? T.amber : (avatarColor[entry.role] || T.textMuted);
          const st = statusLabel[entry.liveStatus];
          return (
            <div key={entry.staffId} className="flex items-center gap-[8px] px-[14px] py-[8px]" style={{ borderBottom: idx < LIVE_NOW.length - 1 ? "1px solid #0C1428" : "none" }}>
              <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: dotColor[entry.liveStatus] }} />
              <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 26, height: 26, background: abg, color: acol, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>{entry.initials}</div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: isU ? T.amber : T.textPrimary }}>{entry.name}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: isU ? "#3A2500" : T.textMuted, marginTop: 1 }}>{entry.role} · {entry.lot}{entry.activity ? ` — ${entry.activity}` : ""}</div>
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: st.color }}>{st.text}</span>
            </div>
          );
        })}
      </div>
      <div className="px-[14px] py-[8px]" style={{ borderTop: "1px solid #0C1428" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim }}>+6 more online · 13 offline</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COACHING FLAGS PANEL                                               */
/* ================================================================== */
function CoachingFlagsPanel() {
  const router = useRouter();
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Coaching flags</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.amberBg, color: T.amber, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>4 flagged</span>
      </div>
      <div>
        {COACHING_FLAGS.map((flag, idx) => (
          <div key={flag.staffId} className="flex items-start gap-[8px] px-[14px] py-[8px]" style={{ borderBottom: idx < COACHING_FLAGS.length - 1 ? "1px solid #0C1428" : "none" }}>
            <div className="flex items-center justify-center flex-shrink-0 rounded-[5px]" style={{ width: 24, height: 24, background: flag.severity === "critical" ? T.redBg : T.amberBg, color: flag.severity === "critical" ? T.red : T.amber, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11 }}>{flag.severity === "critical" ? "!" : "i"}</div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: flag.severity === "critical" ? T.amber : T.textSecondary }}>{flag.name}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>{flag.flagText}</div>
              <div className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: T.teal200, marginTop: 3 }} onClick={() => router.push(flag.actionTarget)}>{flag.actionLabel} →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ROLE BREAKDOWN PANEL                                               */
/* ================================================================== */
function RoleBreakdownPanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Role breakdown</span>
      </div>
      <div>
        {ROLE_COUNTS.map((r, idx) => (
          <div key={r.role} className="flex items-center gap-[8px] px-[14px] py-[6px]" style={{ borderBottom: idx < ROLE_COUNTS.length - 1 ? "1px solid #0C1428" : "none" }}>
            <span className="rounded-full text-center flex-shrink-0" style={{ width: 110, padding: "2px 7px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, ...roleBadgeStyle(r.role) }}>{r.role}</span>
            <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: T.bgRow }}>
              <div className="h-full rounded-full" style={{ width: `${r.barPct}%`, background: r.barColor }} />
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: r.textColor, minWidth: 20, textAlign: "right" }}>{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function roleBadgeStyle(role: RoleType): { background: string; color: string } {
  const map: Record<RoleType, { background: string; color: string }> = {
    "Sales":       { background: "#0A1D1A", color: T.teal200 },
    "Lot Manager": { background: T.indigo,  color: T.textMuted },
    "Finance":     { background: "#1A0520", color: "#C080F0" },
    "Recon Tech":  { background: T.amberBg, color: T.amber },
    "Super Admin": { background: "#0A2A26", color: T.teal200 },
    "Read Only":   { background: T.bgRow,   color: T.textMuted },
  };
  return map[role];
}

/* ================================================================== */
/*  ACCESS MANAGEMENT PANEL                                            */
/* ================================================================== */
function AccessManagementPanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Role & access management</span>
        <span className="ml-auto mr-2" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>24 staff · 3 lots · 5 role types</span>
        <button className="rounded-[7px] px-[10px] py-[3px]" style={{ background: "#0A2A26", color: T.teal200, border: "1px solid #1E3A34", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }} onClick={() => console.log("invite staff")}>+ Invite staff</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 700, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 130 }} /><col style={{ width: 90 }} /><col style={{ width: 140 }} />
            <col style={{ width: 80 }} /><col style={{ width: 70 }} /><col style={{ width: 70 }} />
            <col style={{ width: 70 }} /><col style={{ width: 70 }} /><col style={{ width: 80 }} />
          </colgroup>
          <thead>
            <tr>
              {["Name", "Role", "Lot access", "Inventory", "Deals", "Finance", "Payouts", "Admin", "Actions"].map(h => (
                <th key={h} className="px-[8px] py-[6px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACCESS_ROWS.map((row, idx) => (
              <tr key={row.staffId}
                onMouseEnter={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = T.bgHover))}
                onMouseLeave={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = "transparent"))}
              >
                <td className="px-[8px] py-[6px] align-middle" style={{ borderBottom: idx < ACCESS_ROWS.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textPrimary }}>{row.name}</td>
                <td className="px-[8px] py-[6px] align-middle" style={{ borderBottom: idx < ACCESS_ROWS.length - 1 ? `1px solid ${T.border2}` : "none" }}>{roleBadge(row.role)}</td>
                <td className="px-[8px] py-[6px] align-middle" style={{ borderBottom: idx < ACCESS_ROWS.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{row.lots}</td>
                {(["inventory", "deals", "finance", "payouts", "admin"] as const).map(key => (
                  <td key={key} className="px-[8px] py-[6px] align-middle text-center" style={{ borderBottom: idx < ACCESS_ROWS.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-body)", fontWeight: row[key] === "Full" || row[key] === "Read/write" ? 700 : 400, fontSize: 11, color: permColor(row[key]) }}>{row[key]}</td>
                ))}
                <td className="px-[8px] py-[6px] align-middle" style={{ borderBottom: idx < ACCESS_ROWS.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                  <button className="rounded-[6px] px-[9px] py-[3px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textMuted }} onClick={() => console.log("edit staff access", row.staffId)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-[14px] py-[7px]" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim }}>Showing 5 of 24 · Permissions are role-based · Click Edit to modify individual access or lot assignment</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function StaffPage() {
  const [period, setPeriod] = useState<PeriodType>("last7d");

  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar period={period} setPeriod={setPeriod} />
        <div className="flex-1 flex flex-col gap-[10px] overflow-x-hidden" style={{ padding: "14px 20px" }}>
          <KpiStrip />
          {/* Main grid: left (leaderboard + roster) + right (live + coaching + roles) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 10 }}>
            <div className="flex flex-col gap-[10px]">
              <StaffLeaderboard period={period} />
              <StaffRoster period={period} />
            </div>
            <div className="flex flex-col gap-[10px]">
              <LiveNowPanel />
              <CoachingFlagsPanel />
              <RoleBreakdownPanel />
            </div>
          </div>
          {/* Bottom: access management */}
          <AccessManagementPanel />
        </div>
      </div>
    </div>
  );
}
