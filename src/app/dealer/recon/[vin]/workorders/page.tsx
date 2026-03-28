// Work orders — create mechanical/body/detail orders, cost entry

export default function WorkOrdersPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Work Orders — {params.vin}</div>;
}
