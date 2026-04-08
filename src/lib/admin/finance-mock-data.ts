// lib/admin/finance-mock-data.ts — All static mock data for the Finance Dashboard

export type PeriodType = 'mtd' | 'qtd' | 'last30';

export interface FinanceKpis {
  revenueMtd: number;
  grossProfitMtd: number;
  grossMarginPct: number;
  platformFees: number;
  totalCosts: number;
  costPct: number;
  avgGpu: number;
  revenueDeltaPct: number;
  gpuDelta: number;
}

export interface DailyRevenue {
  day: number;
  value: number;
}

export interface WaterfallItem {
  name: string;
  value: number;
  offset: number;
  fill: string;
}

export interface GpuByLot {
  lot: string;
  gpu: number;
  fill: string;
}

export interface CostSector {
  name: string;
  value: number;
  pct: number;
  fill: string;
}

export interface PipelineStage {
  id: string;
  title: string;
  sub: string;
  deals: number;
  value: number;
  pct: number;
  dotColor: string;
  valueColor: string;
  badgeLabel: string;
  isRisk: boolean;
}

export interface ForecastMonth {
  month: string;
  forecast: number;
  priorYear: number;
}

/* ── Utilities ── */
export function formatGBP(n: number): string {
  if (n >= 1000000) return "£" + (n / 1000000).toFixed(2) + "m";
  if (n >= 1000) return "£" + (n / 1000).toFixed(1) + "k";
  return "£" + n.toLocaleString();
}

export function periodLabel(period: PeriodType): string {
  if (period === "mtd") return "March MTD";
  if (period === "qtd") return "Q1 2026";
  return "Last 30 days";
}

export const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#0A1020",
    border: "1px solid #1A2640",
    borderRadius: "8px",
    padding: "8px 12px",
  },
  labelStyle: { color: "#E2E8F4", fontSize: 12, fontWeight: 600 },
  itemStyle: { color: "#8492A8", fontSize: 11 },
};

/* ── KPI data (MTD) ── */
export const FINANCE_KPIS_MTD: FinanceKpis = {
  revenueMtd: 412800,
  grossProfitMtd: 84600,
  grossMarginPct: 20.5,
  platformFees: 0,
  totalCosts: 328200,
  costPct: 79.5,
  avgGpu: 1847,
  revenueDeltaPct: 18,
  gpuDelta: 142,
};

// TODO: Add FINANCE_KPIS_QTD and FINANCE_KPIS_LAST30 data sets when available
export const FINANCE_KPIS_QTD: FinanceKpis = FINANCE_KPIS_MTD;
export const FINANCE_KPIS_LAST30: FinanceKpis = FINANCE_KPIS_MTD;

/* ── Daily revenue (29 days, MTD) ── */
export const REVENUE_DAILY: DailyRevenue[] = [
  { day: 1, value: 10.2 }, { day: 2, value: 14.8 }, { day: 3, value: 12.1 }, { day: 4, value: 18.4 },
  { day: 5, value: 15.6 }, { day: 6, value: 9.8 },  { day: 7, value: 22.1 }, { day: 8, value: 19.4 },
  { day: 9, value: 16.8 }, { day: 10, value: 21.2 }, { day: 11, value: 18.9 }, { day: 12, value: 24.6 },
  { day: 13, value: 20.1 }, { day: 14, value: 17.8 }, { day: 15, value: 26.4 }, { day: 16, value: 23.8 },
  { day: 17, value: 19.2 }, { day: 18, value: 28.1 }, { day: 19, value: 25.4 }, { day: 20, value: 21.6 },
  { day: 21, value: 30.2 }, { day: 22, value: 27.8 }, { day: 23, value: 24.1 }, { day: 24, value: 32.4 },
  { day: 25, value: 29.6 }, { day: 26, value: 26.8 }, { day: 27, value: 34.1 }, { day: 28, value: 31.4 },
  { day: 29, value: 28.9 },
];

