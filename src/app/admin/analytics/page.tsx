"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Label,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import * as D from "@/lib/admin/analytics-mock-data";
import type { AnalyticsPeriod } from "@/lib/admin/analytics-mock-data";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
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
  indigoBg:    "#172D4D",
};

const deltaColors: Record<string, string> = {
  up: T.green, down: T.red, warn: T.amber, neutral: T.textMuted,
};

/* ================================================================== */
/*  SHARED SUB-COMPONENTS                                              */
/* ================================================================== */

function formatValue(value: number | undefined, key: string): string {
  if (value === undefined) return "-";
  if (key?.toLowerCase().includes("revenue") || key?.toLowerCase().includes("fee") || key?.toLowerCase().includes("payout") || key?.toLowerCase().includes("gpu") || key?.toLowerCase().includes("gross")) {
    return "£" + value.toLocaleString();
  }
  if (key?.toLowerCase().includes("rate") || key?.toLowerCase().includes("pct")) return value.toFixed(1) + "%";
  return value.toLocaleString();
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[8px] px-3 py-2" style={{ background: T.bgRow, border: `1px solid ${T.border}` }}>
      <p className="text-[11px] mb-1" style={{ color: T.textMuted }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[12px] font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatValue(entry.value as number, entry.name || "")}
        </p>
      ))}
    </div>
  );
}

function KpiCard({ label, value, delta, deltaType, valueColor }: {
  label: string; value: string; delta: string; deltaType: string; valueColor?: string;
}) {
  return (
    <div className="rounded-[14px] px-[15px] py-[13px] transition-colors duration-200" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-[7px]" style={{ color: T.textDim }}>{label}</div>
      <div className="font-heading font-black text-[28px] leading-none tracking-tight" style={{ color: valueColor || T.textPrimary }}>{value}</div>
      <div className="font-body font-semibold text-[11px] mt-1" style={{ color: deltaColors[deltaType] || T.textMuted }}>{delta}</div>
    </div>
  );
}

function PanelCard({ title, rightBadge, children }: {
  title: string; rightBadge?: { text: string; color: string }; children: React.ReactNode;
}) {
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

function InsightBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] px-3 py-2.5 mb-2" style={{ background: T.bgRow }}>
      <div className="font-body font-bold text-[10px] uppercase tracking-widest mb-1" style={{ color: T.textDim }}>{label}</div>
      <div className="font-body text-[13px] leading-relaxed" style={{ color: T.textSecondary }}>{children}</div>
    </div>
  );
}

