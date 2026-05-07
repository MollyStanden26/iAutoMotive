// lib/admin/inventory-mock-data.ts — All static mock data for the Inventory & Lot Management page

export type ReconStage = 'live' | 'recon' | 'arrived' | 'mech' | 'photo' | 'ready';
export type VehicleFilter = 'all' | 'live' | 'recon' | 'risk' | 'lot1' | 'lot2' | 'lot3';
export type AiActionClass = 'ok' | 'flag' | 'decay';
export type RiskLevel = 'low' | 'mid' | 'high';
export type PricingDotColor = 'red' | 'amber' | 'teal';

export interface InventoryVehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  days: number;
  stage: ReconStage;
  listPrice: number;
  aiRecPrice: number;
  aiAction: string;
  aiActionClass: AiActionClass;
  lot: 'Lot 1' | 'Lot 2' | 'Lot 3';
  risk: RiskLevel;
}

export interface LotInfo {
  name: string;
  city: string;
  count: number;
  capacity: number;
  inRecon: number;
  capacityPct: number;
}

export interface ReconStageRow {
  label: string;
  count: number;
  fillColor: string;
  valueColor: string;
  overdue: number;
}

export interface AgingBucket {
  label: string;
  count: number;
  labelColor: string;
  actionText: string;
  actionBg: string;
  actionTextColor: string;
}

export interface PricingLogRow {
  vehicle: string;
  dotColor: PricingDotColor;
  sub: string;
  value: string;
  valueColor: string;
}

export interface TransferRec {
  id: string;
  vehicle: string;
  from: string;
  to: string;
  sub: string;
}

export interface InventoryKpis {
  totalStock: number;
  frontLineLive: number;
  frontLinePct: number;
  inRecon: number;
  reconOverdue: number;
  avgDaysOnLot: number;
  avgDaysDelta: number;
  atRisk: number;
}

/* ── KPIs ── */
export const INVENTORY_KPIS: InventoryKpis = {
  totalStock: 0,
  frontLineLive: 0,
  frontLinePct: 0,
  inRecon: 0,
  reconOverdue: 0,
  avgDaysOnLot: 0,
  avgDaysDelta: 0,
  atRisk: 0,
};

/* ── Lots ── */
export const LOTS: LotInfo[] = [];

/* ── 12 representative vehicles ── */
export const VEHICLES: InventoryVehicle[] = [];

/* ── Recon pipeline ── */
export const RECON_STAGES: ReconStageRow[] = [];

export const RECON_MAX = 1;

/* ── Aging buckets ── */
export const AGING_BUCKETS: AgingBucket[] = [];

/* ── Pricing log ── */
export const PRICING_LOG: PricingLogRow[] = [];

/* ── Transfer recommendations ── */
export const TRANSFER_RECS: TransferRec[] = [];
