// lib/admin/deals-mock-data.ts — All static mock data for the Deals & Transaction Pipeline page

export type DealStage =
  | 'Reserved' | 'ID verified' | 'Docs sent' | 'Awaiting sign'
  | 'Submitted' | 'Funded' | 'Delivered' | 'Closed';

export type DealStageKey = 'res' | 'idv' | 'docs' | 'sign' | 'sub' | 'fund' | 'del' | 'closed';
export type FundingStatus =
  | 'Approved' | 'Pending' | 'Stip req.' | 'Submitted' | 'Awaiting'
  | 'Pre-qual' | 'Declined' | 'Cash' | 'Funded';
export type FundingKey = 'approved' | 'pending' | 'wait' | 'cash' | 'declined';
export type RiskSeverity = 'HIGH' | 'MED' | 'LOW';
export type DealFilter = 'all' | 'risk' | 'fund' | 'docs' | 'today';

export interface Deal {
  id: string;
  year: number;
  make: string;
  model: string;
  buyer: string;
  stage: DealStage;
  stageKey: DealStageKey;
  healthScore: number;
  salePrice: number;
  gpu: number;
  fundingStatus: FundingStatus;
  fundingKey: FundingKey;
  openedLabel: string;
}

export interface PipelineStage {
  label: string;
  count: number;
  countColor: string;
  barColor: string;
}

export interface AtRiskDeal {
  id: string;
  title: string;
  severity: RiskSeverity;
  stallReason: string;
  recommendedAction: string;
  healthScore: number;
}

export interface FundingRow {
  dealTitle: string;
  status: FundingStatus;
  fundingKey: FundingKey;
  ageLabel: string;
  ageColor: string;
}

export interface DocStatusRow {
  dealTitle: string;
  dotColor: 'red' | 'amber' | 'green';
  sub: string;
  statusLabel: string;
  statusColor: string;
}

export interface ComplianceRow {
  title: string;
  sub: string;
  statusLabel: string;
  passing: boolean;
}

export interface DealsKpis {
  liveDeals: number;
  pipelineValue: number;
  estPlatformFee: number;
  atRisk: number;
  closedToday: number;
  closedTodayRevenue: number;
}

/* ── KPIs ── */
export const DEALS_KPIS: DealsKpis = {
  liveDeals: 36,
  pipelineValue: 641000,
  estPlatformFee: 0,
  atRisk: 4,
  closedToday: 3,
  closedTodayRevenue: 52400,
};

/* ── Pipeline strip ── */
export const PIPELINE_STAGES: PipelineStage[] = [
  { label: 'Reserved',      count: 8, countColor: '#4DD9C7', barColor: '#172D4D' },
  { label: 'ID verified',   count: 6, countColor: '#4DD9C7', barColor: '#172D4D' },
  { label: 'Docs sent',     count: 5, countColor: '#F5A623', barColor: '#FCD34D' },
  { label: 'Awaiting sign', count: 4, countColor: '#F5A623', barColor: '#FCD34D' },
  { label: 'Submitted',     count: 7, countColor: '#F5A623', barColor: '#FCD34D' },
  { label: 'Funded',        count: 4, countColor: '#34D399', barColor: '#34D399' },
  { label: 'Delivered',     count: 2, countColor: '#34D399', barColor: '#34D399' },
  { label: 'Closed today',  count: 3, countColor: '#6B7A90', barColor: '#2E4060' },
];

/* ── 12 representative deals ── */
export const DEALS: Deal[] = [
  { id: 'd001', year: 2022, make: 'Toyota',   model: 'RAV4 Hybrid',  buyer: 'Lim T.',   stage: 'Funded',        stageKey: 'fund',  healthScore: 92, salePrice: 21800, gpu: 1240, fundingStatus: 'Approved',  fundingKey: 'approved', openedLabel: '2d'  },
  { id: 'd002', year: 2021, make: 'BMW',      model: '3 Series',     buyer: 'Tom H.',   stage: 'Submitted',     stageKey: 'sub',   healthScore: 28, salePrice: 18400, gpu: 980,  fundingStatus: 'Declined',  fundingKey: 'declined', openedLabel: '5d'  },
  { id: 'd003', year: 2020, make: 'Audi',     model: 'A4 2.0 TDi',  buyer: 'Priya N.', stage: 'Awaiting sign', stageKey: 'sign',  healthScore: 34, salePrice: 15900, gpu: 840,  fundingStatus: 'Pending',   fundingKey: 'pending',  openedLabel: '5d'  },
  { id: 'd004', year: 2022, make: 'Mercedes', model: 'A200',         buyer: 'Dev P.',   stage: 'Submitted',     stageKey: 'sub',   healthScore: 41, salePrice: 18800, gpu: 1100, fundingStatus: 'Stip req.', fundingKey: 'pending',  openedLabel: '3d'  },
  { id: 'd005', year: 2021, make: 'Honda',    model: 'Civic Type R', buyer: 'Ed M.',    stage: 'Submitted',     stageKey: 'sub',   healthScore: 78, salePrice: 24900, gpu: 1480, fundingStatus: 'Pending',   fundingKey: 'pending',  openedLabel: '1d'  },
  { id: 'd006', year: 2021, make: 'VW',       model: 'Golf GTI',     buyer: 'Sara B.',  stage: 'Docs sent',     stageKey: 'docs',  healthScore: 46, salePrice: 14600, gpu: 720,  fundingStatus: 'Awaiting',  fundingKey: 'wait',     openedLabel: '4d'  },
  { id: 'd007', year: 2022, make: 'Skoda',    model: 'Octavia vRS',  buyer: 'Jo P.',    stage: 'Submitted',     stageKey: 'sub',   healthScore: 67, salePrice: 14000, gpu: 680,  fundingStatus: 'Pending',   fundingKey: 'pending',  openedLabel: '2d'  },
  { id: 'd008', year: 2021, make: 'Nissan',   model: 'Leaf Plus',    buyer: 'Faye D.',  stage: 'Funded',        stageKey: 'fund',  healthScore: 88, salePrice: 17100, gpu: 940,  fundingStatus: 'Cash',      fundingKey: 'cash',     openedLabel: '1d'  },
  { id: 'd009', year: 2020, make: 'Ford',     model: 'Focus ST',     buyer: 'Ray K.',   stage: 'Submitted',     stageKey: 'sub',   healthScore: 74, salePrice: 13100, gpu: 620,  fundingStatus: 'Submitted', fundingKey: 'wait',     openedLabel: '3d'  },
  { id: 'd010', year: 2022, make: 'Kia',      model: 'Sportage GT',  buyer: 'Alex W.',  stage: 'Reserved',      stageKey: 'res',   healthScore: 91, salePrice: 19600, gpu: 1180, fundingStatus: 'Cash',      fundingKey: 'cash',     openedLabel: '6h'  },
  { id: 'd011', year: 2022, make: 'BMW',      model: '3 Series',     buyer: 'Nina F.',  stage: 'ID verified',   stageKey: 'idv',   healthScore: 85, salePrice: 21200, gpu: 1320, fundingStatus: 'Pre-qual',  fundingKey: 'wait',     openedLabel: '1d'  },
  { id: 'd012', year: 2021, make: 'Hyundai',  model: 'Tucson',       buyer: 'Jake T.',  stage: 'Delivered',     stageKey: 'del',   healthScore: 95, salePrice: 17600, gpu: 980,  fundingStatus: 'Funded',    fundingKey: 'approved', openedLabel: '7d'  },
];

