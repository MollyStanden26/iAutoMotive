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

export const callScripts: CallScript[] = [];

/* ================================================================== */
/*  SMS TEMPLATES                                                      */
/* ================================================================== */

export const smsTemplates: SmsTemplate[] = [];

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
