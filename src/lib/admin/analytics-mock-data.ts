// lib/admin/analytics-mock-data.ts — All static mock data for the Analytics Dashboard

export type AnalyticsPeriod = '7d' | '30d' | 'mtd' | '90d' | 'ytd';

export const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// --- Chart data ---
export const revenueChartData = DAYS.map((day, i) => ({
  day,
  gross: [4800,6200,5100,7400,6800,5200,5700][i],
  fee:   [0,0,0,0,0,0,0][i],
}));

export const acquisitionChartData = DAYS.map((day, i) => ({
  day,
  outreach:  [142,158,139,162,175,148,126][i],
  responded: [31,38,29,42,44,34,29][i],
}));

export const avgDaysChartData = DAYS.map((day, i) => ({
  day,
  avgDays: [25.2,24.8,24.1,23.6,23.0,22.7,22.4][i],
}));

export const revenueFeeChartData = DAYS.map((day, i) => ({
  day,
  fee: [0,0,0,0,0,0,0][i],
}));

export const storefrontChartData = DAYS.map((day, i) => ({
  day,
  visits: [480,560,490,620,640,580,470][i],
}));

export const payoutChartData = DAYS.map((day, i) => ({
  day,
  payout: [0,14820,0,30340,17960,0,39280][i],
}));

export const revenueBreakdown = [
  { name: "Platform fee", value: 0,     fill: "#4DD9C7" },
  { name: "Recon margin", value: 2400,  fill: "#FCD34D" },
  { name: "Other",        value: 1600,  fill: "#172D4D" },
];

// --- Overview tab ---
export const overviewKpis = [
  { label: 'Revenue (7d)',     value: '£41.2k', delta: '↑ 12% vs prior 7d', deltaType: 'up' as const,      valueColor: '#4DD9C7' },
  { label: 'Deals closed',    value: '9',       delta: '↑ 2 vs prior 7d',   deltaType: 'up' as const },
  { label: 'Avg GPU',         value: '£1,046',  delta: 'Per deal avg',       deltaType: 'neutral' as const, valueColor: '#F5A623' },
  { label: 'Leads contacted', value: '247',     delta: '↑ 18% vs prior 7d', deltaType: 'up' as const },
  { label: 'Vehicles live',   value: '142',     delta: '4 aging >45d',       deltaType: 'warn' as const },
];

export const acquisitionFunnel = [
  { label: 'Listings scraped', value: 1840, pct: 100, fill: '#172D4D' },
  { label: 'Hot/Warm scored',  value: 1178, pct: 64,  fill: '#1D5A4D', rateLbl: '64%',  rateColor: '#34D399' },
  { label: 'Outreach sent',   value: 1050, pct: 57,  fill: '#1D5A4D', rateLbl: '57%',  rateColor: '#4DD9C7' },
  { label: 'Responded',       value: 247,  pct: 23,  fill: '#1F4020', rateLbl: '24%',  rateColor: '#4DD9C7' },
  { label: 'Signed',          value: 52,   pct: 5,   fill: '#224F12', rateLbl: '4.9%', rateColor: '#34D399' },
  { label: 'Intakes booked',  value: 38,   pct: 3,   fill: '#224F12', rateLbl: '3.6%', rateColor: '#34D399' },
];

export const dealsByStage = [
  { label: 'Reserved',          value: 8, fill: '#0C1428', color: '#4DD9C7' },
  { label: 'ID verified',       value: 6, fill: '#0C1428', color: '#4DD9C7' },
  { label: 'Docs sent',         value: 5, fill: '#0C1428', color: '#4DD9C7' },
  { label: 'Funded',            value: 4, fill: '#0B2B1A', color: '#34D399' },
  { label: 'Pending delivery',  value: 3, fill: '#2B1A00', color: '#F5A623' },
  { label: 'Return window',     value: 2, fill: '#2B1A00', color: '#F5A623' },
];

