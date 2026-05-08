import { redirect } from "next/navigation";

/** /purchase → bounces to step 1 (personal details), preserving vehicleId. */
export default function PurchaseIndex({ searchParams }: { searchParams: { vehicleId?: string } }) {
  const v = searchParams.vehicleId;
  redirect(v ? `/purchase/steps/personal-details?vehicleId=${v}` : "/purchase/steps/personal-details");
}
