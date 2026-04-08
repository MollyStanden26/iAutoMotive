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

export const CALLER_PROFILES: CallerProfile[] = [
  { name: "Sarah K.",  initials: "SK", bg: "#008C7C" },
  { name: "James T.",  initials: "JT", bg: "#534AB7" },
  { name: "Emma R.",   initials: "ER", bg: "#854F0B" },
  { name: "Liam P.",   initials: "LP", bg: "#3B6D11" },
];

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

export const CALL_LOG: CallLogRecord[] = [
  // Apr 8 (today)
  { id: "cl-01", callerName: "Sarah K.", callerInitials: "SK", callerBg: "#008C7C", sellerName: "James Holloway", sellerPhone: "07914 442 881", vehicleSummary: "2021 BMW 320d M Sport", direction: "outbound", outcome: "connected_positive", duration: 222, notes: "Very interested in consignment. Wants valuation visit this week. Prefers Thursday afternoon.", hasRecording: true, timestamp: "2026-04-08T14:32:00.000Z" },
  { id: "cl-02", callerName: "James T.", callerInitials: "JT", callerBg: "#534AB7", sellerName: "Sarah Williams", sellerPhone: "07821 339 204", vehicleSummary: "2020 Audi A3 35 TFSI S Line", direction: "outbound", outcome: "voicemail_left", duration: 22, notes: "Left voicemail requesting callback. Mentioned competitive valuation.", hasRecording: true, timestamp: "2026-04-08T13:45:00.000Z" },
  { id: "cl-03", callerName: "Emma R.", callerInitials: "ER", callerBg: "#854F0B", sellerName: "Marcus Chen", sellerPhone: "07703 551 442", vehicleSummary: "2022 Mercedes A200 AMG Line", direction: "outbound", outcome: "no_answer", duration: 0, notes: "No answer after 6 rings. Will retry tomorrow morning.", hasRecording: false, timestamp: "2026-04-08T12:18:00.000Z" },
  { id: "cl-04", callerName: "Liam P.", callerInitials: "LP", callerBg: "#3B6D11", sellerName: "Emily Parker", sellerPhone: "07456 882 119", vehicleSummary: "2021 Volkswagen Golf GTI", direction: "inbound", outcome: "callback_requested", duration: 145, notes: "Called back from yesterday. Interested but needs to discuss with partner. Callback Friday 10am.", hasRecording: true, timestamp: "2026-04-08T11:50:00.000Z" },
  { id: "cl-05", callerName: "Sarah K.", callerInitials: "SK", callerBg: "#008C7C", sellerName: "Tom Brennan", sellerPhone: "07889 221 073", vehicleSummary: "2020 Ford Focus ST-3", direction: "outbound", outcome: "connected_not_interested", duration: 87, notes: "Already sold privately last week. Remove from queue.", hasRecording: true, timestamp: "2026-04-08T10:22:00.000Z" },
  { id: "cl-06", callerName: "James T.", callerInitials: "JT", callerBg: "#534AB7", sellerName: "Priya Kaur", sellerPhone: "07712 664 338", vehicleSummary: "2023 Volvo XC40 Recharge Plus", direction: "outbound", outcome: "converted", duration: 278, notes: "Agreed to consign. Sending agreement via DocuSign. Collection booked for Monday.", hasRecording: true, timestamp: "2026-04-08T09:35:00.000Z" },

  // Apr 7
  { id: "cl-07", callerName: "Emma R.", callerInitials: "ER", callerBg: "#854F0B", sellerName: "Daniel Murphy", sellerPhone: "07934 115 667", vehicleSummary: "2021 Range Rover Evoque R-Dynamic S", direction: "outbound", outcome: "connected_positive", duration: 195, notes: "Keen to proceed. Wants to know about photography and listing process.", hasRecording: true, timestamp: "2026-04-07T16:10:00.000Z" },
  { id: "cl-08", callerName: "Liam P.", callerInitials: "LP", callerBg: "#3B6D11", sellerName: "Lisa Thompson", sellerPhone: "07845 773 290", vehicleSummary: "2022 Mazda 3 GT Sport Tech", direction: "outbound", outcome: "busy", duration: 0, notes: "Line busy. Retry scheduled for tomorrow.", hasRecording: false, timestamp: "2026-04-07T15:30:00.000Z" },
  { id: "cl-09", callerName: "Sarah K.", callerInitials: "SK", callerBg: "#008C7C", sellerName: "Raj Patel", sellerPhone: "07501 882 456", vehicleSummary: "2020 BMW 118i M Sport", direction: "outbound", outcome: "voicemail_left", duration: 18, notes: "Left voicemail. Second attempt.", hasRecording: true, timestamp: "2026-04-07T14:05:00.000Z" },
  { id: "cl-10", callerName: "James T.", callerInitials: "JT", callerBg: "#534AB7", sellerName: "Hannah Scott", sellerPhone: "07623 449 112", vehicleSummary: "2021 Audi Q3 35 TFSI Vorsprung", direction: "inbound", outcome: "connected_positive", duration: 210, notes: "Saw our ad. Wants a quote for her Q3. Sending valuation link.", hasRecording: true, timestamp: "2026-04-07T11:42:00.000Z" },
  { id: "cl-11", callerName: "Emma R.", callerInitials: "ER", callerBg: "#854F0B", sellerName: "Chris Walker", sellerPhone: "07778 336 801", vehicleSummary: "2022 Toyota Yaris Cross Design", direction: "outbound", outcome: "connected_not_interested", duration: 65, notes: "Not selling anymore. Changed mind after repair quote came in lower.", hasRecording: false, timestamp: "2026-04-07T10:15:00.000Z" },
  { id: "cl-12", callerName: "Liam P.", callerInitials: "LP", callerBg: "#3B6D11", sellerName: "Fatima Ahmed", sellerPhone: "07490 558 234", vehicleSummary: "2021 Hyundai Tucson Premium", direction: "outbound", outcome: "callback_requested", duration: 120, notes: "Interested but at work. Callback requested for 6pm today.", hasRecording: true, timestamp: "2026-04-07T09:48:00.000Z" },

  // Apr 6
  { id: "cl-13", callerName: "Sarah K.", callerInitials: "SK", callerBg: "#008C7C", sellerName: "George Bennett", sellerPhone: "07856 142 908", vehicleSummary: "2020 Skoda Octavia vRS", direction: "outbound", outcome: "wrong_number", duration: 35, notes: "Number belongs to someone else. Need updated contact info.", hasRecording: false, timestamp: "2026-04-06T16:20:00.000Z" },
  { id: "cl-14", callerName: "James T.", callerInitials: "JT", callerBg: "#534AB7", sellerName: "Amelia Rose", sellerPhone: "07367 229 445", vehicleSummary: "2023 MINI Cooper S Sport", direction: "outbound", outcome: "converted", duration: 245, notes: "Signed agreement on call. Premium listing confirmed. Collection Wednesday.", hasRecording: true, timestamp: "2026-04-06T14:55:00.000Z" },
  { id: "cl-15", callerName: "Emma R.", callerInitials: "ER", callerBg: "#854F0B", sellerName: "Oliver Hughes", sellerPhone: "07412 883 567", vehicleSummary: "2021 Peugeot 3008 GT", direction: "inbound", outcome: "connected_neutral", duration: 180, notes: "Enquiring about process. Not committed yet. Sent brochure via email.", hasRecording: true, timestamp: "2026-04-06T13:08:00.000Z" },
  { id: "cl-16", callerName: "Liam P.", callerInitials: "LP", callerBg: "#3B6D11", sellerName: "Sophie Taylor", sellerPhone: "07534 221 890", vehicleSummary: "2022 Kia Sportage GT-Line", direction: "outbound", outcome: "no_answer", duration: 0, notes: "No answer. First attempt.", hasRecording: false, timestamp: "2026-04-06T11:30:00.000Z" },
  { id: "cl-17", callerName: "Sarah K.", callerInitials: "SK", callerBg: "#008C7C", sellerName: "Ryan Cooper", sellerPhone: "07698 445 332", vehicleSummary: "2020 Nissan Qashqai Tekna+", direction: "outbound", outcome: "voicemail_not_left", duration: 15, notes: "Voicemail full. Will try again later.", hasRecording: false, timestamp: "2026-04-06T10:02:00.000Z" },

  // Apr 5
  { id: "cl-18", callerName: "James T.", callerInitials: "JT", callerBg: "#534AB7", sellerName: "Charlotte Adams", sellerPhone: "07223 667 114", vehicleSummary: "2021 Seat Leon FR", direction: "outbound", outcome: "connected_positive", duration: 198, notes: "Very keen. Asking about timeline and fees. Follow-up email sent.", hasRecording: true, timestamp: "2026-04-05T15:40:00.000Z" },
  { id: "cl-19", callerName: "Emma R.", callerInitials: "ER", callerBg: "#854F0B", sellerName: "Jack Morrison", sellerPhone: "07889 334 556", vehicleSummary: "2022 Honda Civic Sport", direction: "outbound", outcome: "busy", duration: 0, notes: "Line busy twice today.", hasRecording: false, timestamp: "2026-04-05T14:12:00.000Z" },
  { id: "cl-20", callerName: "Liam P.", callerInitials: "LP", callerBg: "#3B6D11", sellerName: "Isabella Ward", sellerPhone: "07745 998 223", vehicleSummary: "2023 Cupra Formentor VZ", direction: "outbound", outcome: "connected_positive", duration: 167, notes: "Interested in premium package. Wants to see comparable sold prices.", hasRecording: true, timestamp: "2026-04-05T11:55:00.000Z" },
  { id: "cl-21", callerName: "Sarah K.", callerInitials: "SK", callerBg: "#008C7C", sellerName: "James Holloway", sellerPhone: "07914 442 881", vehicleSummary: "2021 BMW 320d M Sport", direction: "outbound", outcome: "voicemail_left", duration: 20, notes: "Follow-up voicemail. Mentioned new market data for his area.", hasRecording: true, timestamp: "2026-04-05T09:30:00.000Z" },

  // Apr 4
  { id: "cl-22", callerName: "James T.", callerInitials: "JT", callerBg: "#534AB7", sellerName: "Natasha Brooks", sellerPhone: "07601 778 443", vehicleSummary: "2020 Renault Captur Iconic", direction: "inbound", outcome: "callback_requested", duration: 92, notes: "Returning missed call. Interested but travelling until Monday.", hasRecording: true, timestamp: "2026-04-04T16:45:00.000Z" },
  { id: "cl-23", callerName: "Emma R.", callerInitials: "ER", callerBg: "#854F0B", sellerName: "David Fletcher", sellerPhone: "07334 556 891", vehicleSummary: "2021 Jaguar E-Pace R-Dynamic", direction: "outbound", outcome: "connected_not_interested", duration: 78, notes: "Wants to wait 6 months. Finance not yet settled.", hasRecording: true, timestamp: "2026-04-04T14:20:00.000Z" },
  { id: "cl-24", callerName: "Liam P.", callerInitials: "LP", callerBg: "#3B6D11", sellerName: "Megan Phillips", sellerPhone: "07456 112 887", vehicleSummary: "2022 Vauxhall Mokka-e Elite Nav", direction: "outbound", outcome: "no_answer", duration: 0, notes: "No answer. Third attempt this week.", hasRecording: false, timestamp: "2026-04-04T12:10:00.000Z" },
  { id: "cl-25", callerName: "Sarah K.", callerInitials: "SK", callerBg: "#008C7C", sellerName: "Raj Patel", sellerPhone: "07501 882 456", vehicleSummary: "2020 BMW 118i M Sport", direction: "outbound", outcome: "connected_neutral", duration: 135, notes: "Answered this time. Comparing us with WeBuyAnyCar. Sent comparison sheet.", hasRecording: true, timestamp: "2026-04-04T10:05:00.000Z" },

  // Apr 3
  { id: "cl-26", callerName: "James T.", callerInitials: "JT", callerBg: "#534AB7", sellerName: "Lucy Harrison", sellerPhone: "07778 223 665", vehicleSummary: "2021 Ford Puma ST-Line X", direction: "outbound", outcome: "converted", duration: 302, notes: "Closed the deal. Standard listing. Collection Friday. Very happy customer.", hasRecording: true, timestamp: "2026-04-03T15:22:00.000Z" },
  { id: "cl-27", callerName: "Emma R.", callerInitials: "ER", callerBg: "#854F0B", sellerName: "Sophie Taylor", sellerPhone: "07534 221 890", vehicleSummary: "2022 Kia Sportage GT-Line", direction: "outbound", outcome: "voicemail_left", duration: 25, notes: "First contact attempt. Left detailed voicemail about our service.", hasRecording: true, timestamp: "2026-04-03T13:40:00.000Z" },
  { id: "cl-28", callerName: "Liam P.", callerInitials: "LP", callerBg: "#3B6D11", sellerName: "Alex Turner", sellerPhone: "07612 449 778", vehicleSummary: "2020 Citroen C5 Aircross Flair", direction: "outbound", outcome: "wrong_number", duration: 28, notes: "Disconnected number. Remove from list.", hasRecording: false, timestamp: "2026-04-03T11:15:00.000Z" },

  // Apr 2
  { id: "cl-29", callerName: "Sarah K.", callerInitials: "SK", callerBg: "#008C7C", sellerName: "Daniel Murphy", sellerPhone: "07934 115 667", vehicleSummary: "2021 Range Rover Evoque R-Dynamic S", direction: "outbound", outcome: "callback_requested", duration: 110, notes: "Interested but in a meeting. Asked to call back after 4pm.", hasRecording: true, timestamp: "2026-04-02T14:00:00.000Z" },
  { id: "cl-30", callerName: "James T.", callerInitials: "JT", callerBg: "#534AB7", sellerName: "Emily Parker", sellerPhone: "07456 882 119", vehicleSummary: "2021 Volkswagen Golf GTI", direction: "outbound", outcome: "no_answer", duration: 0, notes: "No answer. Will follow up tomorrow.", hasRecording: false, timestamp: "2026-04-02T10:30:00.000Z" },
];
