// Step 2: Finance or cash — pre-qual result, term selector, monthly calc

export default function FinancePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Finance or Cash</h1>
      <p>Vehicle ID: {params.id}</p>
      <p>Pre-qualification result, term selector, monthly calculation</p>
    </div>
  );
}
