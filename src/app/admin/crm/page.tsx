"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { crmDashboardData as D } from "@/lib/admin/crm-mock-data";
import { Phone, SkipForward } from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import { CrmTopbar } from "@/components/admin/crm-topbar";
import { AddLeadDrawer } from "@/components/admin/add-lead-drawer";
import { ScraperDrawer } from "@/components/admin/scraper-drawer";
import { LeadPipeline } from "@/components/crm/lead-pipeline";
import { useCurrentUser } from "@/lib/auth/use-current-user";

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

interface CrmStats {
  dialsToday: number; contacted: number; offersSent: number; signedToday: number; callbacksOverdue: number;
}

function CrmKpiRow({ stats }: { stats: CrmStats | null }) {
  const n = (v: number | undefined) => v ?? 0;
  const kpis = [
    { label: "Dials today",       value: n(stats?.dialsToday),       delta: n(stats?.dialsToday) > 0 ? "today" : "No data yet",          deltaType: "neutral" as const },
    { label: "Contacted",         value: n(stats?.contacted),        delta: n(stats?.contacted) > 0 ? "in pipeline" : "No data yet",     deltaType: "neutral" as const },
    { label: "Offers sent",       value: n(stats?.offersSent),       delta: n(stats?.offersSent) > 0 ? "awaiting signature" : "No data yet", deltaType: "neutral" as const },
    { label: "Signed today",      value: n(stats?.signedToday),      delta: n(stats?.signedToday) > 0 ? "today" : "No data yet",         deltaType: (n(stats?.signedToday) > 0 ? "up" : "neutral") as "up" | "neutral" },
    { label: "Callbacks overdue", value: n(stats?.callbacksOverdue), delta: n(stats?.callbacksOverdue) > 0 ? "action needed" : "None overdue", deltaType: (n(stats?.callbacksOverdue) > 0 ? "warn" : "neutral") as "warn" | "neutral" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map(kpi => (
        <div
          key={kpi.label}
          className="rounded-[14px] px-3 py-3 sm:px-[15px] sm:py-[13px] transition-colors duration-200"
          style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        >
          <div
            className="font-body font-bold text-[10px] uppercase tracking-widest mb-[7px] truncate"
            style={{ color: T.textDim }}
          >
            {kpi.label}
          </div>
          <div
            className="font-heading font-black text-2xl sm:text-3xl leading-none tracking-tight mb-1"
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
/*  DIALLER SNAPSHOT                                                   */
/* ================================================================== */
function DiallerSnapshot() {
  const router = useRouter();
  const lead = D.activeDiallerLead;

  if (!lead) {
    return (
      <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
        <div className="flex items-center px-3 py-[11px] sm:px-[15px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
          <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: T.textDim }} />
          <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0 truncate" style={{ color: T.textPrimary }}>Live dialler — idle</span>
          <button
            className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer flex-shrink-0"
            style={{ color: T.teal200 }}
            onClick={() => router.push("/admin/crm/dialler")}
          >
            Open dialler →
          </button>
        </div>
        <div className="px-3 sm:px-[15px] py-8 text-center font-body text-[12px]" style={{ color: T.textMuted }}>
          No active call. Open the dialler to start working the queue.
        </div>
      </div>
    );
  }

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
      <div className="flex items-center px-3 py-[11px] sm:px-[15px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="w-[7px] h-[7px] rounded-full flex-shrink-0 animate-pulse" style={{ background: T.green }} />
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0 truncate" style={{ color: T.textPrimary }}>
          Live dialler — {lead.activeCaller}
        </span>
        <button
          className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer flex-shrink-0"
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
      <div className="flex items-center px-3 py-[11px] sm:px-[15px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0" style={{ color: T.textPrimary }}>
          Callbacks today
        </span>
        <span className="font-body font-bold text-[11px] flex-shrink-0" style={{ color: T.red }}>
          {overdueCount} overdue
        </span>
      </div>
      <div className="px-3 sm:px-[15px] py-[8px]">
        {D.callbacks.length === 0 && (
          <div className="font-body text-[12px] text-center py-6" style={{ color: T.textMuted }}>No callbacks scheduled.</div>
        )}
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
      <div className="flex items-center px-3 py-[11px] sm:px-[15px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0" style={{ color: T.textPrimary }}>
          Caller leaderboard
        </span>
        <button
          className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer flex-shrink-0"
          style={{ color: T.teal200 }}
          onClick={() => router.push("/admin/crm/performance")}
        >
          Full stats →
        </button>
      </div>
      <div className="px-3 sm:px-[15px] py-[6px]">
        {D.callers.length === 0 && (
          <div className="font-body text-[12px] text-center py-6" style={{ color: T.textMuted }}>No callers tracked yet.</div>
        )}
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
  const hasTargets = D.targets.some(t => t.target > 0);
  const onTrackCount = D.targets.filter(t => {
    if (t.label === "Callbacks cleared") return false; // ops hygiene, not counted
    return t.target > 0 && t.actual >= t.target;
  }).length;

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-3 py-[11px] sm:px-[15px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0" style={{ color: T.textPrimary }}>
          Team targets
        </span>
        <span className="font-body font-bold text-[11px] flex-shrink-0" style={{ color: hasTargets ? T.green : T.textMuted }}>
          {hasTargets ? `${onTrackCount} of 4 on track` : "No targets set"}
        </span>
      </div>
      <div className="px-3 sm:px-[15px] py-[10px]">
        {!hasTargets && (
          <div className="font-body text-[12px] text-center py-6" style={{ color: T.textMuted }}>No targets set yet.</div>
        )}
        {hasTargets && D.targets.map((t, i) => {
          const pct = t.target > 0 ? Math.min((t.actual / t.target) * 100, 100) : 0;
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
        {hasTargets && (
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
            {D.paceForecast.interventionFlag !== "—" && (
              <div className="flex justify-between">
                <span className="font-body text-[12px]" style={{ color: T.textMuted }}>{D.paceForecast.interventionFlag} intervention needed</span>
                <span className="font-body font-bold text-[12px]" style={{ color: T.red }}>Yes</span>
              </div>
            )}
          </div>
        )}
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
      <div className="flex items-center px-3 py-[11px] sm:px-[15px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0" style={{ color: T.textPrimary }}>
          Active call script
        </span>
        <button
          className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer flex-shrink-0"
          style={{ color: T.teal200 }}
          onClick={() => router.push("/admin/crm/scripts")}
        >
          Edit library →
        </button>
      </div>
      <div className="p-[12px]">
        {D.scriptSections.length === 0 && (
          <div className="font-body text-[12px] text-center py-6" style={{ color: T.textMuted }}>No script saved yet.</div>
        )}
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
  const router = useRouter();
  const { user } = useCurrentUser();
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [scraperOpen, setScraperOpen] = useState(false);
  const [leadsRefreshKey, setLeadsRefreshKey] = useState(0);
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  // KPI counts — refetched whenever a lead moves stage or a lead is added.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/crm/stats", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) setStats(d.stats ?? null); })
      .catch(err => { if (!cancelled) console.error("[CrmPage] stats fetch failed:", err); });
    return () => { cancelled = true; };
  }, [statsRefreshKey]);

  // Sales reps don't source leads — hide the AutoTrader scrape entry point.
  const isSales = user?.role === "sales";
  const overdueCount = stats?.callbacksOverdue ?? 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
      <CrmTopbar
        title="Overview"
        badges={
          overdueCount > 0 ? (
            <span
              className="rounded-pill px-2.5 py-1 font-body text-[11px] font-bold"
              style={{ background: T.redBg, color: T.red }}
            >
              {overdueCount === 1 ? "1 callback overdue" : `${overdueCount} callbacks overdue`}
            </span>
          ) : undefined
        }
        actions={
          <>
            {!isSales && (
              <button
                onClick={() => setScraperOpen(true)}
                className="px-2.5 py-1.5 sm:px-[14px] sm:py-[6px] text-xs rounded-[8px] transition-colors hover:opacity-80 flex-shrink-0"
                style={{ background: "#101A2E", color: T.textPrimary, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600 }}
                title="Bulk-import listings from AutoTrader URLs"
              >
                ⤓<span className="hidden sm:inline"> Scrape AT</span>
              </button>
            )}
            <button
              onClick={() => setAddLeadOpen(true)}
              className="px-2.5 py-1.5 sm:px-[14px] sm:py-[6px] text-xs rounded-[8px] transition-colors hover:opacity-80 flex-shrink-0"
              style={{ background: "#0A2A26", color: T.teal200, border: "1px solid #0A1A2E", fontFamily: "var(--font-body)", fontWeight: 600 }}
              title="Add lead"
            >
              +<span className="hidden sm:inline"> Add lead</span>
            </button>
            <button
              onClick={() => router.push("/admin/crm/dialler")}
              className="font-heading font-[800] text-xs sm:text-[13px] text-white rounded-[8px] px-2.5 py-1.5 sm:px-4 transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ background: T.teal }}
            >
              Open dialler<span className="hidden sm:inline"> →</span>
            </button>
          </>
        }
      />
      <div className="flex-1 flex flex-col gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 overflow-y-auto overflow-x-hidden">
        {/* KPI Strip */}
        <CrmKpiRow stats={stats} />

        {/* Pipeline — the rep's deal board (full width) */}
        <LeadPipeline refreshKey={leadsRefreshKey} onLeadsChanged={() => setStatsRefreshKey(k => k + 1)} />

        {/* Calls-focused row: dialler snapshot + callbacks + script */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <DiallerSnapshot />
          <CallbackQueue />
          <CallScript />
        </div>

        {/* Team row — hidden for sales reps (their portal is calls + their deals) */}
        {!isSales && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            <CallerLeaderboard />
            <TeamTargets />
          </div>
        )}
      </div>
      </div>
      <AddLeadDrawer
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        onCreated={() => { setLeadsRefreshKey(k => k + 1); setStatsRefreshKey(k => k + 1); }}
      />
      <ScraperDrawer
        open={scraperOpen}
        onClose={() => setScraperOpen(false)}
        onCreated={() => { setLeadsRefreshKey(k => k + 1); setStatsRefreshKey(k => k + 1); }}
      />
    </div>
  );
}
