// Return initiation — reason, condition declaration, pickup scheduling

export default function ReturnPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Return Initiation</h1>
      <p>Order ID: {params.id}</p>
      <p>Reason, condition declaration, pickup scheduling</p>
    </div>
  );
}
