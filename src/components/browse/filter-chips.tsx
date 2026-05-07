"use client";

import type { Filters } from "@/components/browse/filter-sidebar";

/**
 * Quick-toggle preset chips above the listing grid. Each chip flips a single
 * field on the parent {@link Filters} state — they are NOT independent state.
 *
 * Mock counts were removed; they were never accurate against the real DB.
 */

interface FilterChipsProps {
  className?: string;
  filters: Filters;
  onChange: (next: Filters) => void;
}

interface ChipDef {
  label: string;
  /** Returns whether the chip is currently active for the given filters. */
  isActive: (f: Filters) => boolean;
  /** Returns the new filter state if the chip is toggled. */
  toggle: (f: Filters) => Filters;
}

const CHIPS: ChipDef[] = [
  {
    label: "Under £20,000",
    isActive: f => f.maxPrice === "20000",
    toggle: f => ({ ...f, maxPrice: f.maxPrice === "20000" ? "" : "20000" }),
  },
  {
    label: "Under £25,000",
    isActive: f => f.maxPrice === "25000",
    toggle: f => ({ ...f, maxPrice: f.maxPrice === "25000" ? "" : "25000" }),
  },
  {
    label: "2022 or newer",
    isActive: f => f.minYear === "2022",
    toggle: f => ({ ...f, minYear: f.minYear === "2022" ? "" : "2022" }),
  },
  {
    label: "Under 30,000 miles",
    isActive: f => f.maxMileage === "30000",
    toggle: f => ({ ...f, maxMileage: f.maxMileage === "30000" ? "" : "30000" }),
  },
  {
    label: "Under 50,000 miles",
    isActive: f => f.maxMileage === "50000",
    toggle: f => ({ ...f, maxMileage: f.maxMileage === "50000" ? "" : "50000" }),
  },
  {
    label: "Electric",
    isActive: f => f.fuelTypes.includes("electric"),
    toggle: f => ({ ...f, fuelTypes: f.fuelTypes.includes("electric") ? f.fuelTypes.filter(v => v !== "electric") : [...f.fuelTypes, "electric"] }),
  },
  {
    label: "Petrol",
    isActive: f => f.fuelTypes.includes("petrol"),
    toggle: f => ({ ...f, fuelTypes: f.fuelTypes.includes("petrol") ? f.fuelTypes.filter(v => v !== "petrol") : [...f.fuelTypes, "petrol"] }),
  },
  {
    label: "SUV",
    isActive: f => f.bodyTypes.includes("suv"),
    toggle: f => ({ ...f, bodyTypes: f.bodyTypes.includes("suv") ? f.bodyTypes.filter(v => v !== "suv") : [...f.bodyTypes, "suv"] }),
  },
  {
    label: "Saloon",
    isActive: f => f.bodyTypes.includes("saloon"),
    toggle: f => ({ ...f, bodyTypes: f.bodyTypes.includes("saloon") ? f.bodyTypes.filter(v => v !== "saloon") : [...f.bodyTypes, "saloon"] }),
  },
  {
    label: "Automatic",
    isActive: f => f.transmissions.includes("automatic"),
    toggle: f => ({ ...f, transmissions: f.transmissions.includes("automatic") ? f.transmissions.filter(v => v !== "automatic") : [...f.transmissions, "automatic"] }),
  },
];

export function FilterChips({ className, filters, onChange }: FilterChipsProps) {
  return (
    <div className={className} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {CHIPS.map(chip => {
        const isSelected = chip.isActive(filters);
        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => onChange(chip.toggle(filters))}
            style={{
              fontFamily: 'var(--ac-font-body, "Inter", sans-serif)',
              fontSize: 14, fontWeight: 500, lineHeight: "20px",
              color: isSelected ? "#008C7C" : "#0F1724",
              backgroundColor: isSelected ? "#E0FAF5" : "#FFFFFF",
              border: `1px solid ${isSelected ? "#008C7C" : "#C8CDD6"}`,
              borderRadius: 100,
              padding: "8px 16px",
              cursor: "pointer",
              transition: "all 150ms ease",
              display: "inline-flex", alignItems: "center", gap: 6,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "#008C7C";
                e.currentTarget.style.color = "#008C7C";
                e.currentTarget.style.backgroundColor = "#F0FDFB";
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "#C8CDD6";
                e.currentTarget.style.color = "#0F1724";
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }
            }}
          >
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
