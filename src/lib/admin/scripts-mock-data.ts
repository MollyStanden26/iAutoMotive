// lib/admin/scripts-mock-data.ts — Mock data for CRM Scripts & SMS Template library

/* ================================================================== */
/*  TYPES                                                              */
/* ================================================================== */

export type ScriptCategory = "cold_call" | "follow_up" | "objection" | "close" | "callback" | "inbound";
export type SmsCategory = "initial_outreach" | "follow_up" | "offer" | "callback_confirmation" | "seller_update" | "payout_notification" | "general";

export interface CallScript {
  id: string;
  name: string;
  category: ScriptCategory;
  sections: { label: string; text: string }[];
  variables: string[];
  isActive: boolean;
  createdBy: string;
  lastEdited: string;
  usageCount: number;
}

export interface SmsTemplate {
  id: string;
  name: string;
  category: SmsCategory;
  body: string;
  variables: string[];
  characterCount: number;
  isActive: boolean;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

/* ================================================================== */
/*  CALL SCRIPTS                                                       */
/* ================================================================== */

export const callScripts: CallScript[] = [
  {
    id: "cs-001",
    name: "Cold Call — AutoTrader Lead",
    category: "cold_call",
    sections: [
      {
        label: "Opening",
        text: "Hi, is that [seller name]? Calling from iAutoMotive about your [vehicle] on AutoTrader. We're a consignment platform — we sell it at full retail and you keep the proceeds. No commission fee. Do you have 2 minutes?",
      },
      {
        label: "Value Proposition",
        text: "We're currently offering around [offer price] as a listing price — based on live AutoTrader data. There's no commission fee, so you'd receive [net estimate] in your account, without doing any viewings.",
      },
      {
        label: "Objection — \"I'd rather sell privately\"",
        text: "Totally understand. We handle everything — collection, prep, every buyer enquiry. Most sellers get paid within 5–6 weeks with zero involvement after drop-off.",
      },
      {
        label: "Close",
        text: "If that sounds good, I can get a formal offer over to you today — just need 5 minutes to confirm the details. Would [time] work for a quick callback?",
      },
    ],
    variables: ["seller name", "vehicle", "offer price", "net estimate", "time"],
    isActive: true,
    createdBy: "Sarah K.",
    lastEdited: "2026-04-06T14:30:00Z",
    usageCount: 142,
  },
  {
    id: "cs-002",
    name: "Follow-Up — Callback",
    category: "follow_up",
    sections: [
      {
        label: "Opening",
        text: "Hi [seller name], it's [agent name] from iAutoMotive — we spoke on [last contact date] about your [vehicle]. Hope I've caught you at a good time?",
      },
      {
        label: "Recap",
        text: "Just to recap — you were interested in our consignment service for the [vehicle]. You mentioned your asking price was around [asking price], and we discussed a listing price of [offer price].",
      },
      {
        label: "Updated Offer",
        text: "I've had another look at the market since we spoke, and similar [vehicle] models are moving well. We can list at [offer price] — after our flat fee, you'd net approximately [net estimate]. That's a strong return without the hassle of private viewings.",
      },
      {
        label: "Close",
        text: "Shall I get the formal offer emailed across now? We can arrange collection from [lot location] as early as [collection date] — you'd just need to sign the consignment agreement and we handle the rest.",
      },
    ],
    variables: ["seller name", "agent name", "last contact date", "vehicle", "asking price", "offer price", "net estimate", "lot location", "collection date"],
    isActive: true,
    createdBy: "Sarah K.",
    lastEdited: "2026-04-05T09:15:00Z",
    usageCount: 87,
  },
  {
    id: "cs-003",
    name: "Follow-Up — Post Voicemail",
    category: "follow_up",
    sections: [
      {
        label: "Opening",
        text: "Hi [seller name], it's [agent name] calling from iAutoMotive. I left you a voicemail earlier today — just wanted to follow up quickly.",
      },
      {
        label: "Reference VM",
        text: "As I mentioned in the message, I noticed your [vehicle] listed on AutoTrader at [asking price]. We specialise in consignment sales — we sell your car at full retail price and handle everything from collection to sale.",
      },
      {
        label: "Quick Pitch",
        text: "Based on current market data, we'd look at listing around [offer price]. There's no commission — just a flat prep fee. You'd receive approximately [net estimate] directly into your account once it sells.",
      },
      {
        label: "Close",
        text: "Would you be open to hearing a bit more? I can walk you through the full process in under 3 minutes, or if now's not ideal, I'm happy to arrange a callback at a time that suits you.",
      },
    ],
    variables: ["seller name", "agent name", "vehicle", "asking price", "offer price", "net estimate"],
    isActive: true,
    createdBy: "Jordan M.",
    lastEdited: "2026-04-04T16:45:00Z",
    usageCount: 63,
  },
  {
    id: "cs-004",
    name: "Inbound — Seller Enquiry",
    category: "inbound",
    sections: [
      {
        label: "Greeting",
        text: "Good [morning/afternoon], thanks for calling iAutoMotive — my name's [agent name]. How can I help you today?",
      },
      {
        label: "Qualification",
        text: "Brilliant — so you're looking to sell your [vehicle]? Can I just grab a few details? What's the current mileage, and do you have a price in mind? And is it currently listed anywhere?",
      },
      {
        label: "Value Proposition",
        text: "So the way it works — we collect the car from you, prep it to retail standard, photograph it, and list it across AutoTrader, eBay Motors and our own platform. There's no commission. We charge a flat consignment fee, and based on a quick look at [vehicle] at [asking price], you'd likely net around [net estimate].",
      },
      {
        label: "Next Steps",
        text: "What I'll do is send you a formal valuation by email — it'll include the breakdown of estimated sale price, our fee, and your net payout. From there, if you're happy, we can arrange collection as early as [collection date]. Sound good?",
      },
    ],
    variables: ["morning/afternoon", "agent name", "vehicle", "asking price", "net estimate", "collection date"],
    isActive: true,
    createdBy: "Aisha T.",
    lastEdited: "2026-04-03T11:20:00Z",
    usageCount: 51,
  },
  {
    id: "cs-005",
    name: "Objection — \"Too Low\"",
    category: "objection",
    sections: [
      {
        label: "Acknowledge",
        text: "I completely understand, [seller name] — and you're right to question it. You know your car better than anyone. Let me walk you through how we arrived at [offer price].",
      },
      {
        label: "Market Data",
        text: "We pull live data from AutoTrader, eBay Motors, and recent auction results. Right now, similar [vehicle] models with comparable mileage are selling at retail between [market low] and [market high]. Your asking price of [asking price] is at the upper end, which is why we've positioned our listing at [offer price] to ensure a quicker sale.",
      },
      {
        label: "Breakdown",
        text: "Here's the key difference — with a private sale at [asking price], you'd handle all viewings, tyre-kickers, and negotiations yourself. With us, the car is prepped, photographed and marketed professionally. After our flat fee, your net payout at [offer price] would be approximately [net estimate]. That's a strong return for zero effort.",
      },
      {
        label: "Counter / Close",
        text: "Tell you what — let me send the formal offer across with the full breakdown. If the numbers don't work for you, there's absolutely no obligation. But most sellers find once they see the net sheet side by side, it makes a lot more sense. Shall I fire that across now?",
      },
    ],
    variables: ["seller name", "vehicle", "offer price", "market low", "market high", "asking price", "net estimate"],
    isActive: true,
    createdBy: "Sarah K.",
    lastEdited: "2026-04-07T10:00:00Z",
    usageCount: 38,
  },
  {
    id: "cs-006",
    name: "Close — Final Offer",
    category: "close",
    sections: [
      {
        label: "Opening",
        text: "Hi [seller name], it's [agent name] from iAutoMotive. Thanks for your time over the past few days — I wanted to come back with our final offer on the [vehicle].",
      },
      {
        label: "Summary",
        text: "So to confirm — we'll list the [vehicle] at a retail price of [offer price]. After our flat consignment fee, your guaranteed net payout is [net estimate]. Based on current demand, we'd expect it to sell within 4–6 weeks.",
      },
      {
        label: "Final Terms",
        text: "Collection would be from [lot location] on [collection date]. We cover transport, full valet, professional photography, and all listing fees. You don't pay a penny upfront — our fee only comes out of the sale price.",
      },
      {
        label: "Signature Steps",
        text: "If you're happy to proceed, I'll email the consignment agreement now. It's a simple e-sign — takes about 2 minutes. Once signed, we'll schedule the collection and you're all set. Shall I send it across?",
      },
    ],
    variables: ["seller name", "agent name", "vehicle", "offer price", "net estimate", "lot location", "collection date"],
    isActive: false,
    createdBy: "Jordan M.",
    lastEdited: "2026-04-02T08:30:00Z",
    usageCount: 24,
  },
];

/* ================================================================== */
/*  SMS TEMPLATES                                                      */
/* ================================================================== */

export const smsTemplates: SmsTemplate[] = [
  {
    id: "sms-001",
    name: "Initial Outreach — AutoTrader Lead",
    category: "initial_outreach",
    body: "Hi {{seller_first_name}}, saw your {{vehicle}} on AutoTrader. We sell cars at full retail on consignment — no commission. Interested in a free valuation? Reply YES or call 0800 123 4567. iAutoMotive",
    variables: ["seller_first_name", "vehicle"],
    characterCount: 184,
    isActive: true,
    createdBy: "Sarah K.",
    approvedBy: "James T.",
    approvedAt: "2026-03-28T14:00:00Z",
  },
  {
    id: "sms-002",
    name: "Follow-Up — Post Call",
    category: "follow_up",
    body: "Hi {{seller_first_name}}, thanks for chatting today about your {{vehicle}}. As discussed, your estimated net payout is {{net_estimate}}. Any questions, just reply here. — {{agent_name}}, iAutoMotive",
    variables: ["seller_first_name", "vehicle", "net_estimate", "agent_name"],
    characterCount: 198,
    isActive: true,
    createdBy: "Sarah K.",
    approvedBy: "James T.",
    approvedAt: "2026-03-28T14:10:00Z",
  },
  {
    id: "sms-003",
    name: "Offer — Valuation Sent",
    category: "offer",
    body: "Hi {{seller_first_name}}, your valuation for the {{vehicle}} is ready. Listing price: {{offer_price}}, est. net payout: {{net_estimate}}. View full offer: {{offer_link}} — iAutoMotive",
    variables: ["seller_first_name", "vehicle", "offer_price", "net_estimate", "offer_link"],
    characterCount: 189,
    isActive: true,
    createdBy: "Aisha T.",
    approvedBy: "Sarah K.",
    approvedAt: "2026-04-01T09:30:00Z",
  },
  {
    id: "sms-004",
    name: "Callback Confirmation",
    category: "callback_confirmation",
    body: "Hi {{seller_first_name}}, confirming your callback at {{time}} on {{date}}. We'll call on {{phone}}. Need to reschedule? Reply here. — iAutoMotive",
    variables: ["seller_first_name", "time", "date", "phone"],
    characterCount: 148,
    isActive: true,
    createdBy: "Jordan M.",
    approvedBy: "Sarah K.",
    approvedAt: "2026-04-02T11:00:00Z",
  },
  {
    id: "sms-005",
    name: "Seller Update — Vehicle Collected",
    category: "seller_update",
    body: "Hi {{seller_first_name}}, your {{vehicle}} has been collected and is now at our prep centre. We'll have it photographed and listed within 48hrs. — iAutoMotive",
    variables: ["seller_first_name", "vehicle"],
    characterCount: 157,
    isActive: true,
    createdBy: "Aisha T.",
    approvedBy: "James T.",
    approvedAt: "2026-04-03T10:00:00Z",
  },
  {
    id: "sms-006",
    name: "Seller Update — Vehicle Listed",
    category: "seller_update",
    body: "Great news {{seller_first_name}}! Your {{vehicle}} is now live on AutoTrader, eBay Motors & our platform. View listing: {{listing_link}} — iAutoMotive",
    variables: ["seller_first_name", "vehicle", "listing_link"],
    characterCount: 152,
    isActive: true,
    createdBy: "Aisha T.",
    approvedBy: "Sarah K.",
    approvedAt: "2026-04-03T16:00:00Z",
  },
  {
    id: "sms-007",
    name: "Payout Notification",
    category: "payout_notification",
    body: "Hi {{seller_first_name}}, your {{vehicle}} has sold! Payment of {{payout_amount}} has been sent to your account ending {{account_last4}}. Funds arrive within 1-2 working days. — iAutoMotive",
    variables: ["seller_first_name", "vehicle", "payout_amount", "account_last4"],
    characterCount: 192,
    isActive: true,
    createdBy: "Sarah K.",
    approvedBy: "James T.",
    approvedAt: "2026-04-04T09:00:00Z",
  },
  {
    id: "sms-008",
    name: "General — Thank You / No-Go",
    category: "general",
    body: "Hi {{seller_first_name}}, thanks for considering iAutoMotive for your {{vehicle}}. If you change your mind, we're here. Best of luck! — iAutoMotive",
    variables: ["seller_first_name", "vehicle"],
    characterCount: 146,
    isActive: false,
    createdBy: "Jordan M.",
    approvedBy: null,
    approvedAt: null,
  },
];

/* ================================================================== */
/*  CATEGORY LABELS & COLORS                                           */
/* ================================================================== */

export const SCRIPT_CATEGORY_LABELS: Record<ScriptCategory, string> = {
  cold_call:  "Cold Call",
  follow_up:  "Follow-Up",
  objection:  "Objection",
  close:      "Close",
  callback:   "Callback",
  inbound:    "Inbound",
};

export const SCRIPT_CATEGORY_COLORS: Record<ScriptCategory, { bg: string; text: string }> = {
  cold_call:  { bg: "#1A1040", text: "#A78BFA" },
  follow_up:  { bg: "#0B2B1A", text: "#34D399" },
  objection:  { bg: "#2B1A00", text: "#F5A623" },
  close:      { bg: "#0F2540", text: "#60A5FA" },
  callback:   { bg: "#1A2030", text: "#94A3BB" },
  inbound:    { bg: "#0B2525", text: "#4DD9C7" },
};

export const SMS_CATEGORY_LABELS: Record<SmsCategory, string> = {
  initial_outreach:       "Initial Outreach",
  follow_up:              "Follow-Up",
  offer:                  "Offer",
  callback_confirmation:  "Callback Confirm",
  seller_update:          "Seller Update",
  payout_notification:    "Payout",
  general:                "General",
};

export const SMS_CATEGORY_COLORS: Record<SmsCategory, { bg: string; text: string }> = {
  initial_outreach:       { bg: "#1A1040", text: "#A78BFA" },
  follow_up:              { bg: "#0B2B1A", text: "#34D399" },
  offer:                  { bg: "#0F2540", text: "#60A5FA" },
  callback_confirmation:  { bg: "#1A2030", text: "#94A3BB" },
  seller_update:          { bg: "#0B2525", text: "#4DD9C7" },
  payout_notification:    { bg: "#0B2B1A", text: "#34D399" },
  general:                { bg: "#2B1A00", text: "#F5A623" },
};

/* ================================================================== */
/*  VARIABLE REFERENCE                                                 */
/* ================================================================== */

export const VARIABLE_REFERENCE = [
  { key: "seller_first_name", description: "Seller's first name" },
  { key: "seller_name",       description: "Seller's full name" },
  { key: "agent_name",        description: "Assigned agent's name" },
  { key: "vehicle",           description: "Full vehicle description (year, make, model)" },
  { key: "asking_price",      description: "Seller's original asking price" },
  { key: "offer_price",       description: "iAutoMotive listing/offer price" },
  { key: "net_estimate",      description: "Estimated net payout to seller" },
  { key: "market_low",        description: "Market low price for comparable vehicles" },
  { key: "market_high",       description: "Market high price for comparable vehicles" },
  { key: "collection_date",   description: "Scheduled vehicle collection date" },
  { key: "lot_location",      description: "Collection/prep centre address" },
  { key: "time",              description: "Callback or appointment time" },
  { key: "date",              description: "Callback or appointment date" },
  { key: "phone",             description: "Seller's phone number" },
  { key: "offer_link",        description: "Link to view formal offer online" },
  { key: "listing_link",      description: "Link to live vehicle listing" },
  { key: "payout_amount",     description: "Final payout amount after sale" },
  { key: "account_last4",     description: "Last 4 digits of seller's bank account" },
  { key: "last_contact_date", description: "Date of last contact with seller" },
];
