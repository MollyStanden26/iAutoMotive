export type LeadStage =
  | "new"
  | "contacted"
  | "negotiating"
  | "offer-sent"
  | "accepted"
  | "rejected";

export type LeadSource = "autotrader" | "facebook" | "website" | "direct";

export interface Lead {
  id: string;
  source: LeadSource;
  stage: LeadStage;
  scoutScore: number; // 0-100
  sellerName: string;
  sellerPhone?: string;
  sellerEmail?: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  askingPrice: number;
  offerPrice?: number;
  assignedCallerId?: string;
  siteId?: string;
  callLog: CallRecord[];
  aiOutreachLog: OutreachRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CallRecord {
  id: string;
  callerId: string;
  outcome: "interested" | "callback" | "declined" | "voicemail" | "no-answer";
  notes: string;
  duration: number; // seconds
  scheduledCallback?: string;
  createdAt: string;
}

export interface OutreachRecord {
  id: string;
  channel: "autotrader" | "sms" | "email";
  messageVariant: string;
  sent: boolean;
  opened: boolean;
  responded: boolean;
  createdAt: string;
}
