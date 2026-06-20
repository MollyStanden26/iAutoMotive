/* ================================================================== */
/*  CALL LOG MOCK DATA                                                 */
/* ================================================================== */

export interface CallLogRecord {
  id: string;
  callerName: string;
  callerInitials: string;
  callerBg: string;
  sellerName: string;
  sellerPhone: string;
  vehicleSummary: string;
  direction: "outbound" | "inbound";
  outcome: string;
  duration: number;
  notes: string;
  hasRecording: boolean;
  timestamp: string;
}

export interface CallerProfile {
  name: string;
  initials: string;
  bg: string;
}

export const CALLER_PROFILES: CallerProfile[] = [];

export const OUTCOME_LABELS: Record<string, string> = {
  connected_positive:       "Interested",
  converted:                "Converted",
  callback_requested:       "Callback",
  connected_not_interested: "Not Interested",
  wrong_number:             "Wrong Number",
  voicemail_left:           "Voicemail",
  voicemail_not_left:       "VM (no msg)",
  no_answer:                "No Answer",
  busy:                     "Busy",
  connected_neutral:        "Neutral",
};

export const OUTCOME_COLORS: Record<string, { color: string; bg: string }> = {
  connected_positive:       { color: "#34D399", bg: "#0B2B1A" },
  converted:                { color: "#34D399", bg: "#0B2B1A" },
  callback_requested:       { color: "#F5A623", bg: "#2B1A00" },
  connected_not_interested: { color: "#F87171", bg: "#2B0F0F" },
  wrong_number:             { color: "#F87171", bg: "#2B0F0F" },
  voicemail_left:           { color: "#A78BFA", bg: "#1A1040" },
  voicemail_not_left:       { color: "#A78BFA", bg: "#1A1040" },
  no_answer:                { color: "#94A3BB", bg: "#111D30" },
  busy:                     { color: "#94A3BB", bg: "#111D30" },
  connected_neutral:        { color: "#008C7C", bg: "#0A1A1A" },
};

export const CALL_LOG: CallLogRecord[] = [];
