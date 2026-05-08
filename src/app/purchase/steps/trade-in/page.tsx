"use client";

/**
 * Step 2 of the purchase flow — placeholder for now. The full trade-in form
 * (current vehicle reg, mileage, condition, payoff balance) lands in a
 * follow-up commit; right now this just confirms navigation from
 * personal-details lands in the right place.
 */
export default function TradeInPage() {
  return (
    <div style={{ maxWidth: 720, fontFamily: "var(--font-body)" }}>
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 28,
        color: "#0D1525", marginBottom: 16,
      }}>Trade-in</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
        Coming next — give us your current vehicle&apos;s details and we&apos;ll
        roll the trade-in value straight into your purchase price.
      </p>
    </div>
  );
}