function HBar({ label, value, fillPct, fillColor, rateLbl, rateColor, labelWidth = 90 }: {
  label: string; value: number | string; fillPct: number; fillColor: string; rateLbl?: string; rateColor?: string; labelWidth?: number;
}) {
  return (
    <div className="flex items-center gap-2 py-[3px]">
      <span className="font-body text-[12px] text-right flex-shrink-0" style={{ color: T.textSecondary, width: labelWidth }}>{label}</span>
      <div className="flex-1 h-[24px] rounded-[6px] overflow-hidden" style={{ background: T.bgRow }}>
        {fillPct > 0 && <div className="h-full rounded-[6px]" style={{ width: `${fillPct}%`, background: fillColor }} />}
      </div>
      <span className="font-heading font-bold text-[12px] min-w-[32px] text-right" style={{ color: T.textPrimary }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      {rateLbl && <span className="font-body text-[11px] min-w-[36px]" style={{ color: rateColor || T.textMuted }}>{rateLbl}</span>}
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between py-[5px]" style={{ borderBottom: `1px solid ${T.border2}` }}>
      <span className="font-body text-[12px]" style={{ color: T.textMuted }}>{label}</span>
      <span className="font-body font-bold text-[12px]" style={{ color }}>{value}</span>
    </div>
  );
}

const chartMargin = { top: 8, right: 8, bottom: 0, left: 0 };
const gridStroke = "#1A2640";
const tickStyle = { fill: "#4A556B", fontSize: 11 };

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
const analyticsTabs = [
  { id: "overview", label: "Overview" }, { id: "acquisition", label: "Acquisition" },
  { id: "inventory", label: "Inventory" }, { id: "revenue", label: "Revenue" },
  { id: "buyers", label: "Buyers" }, { id: "payouts", label: "Payouts" },
];

function AnalyticsTopbar({ activeTab, setActiveTab, activePeriod }: {
  activeTab: string; setActiveTab: (t: string) => void; activePeriod: AnalyticsPeriod;
}) {
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
          {analyticsTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="rounded-[8px] px-[13px] py-[6px] font-body font-semibold text-[13px] transition-colors duration-150"
              style={{ background: activeTab === tab.id ? T.bgCard : "transparent", color: activeTab === tab.id ? T.textPrimary : T.textMuted }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <button className="rounded-[8px] px-[14px] py-[6px] font-body font-semibold text-[12px]"
        style={{ background: T.bgRow, border: `1px solid ${T.border}`, color: T.textSecondary }}
        onClick={() => { /* TODO: generate and download CSV */ console.log("export", activeTab, activePeriod); }}>
        Export CSV
      </button>
    </div>
  );
}

/* ================================================================== */
/*  PERIOD SELECTOR                                                    */
/* ================================================================== */
const periods: { id: AnalyticsPeriod; label: string }[] = [
  { id: "7d", label: "7 days" }, { id: "30d", label: "30 days" },
  { id: "mtd", label: "MTD" }, { id: "90d", label: "90 days" }, { id: "ytd", label: "YTD" },
];

function PeriodSelector({ activePeriod, onChange }: { activePeriod: AnalyticsPeriod; onChange: (p: AnalyticsPeriod) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-body font-semibold text-[12px] mr-1" style={{ color: T.textMuted }}>Period:</span>
      {periods.map(p => (
        <button key={p.id} onClick={() => onChange(p.id)}
          className="rounded-[8px] px-[12px] py-[5px] font-body font-semibold text-[12px] transition-colors"
          style={{
            background: activePeriod === p.id ? "#0A1A2E" : T.bgRow,
            border: `1px solid ${activePeriod === p.id ? T.indigoBg : T.border}`,
            color: activePeriod === p.id ? T.teal200 : T.textMuted,
          }}>
          {p.label}
        </button>
      ))}
      <span className="font-body text-[11px] ml-2" style={{ color: T.textDim }}>{D.periodLabels[activePeriod]}</span>
    </div>
  );
}

/* ================================================================== */
/*  TAB: OVERVIEW                                                      */
/* ================================================================== */
function OverviewTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">
        {D.overviewKpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <PanelCard title="Revenue — 7 days" rightBadge={{ text: "↑ 12% vs prior period", color: T.green }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={D.revenueChartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="gross" name="Gross revenue" fill={T.indigoBg} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="fee" name="Platform fee" fill={T.teal200} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 font-body text-[11px]" style={{ color: T.textMuted }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: T.indigoBg }} /> Gross revenue</span>
            <span className="flex items-center gap-1.5 font-body text-[11px]" style={{ color: T.textMuted }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: T.teal200 }} /> Platform fee</span>
          </div>
        </PanelCard>
        <PanelCard title="Acquisition funnel">
          <div className="flex flex-col gap-[6px]">
            {D.acquisitionFunnel.map(row => <HBar key={row.label} label={row.label} value={row.value} fillPct={row.pct} fillColor={row.fill} rateLbl={row.rateLbl} rateColor={row.rateColor} />)}
          </div>
        </PanelCard>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <PanelCard title="Deals by stage">
          <div className="flex flex-col gap-[6px]">
            {D.dealsByStage.map(s => <HBar key={s.label} label={s.label} value={s.value} fillPct={s.value / 10 * 100} fillColor={s.fill} labelWidth={110} />)}
          </div>
        </PanelCard>
        <PanelCard title="Inventory health — age buckets">
          <div className="flex flex-col gap-[6px]">
            {D.inventoryHealth.map(b => <HBar key={b.label} label={b.label} value={b.value} fillPct={b.value / 58 * 100} fillColor={b.fill} labelWidth={80} />)}
          </div>
        </PanelCard>
        <PanelCard title="AI agent activity — 7d">
          <div className="flex flex-col gap-[6px]">
            {D.agentActivity.map(a => <HBar key={a.label} label={a.label} value={a.value} fillPct={a.value / 1840 * 100} fillColor={a.fill} labelWidth={120} />)}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: ACQUISITION                                                   */
/* ================================================================== */
function AcquisitionTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">
        {D.acquisitionKpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <PanelCard title="Daily outreach vs responses">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={D.acquisitionChartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="outreach" name="Outreach" stroke={T.teal200} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="responded" name="Responded" stroke="#FCD34D" dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 font-body text-[11px]" style={{ color: T.textMuted }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: T.teal200 }} /> Outreach</span>
            <span className="flex items-center gap-1.5 font-body text-[11px]" style={{ color: T.textMuted }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#FCD34D" }} /> Responded</span>
          </div>
        </PanelCard>
        <PanelCard title="Lead source breakdown">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {D.leadSourceData.boxes.map(b => (
              <div key={b.label} className="rounded-[8px] px-3 py-2.5" style={{ background: T.bgRow }}>
                <div className="font-body font-bold text-[10px] uppercase tracking-widest" style={{ color: T.textDim }}>{b.label}</div>
                <div className="font-body text-[13px]" style={{ color: T.textSecondary }}>{b.value}</div>
              </div>
            ))}
          </div>
          {D.leadSourceData.stats.map(s => <StatRow key={s.label} {...s} />)}
        </PanelCard>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <PanelCard title="Top acquisition models">
          {D.topModels.map((m, i) => (
            <div key={m.name} className="flex items-center gap-2 py-[7px]" style={{ borderBottom: i < D.topModels.length - 1 ? `1px solid ${T.border2}` : "none" }}>
              <div className="flex-1"><div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{m.name}</div><div className="font-body text-[11px]" style={{ color: T.textMuted }}>Score {m.avgScore} avg · {m.signed} signed</div></div>
              <span className="font-body font-bold text-[11px]" style={{ color: T.green }}>↑</span>
            </div>
          ))}
        </PanelCard>
        <PanelCard title="Message template performance">
          <div className="flex flex-col gap-[6px]">
            {D.templatePerformance.map(t => <HBar key={t.name} label={t.name} value={`${t.rate}%`} fillPct={t.fillPct} fillColor={t.color} labelWidth={140} />)}
          </div>
        </PanelCard>
        <PanelCard title="Negotiation agent outcomes">
          <div className="flex flex-col gap-[6px]">
            {D.negotiationOutcomes.map(o => <HBar key={o.label} label={o.label} value={o.value} fillPct={o.noBar ? 0 : o.pct} fillColor={o.fill} labelWidth={130} />)}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: INVENTORY                                                     */
/* ================================================================== */
function InventoryTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">{D.inventoryKpis.map(k => <KpiCard key={k.label} {...k} />)}</div>
      <div className="grid grid-cols-2 gap-3">
        <PanelCard title="Avg days on lot — daily trend" rightBadge={{ text: "↓ trend = good", color: T.green }}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={D.avgDaysChartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={[20, 28]} tick={tickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => `${v}d`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="avgDays" name="Avg days" stroke={T.green} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </PanelCard>
        <PanelCard title="Recon stage breakdown">
          <div className="flex flex-col gap-[6px]">
            {D.reconStages.map(s => (
              <div key={s.label} className="flex items-center gap-2 py-[3px]">
                <span className="font-body text-[12px] text-right flex-shrink-0" style={{ color: T.textSecondary, width: 100 }}>{s.label}</span>
                <div className="flex-1 h-[24px] rounded-[6px] overflow-hidden" style={{ background: T.bgRow }}><div className="h-full rounded-[6px]" style={{ width: `${s.pct}%`, background: s.fill }} /></div>
                <span className="font-heading font-bold text-[12px] min-w-[24px] text-right" style={{ color: T.textPrimary }}>{s.value}</span>
                {s.overdue && <span className="rounded-pill px-1.5 py-0.5 font-body font-bold text-[9px]" style={{ background: T.redBg, color: T.red }}>overdue</span>}
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <PanelCard title="Lot capacity">
          {D.lotCapacity.map((lot, i) => (
            <div key={lot.name} className="flex items-center gap-2 py-[7px]" style={{ borderBottom: i < D.lotCapacity.length - 1 ? `1px solid ${T.border2}` : "none" }}>
              <div className="flex-1"><div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{lot.name}</div><div className="font-body text-[11px]" style={{ color: T.textMuted }}>{lot.vehicles} vehicles</div></div>
              <span className="font-heading font-bold text-[13px]" style={{ color: lot.color }}>{lot.capacity}%</span>
              {lot.warning && <span className="rounded-pill px-1.5 py-0.5 font-body font-bold text-[9px]" style={{ background: T.redBg, color: T.red }}>{lot.warning}</span>}
            </div>
          ))}
        </PanelCard>
        <PanelCard title="Recon cost distribution">
          <div className="flex flex-col gap-[6px]">{D.reconCosts.map(c => <HBar key={c.label} label={c.label} value={c.value} fillPct={c.pct} fillColor={c.fill} labelWidth={110} />)}</div>
        </PanelCard>
        <PanelCard title="AI pricing actions">
          {D.aiPricingActions.map((a, i) => (
            <div key={a.label} className="flex justify-between py-[5px]" style={{ borderBottom: i < D.aiPricingActions.length - 1 ? `1px solid ${T.border2}` : "none" }}>
              <span className="font-body text-[12px]" style={{ color: T.textMuted }}>{a.label}</span>
              <span className="flex items-center gap-1.5"><span className="font-body font-bold text-[12px]" style={{ color: a.color }}>{a.value}</span>
                {a.badge && <span className="rounded-pill px-1.5 py-0.5 font-body font-bold text-[9px]" style={{ background: T.redBg, color: T.red }}>!</span>}</span>
            </div>
          ))}
        </PanelCard>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: REVENUE                                                       */
/* ================================================================== */
function RevenueTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">{D.revenueKpis.map(k => <KpiCard key={k.label} {...k} />)}</div>
      <div className="grid grid-cols-2 gap-3">
        <PanelCard title="Daily platform fee revenue" rightBadge={{ text: "↑ 12% vs prior period", color: T.green }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={D.revenueFeeChartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => `£${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="fee" name="Platform fee" fill={T.teal200} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>
        <PanelCard title="Revenue breakdown">
          <div className="flex items-center justify-center" style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={D.revenueBreakdown} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" dataKey="value" stroke="none">
                  {D.revenueBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  <Label value="£13,414" position="center" style={{ fill: T.textPrimary, fontSize: 14, fontWeight: 900, fontFamily: "var(--font-heading)" }} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center mt-1">
            {D.revenueBreakdown.map(r => (
              <span key={r.name} className="flex items-center gap-1.5 font-body text-[11px]" style={{ color: T.textMuted }}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: r.fill }} /> {r.name} £{r.value.toLocaleString()}
              </span>
            ))}
          </div>
        </PanelCard>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <PanelCard title="GPU by lot">
          {D.gpuByLot.map((lot, i) => (
            <div key={lot.name} className="flex items-center gap-2 py-[7px] cursor-pointer" style={{ borderBottom: i < D.gpuByLot.length - 1 ? `1px solid ${T.border2}` : "none" }}>
              <div className="flex-1"><div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{lot.name}</div><div className="font-body text-[11px]" style={{ color: T.textMuted }}>{lot.deals} deals</div></div>
              <span className="font-heading font-bold text-[14px]" style={{ color: lot.color }}>£{lot.gpu.toLocaleString()}</span>
            </div>
          ))}
        </PanelCard>
        <PanelCard title="Margin by vehicle segment">
          <div className="flex flex-col gap-[6px]">{D.marginBySegment.map(s => <HBar key={s.label} label={s.label} value={`£${s.gpu.toLocaleString()}`} fillPct={s.pct} fillColor={s.color} labelWidth={100} />)}</div>
        </PanelCard>
        <PanelCard title="30-day revenue forecast">
          <InsightBox label="AI forecast">{D.revenueForecast.aiText}</InsightBox>
          {D.revenueForecast.scenarios.map(s => <StatRow key={s.label} label={s.label} value={s.value} color={s.color} />)}
          <StatRow label={D.revenueForecast.payoutCashFlow.label} value={D.revenueForecast.payoutCashFlow.value} color={D.revenueForecast.payoutCashFlow.color} />
        </PanelCard>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: BUYERS                                                        */
/* ================================================================== */
function BuyersTab() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">{D.buyersKpis.map(k => <KpiCard key={k.label} {...k} />)}</div>
      <div className="grid grid-cols-2 gap-3">
        <PanelCard title="Daily storefront visits" rightBadge={{ text: "↑ 9% vs prior 7d", color: T.green }}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={D.storefrontChartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="visits" name="Visits" stroke={T.teal200} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </PanelCard>
        <PanelCard title="Checkout funnel drop-off">
          <div className="flex flex-col gap-[6px]">{D.checkoutFunnel.map(s => <HBar key={s.label} label={s.label} value={s.value} fillPct={s.pct} fillColor={s.fill} rateLbl={s.rateLbl} rateColor={s.rateColor} labelWidth={110} />)}</div>
        </PanelCard>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <PanelCard title="Top VDPs this week">
          {D.topVdps.map((v, i) => (
            <div key={v.id} className="flex items-center gap-2 py-[7px] cursor-pointer" style={{ borderBottom: i < D.topVdps.length - 1 ? `1px solid ${T.border2}` : "none" }} onClick={() => router.push(`/admin/crm/leads/${v.id}`)}>
              <div className="flex-1"><div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{v.name}</div><div className="font-body text-[11px]" style={{ color: T.textMuted }}>{v.views} views · {v.reservations} reservations</div></div>
              <span className="font-heading font-bold text-[13px]" style={{ color: v.color }}>{v.views}</span>
            </div>
          ))}
        </PanelCard>
        <PanelCard title="Finance vs cash split">
          <InsightBox label="This week (9 deals)">{D.financeSplit.summary}</InsightBox>
          {D.financeSplit.stats.map(s => <StatRow key={s.label} {...s} />)}
        </PanelCard>
        <PanelCard title="Buyer behaviour signals">
          {D.buyerBehaviourSignals.map((s, i) => (
            <div key={s.label} className="flex justify-between py-[5px]" style={{ borderBottom: i < D.buyerBehaviourSignals.length - 1 ? `1px solid ${T.border2}` : "none" }}>
              <span className="font-body text-[12px]" style={{ color: T.textMuted }}>{s.label}</span>
              <span className="flex items-center gap-1.5"><span className="font-body font-bold text-[12px]" style={{ color: s.color }}>{s.value}</span>
                {s.warning && <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.amber }} />}</span>
            </div>
          ))}
        </PanelCard>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: PAYOUTS                                                       */
/* ================================================================== */
function PayoutsTab() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">{D.payoutsKpis.map(k => <KpiCard key={k.label} {...k} />)}</div>
      <div className="grid grid-cols-2 gap-3">
        <PanelCard title="Payout value — daily">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={D.payoutChartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="payout" name="Payout" fill={T.teal200} radius={[4, 4, 0, 0]} isAnimationActive={false} minPointSize={3} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>
        <PanelCard title="Escrow condition tracking">
          <InsightBox label="Live deals in escrow">9 deals · £82.3k total · Avg 4.1 days since close</InsightBox>
          <div className="flex flex-col gap-[8px]">
            {D.escrowConditions.map(c => (
              <div key={c.label}>
                <div className="flex justify-between mb-[3px]"><span className="font-body font-semibold text-[11px]" style={{ color: T.textMuted }}>{c.label}</span><span className="font-body font-bold text-[11px]" style={{ color: T.green }}>{c.done} of {c.total}</span></div>
                <div className="h-[4px] rounded-full overflow-hidden" style={{ background: T.bgRow }}><div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: T.green }} /></div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <PanelCard title="Recent payouts">
          {D.recentPayouts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 py-[7px] cursor-pointer transition-colors" style={{ borderBottom: i < D.recentPayouts.length - 1 ? `1px solid ${T.border2}` : "none" }}
              onClick={() => router.push(`/admin/crm/leads/${p.id}`)} onMouseEnter={e => (e.currentTarget.style.background = T.bgHover)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="flex-1"><div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>{p.seller}</div><div className="font-body text-[11px]" style={{ color: T.textMuted }}>{p.vehicle} · {p.date}</div></div>
              <span className="font-heading font-bold text-[13px]" style={{ color: T.green }}>{p.amount}</span>
            </div>
          ))}
        </PanelCard>
        <PanelCard title="Payment method split">
          <div className="flex flex-col gap-[6px] mb-3">{D.paymentMethods.map(m => <HBar key={m.label} label={m.label} value={m.value} fillPct={m.pct} fillColor={m.fill} labelWidth={110} />)}</div>
          {D.paymentStats.map(s => <StatRow key={s.label} {...s} />)}
        </PanelCard>
        <PanelCard title="Lien payoff status">
          <InsightBox label="7-day summary">{D.lienPayoffData.summary}</InsightBox>
          {/* TODO: UK equivalent — "Sellers approaching £5,000 threshold for self-assessment reporting guidance" */}
          {D.lienPayoffData.stats.map(s => <StatRow key={s.label} {...s} />)}
        </PanelCard>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE ASSEMBLY                                                      */
/* ================================================================== */
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activePeriod, setActivePeriod] = useState<AnalyticsPeriod>("7d");

  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AnalyticsTopbar activeTab={activeTab} setActiveTab={setActiveTab} activePeriod={activePeriod} />
        <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto">
          <PeriodSelector activePeriod={activePeriod} onChange={setActivePeriod} />
          {/* TODO: Swap mock data source by period in real build */}
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "acquisition" && <AcquisitionTab />}
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "revenue" && <RevenueTab />}
          {activeTab === "buyers" && <BuyersTab />}
          {activeTab === "payouts" && <PayoutsTab />}
        </div>
      </div>
    </div>
  );
}
