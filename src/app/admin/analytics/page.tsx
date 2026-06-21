"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { IconSidebar } from "@/components/admin/icon-sidebar";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const T = {
  bgPage: "#0B111E", bgCard: "#0D1525", bgSidebar: "#070D18", bgRow: "#111D30",
  border: "#1E2D4A", border2: "#111D30",
  textPrimary: "#F1F5F9", textSecondary: "#8492A8", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7", green: "#34D399", amber: "#F5A623", red: "#F87171",
  indigo: "#A78BFA", indigoBg: "#172D4D",
};
const deltaColors: Record<string, string> = { up: T.green, down: T.red, warn: T.amber, neutral: T.textMuted };
const BAR_PALETTE = [T.teal200, T.indigo, T.green, T.amber, T.teal, "#60A5FA"];
const fmtK = (p: number) => (p >= 1000 ? `£${Math.round(p / 1000)}k` : `£${p.toLocaleString()}`);

/* ================================================================== */
/*  TYPES                                                              */
/* ================================================================== */
type Period = "7d" | "30d" | "mtd" | "90d" | "ytd";
const PERIODS: { id: Period; label: string; api: string; range: string }[] = [
  { id: "7d", label: "7 days", api: "7days", range: "Last 7 days" },
  { id: "30d", label: "30 days", api: "30days", range: "Last 30 days" },
  { id: "mtd", label: "MTD", api: "mtd", range: "Month to date" },
  { id: "90d", label: "90 days", api: "90days", range: "Last 90 days" },
  { id: "ytd", label: "YTD", api: "ytd", range: "Year to date" },
];

interface AnalyticsData {
  overview: {
    kpis: { pipelineValueGbp: number; activeDeals: number; dealsCollected: number; vehiclesLive: number; leadsContacted: number; estCommissionGbp: number };
    dealsCollectedSeries: { label: string; count: number }[];
    funnel: { label: string; value: number; pct: number }[];
    dealsByStage: { label: string; count: number }[];
    inventoryAge: { label: string; count: number }[];
  };
  acquisition: {
    kpis: { totalLeads: number; scored: number; outreachSent: number; responseRatePct: number; signed: number };
    outreachSeries: { label: string; outreach: number; responded: number }[];
    leadSources: { label: string; value: number }[];
    topModels: { name: string; count: number; avgScore: number }[];
  };
  inventory: {
    kpis: { vehiclesLive: number; avgDaysOnLot: number; aging45: number; lots: number };
    ageBuckets: { label: string; count: number }[];
    vehiclesByStage: { label: string; count: number }[];
    lotCapacity: { name: string; vehicles: number; capacityPct: number }[];
  };
}

/* ================================================================== */
/*  SHARED                                                             */
/* ================================================================== */
function ChartTooltip({ active, payload, label, suffix = "" }: { active?: boolean; payload?: { color?: string; name?: string; value?: number }[]; label?: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[8px] px-3 py-2" style={{ background: T.bgRow, border: `1px solid ${T.border}` }}>
      <p className="text-[11px] mb-1" style={{ color: T.textMuted }}>{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="text-[12px] font-semibold" style={{ color: e.color }}>{e.name}: {e.value}{suffix}</p>
      ))}
    </div>
  );
}
function KpiCard({ label, value, delta, deltaType = "neutral", valueColor }: { label: string; value: string; delta: string; deltaType?: string; valueColor?: string }) {
  return (
    <div className="rounded-[14px] px-[15px] py-[13px]" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-[7px]" style={{ color: T.textDim }}>{label}</div>
      <div className="font-heading font-black text-[28px] leading-none tracking-tight" style={{ color: valueColor || T.textPrimary }}>{value}</div>
      <div className="font-body font-semibold text-[11px] mt-1" style={{ color: deltaColors[deltaType] || T.textMuted }}>{delta}</div>
    </div>
  );
}
function PanelCard({ title, rightBadge, children }: { title: string; rightBadge?: { text: string; color: string }; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[15px] py-[11px] gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>{title}</span>
        {rightBadge && <span className="font-body font-bold text-[11px]" style={{ color: rightBadge.color }}>{rightBadge.text}</span>}
      </div>
      <div className="px-[15px] py-[12px]">{children}</div>
    </div>
  );
}
function HBar({ label, value, fillPct, fillColor, rateLbl, rateColor, labelWidth = 90 }: { label: string; value: number | string; fillPct: number; fillColor: string; rateLbl?: string; rateColor?: string; labelWidth?: number }) {
  return (
    <div className="flex items-center gap-2 py-[3px]">
      <span className="font-body text-[12px] text-right flex-shrink-0" style={{ color: T.textSecondary, width: labelWidth }}>{label}</span>
      <div className="flex-1 h-[24px] rounded-[6px] overflow-hidden" style={{ background: T.bgRow }}>
        {fillPct > 0 && <div className="h-full rounded-[6px]" style={{ width: `${Math.min(100, fillPct)}%`, background: fillColor }} />}
      </div>
      <span className="font-heading font-bold text-[12px] min-w-[32px] text-right" style={{ color: T.textPrimary }}>{typeof value === "number" ? value.toLocaleString() : value}</span>
      {rateLbl && <span className="font-body text-[11px] min-w-[40px] text-right" style={{ color: rateColor || T.textMuted }}>{rateLbl}</span>}
    </div>
  );
}
const chartMargin = { top: 8, right: 8, bottom: 0, left: 0 };
const gridStroke = "#1A2640";
const tickStyle = { fill: "#4A556B", fontSize: 11 };
const EmptyChart = ({ msg }: { msg: string }) => <div className="flex items-center justify-center" style={{ height: 180, color: T.textMuted, fontSize: 12 }}>{msg}</div>;

