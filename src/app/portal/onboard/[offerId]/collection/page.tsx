// Confirm collection — date/time picker, address, special instructions

export default function ConfirmCollectionPage({
  params,
}: {
  params: { offerId: string };
}) {
  return <div>Confirm Collection — {params.offerId}</div>;
}
