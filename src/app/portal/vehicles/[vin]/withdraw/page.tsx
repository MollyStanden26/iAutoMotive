// Request withdrawal — cost disclosure, refund calc, confirm (destructive)

export default function RequestWithdrawalPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Request Withdrawal — {params.vin}</div>;
}
