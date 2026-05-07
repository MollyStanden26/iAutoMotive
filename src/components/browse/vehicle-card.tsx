"use client";

import { useCallback } from "react";

interface VehicleCardProps {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  price: number;
  monthlyEstimate: number;
  imageUrl?: string;
  badge?: string;
  isSaved?: boolean;
  deliveryDate?: string;
  onSave?: (id: string) => void;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

export function VehicleCard({
  id,
  year,
  make,
  model,
  trim,
  mileage,
  price,
  monthlyEstimate,
  imageUrl,
  badge,
  isSaved = false,
  deliveryDate,
  onSave,
}: VehicleCardProps) {
  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSave?.(id);
    },
    [id, onSave],
  );

  return (
    <div
      className="group relative flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
        el.style.borderColor = "#008C7C";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.borderColor = "#E2E8F0";
      }}
    >
      {/* Image area */}
      <div
        className="relative w-full"
        style={{
          height: "240px",
          backgroundColor: "#F7F8F9",
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`${year} ${make} ${model}`}
            className="h-full w-full object-cover"
          />
        )}

        {/* Badge */}
        {badge && (
          <span
            className="absolute left-3 top-3"
            style={{
              fontFamily: "var(--ac-font-body)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#FFFFFF",
              backgroundColor: "#008C7C",
              borderRadius: "6px",
              padding: "4px 8px",
              lineHeight: 1,
            }}
          >
            {badge}
          </span>
        )}

        {/* Heart / save button */}
        <button
          className="absolute right-3 top-3 flex items-center justify-center"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            border: "none",
            cursor: "pointer",
          }}
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
          onClick={handleSave}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isSaved ? "#008C7C" : "none"}
            stroke={isSaved ? "#008C7C" : "#8492A8"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px" }}>
        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--ac-font-body)",
            fontSize: "18px",
            fontWeight: 600,
            color: "#0F1724",
            lineHeight: "24px",
            margin: 0,
          }}
        >
          {year} {make} {model}
        </h3>

        {/* Trim + mileage — truncated to a single 30-char line so cards stay
            uniform height in the grid. */}
        <p
          style={{
            fontFamily: "var(--ac-font-body)",
            fontSize: "14px",
            fontWeight: 400,
            color: "#8492A8",
            margin: "2px 0 0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={`${trim} · ${mileage}`}
        >
          {(() => {
            const full = `${trim} · ${mileage}`;
            return full.length > 30 ? `${full.slice(0, 30).trimEnd()}…` : full;
          })()}
        </p>

        {/* Price */}
        <p
          style={{
            fontFamily: "var(--ac-font-heading)",
            fontSize: "24px",
            fontWeight: 800,
            color: "#0F1724",
            margin: "12px 0 0",
            lineHeight: 1.2,
          }}
        >
          {formatPrice(price)}
        </p>

        {/* Monthly estimate */}
        <p
          style={{
            fontFamily: "var(--ac-font-body)",
            fontSize: "14px",
            fontWeight: 400,
            color: "#4A556B",
            margin: "4px 0 0",
          }}
        >
          {formatPrice(monthlyEstimate)}/mo estimated
        </p>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "#EAECEF",
            marginTop: "12px",
          }}
        />

        {/* Footer */}
        <p
          style={{
            fontFamily: "var(--ac-font-body)",
            fontSize: "13px",
            fontWeight: 500,
            color: "#008C7C",
            margin: 0,
            paddingTop: "12px",
          }}
        >
          Free delivery{deliveryDate ? ` \u00B7 Get it ${deliveryDate}` : ""}
        </p>
      </div>
    </div>
  );
}
