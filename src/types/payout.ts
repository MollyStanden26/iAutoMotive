export type PayoutStatus =
  | "pending"
  | "in-escrow"
  | "released"
  | "failed";

export interface Payout {
  id: string;
  dealId: string;
  sellerId: string;
  vehicleVin: string;
  salePrice: number;
  platformFee: number;
  reconCost: number;
  transportCost: number;
  financePayoff: number;
  netPayout: number;
  status: PayoutStatus;
  paymentMethod: "bacs" | "chaps" | "faster-payments" | "cheque";
  expectedDate: string;
  releasedAt?: string;
  stripeTransferId?: string;
}
