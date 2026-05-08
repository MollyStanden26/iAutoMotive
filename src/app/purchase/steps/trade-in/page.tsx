"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * Step 2 — Add a trade-in. Matches the Carvana reference: a single hero
 * card pitching the trade-in benefits, with two CTAs ("Get trade-in offer"
 * and "I don't have a trade-in"). Both currently advance to the next step;
 * the actual offer-collection form lands in a follow-up commit.
 */
export default function TradeInPage() {
  const router = useRouter();
  const search = useSearchParams();
  const vehicleId = search.get("vehicleId");
  const qs = vehicleId ? `?vehicleId=${vehicleId}` : "";

  const goNext = () => router.push(`/purchase/steps/finance${qs}`);

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 28,
        color: "#0D1525", marginBottom: 28,
      }}>Add a trade-in</h1>

      {/* Pitch card with the "coming soon" overlay sitting on top of the
          benefits + the disabled "Get trade-in offer" button. The overlay
          isn't a modal — buyers can still skip past it via "I don't have
          a trade-in" below — it's a passive notice. */}
      <div style={{ position: "relative" }}>
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: 28,
          display: "grid",
          gridTemplateColumns: "minmax(0, 280px) 1fr",
          gap: 28,
          alignItems: "center",
          opacity: 0.45,
          filter: "saturate(0.6)",
          pointerEvents: "none",
        }}>
          <TradeInIllustration />
          <ul style={{
            listStyle: "none", margin: 0, padding: 0,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <BenefitRow text="Get a real offer in 2 minutes" />
            <BenefitRow text="Reduce or eliminate down and monthly payments" />
            <BenefitRow text="Roll your trade-in value straight into the purchase price" />
          </ul>
        </div>

        {/* Centred notice card */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16, pointerEvents: "none",
        }}>
          <div style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 16,
            padding: "20px 28px",
            maxWidth: 420, textAlign: "center",
            boxShadow: "0 16px 40px rgba(7, 13, 24, 0.12)",
            pointerEvents: "auto",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#FFF8E6", color: "#92400E",
              padding: "4px 12px", borderRadius: 9999,
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
              letterSpacing: "0.06em", textTransform: "uppercase",
              marginBottom: 10,
            }}>
              Coming soon
            </div>
            <div style={{
              fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 18,
              color: "#0D1525", marginBottom: 6,
            }}>
              Accepting trade-ins soon
            </div>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: 13, color: "#64748B",
              lineHeight: 1.5,
            }}>
              Trade-ins are currently unavailable. You can continue with your
              purchase using the option below.
            </div>
          </div>
        </div>
      </div>

      {/* CTAs — "Get trade-in offer" disabled while trade-ins are paused */}
      <div style={{
        marginTop: 32, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 14,
      }}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Trade-ins are coming soon"
          style={{
            width: "min(360px, 100%)", height: 52, borderRadius: 9999,
            background: "#008C7C", color: "#FFFFFF", border: "none",
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
            cursor: "not-allowed", opacity: 0.4,
          }}
        >Get trade-in offer</button>
        <button
          type="button"
          onClick={goNext}
          style={{
            width: "min(360px, 100%)", height: 52, borderRadius: 9999,
            background: "#FFFFFF", color: "#0D1525",
            border: "1.5px solid #0D1525",
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
            cursor: "pointer",
          }}
        >I don&apos;t have a trade-in</button>
      </div>
    </div>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{
        flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
        background: "#E0FAF5", color: "#008C7C",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800,
      }}>✓</span>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: 15, color: "#0D1525",
        lineHeight: 1.5,
      }}>{text}</span>
    </li>
  );
}

/**
 * Inline SVG of a car on a transporter against a brand-teal blob.
 * Inline (not a public asset) so the bundle stays small and we can
 * theme it from CSS variables in future without a round-trip.
 */
function TradeInIllustration() {
  return (
    <div style={{ position: "relative", aspectRatio: "4/3", width: "100%" }}>
      <svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        {/* Teal blob */}
        <path
          d="M40,150 C20,90 70,30 150,40 C220,48 280,80 290,140 C298,190 240,210 170,210 C90,210 55,200 40,150 Z"
          fill="#E0FAF5"
        />
        {/* Transporter chassis */}
        <rect x="50" y="160" width="200" height="14" rx="3" fill="#0D1525" />
        <circle cx="80" cy="186" r="14" fill="#0D1525" />
        <circle cx="80" cy="186" r="6" fill="#E0FAF5" />
        <circle cx="220" cy="186" r="14" fill="#0D1525" />
        <circle cx="220" cy="186" r="6" fill="#E0FAF5" />
        {/* Cab */}
        <path d="M40,160 L40,128 L72,128 L82,150 L82,160 Z" fill="#008C7C" />
        <rect x="46" y="134" width="22" height="14" rx="2" fill="#E0FAF5" />
        {/* Car body on the bed */}
        <path
          d="M100,160 L114,128 C118,118 126,114 138,114 L218,114 C228,114 234,118 238,126 L246,160 Z"
          fill="#FFFFFF" stroke="#0D1525" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Car windows */}
        <path d="M128,128 L142,118 L196,118 L210,128 Z" fill="#0D1525" opacity="0.85" />
        {/* Car wheels */}
        <circle cx="138" cy="160" r="10" fill="#0D1525" />
        <circle cx="138" cy="160" r="4" fill="#FFFFFF" />
        <circle cx="208" cy="160" r="10" fill="#0D1525" />
        <circle cx="208" cy="160" r="4" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
