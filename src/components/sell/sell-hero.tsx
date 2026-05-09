"use client";

import { useState } from "react";

type Tab = "reg" | "vin";

export default function SellHero() {
  const [activeTab, setActiveTab] = useState<Tab>("reg");
  const [inputValue, setInputValue] = useState("");

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #0F1724 0%, #0A4A42 100%)",
      }}
      className="w-full"
    >
      <div
        style={{ maxWidth: 1056, padding: "40px 24px" }}
        className="mx-auto flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between"
      >
        {/* Left side — Headline */}
        <div className="flex-1 text-center md:text-left">
          <h1
            style={{
              fontFamily:
                '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Sell your car at full retail price in under 30&nbsp;days
          </h1>
          <p
            style={{
              fontFamily:
                '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
              fontSize: 20,
              fontWeight: 400,
              lineHeight: 1.5,
              color: "#FFFFFF",
              marginTop: 16,
              opacity: 0.9,
            }}
          >
            Sell or consign your car 100% online. No haggling, no headaches.
          </p>
        </div>

        {/* Right side — Form Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.15)",
            padding: "32px 28px",
            width: "100%",
            maxWidth: 420,
            flexShrink: 0,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 24,
              borderBottom: "1px solid #E2E8F0",
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("reg");
                setInputValue("");
              }}
              style={{
                fontFamily:
                  '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
                fontSize: 16,
                fontWeight: 500,
                color: activeTab === "reg" ? "#0F1724" : "#8492A8",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === "reg" ? "2px solid #008C7C" : "2px solid transparent",
                paddingBottom: 12,
                cursor: "pointer",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              Reg Number
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("vin");
                setInputValue("");
              }}
              style={{
                fontFamily:
                  '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
                fontSize: 16,
                fontWeight: 500,
                color: activeTab === "vin" ? "#0F1724" : "#8492A8",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === "vin" ? "2px solid #008C7C" : "2px solid transparent",
                paddingBottom: 12,
                cursor: "pointer",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              VIN
            </button>
          </div>

          {/* Input */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                activeTab === "reg"
                  ? "Enter your reg number"
                  : "Enter your VIN"
              }
              style={{
                width: "100%",
                height: 52,
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 16,
                fontFamily:
                  '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
                padding: "0 16px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
                backgroundColor: "#FFFFFF",
                color: "#374151",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#008C7C";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            />
          </div>

          {/* Submit button */}
          <button
            type="button"
            style={{
              width: "100%",
              height: 48,
              borderRadius: 99999,
              backgroundColor: "#008C7C",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 500,
              fontFamily:
                '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#006B5E";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#008C7C";
            }}
          >
            Get your offer
          </button>
        </div>
      </div>
    </section>
  );
}
