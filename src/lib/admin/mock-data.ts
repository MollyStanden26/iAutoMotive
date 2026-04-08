// lib/admin/mock-data.ts — All static mock data for the Command Centre
// Swap this for real API calls later — components don't change.

export const commandCentreData = {
  health: {
    score: 84,
    chips: [
      { label: "Revenue on track", variant: "green" as const },
      { label: "2 recon delays", variant: "amber" as const },
      { label: "1 compliance flag", variant: "red" as const },
    ],
  },

  kpis: [
    {
      eyebrow: "Revenue today",
      value: "£41,200",
      rawValue: 41200,
      delta: "↑ 12% vs yesterday",
      deltaType: "up" as const,
      accent: "#4DD9C7",
      href: "/admin/finance",
    },
    {
      eyebrow: "Pipeline value",
      value: "£836k",
      rawValue: 836000,
      delta: "48 active deals",
      deltaType: "neutral" as const,
      accent: "#6366F1",
      href: "/admin/deals",
    },
    {
      eyebrow: "Vehicles in stock",
      value: "142",
      rawValue: 142,
      delta: "41 days avg to sell ↑",
      deltaType: "warn" as const,
      accent: "#FCD34D",
      href: "/admin/inventory",
    },
    {
      eyebrow: "CRM signed today",
      value: "3",
      rawValue: 3,
      delta: "34% contact rate",
      deltaType: "up" as const,
      accent: "#34D399",
      href: "/admin/crm",
    },
  ],

  revenue: [
    { day: "M", prev: 24, curr: 28 },
    { day: "T", prev: 30, curr: 35 },
    { day: "W", prev: 36, curr: 41 },
    { day: "T", prev: 28, curr: 22 },
    { day: "F", prev: 48, curr: 55 },
    { day: "S", prev: 52, curr: 68 },
    { day: "S", prev: 27, curr: 31 },
    { day: "M", prev: 39, curr: 44 },
    { day: "T", prev: 32, curr: 39 },
    { day: "W", prev: 44, curr: 51 },
    { day: "T", prev: 41, curr: 47 },
    { day: "F", prev: 55, curr: 62 },
    { day: "S", prev: 32, curr: 38 },
    { day: "Sa", prev: 36, curr: 41, isToday: true },
  ],

  pipeline: [
    { stage: "Reserved", count: 18, value: "£312k", barColor: "#4DD9C7", barPct: 95 },
    { stage: "Finance pending", count: 11, value: "£198k", barColor: "#FCD34D", barPct: 58 },
    { stage: "Docs outstanding", count: 6, value: "£105k", barColor: "#F87171", barPct: 30 },
    { stage: "Awaiting delivery", count: 9, value: "£156k", barColor: "#8492A8", barPct: 45 },
    { stage: "Payout pending", count: 4, value: "£65k", barColor: "#4A556B", barPct: 22 },
  ],

  pipelineTotal: { count: 48, value: "£836k" },

  briefing: {
    time: "08:01 GMT",
    paragraphs: [
      'Good morning. Revenue is running <strong>12% ahead</strong> of yesterday. Your one critical item: <strong>Deal #AC-0847</strong> — finance stips outstanding 4 days, lender chasing. Recommend escalation today.',
      'Recon at <strong>Lot B (Coventry)</strong> is behind — <strong>6 vehicles</strong> stuck in mechanical stage over 5 days, driving avg days-to-sell to <strong>41</strong> vs <strong>38-day target</strong>.',
      '<strong>Sarah K.</strong> leads the CRM team with <strong>3 signed deals</strong> this week.',
    ],
    chips: [
      { label: "Deal #AC-0847 ↗", href: "/admin/deals/AC-0847" },
      { label: "Lot B recon ↗", href: "/admin/inventory/recon?site=lot-b" },
      { label: "Sarah K. ↗", href: "/admin/crm/performance?staff=sarah-k" },
    ],
  },

  alerts: [
    {
      variant: "red" as const,
      message:
        "Compliance — AML flag on <strong>Deal #AC-0851</strong>. PEP match, manual review required before proceeding.",
      time: "11:42 · Unresolved",
    },
    {
      variant: "amber" as const,
      message:
        "<strong>Deal #AC-0847</strong> — Finance stips outstanding 4+ days. Risk of lapse.",
      time: "09:15 · Awaiting action",
    },
    {
      variant: "amber" as const,
      message:
        "Recon — <strong>Lot B</strong> — 6 vehicles exceeding 5-day mechanical stage threshold.",
      time: "08:01 · In progress",
    },
    {
      variant: "green" as const,
      message:
        "Scraper — AutoTrader rate-limit blocked 40 min. Auto-resolved. 12 listings missed.",
      time: "06:22 · Auto-resolved 07:04",
    },
  ],

  forecast: [
    { period: "30 days", value: "£524k", delta: "↑ 8% vs last mo.", deltaType: "up" as const },
    { period: "60 days", value: "£1.1M", delta: "↑ 14% trend", deltaType: "up" as const },
    { period: "90 days", value: "£1.7M", delta: "On plan", deltaType: "neutral" as const },
  ],

  agents: [
    { name: "Scout", status: "online" as const, stat: "Scored 34 today" },
    { name: "Outreach", status: "online" as const, stat: "18 sent" },
    { name: "Negotiation", status: "online" as const, stat: "6 threads" },
    { name: "Pricing", status: "online" as const, stat: "12 min ago" },
    { name: "Compliance", status: "online" as const, stat: "1 flag open" },
    { name: "Follow-up", status: "paused" as const, stat: "Paused" },
  ],

  copilotMessages: [
    {
      role: "assistant" as const,
      content:
        "Good morning. Revenue is running 12% ahead of yesterday. Your priority action today is Deal #AC-0847 — finance stips are 4 days outstanding. Want me to draft an escalation email to the lender?",
    },
    {
      role: "user" as const,
      content: "Yes, and tell me which callers are underperforming.",
    },
    {
      role: "assistant" as const,
      content:
        "Done — lender escalation email drafted and ready in your queue. On CRM: James T. has the lowest contact rate this week at 18% vs the 34% team average. I would flag him for a coaching call.",
    },
  ],
};
