// lib/admin/settings-defaults.ts — All types + default values for the Settings page

export type AiPricingMode     = 'auto' | 'suggest' | 'off';
export type ListingTemplate   = 'full' | 'compact' | 'minimal';
export type IntegrationStatus = 'connected' | 'not-configured' | 'todo';

export interface PlatformConfig {
  platformFeePct: number;
  returnWindowDays: number;
  gpuTargetGbp: number;
  priceDecay1Days: number;
  priceDecay1Pct: number;
  priceDecay2Days: number;
  priceDecay2Pct: number;
  responseSlaHours: number;
  reconSlaHours: number;
  aiPricingMode: AiPricingMode;
}

export interface LotConfig {
  id: string;
  name: string;
  city: string;
  capacity: number;
  address: string;
  hours: string;
  manager: string | null;
  active: boolean;
}

export interface Integration {
  id: string;
  name: string;
  sub: string;
  logoLabel: string;
  logoBg: string;
  logoColor: string;
  status: IntegrationStatus;
  maskedKey: string | null;
  actionLabel: string;
  actionVariant: 'default' | 'teal';
  inlineInput: boolean;
}

export interface NotificationRule {
  id: string;
  event: string;
  sub: string;
  channels: { email: boolean; sms: boolean; push: boolean };
  recipient: string;
}

export interface BrandingConfig {
  platformName: string;
  domain: string;
  primaryColor: string;
  accentColor: string;
  listingTemplate: ListingTemplate;
  showFinanceOptions: boolean;
}

/* ── Platform config defaults ── */
export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  platformFeePct: 0,
  returnWindowDays: 14,
  gpuTargetGbp: 1500,
  priceDecay1Days: 45,
  priceDecay1Pct: 3,
  priceDecay2Days: 60,
  priceDecay2Pct: 5,
  responseSlaHours: 4,
  reconSlaHours: 48,
  aiPricingMode: 'auto',
};

/* ── Lot config defaults ── */
export const DEFAULT_LOT_CONFIG: LotConfig[] = [
  { id: 'lot1', name: 'Lot 1', city: 'Birmingham', capacity: 60, address: '14 Tyburn Rd, B24 9HN',   hours: 'Mon–Sat 8–6', manager: 'Tom B.',  active: true },
  { id: 'lot2', name: 'Lot 2', city: 'Manchester', capacity: 60, address: 'Trafford Park, M17 1PZ',  hours: 'Mon–Sat 8–6', manager: 'Mark O.', active: true },
  { id: 'lot3', name: 'Lot 3', city: 'Bristol',    capacity: 60, address: 'Avonmouth Way, BS11 9HP', hours: 'Mon–Sat 8–6', manager: null,      active: true },
];

/* ── Integrations defaults ── */
export const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: 'autotrader', name: 'AutoTrader',            sub: 'Vehicle sourcing & listing feed',                       logoLabel: 'AT', logoBg: '#0A1D1A', logoColor: '#4DD9C7', status: 'connected',       maskedKey: 'sk_at_••••••••3f2a',   actionLabel: 'Reconnect', actionVariant: 'default', inlineInput: false },
  { id: 'stripe',     name: 'Stripe',                sub: 'Payment processing & disbursements',                    logoLabel: 'St', logoBg: '#1A0520', logoColor: '#C080F0', status: 'connected',       maskedKey: 'sk_live_••••••••8c1d', actionLabel: 'Reconnect', actionVariant: 'default', inlineInput: false },
  { id: 'fca',        name: 'FCA broker gateway',    sub: 'Finance referral & approved broker language',           logoLabel: 'FC', logoBg: '#1A0505', logoColor: '#F87171', status: 'connected',       maskedKey: 'fca_••••••••9d4e',     actionLabel: 'Reconnect', actionVariant: 'default', inlineInput: false },
  { id: 'twilio',     name: 'Twilio',                sub: 'SMS alerts & call centre dialler',                      logoLabel: 'Tw', logoBg: '#1A0010', logoColor: '#F07070', status: 'connected',       maskedKey: 'AC••••••••7b2f',       actionLabel: 'Reconnect', actionVariant: 'default', inlineInput: false },
  { id: 'smtp',       name: 'Email provider (SMTP)', sub: 'Transactional emails — seller updates, buyer confirms', logoLabel: 'Em', logoBg: '#111D30', logoColor: '#4A556B', status: 'not-configured',  maskedKey: null,                   actionLabel: 'Configure', actionVariant: 'teal',    inlineInput: false },
  // TODO: ICO registration number required before live launch. See compliance checklist.
  { id: 'ico',        name: 'ICO registration',      sub: 'Data protection registration reference',                logoLabel: 'IC', logoBg: '#111D30', logoColor: '#4A556B', status: 'todo',            maskedKey: null,                   actionLabel: 'Save',      actionVariant: 'teal',    inlineInput: true  },
];

/* ── Notification rules defaults ── */
export const DEFAULT_NOTIFICATION_RULES: NotificationRule[] = [
  { id: 'aml',      event: 'AML hold triggered',         sub: 'Compliance flag on a deal',                 channels: { email: true,  sms: true,  push: false }, recipient: 'Super Admin'     },
  { id: 'funded',   event: 'Deal funded',                 sub: 'Finance confirmed, return window starts',   channels: { email: true,  sms: false, push: true  }, recipient: 'Sales + Finance' },
  { id: 'payout',   event: 'Seller payout ready',         sub: 'Funds available for disbursement',          channels: { email: true,  sms: false, push: false }, recipient: 'Finance'         },
  { id: 'capacity', event: 'Lot near capacity',           sub: 'Lot reaches 85% of vehicle limit',          channels: { email: true,  sms: false, push: true  }, recipient: 'Super Admin'     },
  { id: 'return',   event: 'Return window day 10',        sub: 'Buyer approaching end of return window',    channels: { email: true,  sms: false, push: false }, recipient: 'Sales assigned'  },
  { id: 'coaching', event: 'Staff underperformance flag', sub: 'AI coaching flag raised for a team member', channels: { email: true,  sms: false, push: false }, recipient: 'Super Admin'     },
  { id: 'decay',    event: 'Price decay applied',         sub: 'AI automatically reduced a listing price',  channels: { email: false, sms: false, push: true  }, recipient: 'Lot Manager'     },
];

/* ── Branding defaults ── */
export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  platformName: 'iAutoMotive',
  domain: 'iautomotive.co.uk',
  primaryColor: '#008C7C',
  accentColor: '#4DD9C7',
  listingTemplate: 'full',
  showFinanceOptions: true,
};
