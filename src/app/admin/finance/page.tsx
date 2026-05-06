"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line,
  ReferenceLine,
} from "recharts";
import {
  FINANCE_KPIS_MTD, REVENUE_DAILY, WATERFALL_DATA,
  GPU_BY_LOT, COST_SECTORS, PIPELINE_STAGES,
  FORECAST_DATA, FORECAST_BAR_OPACITY,
  getDealVelocityData, formatGBP, periodLabel, tooltipStyle,
} from "@/lib/admin/finance-mock-data";
import type { PeriodType } from "@/lib/admin/finance-mock-data";

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
function Topbar({ period, setPeriod }: { period: PeriodType; setPeriod: (p: PeriodType) => void }) {
  const router = useRouter();
  const periods: { label: string; value: PeriodType }[] = [
    { label: "MTD", value: "mtd" },
    { label: "QTD", value: "qtd" },
    { label: "Last 30d", value: "last30" },
  ];
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }} onClick={() => router.push("/admin")}>Admin</span>
          <span style={{ color: T.textDim, fontSize: 13 }}>/</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Finance</span>
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
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("export P&L", period)}>Export P&L</button>
        <button className="px-3 py-[6px] rounded-[8px] hover:opacity-80" style={{ background: T.bgRow, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary }} onClick={() => console.log("export VAT summary")}>VAT summary</button>
        <button className="px-[14px] py-[6px] rounded-[8px] hover:opacity-80" style={{ background: "#0A2A26", color: T.teal200, border: "1px solid #1E3A34", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }} onClick={() => document.getElementById("forecast-panel")?.scrollIntoView({ behavior: "smooth" })}>30/60/90 forecast</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP                                                          */
/* ================================================================== */
function KpiStrip({ period }: { period: PeriodType }) {
  const K = FINANCE_KPIS_MTD;
  const pLabel = period === "mtd" ? "MTD" : period === "qtd" ? "QTD" : "30d";
  const cards = [
    { label: "REVENUE", value: `£${(K.revenueMtd / 1000).toFixed(1)}k`, sub: pLabel, valueColor: T.teal200, borderColor: T.teal, delta: `↑ ${K.revenueDeltaPct}% vs last month`, deltaColor: T.green },
    { label: "GROSS PROFIT", value: `£${(K.grossProfitMtd / 1000).toFixed(1)}k`, sub: pLabel, valueColor: T.green, borderColor: T.green, delta: `${K.grossMarginPct}% margin`, deltaColor: T.green },
    { label: "PLATFORM FEES", value: `£${(K.platformFees / 1000).toFixed(1)}k`, sub: pLabel, valueColor: T.teal200, borderColor: T.teal, delta: `No commission fee`, deltaColor: T.textMuted },
    { label: "TOTAL COSTS", value: `£${(K.totalCosts / 1000).toFixed(1)}k`, sub: pLabel, valueColor: T.amber, borderColor: T.amber, delta: `${K.costPct}% of revenue`, deltaColor: T.amber },
    { label: "AVG GPU", value: `£${K.avgGpu.toLocaleString()}`, sub: "", valueColor: T.green, borderColor: T.green, delta: `↑ £${K.gpuDelta} vs last month`, deltaColor: T.green },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {cards.map((c, i) => (
        <div key={i} className="px-[14px] py-[11px] rounded-[10px] transition-colors duration-200" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderTop: `2px solid ${c.borderColor}` }} onMouseEnter={e => (e.currentTarget.style.borderColor = T.indigoBorder)} onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.borderTopColor = c.borderColor; }}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
          <div className="flex items-baseline gap-1">
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22, lineHeight: 1, letterSpacing: "-0.02em", color: c.valueColor }}>{c.value}</span>
            {c.sub && <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim }}>{c.sub}</span>}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: c.deltaColor, marginTop: 3 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  REVENUE CHART                                                      */