/* ── Waterfall ── */
export const WATERFALL_DATA: WaterfallItem[] = [
  { name: "Revenue",      value: 412.8, offset: 0,     fill: "#4DD9C7" },
  { name: "Vehicle cost", value: 261.4, offset: 151.4, fill: "#F87171" },
  { name: "Recon",        value: 32.8,  offset: 118.6, fill: "#FCD34D" },
  { name: "Holding",      value: 18.6,  offset: 100.0, fill: "#FCD34D" },
  { name: "Lot overhead", value: 15.4,  offset: 84.6,  fill: "#4A556B" },
  { name: "Gross profit", value: 84.6,  offset: 0,     fill: "#34D399" },
];

/* ── GPU by lot ── */
export const GPU_BY_LOT: GpuByLot[] = [
  { lot: "Lot 1 Birmingham", gpu: 1720, fill: "#172D4D" },
  { lot: "Lot 2 Manchester", gpu: 1840, fill: "#1D5A4D" },
  { lot: "Lot 3 Bristol",    gpu: 2020, fill: "#4DD9C7" },
  { lot: "Portfolio avg",    gpu: 1847, fill: "#1D5A4D" },
];

/* ── Cost sectors ── */
export const COST_SECTORS: CostSector[] = [
  { name: "Vehicle cost", value: 261.4, pct: 79.7, fill: "#4DD9C7" },
  { name: "Recon",        value: 32.8,  pct: 10.0, fill: "#FCD34D" },
  { name: "Holding",      value: 18.6,  pct: 5.7,  fill: "#F87171" },
  { name: "Lot overhead", value: 15.4,  pct: 4.7,  fill: "#172D4D" },
];

/* ── Pipeline stages ── */
export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "reserved", title: "Reserved / ID verified", sub: "14 deals · pre-funding", deals: 14, value: 241000, pct: 35,
    dotColor: "#4DD9C7", valueColor: "#4DD9C7", badgeLabel: "35%", isRisk: false },
  { id: "lender", title: "Docs out / at lender", sub: "16 deals · at funding stage", deals: 16, value: 298000, pct: 44,
    dotColor: "#FCD34D", valueColor: "#FCD34D", badgeLabel: "44%", isRisk: false },
  { id: "funded", title: "Funded / in return window", sub: "6 deals · completing", deals: 6, value: 143000, pct: 21,
    dotColor: "#34D399", valueColor: "#34D399", badgeLabel: "21%", isRisk: false },
  { id: "risk", title: "At-risk deals", sub: "4 deals · health score <60", deals: 4, value: 74000, pct: 0,
    dotColor: "#F87171", valueColor: "#F87171", badgeLabel: "Risk", isRisk: true },
];

/* ── Deal velocity ── */
export const DEAL_VELOCITY_CURRENT = [2,5,8,11,14,17,20,23,26,29,31,33,35,37,39,41,43,45,47,49,51,53,55,57,59,61,63,65,68];
export const DEAL_VELOCITY_PRIOR = [2,4,7,9,12,14,16,19,21,23,25,27,28,30,32,33,34,36,37,38,39];

export function getDealVelocityData() {
  return Array.from({ length: 29 }, (_, i) => ({
    day: i + 1,
    current: DEAL_VELOCITY_CURRENT[i] ?? null,
    prior: i < DEAL_VELOCITY_PRIOR.length ? DEAL_VELOCITY_PRIOR[i] : null,
  }));
}

/* ── Forecast ── */
export const FORECAST_DATA: ForecastMonth[] = [
  { month: "Apr", forecast: 490, priorYear: 350 },
  { month: "May", forecast: 450, priorYear: 330 },
  { month: "Jun", forecast: 440, priorYear: 310 },
  { month: "Jul", forecast: 470, priorYear: 360 },
  { month: "Aug", forecast: 480, priorYear: 370 },
  { month: "Sep", forecast: 490, priorYear: 380 },
];

export const FORECAST_BAR_OPACITY = [1, 0.6, 0.4, 0.3, 0.2, 0.15];
