// Accept offer — offer amount, net payout estimate, fee breakdown, consignment terms

export default function AcceptOfferPage({
  params,
}: {
  params: { offerId: string };
}) {
  return <div>Accept Offer — {params.offerId}</div>;
}
