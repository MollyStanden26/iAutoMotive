// Update stage — move to next stage, add notes, attach photos

export default function UpdateStagePage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Update Stage — {params.vin}</div>;
}
