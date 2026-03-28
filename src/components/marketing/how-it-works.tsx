"use client";

const steps = [
  {
    number: 1,
    title: "Get a free offer",
    description:
      "Enter your reg number and get a consignment offer in minutes. We\u2019ll show you exactly what you could earn.",
  },
  {
    number: 2,
    title: "We collect your car",
    description:
      "Once you accept, we collect your car from your door. No hassle, no trips to a dealership.",
  },
  {
    number: 3,
    title: "We sell at retail price",
    description:
      "Your car is reconditioned, photographed, and listed on our storefront and AutoTrader at full retail value.",
  },
  {
    number: 4,
    title: "You get paid",
    description:
      "When it sells, you receive net proceeds within 48 hours. Transparent 7% fee, no surprises.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full bg-white py-12">
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .step-card {
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }
        .step-card:nth-child(1) { animation-delay: 100ms; }
        .step-card:nth-child(2) { animation-delay: 200ms; }
        .step-card:nth-child(3) { animation-delay: 300ms; }
        .step-card:nth-child(4) { animation-delay: 400ms; }
      `}</style>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        <h2
          className="font-heading"
          style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#0F1724",
          }}
        >
          How it works
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="step-card"
              style={{
                backgroundColor: "#F7F8F9",
                borderRadius: "20px",
                padding: "24px",
                transition: "transform 200ms ease, box-shadow 200ms ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = "0 8px 24px rgba(0,140,124,0.10)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Numbered circle */}
              <div
                className="flex items-center justify-center font-heading text-white"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#008C7C",
                  borderRadius: "100%",
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                {step.number}
              </div>

              {/* Step title */}
              <h3
                className="mt-4 font-heading"
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0F1724",
                }}
              >
                {step.title}
              </h3>

              {/* Step description */}
              <p
                className="mt-2 font-body"
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  lineHeight: 1.7,
                  color: "#4A556B",
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
