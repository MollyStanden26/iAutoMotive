// Step 4: Add-ons — warranty, GAP, paint protection toggles

export default function AddonsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Add-ons</h1>
      <p>Vehicle ID: {params.id}</p>
      <p>Warranty, GAP insurance, paint protection toggles</p>
    </div>
  );
}