/* ================================================================== */
/*  TOPBAR + PERIOD                                                    */
/* ================================================================== */
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "acquisition", label: "Acquisition" },
  { id: "inventory", label: "Inventory" },
];
function AnalyticsTopbar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 px-[22px]" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-1.5 mr-3">
        <span className="cursor-pointer font-body text-[13px]" style={{ color: T.textDim }} onClick={() => router.push("/admin")}>Admin</span>
        <span className="text-[13px]" style={{ color: T.textDim }}>/</span>
        <span className="font-heading font-[800] text-[17px]" style={{ color: T.textPrimary }}>Analytics</span>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="flex rounded-[10px] p-[3px] gap-[2px]" style={{ background: T.bgRow }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="rounded-[8px] px-[13px] py-[6px] font-body font-semibold text-[13px] transition-colors duration-150"
              style={{ background: activeTab === tab.id ? T.bgCard : "transparent", color: activeTab === tab.id ? T.textPrimary : T.textMuted }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: 90 }} />
    </div>
  );
}
function PeriodSelector({ activePeriod, onChange }: { activePeriod: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-body font-semibold text-[12px] mr-1" style={{ color: T.textMuted }}>Period:</span>
      {PERIODS.map(p => (
        <button key={p.id} onClick={() => onChange(p.id)}
          className="rounded-[8px] px-[12px] py-[5px] font-body font-semibold text-[12px] transition-colors"
          style={{ background: activePeriod === p.id ? "#0A1A2E" : T.bgRow, border: `1px solid ${activePeriod === p.id ? T.indigoBg : T.border}`, color: activePeriod === p.id ? T.teal200 : T.textMuted }}>
          {p.label}
        </button>
      ))}
      <span className="font-body text-[11px] ml-2" style={{ color: T.textDim }}>{PERIODS.find(p => p.id === activePeriod)?.range}</span>
    </div>
  );
}

