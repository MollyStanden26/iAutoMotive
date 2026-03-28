"use client";

export function CtaBand() {
  return (
    <section style={{ backgroundColor: "#008C7C" }}>
      <div
        className="mx-auto max-w-[1400px] px-6 sm:px-8"
        style={{ padding: "48px 0" }}
      >
        <div className="flex flex-col items-center gap-6 px-6 text-center md:flex-row md:items-center md:justify-between md:text-left sm:px-8">
          {/* Text block */}
          <div className="max-w-xl">
            <h2
              className="font-heading"
              style={{
                fontSize: "30px",
                fontWeight: 800,
                letterSpacing: "-0.015em",
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              Ready to sell your car at retail price?
            </h2>
            <p
              className="font-body mt-3"
              style={{
                fontSize: "17px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Join thousands of sellers who earned more with AutoConsign.
            </p>
          </div>

          {/* CTA button */}
          <button
            className="font-heading w-full shrink-0 transition-shadow duration-150 md:w-auto"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#006058",
              fontSize: "16px",
              fontWeight: 800,
              padding: "15px 30px",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Get started
          </button>
        </div>
      </div>
    </section>
  );
}
