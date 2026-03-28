"use client";

const competitors = [
  {
    name: "Cazoo",
    amount: "£12,200",
    label: "Instant offer",
    highlighted: false,
  },
  {
    name: "AutoConsign",
    amount: "£13,950",
    label: "Net seller payout",
    highlighted: true,
    callout: "+£1,750",
  },
  {
    name: "WBAC",
    amount: "£11,800",
    label: "Instant offer",
    highlighted: false,
  },
] as const;

export function ComparisonTable() {
  return (
    <section
      style={{
        backgroundColor: "#FFFFFF",
        padding: "48px 0",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          paddingLeft: "clamp(24px, 4vw, 32px)",
          paddingRight: "clamp(24px, 4vw, 32px)",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#0F1724",
            margin: 0,
          }}
        >
          More money than instant buyers
        </h2>

        {/* Subheading */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            fontWeight: 400,
            color: "#4A556B",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          See how AutoConsign compares for a typical £15,000 car
        </p>

        {/* Comparison grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginTop: 32,
          }}
          className="comparison-grid"
        >
          {competitors.map((card) => (
            <div
              key={card.name}
              style={{
                borderRadius: 20,
                padding: 32,
                backgroundColor: card.highlighted ? "#008C7C" : "#F7F8F9",
                border: card.highlighted ? "none" : "1.5px solid #EAECEF",
              }}
            >
              {/* Company name */}
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: card.highlighted
                    ? "rgba(255,255,255,0.8)"
                    : "#8492A8",
                  margin: 0,
                }}
              >
                {card.name}
              </p>

              {/* Amount */}
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 38,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: card.highlighted ? "#FFFFFF" : "#0F1724",
                  margin: "12px 0 4px",
                }}
              >
                {card.amount}
              </p>

              {/* Label */}
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: card.highlighted
                    ? "rgba(255,255,255,0.8)"
                    : "#8492A8",
                  margin: 0,
                }}
              >
                {card.label}
              </p>

              {/* Callout badge (AutoConsign only) */}
              {card.highlighted && "callout" in card && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 100,
                    padding: "6px 14px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}
                >
                  {card.callout}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Responsive breakpoints */}
      <style>{`
        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