/* ================================================================== */
/*  TAB: OVERVIEW                                                      */
/* ================================================================== */
function OverviewTab({ d }: { d: AnalyticsData["overview"] | null }) {
  const k = d?.kpis;
  const kpis = [
    { label: "Pipeline value", value: k ? fmtK(k.pipelineValueGbp) : "—", delta: `${k?.activeDeals ?? 0} active deals`, valueColor: T.teal200 },
    { label: "Deals collected", value: k ? String(k.dealsCollected) : "—", delta: "This period" },
    { label: "Vehicles live", value: k ? String(k.vehiclesLive) : "—", delta: "In inventory" },
    { label: "Leads contacted", value: k ? String(k.leadsContacted) : "—", delta: "Reached at least once" },
    { label: "Est. commission", value: k ? `£${k.estCommissionGbp.toLocaleString()}` : "—", delta: "Projected · open deals", valueColor: T.green },
  ];
  const maxStage = Math.max(1, ...(d?.dealsByStage ?? []).map(s => s.count));
  const maxAge = Math.max(1, ...(d?.inventoryAge ?? []).map(b => b.count));
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">{kpis.map(c => <KpiCard key={c.label} {...c} />)}</div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <PanelCard title="Deals collected">
          {(d?.dealsCollectedSeries?.length ?? 0) === 0 ? <EmptyChart msg="No deals in this period" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={d!.dealsCollectedSeries} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip content={<ChartTooltip suffix=" deals" />} cursor={{ fill: "#111D3055" }} />
                <Bar dataKey="count" name="Collected" fill={T.teal} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </PanelCard>
        <PanelCard title="Acquisition funnel">
          <div className="flex flex-col gap-[6px]">
            {(d?.funnel ?? []).map((row, i) => <HBar key={row.label} label={row.label} value={row.value} fillPct={row.pct} fillColor={BAR_PALETTE[i % BAR_PALETTE.length]} rateLbl={`${row.pct}%`} rateColor={T.teal200} />)}
          </div>
        </PanelCard>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <PanelCard title="Deals by stage">
          <div className="flex flex-col gap-[6px]">
            {(d?.dealsByStage ?? []).map(s => <HBar key={s.label} label={s.label} value={s.count} fillPct={(s.count / maxStage) * 100} fillColor={T.teal} labelWidth={110} />)}
          </div>
        </PanelCard>
        <PanelCard title="Inventory health — age buckets">
          <div className="flex flex-col gap-[6px]">
            {(d?.inventoryAge ?? []).map((b, i) => <HBar key={b.label} label={b.label} value={b.count} fillPct={(b.count / maxAge) * 100} fillColor={i >= 3 ? T.amber : T.teal200} labelWidth={90} />)}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: ACQUISITION                                                   */
/* ================================================================== */
function AcquisitionTab({ d }: { d: AnalyticsData["acquisition"] | null }) {
  const k = d?.kpis;
  const kpis = [
    { label: "Total leads", value: k ? String(k.totalLeads) : "—", delta: "In the system" },
    { label: "Scored", value: k ? String(k.scored) : "—", delta: "AI-scored" },
    { label: "Outreach sent", value: k ? String(k.outreachSent) : "—", delta: "This period" },
    { label: "Response rate", value: k ? `${k.responseRatePct}%` : "—", delta: "Of outreach", valueColor: T.teal200 },
    { label: "Signed", value: k ? String(k.signed) : "—", delta: "Converted to deals", valueColor: T.green },
  ];
  const maxSource = Math.max(1, ...(d?.leadSources ?? []).map(s => s.value));
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">{kpis.map(c => <KpiCard key={c.label} {...c} />)}</div>
      <div className="grid grid-cols-2 gap-3">
        <PanelCard title="Outreach vs responses">
          {(d?.outreachSeries?.reduce((s, x) => s + x.outreach, 0) ?? 0) === 0 ? <EmptyChart msg="No outreach in this period" /> : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={d!.outreachSeries} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="outreach" name="Outreach" stroke={T.teal200} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="responded" name="Responded" stroke="#FCD34D" dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1.5 font-body text-[11px]" style={{ color: T.textMuted }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: T.teal200 }} /> Outreach</span>
                <span className="flex items-center gap-1.5 font-body text-[11px]" style={{ color: T.textMuted }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#FCD34D" }} /> Responded</span>
              </div>
            </>
          )}
        </PanelCard>
        <PanelCard title="Lead source breakdown">
          <div className="flex flex-col gap-[6px]">
            {(d?.leadSources ?? []).map((s, i) => <HBar key={s.label} label={s.label} value={s.value} fillPct={(s.value / maxSource) * 100} fillColor={BAR_PALETTE[i % BAR_PALETTE.length]} labelWidth={120} />)}
          </div>
        </PanelCard>
      </div>
      <PanelCard title="Top acquisition models">
        {(d?.topModels?.length ?? 0) === 0 && <div className="font-body text-[12px] py-3" style={{ color: T.textMuted }}>No leads yet.</div>}
        {(d?.topModels ?? []).map((m, i) => (
          <div key={m.name} className="flex items-center gap-2 py-[7px]" style={{ borderBottom: i < (d!.topModels.length - 1) ? `1px solid ${T.border2}` : "none" }}>
            <div className="flex-1">
              <div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{m.name}</div>
              <div className="font-body text-[11px]" style={{ color: T.textMuted }}>Score {m.avgScore} avg · {m.count} lead{m.count === 1 ? "" : "s"}</div>
            </div>
          </div>
        ))}
      </PanelCard>
    </div>
  );
}

/* ================================================================== */
/*  TAB: INVENTORY                                                     */
/* ================================================================== */
function InventoryTab({ d }: { d: AnalyticsData["inventory"] | null }) {
  const k = d?.kpis;
  const fresh = d?.ageBuckets?.[0]?.count ?? 0;
  const kpis = [
    { label: "Vehicles live", value: k ? String(k.vehiclesLive) : "—", delta: "In inventory" },
    { label: "Avg days on lot", value: k ? `${k.avgDaysOnLot}d` : "—", delta: "Across live stock" },
    { label: "Aging >45d", value: k ? String(k.aging45) : "—", delta: "Need action", valueColor: (k?.aging45 ?? 0) > 0 ? T.amber : T.textPrimary, deltaType: (k?.aging45 ?? 0) > 0 ? "warn" : "neutral" },
    { label: "Fresh <14d", value: String(fresh), delta: "Recently listed", valueColor: T.green },
    { label: "Lots", value: k ? String(k.lots) : "—", delta: "Operating" },
  ];
  const maxAge = Math.max(1, ...(d?.ageBuckets ?? []).map(b => b.count));
  const maxStage = Math.max(1, ...(d?.vehiclesByStage ?? []).map(s => s.count));
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">{kpis.map(c => <KpiCard key={c.label} {...c} />)}</div>
      <div className="grid grid-cols-3 gap-3">
        <PanelCard title="Age buckets">
          <div className="flex flex-col gap-[6px]">
            {(d?.ageBuckets ?? []).map((b, i) => <HBar key={b.label} label={b.label} value={b.count} fillPct={(b.count / maxAge) * 100} fillColor={i >= 3 ? T.amber : T.teal200} labelWidth={90} />)}
          </div>
        </PanelCard>
        <PanelCard title="Vehicles by stage">
          <div className="flex flex-col gap-[6px]">
            {(d?.vehiclesByStage?.length ?? 0) === 0 && <div className="font-body text-[12px] py-3" style={{ color: T.textMuted }}>No live vehicles.</div>}
            {(d?.vehiclesByStage ?? []).map(s => <HBar key={s.label} label={s.label} value={s.count} fillPct={(s.count / maxStage) * 100} fillColor={T.teal} labelWidth={110} />)}
          </div>
        </PanelCard>
        <PanelCard title="Lot capacity">
          {(d?.lotCapacity?.length ?? 0) === 0 && <div className="font-body text-[12px] py-3" style={{ color: T.textMuted }}>No lots.</div>}
          {(d?.lotCapacity ?? []).map((lot, i) => (
            <div key={lot.name} className="flex items-center gap-2 py-[7px]" style={{ borderBottom: i < (d!.lotCapacity.length - 1) ? `1px solid ${T.border2}` : "none" }}>
              <div className="flex-1">
                <div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{lot.name}</div>
                <div className="font-body text-[11px]" style={{ color: T.textMuted }}>{lot.vehicles} vehicle{lot.vehicles === 1 ? "" : "s"}</div>
              </div>
              <span className="font-heading font-bold text-[13px]" style={{ color: lot.capacityPct >= 90 ? T.red : lot.capacityPct >= 70 ? T.amber : T.green }}>{lot.capacityPct}%</span>
            </div>
          ))}
        </PanelCard>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activePeriod, setActivePeriod] = useState<Period>("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const api = PERIODS.find(p => p.id === activePeriod)?.api ?? "7days";
    fetch(`/api/admin/analytics?period=${api}`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) console.error("[Analytics] fetch failed:", e); });
    return () => { cancelled = true; };
  }, [activePeriod]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AnalyticsTopbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto">
          <PeriodSelector activePeriod={activePeriod} onChange={setActivePeriod} />
          {activeTab === "overview" && <OverviewTab d={data?.overview ?? null} />}
          {activeTab === "acquisition" && <AcquisitionTab d={data?.acquisition ?? null} />}
          {activeTab === "inventory" && <InventoryTab d={data?.inventory ?? null} />}
        </div>
      </div>
    </div>
  );
}
