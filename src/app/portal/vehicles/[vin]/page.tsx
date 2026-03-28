// Vehicle status — 5-stage progress tracker, recon photos, listing link

export default function VehicleStatusPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Vehicle Status — {params.vin}</div>;
}
