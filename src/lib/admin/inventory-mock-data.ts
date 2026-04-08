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
  totalStock: 142,
  frontLineLive: 111,
  frontLinePct: 78,
  inRecon: 31,
  reconOverdue: 4,
  avgDaysOnLot: 22.4,
  avgDaysDelta: -3.1,
  atRisk: 14,
};

/* ── Lots ── */
export const LOTS: LotInfo[] = [
  { name: 'Lot 1', city: 'Birmingham', count: 52, capacity: 60, inRecon: 8,  capacityPct: 87 },
  { name: 'Lot 2', city: 'Manchester', count: 48, capacity: 60, inRecon: 13, capacityPct: 80 },
  { name: 'Lot 3', city: 'Bristol',    count: 42, capacity: 60, inRecon: 10, capacityPct: 70 },
];

/* ── 12 representative vehicles ── */
export const VEHICLES: InventoryVehicle[] = [
  { id: 'v001', vin: 'VIN001', year: 2022, make: 'BMW',      model: '3 Series',    days: 8,  stage: 'live',    listPrice: 18900, aiRecPrice: 18900, aiAction: 'Priced at market',      aiActionClass: 'ok',    lot: 'Lot 1', risk: 'low'  },
  { id: 'v002', vin: 'VIN002', year: 2021, make: 'Audi',     model: 'A4 2.0 TDi',  days: 34, stage: 'live',    listPrice: 15900, aiRecPrice: 15550, aiAction: '–£350 recommend',       aiActionClass: 'flag',  lot: 'Lot 2', risk: 'mid'  },
  { id: 'v003', vin: 'VIN003', year: 2020, make: 'VW',       model: 'Golf GTI',     days: 62, stage: 'live',    listPrice: 13700, aiRecPrice: 13700, aiAction: 'Day 60 decay applied',  aiActionClass: 'decay', lot: 'Lot 1', risk: 'high' },
  { id: 'v004', vin: 'VIN004', year: 2022, make: 'Toyota',   model: 'RAV4 Hybrid',  days: 5,  stage: 'recon',   listPrice: 21800, aiRecPrice: 22200, aiAction: 'Demand spike +£400',    aiActionClass: 'ok',    lot: 'Lot 3', risk: 'low'  },
  { id: 'v005', vin: 'VIN005', year: 2021, make: 'Mercedes', model: 'A200',         days: 18, stage: 'live',    listPrice: 18800, aiRecPrice: 18800, aiAction: 'At market price',       aiActionClass: 'ok',    lot: 'Lot 2', risk: 'low'  },
  { id: 'v006', vin: 'VIN006', year: 2019, make: 'BMW',      model: '3 Series',     days: 47, stage: 'live',    listPrice: 12400, aiRecPrice: 12400, aiAction: 'Day 45 decay applied',  aiActionClass: 'decay', lot: 'Lot 1', risk: 'high' },
  { id: 'v007', vin: 'VIN007', year: 2022, make: 'Honda',    model: 'Civic Type R', days: 22, stage: 'recon',   listPrice: 24900, aiRecPrice: 24900, aiAction: 'In photography',        aiActionClass: 'ok',    lot: 'Lot 3', risk: 'low'  },
  { id: 'v008', vin: 'VIN008', year: 2020, make: 'Ford',     model: 'Focus ST',     days: 38, stage: 'live',    listPrice: 13100, aiRecPrice: 12800, aiAction: '0 views 14d — flag',    aiActionClass: 'flag',  lot: 'Lot 2', risk: 'mid'  },
  { id: 'v009', vin: 'VIN009', year: 2021, make: 'Hyundai',  model: 'Tucson',       days: 11, stage: 'ready',   listPrice: 17600, aiRecPrice: 17600, aiAction: 'Ready to publish',      aiActionClass: 'ok',    lot: 'Lot 1', risk: 'low'  },
  { id: 'v010', vin: 'VIN010', year: 2021, make: 'Nissan',   model: 'Leaf Plus',    days: 29, stage: 'live',    listPrice: 17100, aiRecPrice: 17100, aiAction: 'Transfer rec: Lot 3',   aiActionClass: 'flag',  lot: 'Lot 1', risk: 'low'  },
  { id: 'v011', vin: 'VIN011', year: 2022, make: 'Skoda',    model: 'Octavia vRS',  days: 4,  stage: 'arrived', listPrice: 14000, aiRecPrice: 14000, aiAction: 'Awaiting inspection',   aiActionClass: 'ok',    lot: 'Lot 3', risk: 'low'  },
  { id: 'v012', vin: 'VIN012', year: 2021, make: 'Kia',      model: 'Sportage GT',  days: 55, stage: 'live',    listPrice: 19600, aiRecPrice: 18900, aiAction: '–£700 recommended',     aiActionClass: 'flag',  lot: 'Lot 2', risk: 'high' },
];

