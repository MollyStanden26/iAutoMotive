export interface ScriptSection {
  label: string;
  text: string;
}

export const scriptSections: ScriptSection[] = [];

export interface DiallerLead {
  id: string;
  sellerName: string;
  sellerPhone: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleTrim: string;
  askingPrice: string;
  mileage: string;
  scoutScore: number;
  priorContacts: number;
  lastContactDate: string;
  lastOutcome: string;
}

export interface DiallerSessionData {
  repName: string;
  repInitials: string;
  repPhone: string;
  startedAt: string;
}

export const DIALLER_SESSION: DiallerSessionData = {
  repName: "",
  repInitials: "",
  repPhone: "",
  startedAt: "",
};

export const DIALLER_QUEUE: DiallerLead[] = [];
