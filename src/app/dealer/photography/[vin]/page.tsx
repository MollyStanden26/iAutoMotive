// Photo upload — guided 32-shot upload, 360 stitch preview

export default function PhotoUploadPage({
  params,
}: {
  params: { vin: string };
}) {
  return <div>Photo Upload — {params.vin}</div>;
}
