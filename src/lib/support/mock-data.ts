/**
 * UI mock data for the Support portal.
 *
 * Tickets/Conversations/CannedResponses don't exist in the Prisma schema yet —
 * the support surface ships UI-first so the team can iterate on the workflow
 * before we commit to a schema. Sellers tab pulls real data from /api/admin/sellers.
 */

export type TicketStatus = "open" | "pending_seller" | "escalated" | "resolved";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketTopic =
  | "valuation_dispute"
  | "collection_delay"
  | "payment_query"
  | "listing_change"
  | "document_issue"
  | "complaint"
  | "general";

export interface SupportTicket {
  id: string;
  sellerName: string;
  sellerEmail: string;
  vehicle: string;
  topic: TicketTopic;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string | null;
  channel: "email" | "phone" | "chat" | "sms";
  ageHours: number;             // hours since opened
  lastActivityHours: number;    // hours since last update
  unreadCount: number;
}

export const TOPIC_LABELS: Record<TicketTopic, string> = {
  valuation_dispute: "Valuation dispute",
  collection_delay:  "Collection delay",
  payment_query:     "Payment query",
  listing_change:    "Listing change",
  document_issue:    "Document issue",
  complaint:         "Complaint",
  general:           "General enquiry",
};

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "T-2614",
    sellerName: "Hartwell Banbury",
    sellerEmail: "hartwell-banbury-202603240954701@dealers.iautomotive.local",
    vehicle: "2023 Mercedes-Benz A Class",
    topic: "collection_delay",
    subject: "Collection driver no-show on Tue afternoon",
    status: "open",
    priority: "high",
    assignee: "Aisha T.",
    channel: "phone",
    ageHours: 4,
    lastActivityHours: 1,
    unreadCount: 2,
  },
  {
    id: "T-2613",
    sellerName: "The Car Co",
    sellerEmail: "the-car-co-account-202605052142787@dealers.iautomotive.local",
    vehicle: "2023 Mercedes-Benz CLA",
    topic: "valuation_dispute",
    subject: "Asking £24,475 — feedback says listing too low",
    status: "open",
    priority: "normal",
    assignee: "Sarah K.",
    channel: "email",
    ageHours: 8,
    lastActivityHours: 3,
    unreadCount: 0,
  },
  {
    id: "T-2612",
    sellerName: "Volvo Cars Oxford",
    sellerEmail: "seller01@gmail.com",
    vehicle: "2021 Volvo XC40",
    topic: "payment_query",
    subject: "Net payout £100 short — need breakdown",
    status: "escalated",
    priority: "urgent",
    assignee: "James T.",
    channel: "email",
    ageHours: 23,
    lastActivityHours: 6,
    unreadCount: 4,
  },
  {
    id: "T-2611",
    sellerName: "Whytehall Car Collection Ltd",
    sellerEmail: "whytehall-car-collection-ltd-202604201707120@dealers.iautomotive.local",
    vehicle: "2023 Jaguar I-PACE",
    topic: "listing_change",
    subject: "Want to add full service history to listing",
    status: "pending_seller",
    priority: "normal",
    assignee: "Sarah K.",
    channel: "chat",
    ageHours: 30,
    lastActivityHours: 18,
    unreadCount: 0,
  },
  {
    id: "T-2610",
    sellerName: "Trust Ford Birmingham",
    sellerEmail: "trust-ford-birmingham-202603240973641@dealers.iautomotive.local",
    vehicle: "2021 Volvo XC60",
    topic: "document_issue",
    subject: "V5C uploaded twice — which one is on file?",
    status: "open",
    priority: "low",
    assignee: null,
    channel: "email",
    ageHours: 36,
    lastActivityHours: 36,
    unreadCount: 1,
  },
  {
    id: "T-2609",
    sellerName: "Carsa",
    sellerEmail: "carsa-account-202604031280695@dealers.iautomotive.local",
    vehicle: "2023 Land Rover Discovery Sport",
    topic: "complaint",
    subject: "Photos taken don't show damage on N/S/F bumper",
    status: "open",
    priority: "high",
    assignee: "Aisha T.",
    channel: "email",
    ageHours: 48,
    lastActivityHours: 12,
    unreadCount: 3,
  },
  {
    id: "T-2608",
    sellerName: "Hewson Motor Hub Ltd",
    sellerEmail: "hewson-motor-hub-ltd-202604271907711@dealers.iautomotive.local",
    vehicle: "2023 Audi Q4 e-tron",
    topic: "general",
    subject: "Can I be CC'd on buyer correspondence?",
    status: "resolved",
    priority: "low",
    assignee: "Jordan M.",
    channel: "email",
    ageHours: 60,
    lastActivityHours: 5,
    unreadCount: 0,
  },
  {
    id: "T-2607",
    sellerName: "SZ Motor Group Ltd",
    sellerEmail: "sz-motor-group-ltd-202602169957534@dealers.iautomotive.local",
    vehicle: "2022 Mercedes-Benz E Class",
    topic: "payment_query",
    subject: "BACS payment reference unclear on statement",
    status: "resolved",
    priority: "normal",
    assignee: "James T.",
    channel: "phone",
    ageHours: 72,
    lastActivityHours: 24,
    unreadCount: 0,
  },
];

/* ── Conversations / unified inbox ─────────────────────────────────────── */

export type ConversationChannel = "email" | "sms" | "phone" | "chat";

