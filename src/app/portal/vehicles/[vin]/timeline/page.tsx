// Activity timeline — full chronological event log

export default function ActivityTimelinePage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Activity Timeline — {params.vin}</div>;
}
