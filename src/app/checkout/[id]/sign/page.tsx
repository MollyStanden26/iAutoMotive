// Step 6: Sign documents — DocuSign embedded, cooling-off notice

export default function SignPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Sign Documents</h1>
      <p>Vehicle ID: {params.id}</p>
      <p>DocuSign embedded signing, cooling-off notice</p>
    </div>
  );
}