/* ================================================================== */
function RevenueChart({ period }: { period: PeriodType }) {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>Revenue over time — {periodLabel(period)} (daily)</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>29 days · £412.8k total</span>
      </div>
      <div style={{ padding: "8px 14px 4px" }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={REVENUE_DAILY}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,38,64,0.8)" />
            <XAxis dataKey="day" tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} tickFormatter={(v: any, i: any) => i % 7 === 0 ? String(v) : ""} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} tickFormatter={(v: any) => `£${v}k`} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => [`£${v}k`, "Revenue"]} labelFormatter={(l: any) => `Day ${l}`} />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {REVENUE_DAILY.map((entry, idx) => (
                <Cell key={idx} fill={entry.value > 25 ? "#008C7C" : entry.value > 18 ? "#1D5A4D" : "#172D4D"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  WATERFALL CHART                                                    */
/* ================================================================== */
function WaterfallChart({ period }: { period: PeriodType }) {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>Gross profit waterfall — {periodLabel(period)}</span>
      </div>
      <div style={{ padding: "8px 14px 4px" }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={WATERFALL_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,38,64,0.8)" />
            <XAxis dataKey="name" tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} tickFormatter={(v: any) => `£${v}k`} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={(v: any, name: any) => name === "offset" ? null : [`£${v}k`, ""]} />
            <Bar dataKey="offset" stackId="a" fill="transparent" />
            <Bar dataKey="value" stackId="a" radius={[3, 3, 0, 0]}>
              {WATERFALL_DATA.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  GPU BY LOT CHART                                                   */
/* ================================================================== */
function GpuByLotChart({ period }: { period: PeriodType }) {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>GPU by lot — {periodLabel(period)}</span>
        <span className="ml-auto rounded-full px-[7px] py-[2px]" style={{ background: T.greenBg, color: T.green, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>Lot 3 leading</span>
      </div>
      <div style={{ padding: "8px 14px 4px" }}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={GPU_BY_LOT}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,38,64,0.8)" />
            <XAxis dataKey="lot" tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
            <YAxis domain={[1400, "auto"]} tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} tickFormatter={(v: any) => `£${v.toLocaleString()}`} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => [`£${v.toLocaleString()}`, "GPU"]} />
            <ReferenceLine y={1847} strokeDasharray="3 3" stroke={T.textDim} label={{ value: "avg", position: "right", fill: T.textDim, fontSize: 9 }} />
            <Bar dataKey="gpu" radius={[4, 4, 0, 0]}>
              {GPU_BY_LOT.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Summary grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "0 14px 10px" }}>
        {GPU_BY_LOT.map(lot => (
          <div key={lot.lot} className="rounded-[7px]" style={{ background: T.bgRow, padding: "8px 10px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>{lot.lot}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em", color: lot.lot === "Lot 3 Bristol" || lot.lot === "Portfolio avg" ? T.teal200 : T.green, marginTop: 2 }}>£{lot.gpu.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COST BREAKDOWN CHART                                               */
/* ================================================================== */
function CostBreakdownChart({ period }: { period: PeriodType }) {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>Cost breakdown — {periodLabel(period)}</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>£328.2k total</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 0 }}>
        <div style={{ padding: "8px 4px 4px 14px" }}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={COST_SECTORS} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="62%" outerRadius="90%" paddingAngle={2} stroke="none">
                {COST_SECTORS.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: any, name: any) => [`£${v}k`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Custom legend */}
        <div className="flex flex-col justify-center gap-[8px]" style={{ padding: "14px 14px 14px 4px" }}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Breakdown</div>
          {COST_SECTORS.map(sector => (
            <div key={sector.name} className="flex items-center gap-[5px]">
              <div className="rounded-[2px] flex-shrink-0" style={{ width: 9, height: 9, background: sector.fill }} />
              <span className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{sector.name}</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: T.textPrimary }}>£{sector.value}k</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  REVENUE PIPELINE PANEL                                             */
/* ================================================================== */
function RevenuePipelinePanel() {
  const router = useRouter();
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>Revenue pipeline — deals in progress</span>
        <span className="ml-auto rounded-full px-[9px] py-[2px]" style={{ background: "#0A1D1A", color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10 }}>36 live deals · £682k projected</span>
      </div>
      <div className="px-[14px]">
        {PIPELINE_STAGES.map((stage, idx) => {
          const badgeBg = stage.isRisk ? T.redBg : stage.dotColor === T.green ? T.greenBg : stage.dotColor === T.amber ? T.amberBg : "#0A1D1A";
          return (
            <div key={stage.id} className="flex items-center gap-[8px] py-[7px] cursor-pointer" style={{ borderBottom: idx < PIPELINE_STAGES.length - 1 ? `1px solid ${T.border}` : "none" }}
              onClick={() => router.push(`/admin/deals?stage=${stage.id}`)}
              onMouseEnter={e => (e.currentTarget.style.background = T.bgHover)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: stage.dotColor }} />
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{stage.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{stage.sub}</div>
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: stage.valueColor, flexShrink: 0 }}>{formatGBP(stage.value)}</span>
              <span className="flex-shrink-0 rounded-[3px] px-[6px] py-[2px]" style={{ background: badgeBg, color: stage.valueColor, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>{stage.badgeLabel}</span>
            </div>
          );
        })}
      </div>
      {/* Footer stats */}
      <div className="flex gap-[16px] px-[14px] py-[8px]" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Projected MTD close: <span style={{ fontWeight: 700, color: T.green }}>£184k more</span></span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Avg deal size: <span style={{ fontWeight: 700, color: T.textPrimary }}>£18,944</span></span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DEAL VELOCITY CHART                                                */
/* ================================================================== */
function DealVelocityChart() {
  const data = getDealVelocityData();
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>Deal velocity — cumulative closed deals</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>March vs February</span>
      </div>
      <div style={{ padding: "8px 14px 4px" }}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,38,64,0.8)" />
            <XAxis dataKey="day" tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} tickFormatter={(v: any, i: any) => i % 7 === 0 ? String(v) : ""} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} labelFormatter={(l: any) => `Day ${l}`} />
            <Line type="monotone" dataKey="current" stroke={T.teal200} strokeWidth={2} dot={false} name="March" connectNulls={false} />
            <Line type="monotone" dataKey="prior" stroke="#172D4D" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="February" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-[16px]" style={{ padding: "4px 14px 10px" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>March pace: <span style={{ fontWeight: 700, color: T.teal200 }}>46 deals on track</span></span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Feb closed: <span style={{ fontWeight: 700, color: T.textMuted }}>39 deals</span></span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  FORECAST PANEL                                                     */
/* ================================================================== */
function ForecastPanel() {
  const boxes = [
    { period: "30 DAYS", value: "£490k", delta: "↑ 19% vs prior", sub: "46 deals est." },
    { period: "60 DAYS", value: "£940k", delta: "↑ 14% vs prior", sub: "88 deals est." },
    { period: "90 DAYS", value: "£1.41m", delta: "↑ 11% vs prior", sub: "132 deals est." },
  ];
  return (
    <div id="forecast-panel" className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>30 / 60 / 90-day forecast</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted }}>Based on current pipeline velocity and seasonal adjustment</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 0 }}>
        <div style={{ padding: "8px 14px 10px" }}>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={FORECAST_DATA} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,38,64,0.8)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textDim, fontSize: 9, fontFamily: "Inter" }} tickFormatter={(v: any) => `£${v}k`} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: any, name: any) => [`£${v}k`, name === "forecast" ? "Forecast" : "Prior year"]} />
              <Bar dataKey="priorYear" name="priorYear" radius={[3, 3, 0, 0]}>
                {FORECAST_DATA.map((_, idx) => (
                  <Cell key={idx} fill="#172D4D" fillOpacity={0.8} />
                ))}
              </Bar>
              <Bar dataKey="forecast" name="forecast" radius={[3, 3, 0, 0]}>
                {FORECAST_DATA.map((_, idx) => (
                  <Cell key={idx} fill="#4DD9C7" fillOpacity={FORECAST_BAR_OPACITY[idx]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 3 summary boxes */}
        <div style={{ borderLeft: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {boxes.map((box, idx) => (
            <div key={box.period} style={{ padding: 14, borderRight: idx < 2 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{box.period}</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 18, color: T.teal200 }}>{box.value}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.green, marginTop: 3 }}>{box.delta}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 2 }}>{box.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function FinancePage() {
  const [period, setPeriod] = useState<PeriodType>("mtd");

  return (
    <div className="flex min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar period={period} setPeriod={setPeriod} />
        <div className="flex-1 flex flex-col gap-[10px] overflow-x-hidden" style={{ padding: "14px 20px" }}>
          <KpiStrip period={period} />
          {/* Row 2: Revenue + Waterfall */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <RevenueChart period={period} />
            <WaterfallChart period={period} />
          </div>
          {/* Row 3: GPU + Cost */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <GpuByLotChart period={period} />
            <CostBreakdownChart period={period} />
          </div>
          {/* Row 4: Pipeline + Velocity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <RevenuePipelinePanel />
            <DealVelocityChart />
          </div>
          {/* Row 5: Forecast (full width) */}
          <ForecastPanel />
        </div>
      </div>
    </div>
  );
}
