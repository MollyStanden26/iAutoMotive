"use client";

export default function AcquisitionLeadDetailPage({ params }: { params: { id: string } }) {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "#0B111E", color: "#F1F5F9", fontFamily: "var(--font-heading)" }}
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Lead Detail</h1>
        <p style={{ color: "#6B7A90" }}>Lead {params.id} — coming soon</p>
      </div>
    </div>
  );
}
