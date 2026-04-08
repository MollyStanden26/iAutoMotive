import {
  MOCK_VEHICLE,
  MOCK_PAYOUT,
  MOCK_UPDATES,
  RECON_STAGES,
  formatSellerGBP,
} from "@/lib/seller/seller-mock-data";

const DOT_COLORS: Record<string, string> = {
  teal: "#008C7C",
  green: "#34D399",
  amber: "#F5A623",
};

export default function SellerOverviewPage() {
  const activeIndex = RECON_STAGES.findIndex(
    (s) => s.key === MOCK_VEHICLE.currentStage
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F8F9",
        fontFamily: "var(--font-body)",
        padding: "24px 16px",
      }}
    >
      {/* ── 1. Vehicle Hero Strip ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 16,
        }}
      >
        {/* Photo placeholder */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            background: "#F7F8F9",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              color: "#94A3B8",
              letterSpacing: "0.05em",
            }}
          >
            PHOTO
          </span>
        </div>

        {/* Middle info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: 19,
              color: "#1E293B",
              lineHeight: 1.25,
            }}
          >
            {MOCK_VEHICLE.year} {MOCK_VEHICLE.make} {MOCK_VEHICLE.model}{" "}
            {MOCK_VEHICLE.trim}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 13,
              color: "#64748B",
              marginTop: 2,
            }}
          >
            {MOCK_VEHICLE.registration} &middot;{" "}
            {MOCK_VEHICLE.mileage.toLocaleString("en-GB")} miles &middot;{" "}
            {MOCK_VEHICLE.colour} &middot; {MOCK_VEHICLE.gearbox}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              background: "#E0FAF5",
              color: "#006058",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 100,
              padding: "4px 12px",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#008C7C",
                flexShrink: 0,
              }}
            />
            Front-line live &middot; Listed 6 days ago
          </div>
        </div>

        {/* Right payout */}
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 11,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            ESTIMATED PAYOUT
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 900,
              fontSize: 28,
              color: "#B87209",
              lineHeight: 1.1,
            }}
          >
            {formatSellerGBP(MOCK_PAYOUT.netPayoutGbp)}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 11,
              color: "#94A3B8",
              marginTop: 2,
            }}
          >
            Updates as price changes
          </div>
        </div>
      </div>

      {/* ── 2. Recon Stage Tracker ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 13,
            color: "#1E293B",
            marginBottom: 16,
          }}
        >
          Where your car is right now
        </div>

        <div style={{ display: "flex", alignItems: "start" }}>
          {RECON_STAGES.map((stage, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;

            const dotStyle: React.CSSProperties = {
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
              ...(isDone
                ? { background: "#008C7C", color: "#fff" }
                : isActive
                ? {
                    background: "#008C7C",
                    color: "#fff",
                    boxShadow: "0 0 0 4px #E0FAF5",
                  }
                : { background: "#E2E8F0", color: "#94A3B8" }),
            };

            const labelStyle: React.CSSProperties = {
              fontFamily: "var(--font-body)",
              fontWeight: isActive ? 700 : 600,
              fontSize: 11,
              marginTop: 6,
              textAlign: "center",
              maxWidth: 72,
              lineHeight: 1.3,
              color: isDone ? "#008C7C" : isActive ? "#1E293B" : "#94A3B8",
            };

            return (
              <div
                key={stage.key}
                style={{ display: "contents" }}
              >
                {/* Connector before (except first) */}
                {i > 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      marginTop: 14,
                      marginLeft: -4,
                      marginRight: -4,
                      background: i <= activeIndex ? "#008C7C" : "#E2E8F0",
                    }}
                  />
                )}

                {/* Step */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <div style={dotStyle}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div style={labelStyle}>{stage.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Stats Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Card 1 — Listing price */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 11,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current listing price
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: 22,
              color: "#008C7C",
              marginTop: 4,
            }}
          >
            {formatSellerGBP(21200)}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 12,
              color: "#94A3B8",
              marginTop: 4,
            }}
          >
            Market price &middot;{" "}
            <span style={{ color: "#B87209" }}>Last reduced 4 days ago</span>
          </div>
        </div>

        {/* Card 2 — Buyer activity */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 11,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Buyer activity (7 days)
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: 22,
              color: "#1E293B",
              marginTop: 4,
            }}
          >
            84 views
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 12,
              color: "#94A3B8",
              marginTop: 4,
            }}
          >
            12 saves &middot; 3 enquiries
          </div>
        </div>
      </div>

      {/* ── 4. Latest Updates ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          padding: 20,
          marginBottom: 16,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              color: "#1E293B",
            }}
          >
            Latest updates
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 11,
              color: "#94A3B8",
            }}
          >
            Today
          </div>
        </div>

        {/* Update items */}
        {MOCK_UPDATES.map((update, i) => (
          <div
            key={update.id}
            style={{
              display: "flex",
              alignItems: "start",
              gap: 10,
              paddingTop: 10,
              paddingBottom: 10,
              borderBottom:
                i < MOCK_UPDATES.length - 1
                  ? "1px solid #F7F8F9"
                  : "none",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                marginTop: 4,
                flexShrink: 0,
                background: DOT_COLORS[update.dotColor] || "#94A3B8",
              }}
            />
            <div
              style={{
                flex: 1,
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 13,
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              {update.text}
            </div>
            <div
              style={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 11,
                color: "#94A3B8",
              }}
            >
              {update.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
