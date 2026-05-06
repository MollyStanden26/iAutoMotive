// lib/seller/seller-mock-data.ts — All types + mock data for the Seller Portal

export type ReconStage =
  | 'offer_accepted' | 'collected' | 'inspected'
  | 'reconditioned' | 'live' | 'sale_agreed' | 'paid';

export type EscrowConditionStatus = 'complete' | 'waiting';
export type MessageRole = 'them' | 'me';

export interface SellerVehicle {
  id: string;
  registration: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  colour: string;
  gearbox: string;
  fuelType: string;
  owners: number;
  hpiStatus: 'clear' | 'flagged';
  conditionGrade: 'Excellent' | 'Good' | 'Fair' | 'Below Average';
  serviceHistory: 'Full' | 'Partial' | 'None';
  currentStage: ReconStage;
  listedAt: string;
  listingPriceGbp: number;
  photoCount: number;
  viewsLast7Days: number;
  savesLast7Days: number;
  enquiriesLast7Days: number;
}

export interface PayoutEstimate {
  listingPriceGbp: number;
  platformFeePct: number;
  platformFeeGbp: number;
  reconMechanicalGbp: number;
  reconDetailGbp: number;
  transportGbp: number;
  netPayoutGbp: number;
}

export interface PriceHistoryEntry {
  date: string;
  priceGbp: number;
  event: 'listed' | 'adjusted' | 'current';
}

export interface OfferHistoryEntry {
  id: string;
  date: string;
  party: 'iautomotive' | 'seller' | 'agreed';
  label: string;
  detail: string;
}

export interface EscrowCondition {
  id: string;
  label: string;
  status: EscrowConditionStatus;
}

export interface SellerDocument {
  id: string;
  label: string;
  iconText: string;
  iconBg: string;
  iconColor: string;
  meta: string;
  available: boolean;
  pending: boolean;
}

export interface SellerMessage {
  id: string;
  role: MessageRole;
  text: string;
  senderLabel?: string;
}

export interface SellerUpdate {
  id: string;
  dotColor: 'teal' | 'green' | 'amber';
  text: string;
  timestamp: string;
}

export interface LotManager {
  name: string;
  role: string;
  location: string;
  responseTime: string;
}

/* ── Vehicle + payout ── */
export const MOCK_VEHICLE: SellerVehicle = {
  id: 'v001',
  registration: 'AB21 XYZ',
  year: 2021,
  make: 'Volkswagen',
  model: 'Golf',
  trim: 'GTI',
  mileage: 41200,
  colour: 'Tornado Red',
  gearbox: 'Manual',
  fuelType: 'Petrol',
  owners: 1,
  hpiStatus: 'clear',
  conditionGrade: 'Good',
  serviceHistory: 'Full',
  currentStage: 'live',
  listedAt: '2026-03-24',
  listingPriceGbp: 21200,
  photoCount: 32,
  viewsLast7Days: 84,
  savesLast7Days: 12,
  enquiriesLast7Days: 3,
};

export const MOCK_PAYOUT: PayoutEstimate = {
  listingPriceGbp: 21200,
  platformFeePct: 0,
  platformFeeGbp: 0,
  reconMechanicalGbp: 64,
  reconDetailGbp: 30,
  transportGbp: 0,
  netPayoutGbp: 21106,
};

/* ── Price history ── */
export const MOCK_PRICE_HISTORY: PriceHistoryEntry[] = [
  { date: '24 Mar 2026', priceGbp: 21600, event: 'listed' },
  { date: '26 Mar 2026', priceGbp: 21200, event: 'adjusted' },
  { date: 'Current price', priceGbp: 21200, event: 'current' },
];

/* ── Offer history ── */
export const MOCK_OFFER_HISTORY: OfferHistoryEntry[] = [
  { id: 'o1', date: '14 Mar 2026', party: 'iautomotive', label: 'Initial offer sent by iAutoMotive', detail: '£19,800 — via AutoTrader message' },
  { id: 'o2', date: '15 Mar 2026', party: 'seller', label: 'Counter-offer from you', detail: '£20,500 — responded via SMS' },
  { id: 'o3', date: '15 Mar 2026', party: 'agreed', label: 'Offer accepted — consignment agreement signed', detail: '£20,000 consignment value agreed. Listing target: £21,600.' },
];

