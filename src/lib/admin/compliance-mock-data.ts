// lib/admin/compliance-mock-data.ts — All static mock data for the Compliance Dashboard

export type ComplianceStatus = 'critical' | 'advisory' | 'clear';
export type RegPanelStatus   = 'clear' | 'advisory' | 'warning';
export type AmlStatus        = 'hold' | 'clear' | 'pending';
export type DocStatus        = 'incomplete' | 'pending' | 'complete';

export interface ComplianceDeal {
  id: string;
  buyer: string;
  vehicle: string;
  price: number;
  status: ComplianceStatus;
  score: number;
  flags: { label: string; severity: "critical" | "advisory" }[];
}

export interface ActiveFlag {
  id: string;
  dealId: string;
  title: string;
  reason: string;
  recommendedAction: string;
  severity: "critical" | "advisory";
}

export interface AmlScreeningRow {
  label: string;
  verified: number;
  total: number;
  barPct: number;
  status: "green" | "amber";
}

export interface AmlHold {
  dealId: string;
  buyer: string;
  detail: string;
}

export interface ConsumerRightsRow {
  title: string;
  sub: string;
  status: RegPanelStatus;
}

export interface GdprFcaRow {
  title: string;
  sub: string;
  status: RegPanelStatus;
}

export interface AuditRow {
  id: string;
  dealId: string | null;
  title: string;
  sub: string;
  iconType: "error" | "info" | "success" | "download";
  actionLabel: string;
}

export interface ComplianceKpis {
  portfolioScore: number;
  activeFlags: number;
  criticalFlags: number;
  advisoryFlags: number;
  dealsScreened: number;
  docsCompletePct: number;
  jacketsIncomplete: number;
  lastScanLabel: string;
}

export interface CategoryScore {
  name: string;
  score: number;
}

/* ── Utility ── */
export function getScoreColor(score: number): string {
  if (score >= 88) return '#34D399';
  if (score >= 75) return '#FCD34D';
  return '#F87171';
}

/* ── KPIs ── */
export const COMPLIANCE_KPIS: ComplianceKpis = {
  portfolioScore: 87,
  activeFlags: 3,
  criticalFlags: 2,
  advisoryFlags: 1,
  dealsScreened: 36,
  docsCompletePct: 94,
  jacketsIncomplete: 2,
  lastScanLabel: "2h ago",
};

/* ── Category scores ── */
export const CATEGORY_SCORES: CategoryScore[] = [
  { name: 'AML / KYC',       score: 91 },
  { name: 'Consumer rights',  score: 78 },
  { name: 'GDPR / data',     score: 95 },
  { name: 'FCA perimeter',   score: 89 },
  { name: 'Doc integrity',   score: 72 },
  { name: 'Advertising',     score: 100 },
];

/* ── Deal status board (6 rows) ── */
export const COMPLIANCE_DEALS: ComplianceDeal[] = [
  { id: 'd01', buyer: 'Connor H.', vehicle: '2021 BMW 3 Series',  price: 18900, status: 'critical', score: 48, flags: [{ label: 'ID unverified', severity: 'critical' }, { label: 'AML hold', severity: 'critical' }] },
  { id: 'd02', buyer: 'Sarah K.',  vehicle: '2020 Audi A4',       price: 17200, status: 'critical', score: 54, flags: [{ label: 'Doc jacket incomplete', severity: 'critical' }] },
  { id: 'd03', buyer: 'James L.',  vehicle: '2022 VW Golf R',     price: 28400, status: 'advisory', score: 71, flags: [{ label: 'Return window D8', severity: 'advisory' }] },
  { id: 'd04', buyer: 'Priya M.',  vehicle: '2021 Mercedes A200',  price: 22100, status: 'advisory', score: 76, flags: [{ label: 'Consent unconfirmed', severity: 'advisory' }] },
  { id: 'd05', buyer: 'Tom B.',    vehicle: '2021 Toyota RAV4',   price: 21500, status: 'clear',    score: 94, flags: [] },
  { id: 'd06', buyer: 'Rachel D.', vehicle: '2022 Mercedes A200',  price: 23580, status: 'clear',    score: 96, flags: [] },
];