export const inventoryHealth = [
  { label: '0–14 days',  value: 58, fill: '#34D399' },
  { label: '15–30 days', value: 41, fill: '#4DD9C7' },
  { label: '31–45 days', value: 29, fill: '#F5A623' },
  { label: '46–60 days', value: 10, fill: '#F5A623' },
  { label: '>60 days',   value: 4,  fill: '#F87171' },
];

export const agentActivity = [
  { label: 'Listings scraped',      value: 1840, fill: '#0C1428', color: '#4DD9C7' },
  { label: 'Outreach sent',         value: 1050, fill: '#0C1428', color: '#4DD9C7' },
  { label: 'Negotiations handled',  value: 184,  fill: '#1E2D4A', color: '#F1F5F9' },
  { label: 'Reprices triggered',    value: 29,   fill: '#2B1A00', color: '#F5A623' },
  { label: 'Anomalies flagged',     value: 5,    fill: '#2B0F0F', color: '#F87171' },
];

// --- Acquisition tab ---
export const acquisitionKpis = [
  { label: 'Listings scraped',    value: '1,840', delta: '↑ 8% vs prior 7d',    deltaType: 'up' as const,      valueColor: '#4DD9C7' },
  { label: 'Outreach sent',       value: '1,050', delta: '57% of qualified',     deltaType: 'neutral' as const },
  { label: 'Response rate',       value: '23.5%', delta: '↑ 2.1pp vs prior 7d', deltaType: 'up' as const,      valueColor: '#34D399' },
  { label: 'Signed consignments', value: '52',    delta: '4.9% of outreach',    deltaType: 'neutral' as const },
  { label: 'Avg offer price',     value: '£14,200', delta: 'Based on 52 signed', deltaType: 'neutral' as const, valueColor: '#F5A623' },
];

export const leadSourceData = {
  boxes: [
    { label: 'AutoTrader',      value: '1,612 listings · 87.6%' },
    { label: 'Facebook Mktpl',  value: '164 listings · 8.9%' },
    { label: 'Direct enquiry',  value: '64 leads · 3.5%' },
    { label: 'Scout conversion', value: 'Hot: 382 · Warm: 796' },
  ],
  stats: [
    { label: 'Avg days to first contact',         value: '18 min',   color: '#34D399' },
    { label: 'Avg days from outreach to signed',   value: '4.2 days', color: '#4DD9C7' },
    { label: 'Follow-up sequence completion',       value: '68%',      color: '#F1F5F9' },
    { label: 'Escalated to human agent',            value: '23',       color: '#F5A623' },
  ],
};

export const topModels = [
  { name: 'BMW 3 Series',      avgScore: 81, signed: 14 },
  { name: 'VW Golf GTI',       avgScore: 78, signed: 9 },
  { name: 'Audi A4',           avgScore: 76, signed: 8 },
  { name: 'Mercedes A-Class',  avgScore: 72, signed: 7 },
  { name: 'Toyota RAV4',       avgScore: 69, signed: 5 },
];

export const templatePerformance = [
  { name: 'Template A "price-led"',  rate: 26.1, fillPct: 88, color: '#34D399' },
  { name: 'Template B "convenience"', rate: 22.8, fillPct: 77, color: '#4DD9C7' },
  { name: 'Template C "urgency"',     rate: 19.4, fillPct: 65, color: '#F5A623' },
  { name: 'Template D "new"',         rate: 14.2, fillPct: 48, color: '#F87171' },
];

export const negotiationOutcomes = [
  { label: 'Agreed first offer',       value: 31,      fill: '#34D399', pct: 100 },
  { label: 'Counter-offer accepted',   value: 14,      fill: '#4DD9C7', pct: 45 },
  { label: 'Human escalation',         value: 23,      fill: '#F5A623', pct: 74 },
  { label: 'Declined after outreach',  value: 92,      fill: '#F87171', pct: 100 },
  { label: 'Avg counter-offer delta',  value: '+£380', fill: '#F5A623', pct: 0, noBar: true },
];

