// lib/admin/payouts-mock-data.ts — All static mock data for the Seller Payouts page

export type PayoutStatus = 'ready' | 'escrow' | 'lien' | 'overdue' | 'paid';
export type DisbursementMethod = 'RTP' | 'ACH' | 'Wire' | 'BACS';
export type PayoutFilter = 'all' | 'ready' | 'overdue' | 'lien' | 'escrow';
export type ConditionStatus = 'met' | 'pending';
export type LienStatus = 'pending' | 'released';
export type TaxDotColor = 'green' | 'red' | 'amber' | 'muted';

export interface PayoutQueueItem {
  id: string; seller: string; vehicle: string; netPayout: number;
  status: PayoutStatus; method: DisbursementMethod; waitingLabel: string;
  condsMet: number; condsTotal: number;
}

export interface EscrowCondition { label: string; status: ConditionStatus; }
export interface EscrowRow {
  id: string; sellerVehicle: string; sub: string;
  amount: number; amountColor: string; conditions: EscrowCondition[];
}

export interface OverdueAlert {
  id: string; sellerVehicle: string; waitingLabel: string;
  stallReason: string; recommendedAction: string;
}

export interface LienRow {
  id: string; sellerVehicle: string; lienholder: string;
  note: string; amount: number; status: LienStatus;
}

export interface DisbursementRow {
  method: DisbursementMethod; fullName: string; count: number;
  barPct: number; barColor: string; totalAmount: number; amountColor: string;
}

export interface TaxRow {
  title: string; sub: string; dotColor: TaxDotColor;
  statusLabel: string; statusColor: string;
}

export interface PayoutsKpis {
  inEscrow: number; readyToPay: number; readyToPayCount: number;
  overdue: number; paidToday: number; paidTodayCount: number;
  avgPayoutDays: number; avgPayoutDelta: number;
}

/* ── Utility ── */
export function waitingToHours(label: string): number {
  const num = parseFloat(label);
  if (label.endsWith('d')) return num * 24;
  if (label.endsWith('h')) return num;
  return num;
}

/* ── KPIs ── */
export const PAYOUTS_KPIS: PayoutsKpis = {
  inEscrow: 82300, readyToPay: 34100, readyToPayCount: 3,
  overdue: 2, paidToday: 102400, paidTodayCount: 8,
  avgPayoutDays: 1.4, avgPayoutDelta: -0.7,
};

/* ── Payout queue (12 items) ── */
export const PAYOUT_QUEUE: PayoutQueueItem[] = [
  { id: 'p01', seller: 'Priya S.',   vehicle: '2021 VW Golf GTI',    netPayout: 12400, status: 'ready',   method: 'RTP',  waitingLabel: '2d',  condsMet: 5, condsTotal: 5 },
  { id: 'p02', seller: 'Rachel D.',  vehicle: '2022 Mercedes A200',  netPayout: 13580, status: 'ready',   method: 'ACH',  waitingLabel: '1d',  condsMet: 5, condsTotal: 5 },
  { id: 'p03', seller: 'Tom B.',     vehicle: '2021 Toyota RAV4',    netPayout: 11240, status: 'overdue', method: 'ACH',  waitingLabel: '56h', condsMet: 4, condsTotal: 5 },
  { id: 'p04', seller: 'Eva L.',     vehicle: '2021 Nissan Leaf',    netPayout: 9800,  status: 'overdue', method: 'BACS', waitingLabel: '51h', condsMet: 3, condsTotal: 5 },
  { id: 'p05', seller: 'Michael C.', vehicle: '2020 Audi A4',        netPayout: 17960, status: 'lien',    method: 'Wire', waitingLabel: '3d',  condsMet: 3, condsTotal: 5 },
  { id: 'p06', seller: 'James H.',   vehicle: '2022 BMW 3 Series',   netPayout: 14820, status: 'escrow',  method: 'RTP',  waitingLabel: '5d',  condsMet: 4, condsTotal: 5 },
  { id: 'p07', seller: 'Sara B.',    vehicle: '2021 Honda Civic R',  netPayout: 15200, status: 'ready',   method: 'RTP',  waitingLabel: '1d',  condsMet: 5, condsTotal: 5 },
  { id: 'p08', seller: 'Dan W.',     vehicle: '2022 BMW 5 Series',   netPayout: 19400, status: 'escrow',  method: 'Wire', waitingLabel: '4d',  condsMet: 4, condsTotal: 5 },
  { id: 'p09', seller: 'Fiona K.',   vehicle: '2020 Ford Focus ST',  netPayout: 8600,  status: 'escrow',  method: 'ACH',  waitingLabel: '2d',  condsMet: 3, condsTotal: 5 },
  { id: 'p10', seller: 'Leon H.',    vehicle: '2022 Kia Sportage',   netPayout: 10200, status: 'escrow',  method: 'BACS', waitingLabel: '1d',  condsMet: 2, condsTotal: 5 },
  { id: 'p11', seller: 'Anna C.',    vehicle: '2021 Skoda Octavia',  netPayout: 7800,  status: 'escrow',  method: 'RTP',  waitingLabel: '3d',  condsMet: 3, condsTotal: 5 },
  { id: 'p12', seller: 'Tyler B.',   vehicle: '2020 Hyundai Tucson', netPayout: 9600,  status: 'escrow',  method: 'RTP',  waitingLabel: '2d',  condsMet: 4, condsTotal: 5 },
];

