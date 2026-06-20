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

export const repPerformance: RepPerformance[] = [];

/* ================================================================== */
/*  TEAM TARGETS                                                       */
/* ================================================================== */

export const teamTargets: TeamTarget[] = [];

/* ================================================================== */
/*  WEEKLY LEADERBOARD HISTORY                                         */
/* ================================================================== */

export const weeklyHistory: WeeklyEntry[] = [];

/* ================================================================== */
/*  OUTCOME DISTRIBUTION (current week)                                */
/* ================================================================== */

export const outcomeDistribution: OutcomeDistribution[] = [];
