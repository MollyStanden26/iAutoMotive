// lib/admin/acquisition-mock-data.ts — All static mock data for the Acquisition Pipeline
// Swap this for real API calls later — components don't change.

export type LeadStatus = 'new' | 'contacted' | 'responded' | 'negotiating' | 'accepted' | 'escalated';
export type ScoutTier = 'hot' | 'warm' | 'cold';

export interface AcquisitionLead {
  id: string;
  score: number;
  tier: ScoutTier;
  year: number;
  make: string;
  model: string;
  location: string;
  sellerName: string;
  askingPrice: number;
  offerPrice: number;
  status: LeadStatus;
  aiAction: string;
  ageLabel: string;
}

export interface ScraperHealth {
  status: 'running' | 'scheduled' | 'error';
  lastRunMinutesAgo: number;
  listingsFoundToday: number;
  listingsDelta: string;
  outreachSentToday: number;
  outreachQueued: number;
  nextRunMinutes: number;
  nextRunTargets: number;
}

export interface AcquisitionKpis {
  activeLeads: number;
  responded: number;
  responseRate: string;
  negotiating: number;
  aiHandling: number;
  escalated: number;
  acceptedToday: number;
  acceptedDelta: number;
}

export type EscalationSeverity = 'now' | 'high' | 'medium';

export interface Escalation {
  id: string;
  severity: EscalationSeverity;
  title: string;
  sub: string;
  agentNote: string;
  ageLabel: string;
}

export type AgentStatus = 'live' | 'paused' | 'error';

export interface AgentStat {
  name: string;
  status: AgentStatus;
  stat: string;
}

export interface FunnelStep {
  label: string;
  value: number;
  pct: number;
  fill: string;
}

export interface OfferMetric {
  label: string;
  value: string;
  color: string;
}

/* ── Scraper health ── */
export const SCRAPER_HEALTH: ScraperHealth = {
  status: 'running',
  lastRunMinutesAgo: 14,
  listingsFoundToday: 1840,
  listingsDelta: '↑ 8% vs yesterday',
  outreachSentToday: 347,
  outreachQueued: 247,
  nextRunMinutes: 46,
  nextRunTargets: 8,
};

/* ── KPIs ── */
export const ACQUISITION_KPIS: AcquisitionKpis = {
  activeLeads: 247,
  responded: 58,
  responseRate: '23.5%',
  negotiating: 23,
  aiHandling: 20,
  escalated: 3,
  acceptedToday: 7,
  acceptedDelta: 2,
};

/* ── 15 leads sorted by score desc ── */
export const ACQUISITION_LEADS: AcquisitionLead[] = [
  { id: 'lead-001', score: 94, tier: 'hot', year: 2022, make: 'BMW', model: '3 Series',
    location: 'Birmingham', sellerName: 'John M.', askingPrice: 18400, offerPrice: 16200,
    status: 'escalated', aiAction: 'Paused — counter above limit', ageLabel: '2m' },
  { id: 'lead-002', score: 91, tier: 'hot', year: 2021, make: 'Audi', model: 'A4 2.0 TDi',
    location: 'Manchester', sellerName: 'Priya S.', askingPrice: 17800, offerPrice: 15900,
    status: 'escalated', aiAction: 'Awaiting human — legal question', ageLabel: '18m' },
  { id: 'lead-003', score: 88, tier: 'hot', year: 2022, make: 'Mercedes', model: 'A200',
    location: 'Bristol', sellerName: 'Sara L.', askingPrice: 21500, offerPrice: 18800,
    status: 'accepted', aiAction: 'DocuSign sent — awaiting sign', ageLabel: '1h' },
  { id: 'lead-004', score: 86, tier: 'hot', year: 2020, make: 'BMW', model: '5 Series',
    location: 'Birmingham', sellerName: 'Tom R.', askingPrice: 22100, offerPrice: 19400,
    status: 'negotiating', aiAction: 'Counter-offer reply drafted', ageLabel: '3h' },
  { id: 'lead-005', score: 84, tier: 'hot', year: 2021, make: 'Volkswagen', model: 'Golf GTI',
    location: 'Leeds', sellerName: 'Dan W.', askingPrice: 16200, offerPrice: 14600,
    status: 'escalated', aiAction: 'Day 7 — no response', ageLabel: '6h' },
  { id: 'lead-006', score: 82, tier: 'hot', year: 2021, make: 'Toyota', model: 'RAV4 Hybrid',
    location: 'Bristol', sellerName: 'Fiona K.', askingPrice: 24900, offerPrice: 21800,
    status: 'responded', aiAction: 'Follow-up message sent', ageLabel: '4h' },
  { id: 'lead-007', score: 79, tier: 'warm', year: 2020, make: 'Audi', model: 'Q3 Sport',
    location: 'Manchester', sellerName: 'Dev P.', askingPrice: 19800, offerPrice: 17200,
    status: 'negotiating', aiAction: 'Negotiation in progress', ageLabel: '2h' },
  { id: 'lead-008', score: 76, tier: 'warm', year: 2021, make: 'Ford', model: 'Focus ST',
    location: 'Leeds', sellerName: 'Cath B.', askingPrice: 14700, offerPrice: 13100,
    status: 'responded', aiAction: 'Awaiting seller reply', ageLabel: '5h' },
  { id: 'lead-009', score: 74, tier: 'warm', year: 2022, make: 'Honda', model: 'Civic Type R',
    location: 'Birmingham', sellerName: 'Mo A.', askingPrice: 28500, offerPrice: 24900,
    status: 'contacted', aiAction: 'Outreach sent — template B', ageLabel: '3h' },
  { id: 'lead-010', score: 72, tier: 'warm', year: 2022, make: 'Nissan', model: 'Leaf Plus',
    location: 'Bristol', sellerName: 'Eve T.', askingPrice: 19400, offerPrice: 17100,
    status: 'contacted', aiAction: 'Outreach sent — template A', ageLabel: '6h' },
  { id: 'lead-011', score: 71, tier: 'warm', year: 2021, make: 'Hyundai', model: 'Tucson',
    location: 'Manchester', sellerName: 'Raj N.', askingPrice: 20200, offerPrice: 17600,
    status: 'responded', aiAction: 'Reply: send me the offer', ageLabel: '1h' },
  { id: 'lead-012', score: 69, tier: 'warm', year: 2021, make: 'Skoda', model: 'Octavia vRS',
    location: 'Leeds', sellerName: 'Gill F.', askingPrice: 15800, offerPrice: 14000,
    status: 'new', aiAction: 'Outreach queued', ageLabel: '28m' },
  { id: 'lead-013', score: 67, tier: 'warm', year: 2022, make: 'Kia', model: 'Sportage GT',
    location: 'Birmingham', sellerName: 'Leon H.', askingPrice: 22400, offerPrice: 19600,
    status: 'contacted', aiAction: 'Waiting for reply', ageLabel: '8h' },
  { id: 'lead-014', score: 63, tier: 'warm', year: 2020, make: 'Mazda', model: 'CX-5 Sport',
    location: 'Bristol', sellerName: 'Anna C.', askingPrice: 18600, offerPrice: 16200,
    status: 'accepted', aiAction: 'Agreement signed — intake booked', ageLabel: '2d' },
  { id: 'lead-015', score: 61, tier: 'warm', year: 2021, make: 'SEAT', model: 'Leon Cupra',
    location: 'Manchester', sellerName: 'Tyler B.', askingPrice: 16900, offerPrice: 14800,
    status: 'new', aiAction: 'Scout scored — offer pending', ageLabel: '12m' },
];

