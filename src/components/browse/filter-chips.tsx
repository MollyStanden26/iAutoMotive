"use client";

import { useState } from "react";

interface FilterChipsProps {
  className?: string;
}

const CHIPS = [
  { label: "Under \u00a320,000", count: "4,312" },
  { label: "2020 or newer", count: "6,891" },
  { label: "Under 30,000 miles", count: "3,456" },
  { label: "AWD", count: "2,103" },
  { label: "Free Delivery", count: "1,234" },
  { label: "Under 50,000 miles", count: "5,678" },
  { label: "Petrol", count: "8,901" },
  { label: "Under \u00a325,000", count: "5,432" },
  { label: "Sat Nav", count: "4,567" },
  { label: "BMW", count: "1,234" },
] as const;

export function FilterChips({ className }: FilterChipsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <div
      className={className}
      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
    >
      {CHIPS.map((chip) => {
        const isSelected = selected.has(chip.label);

        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => toggle(chip.label)}
            style={{
              fontFamily: 'var(--ac-font-body, "Inter", sans-serif)',
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              color: isSelected ? "#008C7C" : "#0F1724",
              backgroundColor: isSelected ? "#E0FAF5" : "#FFFFFF",
              border: `1px solid ${isSelected ? "#008C7C" : "#C8CDD6"}`,
              borderRadius: "100px",
              padding: "8px 16px",
              cursor: "pointer",
              transition: "all 150ms ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "#008C7C";
                e.currentTarget.style.color = "#008C7C";
                e.currentTarget.style.backgroundColor = "#F0FDFB";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "#C8CDD6";
                e.currentTarget.style.color = "#0F1724";
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }
            }}
          >
            <span>{chip.label}</span>
            <span
              style={{
                fontWeight: 400,
                color: isSelected ? "#008C7C" : "#8492A8",
              }}
            >
              ({chip.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
