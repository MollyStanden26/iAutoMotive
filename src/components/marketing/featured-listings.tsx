"use client";

const listings = [
  {
    id: 1,
    make: "2024 BMW 3 Series",
    trim: "320i Sport · 12k miles",
    price: "£28,990",
    monthly: "£459/mo",
  },
  {
    id: 2,
    make: "2023 Mercedes A-Class",
    trim: "A200 AMG Line · 18k miles",
    price: "£24,500",
    monthly: "£389/mo",
  },
  {
    id: 3,
    make: "2024 Audi A3",
    trim: "35 TFSI S Line · 8k miles",
    price: "£26,750",
    monthly: "£425/mo",
  },
];

export function FeaturedListings() {
  return (
    <section style={{ backgroundColor: "#FFFFFF", padding: "48px 0" }}>
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        {/* Section heading */}
        <h2
          className="font-heading"
          style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#0F1724",
          }}
        >
          Featured listings
        </h2>

        {/* Vehicle grid */}
        <div
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {listings.map((car) => (
            <div
              key={car.id}
              className="group relative flex flex-col overflow-hidden"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #EAECEF",
                borderRadius: "20px",
                transition: "transform 200ms cubic-bezier(.25,.46,.45,.94), border-color 200ms cubic-bezier(.25,.46,.45,.94), box-shadow 200ms cubic-bezier(.25,.46,.45,.94)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-4px)";
                el.style.borderColor = "#00B8A5";
                el.style.boxShadow = "0 12px 32px rgba(0,140,124,0.14)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(0)";
                el.style.borderColor = "#EAECEF";
                el.style.boxShadow = "none";
              }}
            >
              {/* Image placeholder */}
              <div
                className="relative w-full"
                style={{
                  height: "240px",
                  backgroundColor: "#F7F8F9",
                }}
              >
                {/* Heart / save icon */}
                <button
                  className="absolute right-3 top-3 flex items-center justify-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                  aria-label="Save listing"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8492A8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Card content */}
              <div style={{ padding: "20px" }}>
                {/* Make / model */}
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0F1724",
                    margin: 0,
                  }}
                >
                  {car.make}
                </h3>

                {/* Trim + mileage */}
                <p
                  className="font-body"
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#8492A8",
                    margin: "4px 0 0",
                  }}
                >
                  {car.trim}
                </p>

                {/* Price */}
                <p
                  className="font-heading"
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#0F1724",
                    margin: "8px 0 0",
                  }}
                >
                  {car.price}
                </p>

                {/* Monthly estimate */}
                <p
                  className="font-body"
                  style={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#4A556B",
                    margin: "2px 0 0",
                  }}
                >
                  {car.monthly} estimated
                </p>
              </div>

              {/* Footer strip */}
              <div
                className="mt-auto font-body"
                style={{
                  borderTop: "1px solid #EAECEF",
                  backgroundColor: "#F7F8F9",
                  padding: "12px 20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#4A556B",
                }}
              >
                Free shipping · Get it Tuesday
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
