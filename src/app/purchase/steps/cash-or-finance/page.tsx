"use client";

/**
 * Step 3 — Cash or finance. Placeholder while the finance application
 * flow (RouteOne-backed) is being built; lets the trade-in step's "Next"
 * land somewhere real instead of 404-ing.
 */
export default function CashOrFinancePage() {
  return (
    <div style={{ maxWidth: 720, fontFamily: "var(--font-body)" }}>
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 28,
        color: "#0D1525", marginBottom: 16,
      }}>Cash or finance</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
        Coming next — pick how you want to pay for the car. Cash, card or
        full finance via our 40+ lender panel.
      </p>
    </div>
  );
}
