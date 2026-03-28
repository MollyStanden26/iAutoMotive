export type UserRole =
  | "super-admin"
  | "site-manager"
  | "finance"
  | "sales"
  | "recon-tech"
  | "compliance"
  | "read-only"
  | "seller"
  | "buyer"
  | "dealer";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  siteId?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Seller extends User {
  role: "seller";
  bankAccountLast4?: string;
  vehicles: string[]; // VINs
}

export interface Buyer extends User {
  role: "buyer";
  savedCars: string[];
  orders: string[];
}

export interface StaffMember extends User {
  trainingCompleted: boolean;
  trainingRecord: TrainingItem[];
}

export interface TrainingItem {
  topic: string;
  completedAt: string;
  signedOff: boolean;
}