/* ── Escrow ── */
export const ESCROW_ROWS: EscrowRow[] = [
  { id: 'e01', sellerVehicle: 'James H. — BMW 3 Series', sub: 'Closed 22 Mar · Day 7 return window',
    amount: 14820, amountColor: '#4DD9C7',
    conditions: [{ label: 'Title', status: 'met' }, { label: 'Funded', status: 'met' }, { label: 'Comply', status: 'met' }, { label: 'Return window', status: 'pending' }] },
  { id: 'e02', sellerVehicle: 'Priya S. — VW Golf GTI', sub: 'Closed 24 Mar · All conditions met',
    amount: 12400, amountColor: '#34D399',
    conditions: [{ label: 'Title', status: 'met' }, { label: 'Return clear', status: 'met' }, { label: 'Funded', status: 'met' }, { label: 'Comply', status: 'met' }] },
  { id: 'e03', sellerVehicle: 'Michael C. — Audi A4', sub: 'Closed 25 Mar · Lien payoff pending',
    amount: 17960, amountColor: '#F5A623',
    conditions: [{ label: 'Title', status: 'pending' }, { label: 'Return clear', status: 'met' }, { label: 'Funded', status: 'met' }, { label: 'Comply', status: 'met' }] },
  { id: 'e04', sellerVehicle: 'Rachel D. — Mercedes A200', sub: 'Closed 26 Mar · All conditions met',
    amount: 13580, amountColor: '#34D399',
    conditions: [{ label: 'Title', status: 'met' }, { label: 'Return clear', status: 'met' }, { label: 'Funded', status: 'met' }, { label: 'Comply', status: 'met' }] },
];

/* ── Overdue ── */
export const OVERDUE_ALERTS: OverdueAlert[] = [
  { id: 'o01', sellerVehicle: 'Tom B. — Toyota RAV4', waitingLabel: '56h', stallReason: 'ACH failed — bank account name mismatch', recommendedAction: 'Update bank details and retry' },
  { id: 'o02', sellerVehicle: 'Eva L. — Nissan Leaf', waitingLabel: '51h', stallReason: 'TIN not verified — backup withholding triggered', recommendedAction: 'Chase TIN submission from seller' },
];

/* ── Lien ── */
export const LIEN_ROWS: LienRow[] = [
  { id: 'l01', sellerVehicle: 'Michael C. — Audi A4', lienholder: 'Barclays', note: 'Wire initiated', amount: 4200, status: 'pending' },
  { id: 'l02', sellerVehicle: 'Dan W. — BMW 5 Series', lienholder: 'Santander', note: 'Release confirmed', amount: 6800, status: 'released' },
];

/* ── Disbursement ── */
export const DISBURSEMENT_ROWS: DisbursementRow[] = [
  { method: 'RTP',  fullName: 'Faster Payments', count: 6, barPct: 75, barColor: '#34D399', totalAmount: 62400, amountColor: '#34D399' },
  { method: 'ACH',  fullName: 'Same-day ACH',    count: 3, barPct: 38, barColor: '#4DD9C7', totalAmount: 28100, amountColor: '#4DD9C7' },
  { method: 'Wire', fullName: 'CHAPS (>£50k)',    count: 1, barPct: 15, barColor: '#FCD34D', totalAmount: 58200, amountColor: '#F5A623' },
  { method: 'BACS', fullName: 'Standard BACS',    count: 2, barPct: 20, barColor: '#172D4D', totalAmount: 11800, amountColor: '#6B7A90' },
];

/* ── Tax compliance ── */
// TODO: Update threshold and deadline from HMRC guidance API when available.
export const TAX_ROWS: TaxRow[] = [
  { title: 'TIN verification',         sub: '51 of 52 sellers verified',        dotColor: 'green', statusLabel: '1 pending', statusColor: '#34D399' },
  { title: 'Backup withholding',        sub: 'Eva L. — TIN unverified 30+ days', dotColor: 'red',   statusLabel: 'Active',    statusColor: '#F87171' },
  { title: 'Self-assessment guidance',   sub: '3 sellers approaching £5,000 YTD', dotColor: 'amber', statusLabel: 'Monitor',   statusColor: '#F5A623' },
  { title: 'Annual filing',             sub: 'Next deadline: 31 Jan 2027',       dotColor: 'muted', statusLabel: 'On track',  statusColor: '#6B7A90' },
];
