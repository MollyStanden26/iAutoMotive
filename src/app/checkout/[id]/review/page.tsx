// Step 5: Deal review — full itemised breakdown, edit links

export default function ReviewPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Deal Review</h1>
      <p>Vehicle ID: {params.id}</p>
      <p>Full itemised breakdown with edit links</p>
    </div>
  );
}