// --- Inventory tab ---
export const inventoryKpis = [
  { label: 'Total in stock',    value: '142',  delta: 'Across all lots',      deltaType: 'neutral' as const },
  { label: 'Avg days on lot',   value: '22.4', delta: '↓ 3.1d vs prior 7d',  deltaType: 'up' as const,      valueColor: '#34D399' },
  { label: 'In recon',          value: '31',   delta: '4 overdue target',     deltaType: 'neutral' as const, valueColor: '#F5A623' },
  { label: 'Front-line ready',  value: '111',  delta: '78% of stock',         deltaType: 'up' as const,      valueColor: '#4DD9C7' },
  { label: 'At-risk (>45d)',    value: '14',   delta: 'Action needed',        deltaType: 'down' as const,    valueColor: '#F87171' },
];

export const reconStages = [
  { label: 'Arrived',           value: 8,  fill: '#A78BFA', pct: 67 },
  { label: 'In mechanical',     value: 11, fill: '#F5A623', pct: 92, overdue: true },
  { label: 'In body/paint',     value: 6,  fill: '#F5A623', pct: 50 },
  { label: 'In detail/valet',   value: 4,  fill: '#A78BFA', pct: 33 },
  { label: 'Photography',       value: 2,  fill: '#4DD9C7', pct: 17 },
];

export const lotCapacity = [
  { name: 'Lot 1 Beaumont House', vehicles: 52, capacity: 87, color: '#F87171', warning: 'Near capacity' },
  { name: 'Lot 2 Manchester', vehicles: 48, capacity: 80, color: '#F5A623' },
  { name: 'Lot 3 Bristol',    vehicles: 42, capacity: 70, color: '#34D399' },
];

export const reconCosts = [
  { label: '£0–£200',            value: 38, fill: '#34D399', pct: 86 },
  { label: '£201–£500',          value: 44, fill: '#4DD9C7', pct: 100 },
  { label: '£501–£1,000',        value: 28, fill: '#F5A623', pct: 64 },
  { label: '£1,001–£2,000',      value: 8,  fill: '#F5A623', pct: 18 },
  { label: '>£2,000 escalated',  value: 3,  fill: '#F87171', pct: 7 },
];

export const aiPricingActions = [
  { label: 'Auto-repriced',                  value: '29',  color: '#4DD9C7' },
  { label: 'Day-30 decay (–3%)',              value: '8',   color: '#F5A623' },
  { label: 'Day-45 decay (–6%)',              value: '4',   color: '#F5A623' },
  { label: 'Day-60 decay (–10%)',             value: '2',   color: '#F87171' },
  { label: 'Manual override by staff',        value: '5',   color: '#F1F5F9' },
  { label: 'Wholesale escalation triggered',  value: '1',   color: '#F87171', badge: true },
];

// --- Revenue tab ---
export const revenueKpis = [
  { label: 'Platform fee revenue', value: '£0',       delta: 'No commission fee',    deltaType: 'neutral' as const, valueColor: '#4DD9C7' },
  { label: 'Gross vehicle sales',  value: '£134.5k', delta: '9 deals · 7d',         deltaType: 'neutral' as const },
  { label: 'Avg GPU',              value: '£1,046',  delta: 'Avg per deal closed',  deltaType: 'neutral' as const, valueColor: '#F5A623' },
  { label: 'Recon cost total',     value: '£4,820',  delta: 'Avg £536/vehicle',     deltaType: 'neutral' as const },
  { label: 'Payout liability',     value: '£82.3k',  delta: 'In escrow',            deltaType: 'neutral' as const, valueColor: '#F5A623' },
];

export const gpuByLot = [
  { name: 'Lot 1 Beaumont House', deals: 4, gpu: 1124, color: '#34D399' },
  { name: 'Lot 2 Manchester', deals: 3, gpu: 984,  color: '#4DD9C7' },
  { name: 'Lot 3 Bristol',    deals: 2, gpu: 922,  color: '#F5A623' },
];

