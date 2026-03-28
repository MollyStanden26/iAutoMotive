// Order detail — vehicle, deal breakdown, documents, delivery status

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Order Detail</h1>
      <p>Order ID: {params.id}</p>
      <p>Vehicle, deal breakdown, documents, delivery status</p>
    </div>
  );
}
