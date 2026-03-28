// Net payout estimate — live net sheet with all deductions

export default function PayoutEstimatePage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Net Payout Estimate — {params.vin}</div>;
}
