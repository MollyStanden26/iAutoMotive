// Step 3: Trade-in — apply existing or start new, equity calc

export default function TradePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Trade-In</h1>
      <p>Vehicle ID: {params.id}</p>
      <p>Apply existing or start new trade-in, equity calculation</p>
    </div>
  );
}
