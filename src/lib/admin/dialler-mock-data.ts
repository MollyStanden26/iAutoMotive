import { crmDashboardData } from "./crm-mock-data";

export const scriptSections = crmDashboardData.scriptSections;

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
  repName: "Sarah K.",
  repInitials: "SK",
  repPhone: "+44 121 496 0821",
  startedAt: new Date().toISOString(),
};

export const DIALLER_QUEUE: DiallerLead[] = [
  { id: "dl-01", sellerName: "James Holloway", sellerPhone: "07914 442 881", vehicleYear: 2021, vehicleMake: "BMW", vehicleModel: "3 Series", vehicleTrim: "320d M Sport", askingPrice: "£21,500", mileage: "34k mi", scoutScore: 87, priorContacts: 2, lastContactDate: "3 Apr", lastOutcome: "Callback" },
  { id: "dl-02", sellerName: "Sarah Williams", sellerPhone: "07821 339 204", vehicleYear: 2020, vehicleMake: "Audi", vehicleModel: "A3", vehicleTrim: "35 TFSI S Line", askingPrice: "£18,900", mileage: "28k mi", scoutScore: 82, priorContacts: 1, lastContactDate: "1 Apr", lastOutcome: "Voicemail" },
  { id: "dl-03", sellerName: "Marcus Chen", sellerPhone: "07703 551 442", vehicleYear: 2022, vehicleMake: "Mercedes", vehicleModel: "A-Class", vehicleTrim: "A200 AMG Line", askingPrice: "£24,750", mileage: "19k mi", scoutScore: 91, priorContacts: 0, lastContactDate: "—", lastOutcome: "New" },
  { id: "dl-04", sellerName: "Emily Parker", sellerPhone: "07456 882 119", vehicleYear: 2021, vehicleMake: "Volkswagen", vehicleModel: "Golf", vehicleTrim: "GTI", askingPrice: "£23,200", mileage: "31k mi", scoutScore: 85, priorContacts: 3, lastContactDate: "5 Apr", lastOutcome: "Interested" },
  { id: "dl-05", sellerName: "Tom Brennan", sellerPhone: "07889 221 073", vehicleYear: 2020, vehicleMake: "Ford", vehicleModel: "Focus", vehicleTrim: "ST-3", askingPrice: "£19,400", mileage: "42k mi", scoutScore: 74, priorContacts: 1, lastContactDate: "28 Mar", lastOutcome: "No Answer" },
  { id: "dl-06", sellerName: "Priya Kaur", sellerPhone: "07712 664 338", vehicleYear: 2023, vehicleMake: "Volvo", vehicleModel: "XC40", vehicleTrim: "Recharge Plus", askingPrice: "£31,800", mileage: "8k mi", scoutScore: 93, priorContacts: 0, lastContactDate: "—", lastOutcome: "New" },
  { id: "dl-07", sellerName: "Daniel Murphy", sellerPhone: "07934 115 667", vehicleYear: 2021, vehicleMake: "Range Rover", vehicleModel: "Evoque", vehicleTrim: "R-Dynamic S", askingPrice: "£29,500", mileage: "26k mi", scoutScore: 88, priorContacts: 2, lastContactDate: "4 Apr", lastOutcome: "Callback" },
  { id: "dl-08", sellerName: "Lisa Thompson", sellerPhone: "07845 773 290", vehicleYear: 2022, vehicleMake: "Mazda", vehicleModel: "3", vehicleTrim: "GT Sport Tech", askingPrice: "£20,100", mileage: "15k mi", scoutScore: 79, priorContacts: 0, lastContactDate: "—", lastOutcome: "New" },
  { id: "dl-09", sellerName: "Raj Patel", sellerPhone: "07501 882 456", vehicleYear: 2020, vehicleMake: "BMW", vehicleModel: "1 Series", vehicleTrim: "118i M Sport", askingPrice: "£17,800", mileage: "39k mi", scoutScore: 76, priorContacts: 1, lastContactDate: "30 Mar", lastOutcome: "Voicemail" },
  { id: "dl-10", sellerName: "Hannah Scott", sellerPhone: "07623 449 112", vehicleYear: 2021, vehicleMake: "Audi", vehicleModel: "Q3", vehicleTrim: "35 TFSI Vorsprung", askingPrice: "£27,600", mileage: "22k mi", scoutScore: 86, priorContacts: 0, lastContactDate: "—", lastOutcome: "New" },
  { id: "dl-11", sellerName: "Chris Walker", sellerPhone: "07778 336 801", vehicleYear: 2022, vehicleMake: "Toyota", vehicleModel: "Yaris Cross", vehicleTrim: "Design", askingPrice: "£19,200", mileage: "12k mi", scoutScore: 71, priorContacts: 2, lastContactDate: "2 Apr", lastOutcome: "Declined" },
  { id: "dl-12", sellerName: "Fatima Ahmed", sellerPhone: "07490 558 234", vehicleYear: 2021, vehicleMake: "Hyundai", vehicleModel: "Tucson", vehicleTrim: "Premium", askingPrice: "£22,400", mileage: "27k mi", scoutScore: 80, priorContacts: 1, lastContactDate: "31 Mar", lastOutcome: "Callback" },
  { id: "dl-13", sellerName: "George Bennett", sellerPhone: "07856 142 908", vehicleYear: 2020, vehicleMake: "Skoda", vehicleModel: "Octavia", vehicleTrim: "vRS", askingPrice: "£18,500", mileage: "45k mi", scoutScore: 73, priorContacts: 0, lastContactDate: "—", lastOutcome: "New" },
  { id: "dl-14", sellerName: "Amelia Rose", sellerPhone: "07367 229 445", vehicleYear: 2023, vehicleMake: "MINI", vehicleModel: "Cooper S", vehicleTrim: "Sport", askingPrice: "£25,900", mileage: "6k mi", scoutScore: 90, priorContacts: 1, lastContactDate: "6 Apr", lastOutcome: "Interested" },
];
