// Listing approve — review AI description, approve to go live

export default function ListingApprovePage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Listing Approve — {params.vin}</div>;
}
