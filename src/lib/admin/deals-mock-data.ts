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
  liveDeals: 0,
  pipelineValue: 0,
  estPlatformFee: 0,
  atRisk: 0,
  closedToday: 0,
  closedTodayRevenue: 0,
};

/* ── Pipeline strip ── */
export const PIPELINE_STAGES: PipelineStage[] = [
  { label: 'Reserved',      count: 0, countColor: '#6B7A90', barColor: '#172D4D' },
  { label: 'ID verified',   count: 0, countColor: '#6B7A90', barColor: '#172D4D' },
  { label: 'Docs sent',     count: 0, countColor: '#6B7A90', barColor: '#172D4D' },
  { label: 'Awaiting sign', count: 0, countColor: '#6B7A90', barColor: '#172D4D' },
  { label: 'Submitted',     count: 0, countColor: '#6B7A90', barColor: '#172D4D' },
  { label: 'Funded',        count: 0, countColor: '#6B7A90', barColor: '#172D4D' },
  { label: 'Delivered',     count: 0, countColor: '#6B7A90', barColor: '#172D4D' },
  { label: 'Closed today',  count: 0, countColor: '#6B7A90', barColor: '#172D4D' },
];

/* ── 12 representative deals ── */
export const DEALS: Deal[] = [];

/* ── At-risk deals ── */
export const AT_RISK_DEALS: AtRiskDeal[] = [];

/* ── Funding tracker ── */
export const FUNDING_ROWS: FundingRow[] = [];

/* ── Document status ── */
export const DOC_STATUS_ROWS: DocStatusRow[] = [];

/* ── Compliance ── */
export const COMPLIANCE_ROWS: ComplianceRow[] = [];
