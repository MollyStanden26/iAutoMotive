export type DealStage =
  | "reserved"
  | "finance-pending"
  | "identity-check"
  | "documents-signing"
  | "funding"
  | "title-transfer"
  | "delivery-scheduled"
  | "delivered"
  | "return-window"
  | "closed"
  | "returned"
  | "disputed";

export interface Deal {
  id: string;
  vehicleVin: string;
  buyerId: string;
  sellerId: string;
  stage: DealStage;
  salePrice: number;
  platformFee: number;
  reconCost: number;
  transportCost: number;
  financePayoff: number;
  netSellerPayout: number;
  financeStatus?: FinanceStatus;
  identityStatus: IdentityStatus;
  documents: DealDocument[];
  escrowConditions: EscrowConditions;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceStatus {
  method: "cash" | "finance";
  lender?: string;
  approved: boolean;
  monthlyPayment?: number;
  term?: number;
  apr?: number;
  funded: boolean;
}

export interface IdentityStatus {
  idVerified: boolean;
  addressVerified: boolean;
  pepScreened: boolean;
  sanctionsScreened: boolean;
  fraudRiskScore: number;
  deepfakeFlag: boolean;
}

export interface DealDocument {
  id: string;
  name: string;
  type: string;
  signed: boolean;
  signedAt?: string;
  docusignEnvelopeId?: string;
}

export interface EscrowConditions {
  v5cTransferred: boolean;
  returnWindowExpired: boolean;
  noOpenDisputes: boolean;
  financeConfirmed: boolean;
  complianceCheckPassed: boolean;
}
