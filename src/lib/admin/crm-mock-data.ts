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
    { label: 'Dials today',       value: 247, delta: '↑ 18% vs yesterday', deltaType: 'up'      as const },
    { label: 'Contacted',         value: 84,  delta: '34% contact rate',    deltaType: 'neutral' as const },
    { label: 'Offers sent',       value: 12,  delta: '14% of contacts',     deltaType: 'neutral' as const },
    { label: 'Signed today',      value: 3,   delta: 'On target',           deltaType: 'up'      as const },
    { label: 'Callbacks overdue', value: 3,   delta: 'Action needed',       deltaType: 'down'    as const },
  ] as CrmKpi[],

  leads: [
    { id: 'AC-L-001', seller: 'James Holloway',  vehicle: '2021 BMW 3 Series 320d · £21,500 · 34k mi',     score: 87, status: 'negotiating' as const, assignee: 'Sarah K.',  lastContact: '2 hrs ago' },
    { id: 'AC-L-002', seller: 'Priya Sharma',    vehicle: '2020 VW Golf GTI · £18,200 · 41k mi',           score: 81, status: 'offer_sent'  as const, assignee: 'Sarah K.',  lastContact: '4 hrs ago' },
    { id: 'AC-L-003', seller: 'Michael Chen',    vehicle: '2022 Audi A4 2.0 TDi · £24,900 · 19k mi',      score: 79, status: 'contacted'   as const, assignee: 'Jordan M.', lastContact: 'Yesterday' },
    { id: 'AC-L-004', seller: 'Rachel Davies',   vehicle: '2021 Mercedes A200 · £19,750 · 22k mi',         score: 72, status: 'new'         as const, assignee: null,         lastContact: null },
    { id: 'AC-L-005', seller: 'Tom Barker',      vehicle: '2019 Toyota RAV4 Hybrid · £17,400 · 55k mi',    score: 68, status: 'new'         as const, assignee: null,         lastContact: null },
    { id: 'AC-L-006', seller: 'Sophie Williams', vehicle: '2020 Ford Focus ST · £16,800 · 38k mi',         score: 65, status: 'contacted'   as const, assignee: 'James T.',  lastContact: '3 hrs ago' },
    { id: 'AC-L-007', seller: 'David Kim',       vehicle: '2021 Hyundai Tucson 1.6T · £18,500 · 28k mi',   score: 58, status: 'new'         as const, assignee: null,         lastContact: null },
  ] as Lead[],

  activeDiallerLead: {
    seller:        'James Holloway',
    vehicle:       '2021 BMW 3 Series 320d M Sport',
    askingPrice:   '£21,500',
    mileage:       '34k mi',
    score:         87,
    phone:         '07914 442 881',
    activeCaller:  'Sarah K.',
    priorContacts: 2,
    queuePosition: 1,
    queueTotal:    14,
  },

  callbacks: [
    { time: 'NOW',   seller: 'Rachel Davies',   vehicle: 'BMW 3',    caller: 'Sarah K.',  status: 'overdue'  as const },
    { time: 'NOW',   seller: 'Andrew Park',      vehicle: 'Audi A3',  caller: 'James T.',  status: 'overdue'  as const },
    { time: 'NOW',   seller: 'Tom Barker',       vehicle: 'RAV4',     caller: 'Jordan M.', status: 'due_now'  as const },
    { time: '14:30', seller: 'Sophie Williams',  vehicle: 'Focus ST', caller: 'James T.',  status: 'upcoming' as const },
    { time: '16:00', seller: 'Priya Sharma',     vehicle: 'Golf GTI', caller: 'Sarah K.',  status: 'upcoming' as const },
  ] as Callback[],

  callers: [
    { name: 'Sarah K.',  initials: 'SK', avatarBg: '#008C7C', dials: 82, contactRate: 41, signedWeek: 3, rank: 1, flag: false },
    { name: 'Jordan M.', initials: 'JM', avatarBg: '#3B6D11', dials: 74, contactRate: 36, signedWeek: 1, rank: 2, flag: false },
    { name: 'Aisha T.',  initials: 'AT', avatarBg: '#854F0B', dials: 61, contactRate: 31, signedWeek: 1, rank: 3, flag: false },
    { name: 'James T.',  initials: 'JT', avatarBg: '#534AB7', dials: 30, contactRate: 18, signedWeek: 0, rank: 4, flag: true  },
  ] as Caller[],

  targets: [
    { label: 'Daily dials',       target: 300, actual: 247, unit: 'count'   as const },
    { label: 'Contact rate',      target: 30,  actual: 34,  unit: 'percent' as const },
    { label: 'Offers sent',       target: 10,  actual: 12,  unit: 'count'   as const },
    { label: 'Signed deals',      target: 3,   actual: 3,   unit: 'count'   as const },
    { label: 'Callbacks cleared', target: 100, actual: 62,  unit: 'percent' as const },
  ] as Target[],

  paceForecast: {
    projectedDials:   '~298',
    projectedSigned:  '3–4',
    interventionFlag: 'James T.',
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

  avgCallDuration: '3m 42s',
  aiOutreachToday: 18,
};
