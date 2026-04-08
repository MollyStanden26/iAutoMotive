"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  COMPLIANCE_KPIS, CATEGORY_SCORES, COMPLIANCE_DEALS,
  ACTIVE_FLAGS, AML_HOLD, AML_SCREENING,
  CONSUMER_RIGHTS_ROWS, GDPR_FCA_ROWS, AUDIT_ROWS,
  getScoreColor,
} from "@/lib/admin/compliance-mock-data";
import type { ComplianceStatus, RegPanelStatus } from "@/lib/admin/compliance-mock-data";

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
};

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
function Topbar() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2">
        <span className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }} onClick={() => router.push("/admin")}>Admin</span>
        <span style={{ color: T.textDim, fontSize: 13 }}>/</span>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Compliance</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("trigger portfolio scan")}>Portfolio scan</button>
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("export audit log")}>Export audit log</button>
        <button className="px-[14px] py-[6px] rounded-[8px] hover:opacity-80" style={{ background: "#0A2A26", color: T.teal200, border: `1px solid ${T.indigo}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }} onClick={() => console.log("generate audit pack")}>Generate audit pack</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP                                                          */
/* ================================================================== */
function KpiStrip() {
  const K = COMPLIANCE_KPIS;
  const cards = [
    { label: "PORTFOLIO SCORE", value: K.portfolioScore.toString(), valueColor: T.green, delta: "Healthy — 3 issues open", deltaColor: T.green },
    { label: "ACTIVE FLAGS", value: K.activeFlags.toString(), valueColor: T.red, delta: `${K.criticalFlags} critical · ${K.advisoryFlags} advisory`, deltaColor: T.red },
    { label: "DEALS SCREENED", value: K.dealsScreened.toString(), valueColor: T.teal200, delta: "All current deals", deltaColor: T.textMuted },
    { label: "DOCS COMPLETE", value: `${K.docsCompletePct}%`, valueColor: T.green, delta: `${K.jacketsIncomplete} jackets incomplete`, deltaColor: "#F5A623" },
    { label: "LAST FULL SCAN", value: K.lastScanLabel, valueColor: T.textSecondary, valueFontSize: 16, delta: "Auto-runs every 6 hrs", deltaColor: T.textMuted },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {cards.map((c, i) => (
        <div key={i} className="px-[14px] py-[11px] rounded-[10px] transition-colors duration-200" style={{ background: T.bgCard, border: `1px solid ${T.border}` }} onMouseEnter={e => (e.currentTarget.style.borderColor = T.indigoBorder)} onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: (c as any).valueFontSize || 26, lineHeight: 1, letterSpacing: "-0.02em", color: c.valueColor, marginTop: (c as any).valueFontSize ? 4 : 0 }}>{c.value}</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: c.deltaColor, marginTop: 3 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */
function formatPrice(p: number): string { return "£" + p.toLocaleString(); }

function statusDot(status: ComplianceStatus) {
  const colors: Record<ComplianceStatus, string> = { critical: T.red, advisory: T.amber, clear: T.green };
  return <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: colors[status] }} />;
}

function statusLabel(status: ComplianceStatus) {
  const map: Record<ComplianceStatus, { color: string; label: string }> = {
    critical: { color: T.red, label: "Critical" },
    advisory: { color: T.amber, label: "Advisory" },
    clear: { color: T.green, label: "Clear" },
  };
  const s = map[status];
  return <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: s.color }}>{s.label}</span>;
}

function regBadge(status: RegPanelStatus, label: string) {
  const map: Record<RegPanelStatus, { bg: string; color: string }> = {
    clear: { bg: T.greenBg, color: T.green },
    advisory: { bg: T.amberBg, color: T.amber },
    warning: { bg: T.redBg, color: T.red },
  };
  const s = map[status];
  return <span className="flex-shrink-0 rounded-full px-[7px] py-[2px]" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{label}</span>;
}

/* ================================================================== */
/*  PORTFOLIO COMPLIANCE SCORE PANEL                                   */
/* ================================================================== */
function ComplianceScorePanel() {
  const score = COMPLIANCE_KPIS.portfolioScore;
  const scoreColor = getScoreColor(score);
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}`, marginBottom: 10 }}>
      {/* Header */}
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Portfolio compliance score</span>
        <span className="ml-auto rounded-full px-[9px] py-[2px]" style={{ background: "#0D2010", color: T.green, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>87 / 100 — Healthy</span>
      </div>
      {/* Score bar section */}
      <div className="flex items-center gap-[10px] px-[14px] py-[12px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 32, letterSpacing: "-0.02em", color: scoreColor, minWidth: 52 }}>{score}</span>
        <div className="flex-1">
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary, marginBottom: 2 }}>Overall portfolio health</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textSecondary, lineHeight: 1.4 }}>3 open issues across 36 screened deals. Score drops below 75 if a critical flag is unresolved for 48h.</div>
        </div>
        <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 140, height: 6, background: T.bgRow }}>
          <div className="h-full rounded-full" style={{ width: `${score}%`, background: scoreColor }} />
        </div>
      </div>
      {/* Category grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "10px 14px" }}>
        {CATEGORY_SCORES.map(cat => {
          const color = getScoreColor(cat.score);
          return (
            <div key={cat.name} className="flex items-center gap-[8px] rounded-[7px] px-[10px] py-[8px]" style={{ background: T.bgRow }}>
              <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11, color: T.textMuted }}>{cat.name}</span>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em", color }}>{cat.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DEAL STATUS BOARD                                                  */
/* ================================================================== */
function DealStatusBoard() {
  const router = useRouter();
  const sorted = [...COMPLIANCE_DEALS].sort((a, b) => a.score - b.score);
  const redCount = sorted.filter(d => d.status === "critical").length;
  const amberCount = sorted.filter(d => d.status === "advisory").length;
  const greenCount = sorted.filter(d => d.status === "clear").length;

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Live deal status board</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{redCount} red · {amberCount} amber · {greenCount} green</span>
        <span className="ml-auto cursor-pointer" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: T.teal200 }} onClick={() => router.push("/admin/deals")}>View all →</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 500, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 200 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 60 }} />
            <col />
          </colgroup>
          <tbody>
            {sorted.map((deal, idx) => {
              const scoreColor = getScoreColor(deal.score);
              return (
                <tr key={deal.id} className="cursor-pointer transition-colors duration-150"
                  onMouseEnter={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = T.bgHover))}
                  onMouseLeave={e => e.currentTarget.querySelectorAll("td").forEach(td => ((td as HTMLElement).style.background = "transparent"))}
                  onClick={() => router.push(`/admin/deals/${deal.id}`)}
                >
                  <td className="px-[14px] py-[8px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textPrimary }}>{deal.buyer}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim, marginTop: 1 }}>{deal.vehicle} {formatPrice(deal.price)}</div>
                  </td>
                  <td className="px-[10px] py-[8px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                    <div className="flex items-center gap-[6px]">
                      {statusDot(deal.status)}
                      {statusLabel(deal.status)}
                    </div>
                  </td>
                  <td className="px-[10px] py-[8px] align-middle text-right" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 12, color: scoreColor }}>
                    {deal.score}
                  </td>
                  <td className="px-[10px] py-[8px] align-middle" style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${T.border2}` : "none" }}>
                    <div className="flex flex-wrap gap-1">
                      {deal.flags.length === 0 ? (
                        <span className="rounded-[3px] px-[6px] py-[2px]" style={{ background: T.greenBg, color: T.green, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>None</span>
                      ) : (
                        deal.flags.map((f, fi) => (
                          <span key={fi} className="rounded-[3px] px-[6px] py-[2px]" style={{
                            background: f.severity === "critical" ? T.redBg : T.amberBg,
                            color: f.severity === "critical" ? T.red : T.amber,
                            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9,
                          }}>{f.label}</span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-[14px] py-[8px]" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim }}>Showing 6 of 36 deals — sorted by risk score ascending · Click row for deal compliance detail</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ACTIVE FLAGS PANEL                                                 */
/* ================================================================== */
function ActiveFlagsPanel() {
  const router = useRouter();
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Active flags & violations</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>3 open</span>
      </div>
      <div className="px-[14px]">
        {ACTIVE_FLAGS.map((flag, idx) => (
          <div key={flag.id} className="flex items-start gap-[8px] py-[8px]" style={{ borderBottom: idx < ACTIVE_FLAGS.length - 1 ? `1px solid ${T.border}` : "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0C1020")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[4px]" style={{ background: flag.severity === "critical" ? T.red : T.amber }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{flag.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1, lineHeight: 1.4 }}>{flag.reason}</div>
              <div className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9, color: T.teal200, marginTop: 3 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (flag.dealId === "d01") console.log("escalate", flag.dealId);
                  else if (flag.dealId === "d02") router.push("/admin/deals/d02?tab=documents");
                  else if (flag.dealId === "d03") router.push("/admin/deals/d03?tab=activity");
                }}
              >{flag.recommendedAction} →</div>
            </div>
            <span className="flex-shrink-0 rounded-[3px] px-[6px] py-[2px]" style={{
              background: flag.severity === "critical" ? T.redBg : T.amberBg,
              color: flag.severity === "critical" ? T.red : T.amber,
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9,
            }}>{flag.severity === "critical" ? "Critical" : "Advisory"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AML / IDENTITY WATCHLIST PANEL                                     */
/* ================================================================== */
function AmlWatchlistPanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>AML / identity watchlist</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: T.amberBg, color: T.amber, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>1 hold</span>
      </div>
      {/* Hold row */}
      <div className="flex items-start gap-[8px] px-[14px] py-[8px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[4px]" style={{ background: T.red }} />
        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>Connor H. — ID mismatch</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1, lineHeight: 1.4 }}>{AML_HOLD.detail}</div>
        </div>
        <span className="flex-shrink-0 rounded-[3px] px-[6px] py-[2px]" style={{ background: T.redBg, color: T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>Hold</span>
      </div>
      {/* Section label */}
      <div className="px-[14px] py-[8px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.04em" }}>Screening summary — 36 buyers</span>
      </div>
      {/* Screening rows */}
      <div className="px-[14px]">
        {AML_SCREENING.map((row, idx) => {
          const barColor = row.status === "green" ? T.green : T.amber;
          return (
            <div key={idx} className="flex items-center gap-[8px] py-[5px]" style={{ borderBottom: idx < AML_SCREENING.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{row.label}</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: row.status === "green" ? T.green : T.amber }}>{row.verified} / {row.total}</span>
              <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 60, height: 3, background: T.bgRow }}>
                <div className="h-full rounded-full" style={{ width: `${row.barPct}%`, background: barColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CONSUMER RIGHTS PANEL                                              */
/* ================================================================== */
function ConsumerRightsPanel() {
  const advisoryCount = CONSUMER_RIGHTS_ROWS.filter(r => r.status === "advisory").length;
  const warningCount = CONSUMER_RIGHTS_ROWS.filter(r => r.status === "warning").length;
  let badgeStatus: RegPanelStatus = "clear";
  let badgeLabel = "All clear";
  if (warningCount > 0) { badgeStatus = "warning"; badgeLabel = `${warningCount} warning${warningCount > 1 ? "s" : ""}`; }
  else if (advisoryCount > 0) { badgeStatus = "advisory"; badgeLabel = `${advisoryCount} advisory`; }

  const dotColors: Record<RegPanelStatus, string> = { clear: T.green, advisory: T.amber, warning: T.red };

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Consumer rights</span>
        <span className="ml-auto">{regBadge(badgeStatus, badgeLabel)}</span>
      </div>
      <div className="px-[14px]">
        {CONSUMER_RIGHTS_ROWS.map((row, idx) => (
          <div key={idx} className="flex items-start gap-[8px] py-[8px]" style={{ borderBottom: idx < CONSUMER_RIGHTS_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[4px]" style={{ background: dotColors[row.status] }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1, lineHeight: 1.4 }}>{row.sub}</div>
            </div>
            {regBadge(row.status, row.status === "advisory" ? "Monitor" : "Clear")}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  GDPR & FCA PERIMETER PANEL                                        */
/* ================================================================== */
function GdprFcaPanel() {
  // TODO: Wire to live FCA perimeter check API when available.
  const advisoryCount = GDPR_FCA_ROWS.filter(r => r.status === "advisory").length;
  const warningCount = GDPR_FCA_ROWS.filter(r => r.status === "warning").length;
  let badgeStatus: RegPanelStatus = "clear";
  let badgeLabel = "All clear";
  if (warningCount > 0) { badgeStatus = "warning"; badgeLabel = `${warningCount} warning${warningCount > 1 ? "s" : ""}`; }
  else if (advisoryCount > 0) { badgeStatus = "advisory"; badgeLabel = `${advisoryCount} advisory`; }

  const dotColors: Record<RegPanelStatus, string> = { clear: T.green, advisory: T.amber, warning: T.red };

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>GDPR & FCA perimeter</span>
        <span className="ml-auto">{regBadge(badgeStatus, badgeLabel)}</span>
      </div>
      <div className="px-[14px]">
        {GDPR_FCA_ROWS.map((row, idx) => (
          <div key={idx} className="flex items-start gap-[8px] py-[8px]" style={{ borderBottom: idx < GDPR_FCA_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[4px]" style={{ background: dotColors[row.status] }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1, lineHeight: 1.4 }}>{row.sub}</div>
            </div>
            {regBadge(row.status, "Clear")}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AUDIT CENTRE PANEL                                                 */
/* ================================================================== */
function AuditCentrePanel() {
  const router = useRouter();
  const errorCount = AUDIT_ROWS.filter(r => r.iconType === "error").length;
  const badgeLabel = errorCount > 0 ? `${COMPLIANCE_KPIS.jacketsIncomplete} jackets incomplete` : "All clear";
  const badgeBg = errorCount > 0 ? T.redBg : T.greenBg;
  const badgeColor = errorCount > 0 ? T.red : T.green;

  const iconMap: Record<string, { bg: string; color: string; char: string }> = {
    error:    { bg: T.redBg,    color: T.red,    char: "!" },
    info:     { bg: T.amberBg,  color: T.amber,  char: "i" },
    success:  { bg: "#0A1D1A",  color: T.teal200, char: "✓" },
    download: { bg: "#0A1D1A",  color: T.teal200, char: "↓" },
  };

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Audit centre</span>
        <span className="ml-2 rounded-full px-[7px] py-[2px]" style={{ background: badgeBg, color: badgeColor, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{badgeLabel}</span>
      </div>
      <div className="px-[14px]">
        {AUDIT_ROWS.map((row, idx) => {
          const ic = iconMap[row.iconType];
          return (
            <div key={row.id} className="flex items-center gap-[8px] py-[7px]" style={{ borderBottom: idx < AUDIT_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0C1020")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div className="flex items-center justify-center flex-shrink-0 rounded-[5px]" style={{ width: 24, height: 24, background: ic.bg, color: ic.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>{ic.char}</div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{row.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{row.sub}</div>
              </div>
              <button className="flex-shrink-0 cursor-pointer rounded-[5px] px-[8px] py-[3px]" style={{ background: "#0A1D1A", border: "1px solid #1E3A34", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: T.teal200 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (row.dealId) router.push(`/admin/deals/${row.dealId}`);
                  else if (row.actionLabel === "Export") console.log("export audit log");
                  else if (row.actionLabel === "Generate") console.log("generate audit pack");
                }}
              >{row.actionLabel} →</button>
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
export default function CompliancePage() {
  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 flex flex-col gap-[10px] overflow-x-hidden" style={{ padding: "14px 20px" }}>
          <KpiStrip />
          {/* Main grid: left (score + deal board) + right (flags + AML) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 10 }}>
            <div className="flex flex-col">
              <ComplianceScorePanel />
              <DealStatusBoard />
            </div>
            <div className="flex flex-col gap-[10px]">
              <ActiveFlagsPanel />
              <AmlWatchlistPanel />
            </div>
          </div>
          {/* Bottom row: 3 regulatory panels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <ConsumerRightsPanel />
            <GdprFcaPanel />
            <AuditCentrePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
