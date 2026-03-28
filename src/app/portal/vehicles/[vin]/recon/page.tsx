// Recon approval — work orders above threshold for seller approval

export default function ReconApprovalPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Recon Approval — {params.vin}</div>;
}
