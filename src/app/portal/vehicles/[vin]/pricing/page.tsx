// Price & listing history — price change log with reasons

export default function PricingHistoryPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Price &amp; Listing History — {params.vin}</div>;
}
