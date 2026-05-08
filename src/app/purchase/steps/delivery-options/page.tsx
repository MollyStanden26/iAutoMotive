"use client";

/**
 * Step 4 — Delivery options. Placeholder while the delivery flow
 * (date picker + collection vs at-home delivery) is being built.
 */
export default function DeliveryOptionsPage() {
  return (
    <div style={{ maxWidth: 720, fontFamily: "var(--font-body)" }}>
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 28,
        color: "#0D1525", marginBottom: 16,
      }}>Delivery options</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
        Coming next — pick a delivery date and choose between at-home
        delivery or collecting from the lot.
      </p>
    </div>
  );
}
