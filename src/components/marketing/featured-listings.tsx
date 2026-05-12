"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ApiCar {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  price: number;
  monthlyEstimate?: number;
  imageUrl?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 }).format(n);

export function FeaturedListings() {
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/vehicles")
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setCars((data.cars ?? []).slice(0, 3)); })
      .catch(err => { if (!cancelled) console.error("[FeaturedListings] fetch failed:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section style={{ backgroundColor: "#FFFFFF", padding: "48px 0" }}>
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
          Featured listings
        </h2>

        {!loading && cars.length === 0 && (
          <div className="mt-8 rounded-[12px] border border-slate-200 bg-white px-6 py-8 text-center font-body text-sm text-slate-500">
            No cars listed yet. New listings will appear here automatically.
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map(car => (
            <Link
              key={car.id}
              href={`/cars/${car.id}/${car.slug}`}
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
              {/* Image */}
              <div
                className="relative w-full"
                style={{
                  height: "240px",
                  backgroundColor: "#F7F8F9",
                }}
              >
                {car.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={car.imageUrl}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  className="absolute right-3 top-3 flex items-center justify-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                  aria-label="Save listing"
                  onClick={(e) => { e.preventDefault(); }}
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
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0F1724",
                    margin: 0,
                  }}
                >
                  {car.year} {car.make} {car.model}
                </h3>
                <p
                  className="font-body"
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#8492A8",
                    margin: "4px 0 0",
                  }}
                >
                  {[car.trim, `${car.mileage} miles`].filter(Boolean).join(" · ")}
                </p>
                <p
                  className="font-heading"
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#0F1724",
                    margin: "8px 0 0",
                  }}
                >
                  {fmt(car.price)}
                </p>
              </div>

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
                Free shipping · Door-to-door delivery
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
