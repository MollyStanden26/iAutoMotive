// Listing preview — read-only VDP as buyers see it

export default function ListingPreviewPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Listing Preview — {params.vin}</div>;
}
