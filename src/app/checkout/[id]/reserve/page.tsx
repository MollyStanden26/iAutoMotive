// Step 1: Reserve — £199 refundable deposit, Stripe card input

export default function ReservePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Reserve Vehicle</h1>
      <p>Vehicle ID: {params.id}</p>
      <p>£199 refundable deposit — Stripe card input</p>
    </div>
  );
}
