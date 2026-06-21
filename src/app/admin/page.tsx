"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip,
} from "recharts";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import { useCurrentUser, roleLabel } from "@/lib/auth/use-current-user";

/* ================================================================== */
/*  TYPES                                                              */
/* ================================================================== */
interface CCStats {
  pipelineValueGbp: number; activeDeals: number; estCommissionGbp: number; signedToday: number;
  vehiclesInStock: number; vehiclesTotal: number; leadsInPipeline: number;
  dealPipeline: { label: string; count: number; valueGbp: number }[];
  dealsCollected14d: { label: string; count: number }[];
  overdueCallbacks: number;
  health: { score: number; chips: { label: string; variant: "green" | "amber" | "red" }[] };
  alerts: { variant: "red" | "amber"; message: string }[];
}

const fmtK = (p: number) => (p >= 1000 ? `£${Math.round(p / 1000)}k` : `£${p.toLocaleString()}`);

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
function Topbar() {
  const [time, setTime] = useState("");
  const { user } = useCurrentUser();
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setTime(`${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} GMT`);
    };
    fmt();
    const iv = setInterval(fmt, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="sticky top-0 z-10 flex items-center h-14 px-6 gap-4" style={{ background: "#070D18", borderBottom: "1px solid #1A2640" }}>
      <h1 className="text-[17px] font-extrabold text-[#E2E8F4]" style={{ fontFamily: "var(--font-heading)" }}>Command centre</h1>
      <span className="text-[13px] text-[#94A3BB]">{user ? `· ${user.name} · ${roleLabel(user.role)}` : ""}</span>
      <div className="flex items-center gap-1.5 ml-6 rounded-full px-2.5 py-1" style={{ background: "#0D2010" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#34D399]">Live</span>
      </div>
      <span className="text-[12px] font-mono text-[#94A3BB]">{time}</span>
      <div className="flex-1" />
    </div>
  );
}

/* ================================================================== */
/*  HEALTH SCORE BAR                                                   */
/* ================================================================== */
function HealthScoreBar({ stats }: { stats: CCStats | null }) {
  const [fill, setFill] = useState(0);
  const score = stats?.health.score ?? 0;
  useEffect(() => { const t = setTimeout(() => setFill(score), 100); return () => clearTimeout(t); }, [score]);
  const chipColours = { green: { bg: "#0D2010", text: "#34D399" }, amber: { bg: "#1F1500", text: "#FCD34D" }, red: { bg: "#1A0505", text: "#F87171" } };

  return (
    <div className="flex items-center gap-4 rounded-[14px] px-6 py-4" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex-shrink-0 text-center">
        <p className="text-[48px] font-black leading-none tracking-tight text-[#4DD9C7]" style={{ fontFamily: "var(--font-heading)" }}>{score}</p>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#94A3BB] mt-0.5">Platform health</p>
      </div>
      <div className="flex-1 mx-2 h-2 rounded-full overflow-hidden" style={{ background: "#1A2640" }}>
        <div className="h-full rounded-full bg-[#4DD9C7] transition-all duration-700 ease-out" style={{ width: `${fill}%` }} />
      </div>
      <div className="flex gap-2 flex-wrap ml-auto flex-shrink-0">
        {(stats?.health.chips ?? []).map((chip) => {
          const c = chipColours[chip.variant];
          return (
            <span key={chip.label} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: c.bg, color: c.text }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.text }} />
              {chip.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  KPI ROW                                                            */
/* ================================================================== */
function KpiRow({ stats }: { stats: CCStats | null }) {
  const router = useRouter();
  const cards = [
    { eyebrow: "Pipeline value", value: stats ? fmtK(stats.pipelineValueGbp) : "—", accent: "#A78BFA", sub: `${stats?.activeDeals ?? 0} active deals`, href: "/admin/deals" },
    { eyebrow: "Vehicles in stock", value: stats ? String(stats.vehiclesInStock) : "—", accent: "#FCD34D", sub: `of ${stats?.vehiclesTotal ?? 0} total`, href: "/admin/inventory" },
    { eyebrow: "Est. commission", value: stats ? `£${stats.estCommissionGbp.toLocaleString()}` : "—", accent: "#34D399", sub: "Projected · open deals", href: "/admin/deals" },
    { eyebrow: "Signed today", value: stats ? String(stats.signedToday) : "—", accent: "#4DD9C7", sub: "Deals collected today", href: "/admin/deals" },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((kpi) => (
        <div key={kpi.eyebrow}
          className="relative overflow-hidden rounded-[14px] px-5 py-5 cursor-pointer transition-all duration-200 hover:bg-[#0C1428]"
          style={{ background: "#0A1020", border: "1px solid #1A2640" }}
          onClick={() => router.push(kpi.href)}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1E3A5F"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A2640"; }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#94A3BB] mb-2.5">{kpi.eyebrow}</p>
          <p className="text-[36px] font-black leading-none tracking-tight mb-2" style={{ fontFamily: "var(--font-heading)", color: kpi.accent }}>{kpi.value}</p>
          <p className="text-[13px] font-semibold text-[#A0AEBF]">{kpi.sub}</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[14px] opacity-40" style={{ background: kpi.accent }} />
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  DEALS COLLECTED — 14 DAYS                                          */
/* ================================================================== */
function DealsCollectedChart({ stats }: { stats: CCStats | null }) {
  const data = stats?.dealsCollected14d ?? [];
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="rounded-[14px] px-5 py-4" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-[#E2E8F4]">Deals collected — 14 days</p>
        <Link href="/admin/deals" className="text-[11px] font-semibold text-[#4DD9C7] hover:underline">View deals →</Link>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="#111D30" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3BB" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#070D18", border: "1px solid #1A2640", borderRadius: 8, fontSize: 12, color: "#E2E8F4" }} formatter={(v) => [`${v} deal${Number(v) === 1 ? "" : "s"}`, ""]} labelStyle={{ color: "#C5CDD8" }} cursor={{ fill: "#111D3055" }} />
          <Bar dataKey="count" fill="#008C7C" radius={[4, 4, 0, 0]} name="Collected" />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-[11px] text-[#A0AEBF] mt-2">{total} collected in the last 14 days</div>
    </div>
  );
}

/* ================================================================== */
/*  DEAL PIPELINE                                                      */
/* ================================================================== */
function DealPipeline({ stats }: { stats: CCStats | null }) {
  const rows = stats?.dealPipeline ?? [];
  const maxCount = Math.max(1, ...rows.map(r => r.count));
  const totalCount = rows.reduce((s, r) => s + r.count, 0);
  const totalValue = rows.reduce((s, r) => s + r.valueGbp, 0);
  return (
    <div className="rounded-[14px] px-5 py-4" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-[#E2E8F4]">Deal pipeline</p>
        <Link href="/admin/deals" className="text-[11px] font-semibold text-[#4DD9C7] hover:underline">View all →</Link>
      </div>
      <div>
        {rows.map((row, i) => (
          <div key={row.label} className="grid items-center gap-3 py-2.5" style={{ gridTemplateColumns: "1fr auto auto", borderBottom: i < rows.length - 1 ? "1px solid #111D30" : "none" }}>
            <div>
              <p className="text-[13px] font-semibold text-[#C5CDD8] mb-1">{row.label}</p>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "#1A2640" }}>
                <div className="h-full rounded-full" style={{ width: `${(row.count / maxCount) * 100}%`, background: "#008C7C" }} />
              </div>
            </div>
            <p className="text-[20px] font-black text-[#E2E8F4] text-right min-w-[28px]" style={{ fontFamily: "var(--font-heading)" }}>{row.count}</p>
            <p className="text-[12px] text-[#A0AEBF] text-right min-w-[62px]">{fmtK(row.valueGbp)}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2.5 mt-0.5" style={{ borderTop: "1px solid #1A2640" }}>
        <span className="text-[12px] text-[#A0AEBF]">{totalCount} deals total</span>
        <span className="text-[15px] font-black text-[#4DD9C7]" style={{ fontFamily: "var(--font-heading)" }}>{fmtK(totalValue)} pipeline</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ALERTS                                                             */
/* ================================================================== */
function Alerts({ stats }: { stats: CCStats | null }) {
  const alerts = stats?.alerts ?? [];
  const dotColours = { red: "#F87171", amber: "#FCD34D" };
  const critCount = alerts.filter(a => a.variant === "red").length;
  const warnCount = alerts.filter(a => a.variant === "amber").length;
  return (
    <div className="rounded-[14px] flex flex-col" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #1A2640" }}>
        <span className="text-[13px] font-bold text-[#E2E8F4]">Alerts</span>
        <span className="text-[11px] font-bold" style={{ color: alerts.length ? "#F87171" : "#34D399" }}>{alerts.length ? `${critCount} critical · ${warnCount} warnings` : "All clear"}</span>
      </div>
      <div className="px-4 py-2">
        {alerts.length === 0 && (
          <div className="text-center py-6 text-[12px] text-[#94A3BB]">No alerts — deals and callbacks are on track.</div>
        )}
        {alerts.map((alert, i) => (
          <div key={i} className="flex gap-2.5 items-start py-2.5" style={{ borderBottom: i < alerts.length - 1 ? "1px solid #111D30" : "none" }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: dotColours[alert.variant] }} />
            <p className="text-[12px] text-[#C5CDD8] leading-snug" dangerouslySetInnerHTML={{ __html: alert.message.replace(/<strong>/g, '<strong class="font-semibold text-[#E2E8F4]">') }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function AdminCommandCentre() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<CCStats | null>(null);
  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    fetch("/api/admin/command-centre", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) setStats(d.stats ?? null); })
      .catch(e => { if (!cancelled) console.error("[CommandCentre] fetch failed:", e); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#0B111E" }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-[1024px]">
        <Topbar />
        <div className="flex-1 flex flex-col gap-5 p-6 transition-all duration-400 ease-out"
          style={{ background: "#0B111E", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)" }}>
          <HealthScoreBar stats={stats} />
          <KpiRow stats={stats} />
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <DealsCollectedChart stats={stats} />
            <DealPipeline stats={stats} />
          </div>
          <Alerts stats={stats} />
        </div>
      </div>
    </div>
  );
}
