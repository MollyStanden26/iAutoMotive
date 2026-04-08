// lib/admin/performance-mock-data.ts — Mock data for CRM Performance dashboard
// Swap for real API calls later — components don't change.

/* ================================================================== */
/*  INTERFACES                                                         */
/* ================================================================== */

export interface RepPerformance {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  rank: number;
  // Daily metrics
  dialsToday: number;
  contactsToday: number;
  offersToday: number;
  signedToday: number;
  // Weekly metrics
  dialsWeek: number;
  contactsWeek: number;
  offersWeek: number;
  signedWeek: number;
  revenueWeek: number; // in pence
  // Rates
  contactRate: number; // 0-100
  conversionRate: number; // 0-100
  avgCallDuration: number; // seconds
  avgCallsPerHour: number;
  // Targets
  dailyDialTarget: number;
  weeklySignedTarget: number;
  // Coaching
  coachingFlag: "none" | "positive" | "needs_coaching";
  coachingNote: string;
  // Weekly trend (7 days of dial counts for sparkline)
  weeklyTrend: number[];
}

export interface TeamTarget {
  label: string;
  target: number;
  actual: number;
  unit: "count" | "percent" | "currency";
  trend: "up" | "down" | "flat";
  trendValue: string;
}

export interface WeeklyEntry {
  week: string; // "W14", "W13", etc.
  reps: { name: string; dials: number; contacts: number; signed: number; revenue: number }[];
}

export interface OutcomeDistribution {
  outcome: string;
  count: number;
  percentage: number;
}

/* ================================================================== */
/*  REP PERFORMANCE DATA                                               */
/* ================================================================== */

export const repPerformance: RepPerformance[] = [
  {
    id: "rep-sk",
    name: "Sarah K.",
    initials: "SK",
    avatarBg: "#008C7C",
    rank: 1,
    dialsToday: 48,
    contactsToday: 18,
    offersToday: 4,
    signedToday: 1,
    dialsWeek: 214,
    contactsWeek: 81,
    offersWeek: 16,
    signedWeek: 3,
    revenueWeek: 6450000, // £64,500
    contactRate: 38,
    conversionRate: 3.7,
    avgCallDuration: 234, // 3:54
    avgCallsPerHour: 8.2,
    dailyDialTarget: 45,
    weeklySignedTarget: 2,
    coachingFlag: "positive",
    coachingNote: "Excellent objection handling — share BMW pitch technique with team during Thursday standup.",
    weeklyTrend: [42, 46, 38, 50, 44, 48, 48],
  },
  {
    id: "rep-jt",
    name: "James T.",
    initials: "JT",
    avatarBg: "#534AB7",
    rank: 2,
    dialsToday: 36,
    contactsToday: 11,
    offersToday: 2,
    signedToday: 0,
    dialsWeek: 162,
    contactsWeek: 49,
    offersWeek: 9,
    signedWeek: 1,
    revenueWeek: 2180000, // £21,800
    contactRate: 30,
    conversionRate: 2.0,
    avgCallDuration: 198, // 3:18
    avgCallsPerHour: 6.8,
    dailyDialTarget: 40,
    weeklySignedTarget: 2,
    coachingFlag: "none",
    coachingNote: "",
    weeklyTrend: [32, 34, 38, 36, 30, 35, 36],
  },
  {
    id: "rep-er",
    name: "Emma R.",
    initials: "ER",
    avatarBg: "#3B6D11",
    rank: 3,
    dialsToday: 28,
    contactsToday: 7,
    offersToday: 1,
    signedToday: 0,
    dialsWeek: 118,
    contactsWeek: 30,
    offersWeek: 5,
    signedWeek: 1,
    revenueWeek: 1740000, // £17,400
    contactRate: 25,
    conversionRate: 1.7,
    avgCallDuration: 172, // 2:52
    avgCallsPerHour: 5.6,
    dailyDialTarget: 35,
    weeklySignedTarget: 1,
    coachingFlag: "none",
    coachingNote: "",
    weeklyTrend: [20, 22, 24, 26, 28, 26, 28],
  },
  {
    id: "rep-lp",
    name: "Liam P.",
    initials: "LP",
    avatarBg: "#854F0B",
    rank: 4,
    dialsToday: 22,
    contactsToday: 4,
    offersToday: 0,
    signedToday: 0,
    dialsWeek: 84,
    contactsWeek: 15,
    offersWeek: 2,
    signedWeek: 0,
    revenueWeek: 0,
    contactRate: 18,
    conversionRate: 0,
    avgCallDuration: 126, // 2:06
    avgCallsPerHour: 4.4,
    dailyDialTarget: 35,
    weeklySignedTarget: 1,
    coachingFlag: "needs_coaching",
    coachingNote: "Contact rate dropped 8% this week. Struggling with opening pitch — schedule 1:1 to review call recordings and refine approach.",
    weeklyTrend: [28, 26, 24, 20, 18, 22, 22],
  },
];

