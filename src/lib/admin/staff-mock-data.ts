// lib/admin/staff-mock-data.ts — All static mock data for the Staff Dashboard

export type PeriodType    = 'today' | 'last7d' | 'mtd' | 'qtd';
export type RoleType      = 'Super Admin' | 'Sales' | 'Lot Manager' | 'Finance' | 'Recon Tech' | 'Read Only';
export type StaffStatus   = 'active' | 'offline' | 'below-target' | 'on-leave';
export type LiveStatus    = 'active' | 'idle' | 'on-call';
export type CoachSeverity = 'critical' | 'advisory';
export type Permission    = 'Full' | 'Read/write' | 'View' | 'Stage only' | '—';

export interface LeaderboardEntry {
  id: string; rank: number; name: string; initials: string; role: RoleType;
  lots: string[]; logins7d: number; lastActive: string; slaCompliance: number;
  status: StaffStatus; isUnderperformer: boolean;
  deals: number | null; responseRate: number | null; avgGpu: number | null; score: number;
}

export interface LiveNowEntry {
  staffId: string; name: string; initials: string; role: RoleType;
  lot: string; liveStatus: LiveStatus; activity: string; isUnderperformer: boolean;
}

export interface CoachingFlag {
  staffId: string; name: string; severity: CoachSeverity;
  flagText: string; actionLabel: string; actionTarget: string;
}

export interface AccessRow {
  staffId: string; name: string; role: RoleType; lots: string;
  inventory: Permission; deals: Permission; finance: Permission; payouts: Permission; admin: Permission;
}

export interface RoleCount {
  role: RoleType; count: number; barPct: number; barColor: string; textColor: string;
}

export interface StaffKpis {
  totalStaff: number; activeNow: number; activePct: number;
  onTarget: number; onTargetPct: number; underperforming: number; avgSlaCompliance: number;
}

export function staffPeriodLabel(period: PeriodType): string {
  if (period === "today") return "Today";
  if (period === "last7d") return "Last 7 days";
  if (period === "mtd") return "March MTD";
  return "Q1 2026";
}

/* ── KPIs ── */
export const STAFF_KPIS: StaffKpis = {
  totalStaff: 24, activeNow: 11, activePct: 46,
  onTarget: 18, onTargetPct: 75, underperforming: 4, avgSlaCompliance: 87,
};

/* ── Role counts ── */
export const ROLE_COUNTS: RoleCount[] = [
  { role: 'Sales',       count: 12, barPct: 50, barColor: '#4DD9C7', textColor: '#4DD9C7' },
  { role: 'Lot Manager', count: 4,  barPct: 17, barColor: '#4A556B', textColor: '#6B7A90' },
  { role: 'Finance',     count: 2,  barPct: 8,  barColor: '#C080F0', textColor: '#C080F0' },
  { role: 'Recon Tech',  count: 5,  barPct: 21, barColor: '#FCD34D', textColor: '#FCD34D' },
  { role: 'Read Only',   count: 1,  barPct: 4,  barColor: '#2E4060', textColor: '#6B7A90' },
];

/* ── Leaderboard (9 rows: 5 top + 4 under) ── */
export const LEADERBOARD: LeaderboardEntry[] = [
  { id: 's01', rank: 1, name: 'Sarah K.',  initials: 'SK', role: 'Sales',       lots: ['Lot 1','Lot 2'], logins7d: 7, lastActive: 'Now',       slaCompliance: 96, status: 'active',       isUnderperformer: false, deals: 9,    responseRate: 94, avgGpu: 2140, score: 98 },
  { id: 's02', rank: 2, name: 'James T.',  initials: 'JT', role: 'Sales',       lots: ['Lot 2'],         logins7d: 7, lastActive: 'Now',       slaCompliance: 93, status: 'active',       isUnderperformer: false, deals: 8,    responseRate: 91, avgGpu: 1980, score: 94 },
  { id: 's03', rank: 3, name: 'Priya M.',  initials: 'PM', role: 'Sales',       lots: ['Lot 2','Lot 3'], logins7d: 6, lastActive: 'Yesterday', slaCompliance: 91, status: 'offline',      isUnderperformer: false, deals: 7,    responseRate: 88, avgGpu: 1860, score: 89 },
  { id: 's04', rank: 4, name: 'Tom B.',    initials: 'TB', role: 'Lot Manager', lots: ['Lot 1'],         logins7d: 6, lastActive: 'Now',       slaCompliance: 89, status: 'active',       isUnderperformer: false, deals: 6,    responseRate: 82, avgGpu: 1720, score: 84 },
  { id: 's05', rank: 5, name: 'Rachel D.', initials: 'RD', role: 'Sales',       lots: ['Lot 2'],         logins7d: 5, lastActive: 'Yesterday', slaCompliance: 84, status: 'offline',      isUnderperformer: false, deals: 5,    responseRate: 79, avgGpu: 1640, score: 76 },
  { id: 's06', rank: 6, name: 'Connor H.', initials: 'CH', role: 'Sales',       lots: ['Lot 1'],         logins7d: 3, lastActive: '2h ago',    slaCompliance: 72, status: 'below-target', isUnderperformer: true,  deals: 3,    responseRate: 61, avgGpu: 1240, score: 54 },
  { id: 's07', rank: 7, name: 'Mark O.',   initials: 'MO', role: 'Lot Manager', lots: ['Lot 2'],         logins7d: 3, lastActive: '3h ago',    slaCompliance: 64, status: 'below-target', isUnderperformer: true,  deals: 2,    responseRate: 58, avgGpu: 1480, score: 51 },
  { id: 's08', rank: 8, name: 'Lisa W.',   initials: 'LW', role: 'Sales',       lots: ['Lot 3'],         logins7d: 2, lastActive: '4h ago',    slaCompliance: 61, status: 'below-target', isUnderperformer: true,  deals: 2,    responseRate: 54, avgGpu: 1100, score: 48 },
  { id: 's09', rank: 9, name: 'Dan P.',    initials: 'DP', role: 'Recon Tech',  lots: ['Lot 3'],         logins7d: 4, lastActive: '1h ago',    slaCompliance: 58, status: 'below-target', isUnderperformer: true,  deals: null, responseRate: 52, avgGpu: null, score: 44 },
];

