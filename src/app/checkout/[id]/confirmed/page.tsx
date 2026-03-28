// Order confirmed — order number, delivery date, next steps

export default function ConfirmedPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Order Confirmed</h1>
      <p>Vehicle ID: {params.id}</p>
      <p>Order number, delivery date, next steps</p>
    </div>
  );
}
