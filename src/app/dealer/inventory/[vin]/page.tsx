// Vehicle detail — stage tracker, work orders, photos, recon cost

export default function VehicleDetailPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Vehicle Detail — {params.vin}</div>;
}
