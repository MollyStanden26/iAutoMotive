// Step 7: Delivery — date/time picker, home delivery vs collection

export default function DeliveryPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Delivery</h1>
      <p>Vehicle ID: {params.id}</p>
      <p>Date/time picker, home delivery vs collection</p>
    </div>
  );
}
