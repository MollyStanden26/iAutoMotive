"use client";

const stats = [
  { value: "Retail", label: "FULL PRICE FOR YOUR CAR" },
  { value: "12", label: "AVG DAYS TO SELL" },
  { value: "£0", label: "COMMISSION FEE" },
  { value: "Immediate", label: "PAYOUT AFTER SALE" },
];

export function ProofStrip() {
  return (
    <section className="w-full" style={{ backgroundColor: "#0F1724" }}>
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        <div
          className="grid grid-cols-2 gap-4 py-[18px] md:flex md:flex-row md:items-center md:justify-between md:gap-0"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center ${
                i > 0 ? "md:border-l" : ""
              } md:flex-1`}
              style={{
                borderColor: "#222D3F",
              }}
            >
              <span
                className="font-heading"
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#4DD9C7",
                }}
              >
                {stat.value}
              </span>
              <span
                className="mt-1 font-body"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#8492A8",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