/* ── Active flags ── */
export const ACTIVE_FLAGS: ActiveFlag[] = [
  { id: 'f01', dealId: 'd01', title: 'Connor H. — AML hold triggered', severity: 'critical',
    reason: 'Identity verification failed — name mismatch with bank records. Manual review required before deal can proceed.',
    recommendedAction: 'Escalate to compliance officer' },
  { id: 'f02', dealId: 'd02', title: 'Sarah K. — deal jacket incomplete', severity: 'critical',
    reason: 'V5C copy and signed consignment agreement missing. Deal is at funding stage — docs required before disbursement.',
    recommendedAction: 'Open document checklist' },
  { id: 'f03', dealId: 'd03', title: 'James L. — return window advisory', severity: 'advisory',
    reason: 'Day 8 of 14-day return window. No issues yet, but buyer activity shows repeated viewings of similar vehicles.',
    recommendedAction: 'View buyer activity' },
];

/* ── AML ── */
export const AML_HOLD: AmlHold = {
  dealId: 'd01',
  buyer: 'Connor H.',
  detail: 'Passport name: C. Harrison. Bank account name: Connor J. Harrington. OFAC clear. PEP: negative.',
};

export const AML_SCREENING: AmlScreeningRow[] = [
  { label: 'OFAC screened',   verified: 36, total: 36, barPct: 100, status: 'green' },
  { label: 'PEP checked',     verified: 36, total: 36, barPct: 100, status: 'green' },
  { label: 'ID verified',     verified: 35, total: 36, barPct: 97,  status: 'amber' },
  { label: 'Source of funds',  verified: 34, total: 36, barPct: 94,  status: 'green' },
];

/* ── Consumer rights ── */
export const CONSUMER_RIGHTS_ROWS: ConsumerRightsRow[] = [
  { title: '14-day return window tracker', status: 'advisory',
    sub: 'James L. — day 8. Rachel D. — day 3. All others closed.' },
  { title: 'Distance selling compliance', status: 'clear',
    sub: 'All 36 deals include cooling-off notice. No outstanding right-to-cancel exposure.' },
  { title: 'Consumer Rights Act 2015', status: 'clear',
    sub: '0 vehicle quality disputes open. 1 resolved in past 30 days.' },
];

/* ── GDPR & FCA ── */
// TODO: Wire to live FCA perimeter check API when available.
export const GDPR_FCA_ROWS: GdprFcaRow[] = [
  { title: 'Consent status', status: 'clear',
    sub: '52 seller records with valid marketing consent. 0 ICO requests outstanding.' },
  { title: 'FCA perimeter — finance referrals', status: 'clear',
    sub: 'All finance introductions use approved broker language. 0 unauthorised promotions flagged.' },
  { title: 'Advertising standards', status: 'clear',
    sub: 'All 142 active listings reviewed. CAP code compliance: 100%.' },
];

/* ── Audit ── */
export const AUDIT_ROWS: AuditRow[] = [
  { id: 'a01', dealId: 'd02', title: 'Sarah K. — jacket missing 2 docs',
    sub: 'V5C copy \u00b7 signed consignment agreement', iconType: 'error', actionLabel: 'Open' },
  { id: 'a02', dealId: 'd03', title: 'James L. — return window active',
    sub: 'Jacket complete \u00b7 return outcome pending', iconType: 'info', actionLabel: 'Open' },
  { id: 'a03', dealId: null,  title: 'Audit log — last 24 hours',
    sub: '8 compliance events recorded \u00b7 0 gaps', iconType: 'success', actionLabel: 'Export' },
  { id: 'a04', dealId: null,  title: 'Generate audit pack',
    sub: 'Full portfolio \u00b7 all docs \u00b7 ready in ~30s', iconType: 'download', actionLabel: 'Generate' },
];
