"use client";

import { useState } from "react";

export function Hero() {
  const [regInput, setRegInput] = useState("");

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 520 }}>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-range-rover.jpg"
          alt="Range Rover driving on a country road"
          className="h-full w-full object-cover object-center"
        />
      </div>
      {/* Brand green overlay: 0% transparent (fully opaque) on left → 100% transparent on right */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: "linear-gradient(to right, rgba(0, 140, 124, 1) 0%, rgba(0, 140, 124, 0.85) 30%, rgba(0, 140, 124, 0.5) 55%, rgba(0, 140, 124, 0) 100%)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[1400px] px-6 py-16 sm:px-8 md:py-20 lg:py-24">
        <div className="max-w-2xl">
          {/* Display headline */}
          <h1
            className="font-heading text-white"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
            }}
          >
            Sell at retail price.
            <br />
            Keep the difference.
          </h1>

          <p
            className="mt-4 max-w-lg text-white/90 font-body"
            style={{ fontSize: "17px", lineHeight: 1.65 }}
          >
            iAutoSale gets private sellers retail market price for their cars
            — with zero effort — through a transparent consignment model.
          </p>

          {/* Registration bar */}
          <form
            className="mt-8 flex items-center bg-white shadow-lg"
            style={{
              borderRadius: "14px",
              maxWidth: "520px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            }}
            onSubmit={(e) => {
              e.preventDefault();
              if (regInput.trim()) {
                window.location.href = `/sell/offer?reg=${encodeURIComponent(regInput.trim())}`;
              }
            }}
          >
            <div className="flex flex-1 items-center gap-3 px-5 py-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Enter your reg number"
                value={regInput}
                onChange={(e) => setRegInput(e.target.value.toUpperCase())}
                className="w-full border-none font-body text-[15px] outline-none placeholder:text-[#9CA3AF]"
                style={{ backgroundColor: "#FFFFFF", color: "#374151" }}
              />
            </div>
          </form>

          {/* Trust chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "No commission fee",
              "Avg. £1,800 more than Cazoo",
              "Sold in 38 days avg.",
            ].map((chip) => (
              <span
                key={chip}
                className="flex items-center gap-2 font-body text-white/90"
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: "100px",
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00332E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
