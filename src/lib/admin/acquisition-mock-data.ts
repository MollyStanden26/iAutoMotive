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
  activeSellers: number;
  newThisWeek: number;
  newThisWeekDelta: number;
  awaitingKyc: number;
  awaitingKycOverdue: number;
  liveConsignments: number;
  liveConsignmentsPct: number;
  awaitingPayout: number;
  awaitingPayoutOldestDays: number;
  /// Retained — still consumed by other panels (not KPI strip)
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
  status: 'scheduled',
  lastRunMinutesAgo: 0,
  listingsFoundToday: 0,
  listingsDelta: 'No data yet',
  outreachSentToday: 0,
  outreachQueued: 0,
  nextRunMinutes: 0,
  nextRunTargets: 0,
};

/* ── KPIs ── */
export const ACQUISITION_KPIS: AcquisitionKpis = {
  activeSellers: 0,
  newThisWeek: 0,
  newThisWeekDelta: 0,
  awaitingKyc: 0,
  awaitingKycOverdue: 0,
  liveConsignments: 0,
  liveConsignmentsPct: 0,
  awaitingPayout: 0,
  awaitingPayoutOldestDays: 0,
  responded: 0,
  responseRate: '—',
  negotiating: 0,
  aiHandling: 0,
  escalated: 0,
  acceptedToday: 0,
  acceptedDelta: 0,
};

/* ── 15 leads sorted by score desc ── */
export const ACQUISITION_LEADS: AcquisitionLead[] = [];

/* ── Escalations ── */
export const ESCALATIONS: Escalation[] = [];

/* ── Agent status ── */
export const AGENT_STATS: AgentStat[] = [];

/* ── Today's funnel ── */
export const FUNNEL_STEPS: FunnelStep[] = [];

/* ── Offer performance ── */
export const OFFER_PERFORMANCE: OfferMetric[] = [];