/* ── Live now (5 rows) ── */
export const LIVE_NOW: LiveNowEntry[] = [
  { staffId: 's01', name: 'Sarah K.',  initials: 'SK', role: 'Sales',       lot: 'Lot 1',    liveStatus: 'on-call', activity: 'on a call',      isUnderperformer: false },
  { staffId: 's02', name: 'James T.',  initials: 'JT', role: 'Sales',       lot: 'Lot 2',    liveStatus: 'active',  activity: 'browsing leads', isUnderperformer: false },
  { staffId: 's04', name: 'Tom B.',    initials: 'TB', role: 'Lot Manager', lot: 'Lot 1',    liveStatus: 'active',  activity: 'vehicle intake', isUnderperformer: false },
  { staffId: 's10', name: 'Ahmed R.',  initials: 'AR', role: 'Finance',     lot: 'All lots', liveStatus: 'active',  activity: '',               isUnderperformer: false },
  { staffId: 's06', name: 'Connor H.', initials: 'CH', role: 'Sales',       lot: 'Lot 1',    liveStatus: 'idle',    activity: 'idle 22 min',    isUnderperformer: true  },
];

/* ── Coaching flags (4 rows) ── */
export const COACHING_FLAGS: CoachingFlag[] = [
  { staffId: 's06', name: 'Connor H.', severity: 'critical', flagText: 'Response rate dropped 28% vs last week. 3 leads left uncontacted >4h. Pattern consistent with disengagement.', actionLabel: 'Schedule 1-to-1', actionTarget: '/admin/staff/s06' },
  { staffId: 's08', name: 'Lisa W.',   severity: 'critical', flagText: 'Deal count 2 this week vs 6 avg. Login frequency dropped to 2 days. SLA misses on 3 callbacks.',               actionLabel: 'Review activity log', actionTarget: '/admin/staff/s08' },
  { staffId: 's07', name: 'Mark O.',   severity: 'advisory', flagText: 'Recon SLA at 64% — lot capacity issues may be contributing. 2 vehicles overdue stage sign-off.',               actionLabel: 'View recon queue', actionTarget: '/admin/inventory?lot=2&stage=overdue' },
  { staffId: 's09', name: 'Dan P.',    severity: 'advisory', flagText: 'Stage update latency avg 6.2h vs 2h target. 4 vehicles not updated for 48h+.',                                 actionLabel: 'Open recon board', actionTarget: '/admin/inventory?lot=3&stage=overdue' },
];

/* ── Access management (5 rows) ── */
export const ACCESS_ROWS: AccessRow[] = [
  { staffId: 's00', name: 'Molly S.', role: 'Super Admin', lots: 'All lots',   inventory: 'Full',       deals: 'Full',       finance: 'Full', payouts: 'Full', admin: 'Full' },
  { staffId: 's04', name: 'Tom B.',      role: 'Lot Manager', lots: 'Lot 1 only', inventory: 'Read/write', deals: 'View',       finance: '—',    payouts: '—',    admin: '—'    },
  { staffId: 's01', name: 'Sarah K.',    role: 'Sales',       lots: 'Lot 1, 2',   inventory: 'View',       deals: 'Read/write', finance: '—',    payouts: '—',    admin: '—'    },
  { staffId: 's10', name: 'Ahmed R.',    role: 'Finance',     lots: 'All lots',   inventory: '—',          deals: 'Read/write', finance: 'Full', payouts: 'Full', admin: '—'    },
  { staffId: 's09', name: 'Dan P.',      role: 'Recon Tech',  lots: 'Lot 3 only', inventory: 'Stage only', deals: '—',          finance: '—',    payouts: '—',    admin: '—'    },
];
