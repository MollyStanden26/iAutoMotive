// Sign consignment agreement — plain-English terms, DocuSign embed

export default function SignAgreementPage({
  params,
}: {
  params: { offerId: string };
}) {
  return <div>Sign Consignment Agreement — {params.offerId}</div>;
}