/* ── At-risk deals ── */
export const AT_RISK_DEALS: AtRiskDeal[] = [
  { id: 'd002', title: '2021 BMW 3 Series — Tom H.',  severity: 'HIGH', healthScore: 28, stallReason: 'Lender declined · 72h no response from buyer',          recommendedAction: 'Call buyer today — deal will expire' },
  { id: 'd003', title: '2020 Audi A4 — Priya N.',     severity: 'HIGH', healthScore: 34, stallReason: 'Docs sent 5 days ago — not signed yet',                 recommendedAction: 'Send signing reminder' },
  { id: 'd004', title: '2022 Mercedes A200 — Dev P.',  severity: 'MED',  healthScore: 41, stallReason: 'Stip requested by lender · buyer hasn\'t responded',   recommendedAction: 'Chase stip documents' },
  { id: 'd006', title: '2021 VW Golf GTI — Sara B.',   severity: 'MED',  healthScore: 46, stallReason: 'Trade-in value dispute · buyer considering withdrawal', recommendedAction: 'Review trade-in offer' },
];

/* ── Funding tracker ── */
export const FUNDING_ROWS: FundingRow[] = [
  { dealTitle: '2022 Toyota RAV4 — Lim T.',  status: 'Approved',  fundingKey: 'approved', ageLabel: '1h',  ageColor: '#34D399' },
  { dealTitle: '2021 Honda Civic R — Ed M.',  status: 'Pending',   fundingKey: 'pending',  ageLabel: '18h', ageColor: '#F5A623' },
  { dealTitle: '2022 Skoda Octavia — Jo P.',  status: 'Pending',   fundingKey: 'pending',  ageLabel: '31h', ageColor: '#F5A623' },
  { dealTitle: '2020 Ford Focus ST — Ray K.', status: 'Submitted', fundingKey: 'wait',     ageLabel: '4h',  ageColor: '#6B7A90' },
  { dealTitle: '2021 Nissan Leaf — Faye D.',  status: 'Cash',      fundingKey: 'cash',     ageLabel: '–',   ageColor: '#4DD9C7' },
];

/* ── Document status ── */
export const DOC_STATUS_ROWS: DocStatusRow[] = [
  { dealTitle: '2020 Audi A4 — Priya N.',    dotColor: 'red',   sub: 'Purchase agreement not signed · 5 days overdue', statusLabel: 'Blocked',  statusColor: '#F87171' },
  { dealTitle: '2021 BMW 3 Series — Tom H.',  dotColor: 'red',   sub: 'Odometer disclosure missing from packet',        statusLabel: 'Blocked',  statusColor: '#F87171' },
  { dealTitle: '2022 Mercedes A200 — Dev P.', dotColor: 'amber', sub: 'Stip documents requested — not received',        statusLabel: 'Chasing',  statusColor: '#F5A623' },
  { dealTitle: '2022 Toyota RAV4 — Lim T.',   dotColor: 'green', sub: 'All documents signed and submitted',             statusLabel: 'Complete', statusColor: '#34D399' },
];

/* ── Compliance ── */
export const COMPLIANCE_ROWS: ComplianceRow[] = [
  { title: 'OFAC screening',    sub: '36 deals checked · 0 matches',   statusLabel: 'Clear', passing: true },
  { title: 'Identity verified',  sub: '36 of 36 buyers verified',       statusLabel: '100%',  passing: true },
  { title: 'Fraud risk',         sub: 'All scores below 30 · 0 holds',  statusLabel: 'Clear', passing: true },
  { title: 'TILA disclosures',   sub: 'All financed deals disclosed',   statusLabel: 'Clear', passing: true },
];
