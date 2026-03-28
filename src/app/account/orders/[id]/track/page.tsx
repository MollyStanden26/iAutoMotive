// Delivery tracking — GPS map, driver ETA, pre-delivery photos

export default function TrackPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Delivery Tracking</h1>
      <p>Order ID: {params.id}</p>
      <p>GPS map, driver ETA, pre-delivery photos</p>
    </div>
  );
}