/* ── Recon pipeline ── */
export const RECON_STAGES: ReconStageRow[] = [
  { label: 'Arrived',        count: 8,  fillColor: '#172D4D', valueColor: '#F1F5F9', overdue: 0 },
  { label: 'In mechanical',  count: 11, fillColor: '#F87171', valueColor: '#F87171', overdue: 2 },
  { label: 'Body / paint',   count: 6,  fillColor: '#FCD34D', valueColor: '#F5A623', overdue: 1 },
  { label: 'Detail / valet', count: 4,  fillColor: '#172D4D', valueColor: '#F1F5F9', overdue: 0 },
  { label: 'Photography',    count: 2,  fillColor: '#1D5A4D', valueColor: '#4DD9C7', overdue: 1 },
  { label: 'Listing ready',  count: 4,  fillColor: '#224F12', valueColor: '#34D399', overdue: 0 },
];

export const RECON_MAX = 15;

/* ── Aging buckets ── */
export const AGING_BUCKETS: AgingBucket[] = [
  { label: '0–14 days',   count: 58, labelColor: '#34D399', actionText: 'On track',       actionBg: '#0B2B1A', actionTextColor: '#34D399' },
  { label: '15–30 days',  count: 41, labelColor: '#F1F5F9', actionText: 'Monitor',        actionBg: '#111D30', actionTextColor: '#6B7A90' },
  { label: '31–45 days',  count: 29, labelColor: '#F5A623', actionText: 'Review price',   actionBg: '#2B1A00', actionTextColor: '#F5A623' },
  { label: '46–60 days',  count: 10, labelColor: '#F8A35A', actionText: '–3% decay due',  actionBg: '#2B0F0F', actionTextColor: '#F87171' },
  { label: 'Over 60 days', count: 4,  labelColor: '#F87171', actionText: 'Wholesale?',     actionBg: '#2B0F0F', actionTextColor: '#F87171' },
];

/* ── Pricing log ── */
export const PRICING_LOG: PricingLogRow[] = [
  { vehicle: '2019 BMW 3 Series',  dotColor: 'red',   sub: 'Day 45 decay — £500 reduction auto-applied',     value: '–£500',   valueColor: '#F87171' },
  { vehicle: '2021 Audi A4',       dotColor: 'amber', sub: 'Comp scan — recommend –£350 (3 rivals dropped)', value: 'Pending',  valueColor: '#F5A623' },
  { vehicle: '2020 VW Golf GTI',   dotColor: 'red',   sub: 'Day 60 decay — £900 reduction auto-applied',     value: '–£900',   valueColor: '#F87171' },
  { vehicle: '2022 Toyota RAV4',   dotColor: 'teal',  sub: 'Demand spike — AI raised price £400',            value: '+£400',   valueColor: '#4DD9C7' },
  { vehicle: '2021 Honda Civic R', dotColor: 'amber', sub: 'VDP views high, no conversion — review',        value: 'Pending',  valueColor: '#F5A623' },
];

/* ── Transfer recommendations ── */
export const TRANSFER_RECS: TransferRec[] = [
  { id: 'tr-001', vehicle: '2021 Nissan Leaf Plus', from: 'Lot 1', to: 'Lot 3', sub: 'Higher EV demand Bristol · +£820 GPU est.' },
  { id: 'tr-002', vehicle: '2020 Ford Focus ST',    from: 'Lot 2', to: 'Lot 3', sub: '0 views 14d · Bristol has similar demand' },
  { id: 'tr-003', vehicle: '2022 Hyundai Tucson',   from: 'Lot 1', to: 'Lot 2', sub: 'Lot 1 near cap · Lot 2 has space' },
];
