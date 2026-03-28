// HPI check result — clear/flags/block states

export default function HpiCheckPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>HPI Check Result — {params.vin}</div>;
}
