"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crmDashboardData as D } from "@/lib/admin/crm-mock-data";
import type { Lead, LeadStatus } from "@/lib/admin/crm-mock-data";
import { Phone, SkipForward } from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";

/* ================================================================== */
/*  DESIGN TOKENS (inline — matches Command Centre dark admin theme)  */
/* ================================================================== */
const T = {
  bgPage:      "#0B111E",
  bgCard:      "#0D1525",
  bgSidebar:   "#070D18",
  bgRow:       "#111D30",
  bgHover:     "#0C1428",
  border:      "#1E2D4A",
  border2:     "#111D30",
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
  indigo:      "#A78BFA",
  indigoBg:    "#1A1040",
  navy:        "#0F1724",
};

/* ================================================================== */
/*  CRM TOPBAR                                                         */
/* ================================================================== */
const crmTabs = [
  { label: "Overview",    href: "/admin/crm",             active: true },
  { label: "Dialler",     href: "/admin/crm/dialler",     active: false },
  { label: "Assignment",  href: "/admin/crm/assign",      active: false },
  { label: "Calls log",   href: "/admin/crm/calls",       active: false },
  { label: "Performance", href: "/admin/crm/performance", active: false },
  { label: "Scripts",     href: "/admin/crm/scripts",     active: false },
];