/* ── Escrow conditions ── */
export const MOCK_ESCROW_CONDITIONS: EscrowCondition[] = [
  { id: 'e1', label: 'V5C transfer notified to DVLA', status: 'waiting' },
  { id: 'e2', label: '7-day buyer return window expired', status: 'waiting' },
  { id: 'e3', label: 'No open disputes on the deal', status: 'waiting' },
  { id: 'e4', label: 'HPI clear — confirmed at intake', status: 'complete' },
  { id: 'e5', label: 'Consignment agreement signed', status: 'complete' },
];

/* ── Documents ── */
export const MOCK_DOCUMENTS: SellerDocument[] = [
  { id: 'd1', label: 'Consignment agreement', iconText: 'CA', iconBg: '#E0FAF5', iconColor: '#006058', meta: 'Signed 15 Mar 2026 · PDF · 2 pages', available: true, pending: false },
  { id: 'd2', label: 'HPI check certificate', iconText: 'HPI', iconBg: '#D1FAE5', iconColor: '#064E3B', meta: 'Clear result · Checked 17 Mar 2026 · PDF', available: true, pending: false },
  { id: 'd3', label: 'Condition report', iconText: 'CR', iconBg: '#DBEAFE', iconColor: '#1E40AF', meta: 'Completed 18 Mar 2026 · Grade: Good · PDF', available: true, pending: false },
  { id: 'd4', label: 'V5C logbook', iconText: 'V5', iconBg: '#FFF8E6', iconColor: '#92400E', meta: 'Held by iAutoMotive · Transfer notified to DVLA at point of sale', available: false, pending: false },
  { id: 'd5', label: 'Sale confirmation', iconText: 'SA', iconBg: '#F7F8F9', iconColor: '#8492A8', meta: 'Available once sale completes', available: false, pending: true },
  { id: 'd6', label: 'Final net sheet', iconText: 'NS', iconBg: '#F7F8F9', iconColor: '#8492A8', meta: 'Exact payout breakdown — available at close', available: false, pending: true },
];

/* ── Lot manager ── */
export const MOCK_LOT_MANAGER: LotManager = {
  name: 'Tom B.',
  role: 'Lot Manager',
  location: 'Birmingham',
  responseTime: 'Typically replies in < 1 hour',
};

/* ── Messages ── */
export const MOCK_MESSAGES: SellerMessage[] = [
  { id: 'm1', role: 'them', senderLabel: 'Tom B.', text: 'Hi James — your Golf is live on AutoTrader. We\'ve already had 84 views in the first 6 days which is strong for this model. I\'ll update you the moment we get a serious buyer.' },
  { id: 'm2', role: 'me', text: 'Thanks Tom, really appreciate the update. Any idea how long it usually takes to sell a GTI?' },
  { id: 'm3', role: 'them', text: 'GTIs typically go in 30–40 days on the lot. Yours is priced well so I\'d expect the lower end of that range. Will keep you posted.' },
];

/* ── Latest updates ── */
export const MOCK_UPDATES: SellerUpdate[] = [
  { id: 'u1', dotColor: 'green', timestamp: '6 days ago', text: 'Your vehicle is live on AutoTrader and the iAutoMotive storefront. We\'ve had 84 views in the first 6 days.' },
  { id: 'u2', dotColor: 'amber', timestamp: '4 days ago', text: 'Price adjusted from £21,600 to £21,200 — our pricing engine detected 3 similar vehicles reduced this week.' },
  { id: 'u3', dotColor: 'teal', timestamp: '2 days ago', text: 'A buyer shortlisted your car and made an enquiry. Our team responded within 12 minutes.' },
];

/* ── Format utility ── */
export function formatSellerGBP(n: number): string {
  return '£' + n.toLocaleString('en-GB');
}

/* ── Recon stages (ordered) ── */
export const RECON_STAGES: { key: ReconStage; label: string }[] = [
  { key: 'offer_accepted', label: 'Offer accepted' },
  { key: 'collected', label: 'Collected' },
  { key: 'inspected', label: 'Inspected' },
  { key: 'reconditioned', label: 'Reconditioned' },
  { key: 'live', label: 'Live for sale' },
  { key: 'sale_agreed', label: 'Sale agreed' },
  { key: 'paid', label: 'You get paid' },
];