/* ── Escalations ── */
export const ESCALATIONS: Escalation[] = [
  { id: 'esc-001', severity: 'now',
    title: 'Counter-offer above 8% ceiling',
    sub: '2019 BMW 3 Series · John M. offering £13,800',
    agentNote: 'AI paused · awaiting decision', ageLabel: '2m' },
  { id: 'esc-002', severity: 'now',
    title: 'Legal question from seller',
    sub: '2021 Audi A4 · Priya S. asked about V5C lien',
    agentNote: 'Negotiation agent cannot respond', ageLabel: '18m' },
  { id: 'esc-003', severity: 'high',
    title: 'Seller unresponsive — Day 7',
    sub: '2020 VW Golf GTI · No response to 4 follow-ups',
    agentNote: 'Recommend: call manually today', ageLabel: '6h' },
];

/* ── Agent status ── */
export const AGENT_STATS: AgentStat[] = [
  { name: 'Scout agent',       status: 'live', stat: 'Scored 1,840 today' },
  { name: 'Pricer agent',      status: 'live', stat: '247 offers generated' },
  { name: 'Outreach agent',    status: 'live', stat: '347 sent · 3 queued' },
  { name: 'Negotiation agent', status: 'live', stat: '20 active convos' },
  { name: 'Follow-up agent',   status: 'live', stat: '89 sequences running' },
  { name: 'Intake scheduler',  status: 'live', stat: '7 intakes today' },
];

/* ── Today's funnel ── */
export const FUNNEL_STEPS: FunnelStep[] = [
  { label: 'Scraped',     value: 1840, pct: 100, fill: '#172D4D' },
  { label: 'Hot/Warm',    value: 1178, pct: 64,  fill: '#1D5A4D' },
  { label: 'Outreached',  value: 347,  pct: 19,  fill: '#1D5A4D' },
  { label: 'Responded',   value: 58,   pct: 16,  fill: '#1F4020' },
  { label: 'Negotiating', value: 23,   pct: 40,  fill: '#1F2500' },
  { label: 'Accepted',    value: 7,    pct: 30,  fill: '#224F12' },
];

/* ── Offer performance ── */
export const OFFER_PERFORMANCE: OfferMetric[] = [
  { label: 'Avg offer price',        value: '£14,200',    color: '#F1F5F9' },
  { label: 'Avg counter-offer delta', value: '+£380',     color: '#F5A623' },
  { label: 'First offer accepted',   value: '31 today',   color: '#34D399' },
  { label: 'Counter accepted (AI)',  value: '14 today',   color: '#4DD9C7' },
  { label: 'Offers expired (7d)',    value: '8',          color: '#6B7A90' },
  { label: 'Best template today',    value: 'Template A', color: '#34D399' },
];
