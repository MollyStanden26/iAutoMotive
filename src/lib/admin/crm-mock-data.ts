// lib/admin/crm-mock-data.ts — All static mock data for the CRM Dashboard
// Swap this for real API calls later — components don't change.

export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'offer_sent' | 'signed';
export type CallbackStatus = 'overdue' | 'due_now' | 'upcoming';
export type DeltaType = 'up' | 'down' | 'warn' | 'neutral';

export interface CrmKpi {
  label: string;
  value: string | number;
  delta: string;
  deltaType: DeltaType;
}

export interface Lead {
  id: string;
  seller: string;
  vehicle: string;
  score: number;
  status: LeadStatus;
  assignee: string | null;
  lastContact: string | null;
}

export interface Callback {
  time: string;
  seller: string;
  vehicle: string;
  caller: string;
  status: CallbackStatus;
}

export interface Caller {
  name: string;
  initials: string;
  avatarBg: string;
  dials: number;
  contactRate: number;
  signedWeek: number;
  rank: number;
  flag: boolean;
}

export interface Target {
  label: string;
  target: number;
  actual: number;
  unit: 'count' | 'percent';
}

export interface ScriptSection {
  label: string;
  text: string;
}

export const crmDashboardData = {

  kpis: [
    { label: 'Dials today',       value: 0, delta: 'No data yet',  deltaType: 'neutral' as const },
    { label: 'Contacted',         value: 0, delta: 'No data yet',  deltaType: 'neutral' as const },
    { label: 'Offers sent',       value: 0, delta: 'No data yet',  deltaType: 'neutral' as const },
    { label: 'Signed today',      value: 0, delta: 'No data yet',  deltaType: 'neutral' as const },
    { label: 'Callbacks overdue', value: 0, delta: 'None overdue', deltaType: 'neutral' as const },
  ] as CrmKpi[],

  leads: [] as Lead[],

  activeDiallerLead: null as null | {
    seller: string; vehicle: string; askingPrice: string; mileage: string;
    score: number; phone: string; activeCaller: string;
    priorContacts: number; queuePosition: number; queueTotal: number;
  },

  callbacks: [] as Callback[],

  callers: [] as Caller[],

  targets: [
    { label: 'Daily dials',       target: 0, actual: 0, unit: 'count'   as const },
    { label: 'Contact rate',      target: 0, actual: 0, unit: 'percent' as const },
    { label: 'Offers sent',       target: 0, actual: 0, unit: 'count'   as const },
    { label: 'Signed deals',      target: 0, actual: 0, unit: 'count'   as const },
    { label: 'Callbacks cleared', target: 0, actual: 0, unit: 'percent' as const },
  ] as Target[],

  paceForecast: {
    projectedDials:   '—',
    projectedSigned:  '—',
    interventionFlag: '—',
  },

  scriptSections: [
    {
      label: 'Opening',
      text: "Hi, is that [seller name]? Calling from iAutoMotive about your [vehicle] on AutoTrader. We're a consignment platform — we sell it at full retail and you keep the proceeds. No commission fee. Do you have 2 minutes?",
    },
    {
      label: 'Value proposition',
      text: "We're currently offering around [offer price] as a listing price — based on live AutoTrader data. There's no commission fee, so you'd receive [net estimate] in your account, without doing any viewings.",
    },
    {
      label: 'Objection — "I\'d rather sell privately"',
      text: "Totally understand. We handle everything — collection, prep, every buyer enquiry. Most sellers get paid within 5–6 weeks with zero involvement after drop-off.",
    },
    {
      label: 'Close',
      text: "If that sounds good, I can get a formal offer over to you today — just need 5 minutes to confirm the details. Would [time] work for a quick callback?",
    },
  ] as ScriptSection[],

  avgCallDuration: '—',
  aiOutreachToday: 0,
};