export interface ConversationThread {
  id: string;
  sellerName: string;
  vehicle: string;
  channel: ConversationChannel;
  preview: string;          // last message snippet
  unread: boolean;
  ageMinutes: number;       // since last message
  ticketId?: string;        // link to a ticket if conversation is ticketed
}

export const CONVERSATIONS: ConversationThread[] = [
  {
    id: "C-9912",
    sellerName: "Hartwell Banbury",
    vehicle: "2023 Mercedes-Benz A Class",
    channel: "phone",
    preview: "Just rang back — driver ETA pushed to 4:30. Confirmed with seller.",
    unread: true,
    ageMinutes: 8,
    ticketId: "T-2614",
  },
  {
    id: "C-9911",
    sellerName: "Volvo Cars Oxford",
    vehicle: "2021 Volvo XC40",
    channel: "email",
    preview: "Attaching the original net seller payout estimate as requested. The £100 difference is the BACS fee.",
    unread: true,
    ageMinutes: 22,
    ticketId: "T-2612",
  },
  {
    id: "C-9910",
    sellerName: "Sarah Khan",
    vehicle: "2022 Audi Q3",
    channel: "chat",
    preview: "Thanks — that's perfect, all sorted!",
    unread: false,
    ageMinutes: 45,
  },
  {
    id: "C-9909",
    sellerName: "Carsa",
    vehicle: "2023 Land Rover Discovery Sport",
    channel: "email",
    preview: "Photos resent with the bumper damage clearly captured under daylight.",
    unread: false,
    ageMinutes: 90,
    ticketId: "T-2609",
  },
  {
    id: "C-9908",
    sellerName: "Trust Ford Birmingham",
    vehicle: "2021 Volvo XC60",
    channel: "sms",
    preview: "Got both V5Cs — using the one dated 12/03/26. We'll archive the other.",
    unread: false,
    ageMinutes: 180,
    ticketId: "T-2610",
  },
  {
    id: "C-9907",
    sellerName: "Whytehall Car Collection Ltd",
    vehicle: "2023 Jaguar I-PACE",
    channel: "chat",
    preview: "Awaiting your service history scan — happy to push the listing live once we have it.",
    unread: false,
    ageMinutes: 600,
    ticketId: "T-2611",
  },
];

/* ── Canned responses / KB snippets ────────────────────────────────────── */

export interface CannedResponse {
  id: string;
  category: "Collection" | "Payment" | "Listing" | "Documents" | "Closure";
  title: string;
  body: string;
}

export const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: "R-COLL-1",
    category: "Collection",
    title: "Driver delay — apology + ETA",
    body:
      "Hi {first_name},\n\nApologies for the delay — our driver is held up on an earlier collection. New ETA is {new_eta}. We'll text you when they're 30 minutes away.\n\nThanks for your patience.\n\nThe iAutoMotive team",
  },
  {
    id: "R-COLL-2",
    category: "Collection",
    title: "Collection rescheduled",
    body:
      "Hi {first_name},\n\nWe've rescheduled your collection for {new_slot}. Please reply to confirm or let us know if you'd prefer another window.\n\nThanks,\nThe iAutoMotive team",
  },
  {
    id: "R-PAY-1",
    category: "Payment",
    title: "Net payout breakdown",
    body:
      "Hi {first_name},\n\nHere's the full breakdown of your net payout:\n\n• Sale price: £{sale_price}\n• Platform fee: £{platform_fee}\n• BACS fee: £2\n• Net payout: £{net_payout}\n\nLet me know if anything looks off.\n\nThanks,\n{agent_name}",
  },
  {
    id: "R-PAY-2",
    category: "Payment",
    title: "BACS payment timeline",
    body:
      "Hi {first_name},\n\nFunds are released within 48 hours of the buyer's reservation completing. You'll receive a BACS payment from \"I Automotive Tech Ltd\" — usually visible in your account within 1 working day.\n\nThanks,\n{agent_name}",
  },
  {
    id: "R-LIST-1",
    category: "Listing",
    title: "Listing edit confirmation",
    body:
      "Hi {first_name},\n\nWe've updated your listing as requested. Latest version: {listing_url}\n\nLet me know if you'd like any further changes.\n\nThanks,\n{agent_name}",
  },
  {
    id: "R-DOC-1",
    category: "Documents",
    title: "Need clear V5C scan",
    body:
      "Hi {first_name},\n\nThe V5C scan we received is too dark to read the VIN. Could you re-upload a daylight photo of the front and back?\n\nThanks,\n{agent_name}",
  },
  {
    id: "R-CLOSE-1",
    category: "Closure",
    title: "Ticket resolved + survey",
    body:
      "Hi {first_name},\n\nMarking this resolved. If anything else comes up, just reply to this thread and we'll pick it back up.\n\nWe'd love a 30-second feedback rating: {survey_url}\n\nThanks,\n{agent_name}",
  },
];

/* ── KPIs ──────────────────────────────────────────────────────────────── */

export const SUPPORT_KPIS = [
  { label: "Open tickets",      value: SUPPORT_TICKETS.filter(t => t.status === "open" || t.status === "escalated").length },
  { label: "Awaiting seller",   value: SUPPORT_TICKETS.filter(t => t.status === "pending_seller").length },
  { label: "Escalated",         value: SUPPORT_TICKETS.filter(t => t.status === "escalated").length },
  { label: "Resolved today",    value: SUPPORT_TICKETS.filter(t => t.status === "resolved" && t.lastActivityHours < 24).length },
  { label: "Median first reply", value: "11m" as const },
];