export const marginBySegment = [
  { label: '£20k+ premium', gpu: 1680, pct: 100, color: '#34D399' },
  { label: '£15k–£20k',     gpu: 1140, pct: 68,  color: '#4DD9C7' },
  { label: '£10k–£15k',     gpu: 820,  pct: 49,  color: '#A78BFA' },
  { label: 'Under £10k',    gpu: 480,  pct: 29,  color: '#F5A623' },
];

export const revenueForecast = {
  aiText: 'Projected revenue in next 30 days based on current pipeline of 36 live deals',
  scenarios: [
    { label: 'Optimistic',    value: '£58,200', color: '#34D399' },
    { label: 'Base',          value: '£54,800', color: '#4DD9C7' },
    { label: 'Conservative',  value: '£51,600', color: '#F5A623' },
  ],
  payoutCashFlow: { label: 'Payout cash flow (30d)', value: '£196k', color: '#F1F5F9' },
};

// --- Buyers tab ---
export const buyersKpis = [
  { label: 'Storefront visits',     value: '3,840',  delta: '↑ 9% vs prior 7d',    deltaType: 'up' as const },
  { label: 'VDP views',             value: '9,210',  delta: 'Avg 2.4 per session',  deltaType: 'neutral' as const, valueColor: '#4DD9C7' },
  { label: 'Reservations',          value: '24',     delta: '0.6% of visits',       deltaType: 'neutral' as const },
  { label: 'Checkout completion',   value: '62.5%',  delta: '↑ 4.1pp vs prior 7d', deltaType: 'up' as const,      valueColor: '#34D399' },
  { label: 'Return requests',       value: '0',      delta: '0 returns this week',  deltaType: 'up' as const,      valueColor: '#34D399' },
];

export const checkoutFunnel = [
  { label: 'Reserved',         value: 24, pct: 100, fill: '#4DD9C7' },
  { label: 'Finance / cash',   value: 21, pct: 88,  fill: '#4DD9C7', rateLbl: '88%', rateColor: '#4DD9C7' },
  { label: 'Trade-in',         value: 19, pct: 79,  fill: '#4DD9C7', rateLbl: '79%', rateColor: '#F5A623' },
  { label: 'Deal reviewed',    value: 17, pct: 71,  fill: '#F5A623', rateLbl: '71%', rateColor: '#F5A623' },
  { label: 'Docs signed',      value: 16, pct: 67,  fill: '#34D399', rateLbl: '67%', rateColor: '#34D399' },
  { label: 'Delivery booked',  value: 15, pct: 63,  fill: '#34D399', rateLbl: '63%', rateColor: '#34D399' },
];

export const topVdps = [
  { id: 'v1', name: '2022 Audi A4',          views: 284, reservations: 3, color: '#4DD9C7' },
  { id: 'v2', name: '2021 BMW 3 Series',     views: 241, reservations: 2, color: '#4DD9C7' },
  { id: 'v3', name: '2020 VW Golf GTI',      views: 198, reservations: 4, color: '#4DD9C7' },
  { id: 'v4', name: '2021 Mercedes A200',    views: 176, reservations: 1, color: '#6B7A90' },
];

export const financeSplit = {
  summary: 'This week (9 deals) Finance: 6 deals (67%) · Cash: 3 deals (33%)',
  stats: [
    { label: 'Avg finance term',     value: '48 months', color: '#4DD9C7' },
    { label: 'Avg APR offered',      value: '7.9%',      color: '#F1F5F9' },
    { label: 'Avg down payment',     value: '£2,400',    color: '#F1F5F9' },
    { label: 'Pre-qual conversion',  value: '71%',       color: '#34D399' },
  ],
};