/* ================================================================== */
/*  TEAM TARGETS                                                       */
/* ================================================================== */

export const teamTargets: TeamTarget[] = [
  { label: "Daily Dials (Team)",  target: 160, actual: 134, unit: "count",    trend: "up",   trendValue: "+12% vs yesterday" },
  { label: "Contact Rate",        target: 30,  actual: 29,  unit: "percent",  trend: "flat", trendValue: "Steady" },
  { label: "Offers Sent",         target: 28,  actual: 32,  unit: "count",    trend: "up",   trendValue: "+4 ahead" },
  { label: "Deals Signed",        target: 8,   actual: 5,   unit: "count",    trend: "down", trendValue: "3 behind" },
  { label: "Revenue",             target: 12000000, actual: 10370000, unit: "currency", trend: "up", trendValue: "86% of target" },
  { label: "Callbacks Cleared",   target: 100, actual: 68,  unit: "percent",  trend: "down", trendValue: "32% overdue" },
];

/* ================================================================== */
/*  WEEKLY LEADERBOARD HISTORY                                         */
/* ================================================================== */

export const weeklyHistory: WeeklyEntry[] = [
  {
    week: "W14",
    reps: [
      { name: "Sarah K.", dials: 214, contacts: 81, signed: 3, revenue: 64500 },
      { name: "James T.", dials: 162, contacts: 49, signed: 1, revenue: 21800 },
      { name: "Emma R.",  dials: 118, contacts: 30, signed: 1, revenue: 17400 },
      { name: "Liam P.",  dials: 84,  contacts: 15, signed: 0, revenue: 0 },
    ],
  },
  {
    week: "W13",
    reps: [
      { name: "Sarah K.", dials: 198, contacts: 73, signed: 2, revenue: 43200 },
      { name: "James T.", dials: 174, contacts: 54, signed: 2, revenue: 38600 },
      { name: "Emma R.",  dials: 102, contacts: 24, signed: 0, revenue: 0 },
      { name: "Liam P.",  dials: 96,  contacts: 20, signed: 1, revenue: 19500 },
    ],
  },
  {
    week: "W12",
    reps: [
      { name: "Sarah K.", dials: 206, contacts: 78, signed: 3, revenue: 58700 },
      { name: "James T.", dials: 158, contacts: 46, signed: 1, revenue: 22100 },
      { name: "Emma R.",  dials: 94,  contacts: 21, signed: 1, revenue: 16800 },
      { name: "Liam P.",  dials: 110, contacts: 24, signed: 1, revenue: 18200 },
    ],
  },
  {
    week: "W11",
    reps: [
      { name: "Sarah K.", dials: 192, contacts: 69, signed: 2, revenue: 41500 },
      { name: "James T.", dials: 168, contacts: 52, signed: 2, revenue: 36900 },
      { name: "Emma R.",  dials: 88,  contacts: 19, signed: 0, revenue: 0 },
      { name: "Liam P.",  dials: 118, contacts: 28, signed: 1, revenue: 21400 },
    ],
  },
];

/* ================================================================== */
/*  OUTCOME DISTRIBUTION (current week)                                */
/* ================================================================== */

export const outcomeDistribution: OutcomeDistribution[] = [
  { outcome: "No Answer",        count: 198, percentage: 34.3 },
  { outcome: "Voicemail Left",   count: 112, percentage: 19.4 },
  { outcome: "Contacted — Interested", count: 88, percentage: 15.2 },
  { outcome: "Contacted — Not Interested", count: 62, percentage: 10.7 },
  { outcome: "Callback Booked",  count: 48,  percentage: 8.3 },
  { outcome: "Offer Sent",       count: 32,  percentage: 5.5 },
  { outcome: "Wrong Number",     count: 22,  percentage: 3.8 },
  { outcome: "Signed",           count: 5,   percentage: 0.9 },
  { outcome: "Other",            count: 11,  percentage: 1.9 },
];