function CrmTopbar() {
  const router = useRouter();
  const overdueCount = D.callbacks.filter(c => c.status === "overdue").length;

  return (
    <div
      className="flex items-center gap-3 px-[22px]"
      style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mr-3">
        <span
          className="cursor-pointer font-body text-[13px]"
          style={{ color: T.textDim }}
          onClick={() => router.push("/admin")}
        >
          Admin
        </span>
        <span style={{ color: T.textDim }} className="text-[13px]">/</span>
        <span className="font-heading font-[800] text-[17px]" style={{ color: T.textPrimary }}>CRM</span>
      </div>

      {/* Live badge */}
      <span
        className="flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-body text-[11px] font-bold"
        style={{ background: T.bgHover, color: T.teal200 }}
      >
        <span className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: T.green }} />
        Live
      </span>

      {/* Overdue badge */}
      {overdueCount > 0 && (
        <span
          className="rounded-pill px-2.5 py-1 font-body text-[11px] font-bold"
          style={{ background: T.redBg, color: T.red }}
        >
          {overdueCount === 1 ? "1 callback overdue" : `${overdueCount} callbacks overdue`}
        </span>
      )}

      {/* Tab nav */}
      <div className="flex-1 flex justify-center">
        <div className="flex rounded-[10px] p-[3px]" style={{ background: T.bgRow }}>
          {crmTabs.map(tab => (
            <button
              key={tab.label}
              onClick={() => !tab.active && router.push(tab.href)}
              className="px-3 py-1.5 rounded-[8px] font-body text-[12px] font-semibold transition-colors duration-150"
              style={{
                background: tab.active ? T.bgCard : "transparent",
                color: tab.active ? T.textPrimary : T.textMuted,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Open dialler button */}
      <button
        onClick={() => router.push("/admin/crm/dialler")}
        className="font-heading font-[800] text-[13px] text-white rounded-[8px] px-4 py-1.5 transition-opacity hover:opacity-90"
        style={{ background: T.teal }}
      >
        Open dialler →
      </button>
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP                                                          */
/* ================================================================== */
const kpiColors: Record<string, string> = {
  "Dials today":       T.textPrimary,
  "Contacted":         T.teal200,
  "Offers sent":       T.amber,
  "Signed today":      T.green,
  "Callbacks overdue": T.red,
};

const deltaColors: Record<string, string> = {
  up:      T.green,
  down:    T.red,
  warn:    T.amber,
  neutral: T.textMuted,
};

function CrmKpiRow() {
  return (
    <div className="grid grid-cols-5 gap-2">
      {D.kpis.map(kpi => (
        <div
          key={kpi.label}
          className="rounded-[14px] px-[15px] py-[13px] transition-colors duration-200"
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
            style={{ color: kpiColors[kpi.label] || T.textPrimary }}
          >
            {kpi.value}
          </div>
          <div
            className="font-body font-semibold text-[11px]"
            style={{ color: deltaColors[kpi.deltaType] }}
          >
            {kpi.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  LEAD QUEUE                                                         */
/* ================================================================== */
const statusConfig: Record<LeadStatus, { label: string; bg: string; color: string }> = {
  new:         { label: "New",         bg: T.bgHover,  color: T.teal200 },
  contacted:   { label: "Contacted",   bg: T.amberBg,  color: T.amber },
  negotiating: { label: "Negotiating", bg: T.indigoBg,  color: T.indigo },
  offer_sent:  { label: "Offer sent",  bg: T.greenBg,  color: T.green },
  signed:      { label: "Signed",      bg: "#0A1A0D",  color: "#34D399" },
};

function LeadQueue() {
  const router = useRouter();
  const [selectedCaller, setSelectedCaller] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [leads, setLeads] = useState<Lead[]>(D.leads);
  const [assignModal, setAssignModal] = useState<Lead | null>(null);
  const [assignCaller, setAssignCaller] = useState("Sarah K.");

  const callerOptions = ["All callers", "Sarah K.", "James T.", "Jordan M.", "Aisha T."];
  const statusOptions = ["All statuses", "New", "Contacted", "Negotiating", "Offer sent"];

  const filteredLeads = leads.filter(l => {
    const callerMatch = selectedCaller === "all" || l.assignee === selectedCaller;
    const statusMatch = selectedStatus === "all" || l.status === selectedStatus;
    return callerMatch && statusMatch;
  });

  const handleAssign = () => {
    if (!assignModal) return;
    setLeads(prev =>
      prev.map(l => l.id === assignModal.id ? { ...l, assignee: assignCaller } : l)
    );
    setAssignModal(null);
  };

  const selectStyle: React.CSSProperties = {
    background: T.bgRow,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "4px 8px",
    fontSize: 12,
    color: T.textSecondary,
    outline: "none",
  };

  return (
    <>
      <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
        {/* Header */}
        <div
          className="flex items-center px-[15px] py-[11px] gap-2"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
            Lead queue — today
          </span>
          <select
            style={selectStyle}
            value={selectedCaller}
            onChange={e => setSelectedCaller(e.target.value)}
          >
            {callerOptions.map(opt => (
              <option key={opt} value={opt === "All callers" ? "all" : opt}>{opt}</option>
            ))}
          </select>
          <select
            style={selectStyle}
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt === "All statuses" ? "all" : opt.toLowerCase().replace(" ", "_")}>{opt}</option>
            ))}
          </select>
          <button
            className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer"
            style={{ color: T.teal200 }}
            onClick={() => console.log("Bulk assign clicked")}
          >
            Bulk assign
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout: "fixed", minWidth: 680 }}>
          <colgroup>
            <col style={{ width: "38%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Seller", "Score", "Status", "Assigned", "Last contact", "Action"].map((h, i) => (
                <th
                  key={h}
                  className="font-body font-bold text-[10px] uppercase tracking-widest text-left pb-2 pt-2 px-[10px]"
                  style={{ color: T.textDim, paddingLeft: i === 0 ? 14 : undefined }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <span className="font-body text-[13px]" style={{ color: T.textDim }}>
                    No leads match this filter
                  </span>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, i) => {
                const st = statusConfig[lead.status];
                const scoreColor = lead.score >= 75 ? T.green : lead.score >= 60 ? T.amber : T.red;
                const scoreBg = lead.score >= 75 ? T.greenBg : lead.score >= 60 ? T.amberBg : T.redBg;
                return (
                  <tr
                    key={lead.id}
                    className="cursor-pointer transition-colors duration-150"
                    style={{ borderBottom: i < filteredLeads.length - 1 ? `1px solid ${T.border2}` : "none" }}
                    onClick={() => router.push(`/admin/crm/leads/${lead.id}`)}
                    onMouseEnter={e => (e.currentTarget.style.background = T.bgHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="py-[9px] px-[10px] pl-[14px]">
                      <div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{lead.seller}</div>
                      <div className="font-body text-[11px]" style={{ color: T.textMuted }}>{lead.vehicle}</div>
                    </td>
                    <td className="py-[9px] px-[10px]">
                      <span
                        className="inline-flex items-center justify-center rounded-pill font-body font-bold text-[11px]"
                        style={{ width: 32, height: 18, background: scoreBg, color: scoreColor }}
                      >
                        {lead.score}
                      </span>
                    </td>
                    <td className="py-[9px] px-[10px]">
                      <span
                        className="inline-block rounded-pill px-2 py-0.5 font-body font-semibold text-[11px]"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="py-[9px] px-[10px]">
                      <span className="font-body text-[12px]" style={{ color: lead.assignee ? T.textMuted : T.textDim }}>
                        {lead.assignee || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-[9px] px-[10px]">
                      <span className="font-body text-[11px]" style={{ color: T.textDim }}>
                        {lead.lastContact || "—"}
                      </span>
                    </td>
                    <td className="py-[9px] px-[10px]">
                      <button
                        className="rounded-[6px] px-[9px] py-1 font-body font-semibold text-[11px] transition-all duration-150"
                        style={{ background: T.bgRow, color: lead.assignee ? T.textSecondary : T.teal200 }}
                        onClick={e => {
                          e.stopPropagation();
                          if (lead.assignee) {
                            router.push(`/admin/crm/leads/${lead.id}`);
                          } else {
                            setAssignModal(lead);
                          }
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; e.currentTarget.style.color = T.teal200; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.bgRow; e.currentTarget.style.color = lead.assignee ? T.textSecondary : T.teal200; }}
                      >
                        {lead.assignee ? "View" : "Assign"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Assign Modal (slide-in sheet) */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setAssignModal(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />
          <div
            className="relative w-[360px] h-full flex flex-col p-6 gap-4 animate-slide-in"
            style={{ background: T.bgCard, borderLeft: `1px solid ${T.border}` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading font-[800] text-[17px]" style={{ color: T.textPrimary }}>Assign lead</span>
              <button className="font-body text-[13px]" style={{ color: T.textDim }} onClick={() => setAssignModal(null)}>✕</button>
            </div>
            <div className="rounded-[10px] p-3" style={{ background: T.bgRow }}>
              <div className="font-body font-semibold text-[14px] mb-1" style={{ color: T.textPrimary }}>{assignModal.seller}</div>
              <div className="font-body text-[12px]" style={{ color: T.textMuted }}>{assignModal.vehicle}</div>
              <div className="flex gap-1.5 mt-2">
                <span className="rounded-pill px-2 py-0.5 font-body font-bold text-[10px]" style={{ background: T.greenBg, color: T.green }}>Score {assignModal.score}</span>
                <span className="rounded-pill px-2 py-0.5 font-body font-bold text-[10px]" style={{ background: statusConfig[assignModal.status].bg, color: statusConfig[assignModal.status].color }}>{statusConfig[assignModal.status].label}</span>
              </div>
            </div>
            <div>
              <label className="font-body font-bold text-[10px] uppercase tracking-widest mb-2 block" style={{ color: T.textDim }}>
                Assign to caller
              </label>
              <select
                className="w-full rounded-[8px] px-3 py-2 font-body text-[13px] outline-none"
                style={{ background: T.bgRow, border: `1px solid ${T.border}`, color: T.textPrimary }}
                value={assignCaller}
                onChange={e => setAssignCaller(e.target.value)}
              >
                {["Sarah K.", "James T.", "Jordan M.", "Aisha T."].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              className="w-full rounded-[8px] py-2.5 font-heading font-[800] text-[14px] text-white transition-opacity hover:opacity-90"
              style={{ background: T.teal }}
              onClick={handleAssign}
            >
              Assign lead
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ================================================================== */
/*  DIALLER SNAPSHOT                                                   */
/* ================================================================== */
function DiallerSnapshot() {
  const router = useRouter();
  const lead = D.activeDiallerLead;

  const tagPills = [
    { label: `Score ${lead.score}`, bg: T.greenBg, color: T.green },
    { label: lead.askingPrice,      bg: T.amberBg, color: T.amber },
    { label: lead.mileage,          bg: T.bgRow,   color: T.textSecondary },
  ];

  const outcomeBtns = [
    { label: "Interested", bg: T.greenBg, color: T.green },
    { label: "Callback",   bg: T.amberBg, color: T.amber },
    { label: "Declined",   bg: T.redBg,   color: T.red },
    { label: "Voicemail",  bg: T.bgRow,   color: T.textMuted },
    { label: "No answer",  bg: T.bgRow,   color: T.textDim },
  ];

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="flex items-center px-[15px] py-[11px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="w-[7px] h-[7px] rounded-full flex-shrink-0 animate-pulse" style={{ background: T.green }} />
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Live dialler — {lead.activeCaller}
        </span>
        <button
          className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer"
          style={{ color: T.teal200 }}
          onClick={() => router.push("/admin/crm/dialler")}
        >
          Full view →
        </button>
      </div>

      {/* Inner card */}
      <div className="p-[12px]">
        <div className="rounded-[10px] p-[12px]" style={{ background: T.bgRow }}>
          <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-[6px]" style={{ color: T.textDim }}>
            Next in queue — {lead.queuePosition} of {lead.queueTotal}
          </div>
          <div className="font-heading font-[800] text-[16px] tracking-tight mb-[1px]" style={{ color: T.textPrimary }}>
            {lead.seller}
          </div>
          <div className="font-body text-[12px] mb-[7px]" style={{ color: T.textMuted }}>
            {lead.vehicle}
          </div>

          {/* Tags */}
          <div className="flex gap-[5px] flex-wrap mb-[8px]">
            {tagPills.map(t => (
              <span key={t.label} className="rounded-pill px-2 py-0.5 font-body font-bold text-[10px]" style={{ background: t.bg, color: t.color }}>
                {t.label}
              </span>
            ))}
          </div>

          {/* Phone */}
          <div className="font-mono text-[17px] font-bold tracking-[0.03em] mb-[6px]" style={{ color: T.teal200 }}>
            {lead.phone}
          </div>
          <div className="font-body text-[11px] mb-[9px]" style={{ color: T.textMuted }}>
            Assigned · {lead.priorContacts} prior contacts
          </div>

          {/* Call controls — DISABLED for super admin */}
          <div className="grid grid-cols-2 gap-[7px] mt-[2px] pointer-events-none opacity-60">
            <button className="flex items-center justify-center gap-1.5 rounded-[8px] py-[10px] font-heading font-[800] text-[13px]" style={{ background: T.green, color: T.greenBg }}>
              <Phone size={13} /> Call now
            </button>
            <button className="flex items-center justify-center gap-1.5 rounded-[8px] py-[10px] font-heading font-bold text-[13px]" style={{ background: T.bgCard, color: T.textSecondary }}>
              <SkipForward size={13} /> Skip →
            </button>
          </div>

          {/* Outcome buttons — DISABLED */}
          <div className="flex gap-[5px] flex-wrap mt-[8px] pointer-events-none opacity-60">
            {outcomeBtns.map(btn => (
              <button
                key={btn.label}
                className="rounded-[6px] px-2 py-1 font-body font-semibold text-[11px]"
                style={{ background: btn.bg, color: btn.color }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Notes — DISABLED */}
          <textarea
            className="w-full rounded-[7px] px-[10px] py-[7px] font-body text-[12px] resize-none mt-[7px] outline-none pointer-events-none opacity-60"
            style={{
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              color: T.textPrimary,
            }}
            placeholder="Call notes..."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CALLBACK QUEUE                                                     */
/* ================================================================== */
function CallbackQueue() {
  const overdueCount = D.callbacks.filter(c => c.status === "overdue").length;

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[15px] py-[11px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Callbacks today
        </span>
        <span className="font-body font-bold text-[11px]" style={{ color: T.red }}>
          {overdueCount} overdue
        </span>
      </div>
      <div className="px-[15px] py-[8px]">
        {D.callbacks.map((cb, i) => {
          const timeColor = cb.status === "overdue" ? T.red : cb.status === "due_now" ? T.amber : T.textSecondary;
          return (
            <div
              key={i}
              className="flex items-center gap-2 py-[7px]"
              style={{ borderBottom: i < D.callbacks.length - 1 ? `1px solid ${T.border2}` : "none" }}
            >
              <span className="font-heading font-[800] text-[13px] min-w-[40px] flex-shrink-0" style={{ color: timeColor }}>
                {cb.time}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{cb.seller}</div>
                <div className="font-body text-[11px] mt-[1px]" style={{ color: T.textMuted }}>{cb.vehicle} · {cb.caller}</div>
              </div>
              {cb.status === "overdue" && (
                <span className="rounded-pill px-2 py-0.5 font-body font-semibold text-[10px]" style={{ background: T.redBg, color: T.red }}>Overdue</span>
              )}
              {cb.status === "due_now" && (
                <span className="rounded-pill px-2 py-0.5 font-body font-semibold text-[10px]" style={{ background: T.amberBg, color: T.amber }}>Due now</span>
              )}
              {cb.status === "upcoming" && (
                <span className="font-body text-[11px]" style={{ color: T.textMuted }}>{cb.time}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CALLER LEADERBOARD                                                 */
/* ================================================================== */
function CallerLeaderboard() {
  const router = useRouter();

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[15px] py-[11px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Caller leaderboard
        </span>
        <button
          className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer"
          style={{ color: T.teal200 }}
          onClick={() => router.push("/admin/crm/performance")}
        >
          Full stats →
        </button>
      </div>
      <div className="px-[15px] py-[6px]">
        {D.callers.map((caller, i) => {
          const rateColor = caller.contactRate >= 35 ? T.green : caller.contactRate >= 25 ? T.amber : T.red;
          return (
            <div
              key={caller.name}
              className="flex items-center gap-[9px] py-[9px]"
              style={{
                borderBottom: i < D.callers.length - 1 ? `1px solid ${T.border2}` : "none",
                ...(caller.flag ? { background: "#0D0A1A", borderRadius: 8, padding: "8px 6px", margin: "0 -3px" } : {}),
              }}
            >
              {/* Rank */}
              <span
                className="font-heading font-black text-[14px] w-[16px] text-center flex-shrink-0"
                style={{ color: caller.rank === 1 ? T.amber : T.textDim }}
              >
                {caller.rank}
              </span>
              {/* Avatar */}
              <div
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 font-body font-[800] text-[11px] text-white"
                style={{ background: caller.avatarBg }}
              >
                {caller.initials}
              </div>
              {/* Name + sub */}
              <div className="flex-1 min-w-0">
                <div
                  className="font-body font-semibold text-[13px]"
                  style={{ color: caller.flag ? T.amber : T.textPrimary }}
                >
                  {caller.name}
                </div>
                <div
                  className="font-body text-[11px] mt-[1px]"
                  style={{ color: caller.flag ? T.red : T.textMuted }}
                >
                  {caller.flag
                    ? "0 signed · coaching flag"
                    : `${caller.signedWeek} signed this week`
                  }
                </div>
              </div>
              {/* Dials + rate */}
              <div className="text-right flex-shrink-0">
                <div
                  className="font-heading font-black text-[15px] leading-none"
                  style={{ color: caller.flag ? T.amber : T.textPrimary }}
                >
                  {caller.dials}
                </div>
                <div className="font-body text-[11px] text-right mt-[1px]" style={{ color: rateColor }}>
                  {caller.contactRate}%
                </div>
              </div>
            </div>
          );
        })}

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-[10px]" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="rounded-[8px] px-[10px] py-[8px]" style={{ background: T.bgRow }}>
            <div className="font-body font-bold text-[10px] uppercase tracking-widest" style={{ color: T.textDim }}>Avg call time</div>
            <div className="font-heading font-black text-[16px]" style={{ color: T.textPrimary }}>{D.avgCallDuration}</div>
          </div>
          <div className="rounded-[8px] px-[10px] py-[8px]" style={{ background: T.bgRow }}>
            <div className="font-body font-bold text-[10px] uppercase tracking-widest" style={{ color: T.textDim }}>AI sent today</div>
            <div className="font-heading font-black text-[16px]" style={{ color: T.teal200 }}>{D.aiOutreachToday}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TEAM TARGETS                                                       */
/* ================================================================== */
function TeamTargets() {
  const onTrackCount = D.targets.filter(t => {
    if (t.label === "Callbacks cleared") return false; // ops hygiene, not counted
    return t.actual >= t.target;
  }).length;

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[15px] py-[11px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Team targets
        </span>
        <span className="font-body font-bold text-[11px]" style={{ color: T.green }}>
          {onTrackCount} of 4 on track
        </span>
      </div>
      <div className="px-[15px] py-[10px]">
        {D.targets.map((t, i) => {
          const pct = Math.min((t.actual / t.target) * 100, 100);
          const isCallbacks = t.label === "Callbacks cleared";
          const isFailing = t.actual < t.target;
          const isOver = t.actual >= t.target;

          let barColor = T.teal200;
          let valueText: string;
          let valueColor: string;

          if (t.label === "Daily dials") {
            barColor = T.teal200;
            valueText = `${t.actual} / ${t.target}`;
            valueColor = T.teal200;
          } else if (isCallbacks && isFailing) {
            barColor = T.red;
            valueText = `${t.actual}% ✗`;
            valueColor = T.red;
          } else if (isOver) {
            barColor = T.green;
            valueText = t.unit === "percent" ? `${t.actual}% ✓` : `${t.actual} ✓`;
            valueColor = T.green;
          } else {
            barColor = T.amber;
            valueText = t.unit === "percent" ? `${t.actual}%` : `${t.actual}`;
            valueColor = T.amber;
          }

          return (
            <div key={t.label} className={i < D.targets.length - 1 ? "mb-[10px]" : ""}>
              <div className="flex justify-between mb-[3px]">
                <span className="font-body font-semibold text-[11px]" style={{ color: T.textMuted }}>{t.label}</span>
                <span className="font-body font-bold text-[11px]" style={{ color: valueColor }}>{valueText}</span>
              </div>
              <div className="h-[4px] rounded-full overflow-hidden" style={{ background: T.bgRow }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}

        {/* Pace forecast */}
        <div className="mt-3 pt-[10px]" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-2" style={{ color: T.textDim }}>
            Pace forecast
          </div>
          <div className="flex justify-between mb-[5px]">
            <span className="font-body text-[12px]" style={{ color: T.textMuted }}>Projected end-of-day dials</span>
            <span className="font-body font-bold text-[12px]" style={{ color: T.teal200 }}>{D.paceForecast.projectedDials}</span>
          </div>
          <div className="flex justify-between mb-[5px]">
            <span className="font-body text-[12px]" style={{ color: T.textMuted }}>Projected signed deals</span>
            <span className="font-body font-bold text-[12px]" style={{ color: T.green }}>{D.paceForecast.projectedSigned}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-body text-[12px]" style={{ color: T.textMuted }}>{D.paceForecast.interventionFlag} intervention needed</span>
            <span className="font-body font-bold text-[12px]" style={{ color: T.red }}>Yes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CALL SCRIPT                                                        */
/* ================================================================== */
function CallScript() {
  const router = useRouter();

  const renderScript = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        return (
          <strong key={i} className="font-body font-semibold" style={{ color: T.teal200 }}>
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[15px] py-[11px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
          Active call script
        </span>
        <button
          className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer"
          style={{ color: T.teal200 }}
          onClick={() => router.push("/admin/crm/scripts")}
        >
          Edit library →
        </button>
      </div>
      <div className="p-[12px]">
        {D.scriptSections.map((section, i) => (
          <div
            key={i}
            className="rounded-[9px] px-[12px] py-[10px]"
            style={{ background: T.bgRow, marginBottom: i < D.scriptSections.length - 1 ? 7 : 0 }}
          >
            <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-[5px]" style={{ color: T.textDim }}>
              {section.label}
            </div>
            <div className="font-body font-normal text-[12px] leading-relaxed" style={{ color: "#C8CDD6" }}>
              {renderScript(section.text)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE ASSEMBLY                                                      */
/* ================================================================== */
export default function CrmPage() {
  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
      <CrmTopbar />
      <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto overflow-x-hidden">
        {/* KPI Strip */}
        <CrmKpiRow />

        {/* Main row: Lead queue (wide) + Right column (dialler + callbacks) */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 280px" }}>
          <div className="min-w-0">
            <LeadQueue />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <DiallerSnapshot />
            <CallbackQueue />
          </div>
        </div>

        {/* Bottom row: Leaderboard · Targets · Script */}
        <div className="grid grid-cols-3 gap-3">
          <CallerLeaderboard />
          <TeamTargets />
          <CallScript />
        </div>
      </div>
      </div>
    </div>
  );
}