export const buyerBehaviourSignals = [
  { label: 'Avg session duration',           value: '6m 42s',  color: '#4DD9C7' },
  { label: 'VDPs with Ask this car used',    value: '34%',     color: '#4DD9C7' },
  { label: 'Price drop alerts triggered',    value: '18',      color: '#F1F5F9' },
  { label: 'Wishlisted vehicles',            value: '94',      color: '#F1F5F9' },
  { label: 'Checkout abandonment',           value: '37.5%',   color: '#F5A623', warning: true },
];

// --- Payouts tab ---
export const payoutsKpis = [
  { label: 'Payouts released (7d)', value: '£102.4k', delta: '8 sellers paid',        deltaType: 'neutral' as const, valueColor: '#4DD9C7' },
  { label: 'Avg payout time',       value: '1.4 days', delta: '↓ 0.7d vs prior 7d',   deltaType: 'up' as const,      valueColor: '#34D399' },
  { label: 'In escrow (live)',       value: '£82.3k',  delta: 'Awaiting conditions',   deltaType: 'neutral' as const, valueColor: '#F5A623' },
  { label: 'Lien payoffs (7d)',      value: '3',        delta: '£18.4k total',          deltaType: 'neutral' as const },
  { label: 'Overdue payouts',       value: '0',        delta: 'All within SLA',        deltaType: 'up' as const,      valueColor: '#34D399' },
];

export const escrowConditions = [
  { label: 'V5C transfer confirmed',    done: 7, total: 9, pct: 78 },
  { label: 'Return window clear',       done: 5, total: 9, pct: 56 },
  { label: 'Lender funding confirmed',  done: 6, total: 6, pct: 100 },
  { label: 'Compliance check passed',   done: 9, total: 9, pct: 100 },
  { label: 'No open disputes',          done: 9, total: 9, pct: 100 },
];

export const recentPayouts = [
  { id: 's1', seller: 'James Holloway',  vehicle: 'BMW 3 Series',   date: '22 Mar', amount: '£14,820' },
  { id: 's2', seller: 'Priya Sharma',    vehicle: 'VW Golf GTI',    date: '24 Mar', amount: '£12,400' },
  { id: 's3', seller: 'Michael Chen',    vehicle: 'Audi A4',        date: '25 Mar', amount: '£17,960' },
  { id: 's4', seller: 'Rachel Davies',   vehicle: 'Mercedes A200',  date: '26 Mar', amount: '£13,580' },
  { id: 's5', seller: 'Tom Barker',      vehicle: 'Toyota RAV4',    date: '27 Mar', amount: '£11,240' },
];

export const paymentMethods = [
  { label: 'Faster Payments',     value: 6, fill: '#34D399', pct: 75 },
  { label: 'CHAPS (>£50k)',       value: 1, fill: '#4DD9C7', pct: 13 },
  { label: 'BACS standard',       value: 1, fill: '#A78BFA', pct: 13 },
];

export const paymentStats = [
  { label: 'Avg time to receipt', value: '34 min', color: '#34D399' },
  { label: 'Failed payments',     value: '0',      color: '#34D399' },
];

export const lienPayoffData = {
  summary: '7-day summary — 3 payoffs processed · £18,400 to lienholders · 0 delays',
  stats: [
    { label: 'Avg payoff processing',   value: '18 hrs', color: '#4DD9C7' },
    { label: 'Lien release confirmed',  value: '3 of 3', color: '#34D399' },
    { label: 'Negative equity cases',   value: '0',      color: '#34D399' },
    // TODO: UK equivalent — "Sellers approaching £5,000 threshold for self-assessment reporting guidance"
    { label: 'Sellers near £5k threshold', value: '6 YTD', color: '#F1F5F9' },
  ],
};

export const periodLabels: Record<AnalyticsPeriod, string> = {
  '7d':  '22 Mar – 29 Mar 2026',
  '30d': '28 Feb – 29 Mar 2026',
  'mtd': '1 Mar – 29 Mar 2026',
  '90d': '29 Dec 2025 – 29 Mar 2026',
  'ytd': '1 Jan – 29 Mar 2026',
};
