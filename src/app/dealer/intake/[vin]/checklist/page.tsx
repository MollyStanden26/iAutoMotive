// Intake checklist — guided 32-photo capture, damage notes, mileage, keys

export default function IntakeChecklistPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Intake Checklist — {params.vin}</div>;
}
