"use client";

const values = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#006058"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "More money, guaranteed",
    description:
      "On average, sellers earn \u00a31,800 more than instant-cash buyers like Cazoo or WBAC. We sell at retail, not wholesale.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#006058"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Completely transparent",
    description:
      "7% fee, taken when it sells. No hidden charges, no surprise deductions. You see your net payout estimate before you commit.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#006058"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Zero effort for sellers",
    description:
      "We collect your car, recondition it, photograph it, list it, and handle the entire sale. You just wait for payment.",
  },
];

export function ValuesSection() {
  return (
    <section className="w-full" style={{ backgroundColor: "#E0FAF5", padding: "48px 0" }}>
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        <h2
          className="font-heading"
          style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#006058",
          }}
        >
          Why sellers choose AutoConsign
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {values.map((item) => (
            <div
              key={item.title}
              className="group"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #A7F0E3",
                borderRadius: "20px",
                padding: "24px",
                transition: "border-color 200ms ease, box-shadow 200ms ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#008C7C";
                el.style.boxShadow = "0 4px 20px rgba(0,140,124,0.10)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#A7F0E3";
                el.style.boxShadow = "none";
              }}
            >
              {/* Icon container */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#E0FAF5",
                  borderRadius: "12px",
                }}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h3
                className="font-heading"
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0F1724",
                  marginTop: "16px",
                }}
              >
                {item.title}
              </h3>

              {/* Description */}
              <p
                className="font-body"
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  lineHeight: 1.7,
                  color: "#4A556B",
                  marginTop: "8px",
                }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
