"use client";

import { useState } from "react";

export function Hero() {
  const [regInput, setRegInput] = useState("");

  return (
    <section className="relative w-full overflow-hidden" style={{ backgroundColor: "#008C7C" }}>
      {/* Background image area */}
      <div className="absolute inset-0 z-0">
        <div className="absolute right-0 top-0 h-full w-1/2">
          {/* Placeholder for hero image — car carrier / lifestyle shot */}
          <div className="h-full w-full bg-gradient-to-l from-teal-800/30 to-transparent" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-16 sm:px-8 md:py-20 lg:py-24">
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
            AutoConsign gets private sellers retail market price for their cars
            — with zero effort — through a transparent consignment model.
          </p>

          {/* Registration bar */}
          <div
            className="mt-8 flex items-center gap-1.5 bg-white p-1.5 shadow-lg"
            style={{
              borderRadius: "14px",
              maxWidth: "520px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            }}
          >
            <div className="flex flex-1 items-center gap-3 pl-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
            <button
              className="whitespace-nowrap font-heading text-white transition-colors duration-150"
              style={{
                backgroundColor: "#0F1724",
                borderRadius: "100px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Get an offer
            </button>
          </div>

          {/* Trust chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "7% transparent fee",
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
