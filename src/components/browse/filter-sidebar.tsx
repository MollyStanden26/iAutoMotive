"use client";

import { useState } from "react";

/**
 * Controlled filter sidebar. Parent owns the {@link Filters} state and reacts
 * to it for the listing query. Each section emits a partial update.
 *
 * The schema enums (bodyType / fuelType / transmission) come from the Prisma
 * model — see the labels in {@link BODY_TYPE_OPTIONS} etc. for display vs DB
 * value mappings.
 */

export interface Filters {
  minPrice: string;
  maxPrice: string;
  bodyTypes: string[];     // enum values: "suv" | "saloon" | ...
  fuelTypes: string[];     // enum values: "petrol" | "electric" | ...
  transmissions: string[]; // enum values: "automatic" | "manual"
  minYear: string;
  maxMileage: string;
  colours: string[];       // free-text, lowercased
  makes: string[];         // free-text, e.g. "BMW"
  models: string[];        // free-text, gated by makes
  trims: string[];         // free-text, gated by makes + models
}

export const DEFAULT_FILTERS: Filters = {
  minPrice: "",
  maxPrice: "",
  bodyTypes: [],
  fuelTypes: [],
  transmissions: [],
  minYear: "",
  maxMileage: "",
  colours: [],
  makes: [],
  models: [],
  trims: [],
};

interface FilterSidebarProps {
  className?: string;
  filters: Filters;
  onChange: (next: Filters) => void;
  /** Optional list of colours present in the current dataset, lowercased. */
  availableColours?: string[];
  /** Distinct makes in the dataset. */
  availableMakes?: string[];
  /** Models for the currently-selected makes (or all models if none selected). */
  availableModels?: string[];
  /** Trims for the currently-selected make+model combo (gated). */
  availableTrims?: string[];
}

const FILTER_CATEGORIES = [
  { id: "budget", label: "Budget & Price" },
  { id: "make-model", label: "Make & Model" },
  { id: "body-type", label: "Body Type" },
  { id: "year-mileage", label: "Year & Mileage" },
  { id: "fuel-type", label: "Fuel Type" },
  { id: "transmission", label: "Transmission" },
  { id: "exterior-colour", label: "Exterior Colour" },
] as const;

const BODY_TYPE_OPTIONS = [
  { value: "suv",         label: "SUV" },
  { value: "saloon",      label: "Saloon" },
  { value: "hatchback",   label: "Hatchback" },
  { value: "estate",      label: "Estate" },
  { value: "coupe",       label: "Coupe" },
  { value: "convertible", label: "Convertible" },
  { value: "mpv",         label: "MPV" },
] as const;

const FUEL_TYPE_OPTIONS = [
  { value: "petrol",         label: "Petrol" },
  { value: "diesel",         label: "Diesel" },
  { value: "electric",       label: "Electric" },
  { value: "hybrid",         label: "Hybrid" },
  { value: "plugin_hybrid",  label: "Plug-in Hybrid" },
  { value: "mild_hybrid",    label: "Mild Hybrid" },
] as const;

const TRANSMISSION_OPTIONS = [
  { value: "automatic", label: "Automatic" },
  { value: "manual",    label: "Manual" },
] as const;

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 200ms ease",
        flexShrink: 0,
      }}
    >
      <path d="M4 6L8 10L12 6" stroke="#8492A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--ac-font-body)",
  fontSize: 14,
  fontWeight: 400,
  borderRadius: 12,
  backgroundColor: "#F7F8F9",
  border: "1.5px solid #EAECEF",
  padding: "10px 12px",
  width: "100%",
  outline: "none",
  color: "#0F1724",
};

const prefixedInputStyle: React.CSSProperties = { ...inputStyle, padding: "10px 12px 10px 28px" };

const prefixStyle: React.CSSProperties = {
  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
  fontFamily: "var(--ac-font-body)", fontSize: 14, fontWeight: 500,
  color: "#8492A8", pointerEvents: "none",
};

const subLabel: React.CSSProperties = {
  fontFamily: "var(--ac-font-body)",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase",
  color: "#8492A8",
};

const emptyHint: React.CSSProperties = {
  fontFamily: "var(--ac-font-body)",
  fontSize: 13, fontWeight: 400,
  color: "#8492A8",
  margin: "8px 0 0",
};

function PillButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--ac-font-body)",
        fontSize: 13, fontWeight: 500,
        borderRadius: 8,
        border: selected ? "1px solid #008C7C" : "1px solid #EAECEF",
        backgroundColor: selected ? "#E0FAF5" : "transparent",
        color: selected ? "#008C7C" : "#0F1724",
        padding: "8px 16px",
        cursor: "pointer",
        transition: "all 150ms ease",
      }}
    >
      {label}
    </button>
  );
}

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export function FilterSidebar({
  className,
  filters,
  onChange,
  availableColours = [],
  availableMakes = [],
  availableModels = [],
  availableTrims = [],
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["budget", "body-type"]));

  const toggleSection = (id: string) =>
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const renderContent = (id: string) => {
    switch (id) {
      case "budget":
        return (
          <div className="flex gap-3" style={{ padding: "16px 24px 24px" }}>
            <div className="relative flex-1">
              <span style={prefixStyle}>£</span>
              <input
                type="text" inputMode="numeric" placeholder="Min price"
                value={filters.minPrice}
                onChange={e => update({ minPrice: e.target.value.replace(/[^0-9]/g, "") })}
                style={prefixedInputStyle}
              />
            </div>
            <div className="relative flex-1">
              <span style={prefixStyle}>£</span>
              <input
                type="text" inputMode="numeric" placeholder="Max price"
                value={filters.maxPrice}
                onChange={e => update({ maxPrice: e.target.value.replace(/[^0-9]/g, "") })}
                style={prefixedInputStyle}
              />
            </div>
          </div>
        );
      case "make-model":
        return (
          <div className="flex flex-col gap-4" style={{ padding: "16px 24px 24px" }}>
            <div>
              <div style={subLabel}>Make</div>
              {availableMakes.length === 0 ? (
                <p style={emptyHint}>No makes in current results</p>
              ) : (
                <div className="flex flex-wrap gap-2" style={{ marginTop: 8 }}>
                  {availableMakes.map(make => (
                    <PillButton
                      key={make}
                      label={make}
                      selected={filters.makes.includes(make)}
                      onClick={() => {
                        const nextMakes = toggle(filters.makes, make);
                        // Reset model+trim when makes change so dropped makes
                        // don't leave dangling selections.
                        update({ makes: nextMakes, models: [], trims: [] });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {filters.makes.length > 0 && (
              <div>
                <div style={subLabel}>Model</div>
                {availableModels.length === 0 ? (
                  <p style={emptyHint}>No models for the selected makes</p>
                ) : (
                  <div className="flex flex-wrap gap-2" style={{ marginTop: 8 }}>
                    {availableModels.map(model => (
                      <PillButton
                        key={model}
                        label={model}
                        selected={filters.models.includes(model)}
                        onClick={() => {
                          update({ models: toggle(filters.models, model), trims: [] });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {filters.models.length > 0 && (
              <div>
                <div style={subLabel}>Trim</div>
                {availableTrims.length === 0 ? (
                  <p style={emptyHint}>No trims for the selected model</p>
                ) : (
                  <div className="flex flex-wrap gap-2" style={{ marginTop: 8 }}>
                    {availableTrims.map(trim => (
                      <PillButton
                        key={trim}
                        label={trim.length > 26 ? `${trim.slice(0, 26).trimEnd()}…` : trim}
                        selected={filters.trims.includes(trim)}
                        onClick={() => update({ trims: toggle(filters.trims, trim) })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "body-type":
        return (
          <div className="flex flex-wrap gap-2" style={{ padding: "16px 24px 24px" }}>
            {BODY_TYPE_OPTIONS.map(opt => (
              <PillButton
                key={opt.value}
                label={opt.label}
                selected={filters.bodyTypes.includes(opt.value)}
                onClick={() => update({ bodyTypes: toggle(filters.bodyTypes, opt.value) })}
              />
            ))}
          </div>
        );
      case "year-mileage":
        return (
          <div className="flex flex-col gap-3" style={{ padding: "16px 24px 24px" }}>
            <input
              type="text" inputMode="numeric" placeholder="From year (e.g. 2020)"
              value={filters.minYear}
              onChange={e => update({ minYear: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })}
              style={inputStyle}
            />
            <input
              type="text" inputMode="numeric" placeholder="Max mileage (miles)"
              value={filters.maxMileage}
              onChange={e => update({ maxMileage: e.target.value.replace(/[^0-9]/g, "") })}
              style={inputStyle}
            />
          </div>
        );
      case "fuel-type":
        return (
          <div className="flex flex-wrap gap-2" style={{ padding: "16px 24px 24px" }}>
            {FUEL_TYPE_OPTIONS.map(opt => (
              <PillButton
                key={opt.value}
                label={opt.label}
                selected={filters.fuelTypes.includes(opt.value)}
                onClick={() => update({ fuelTypes: toggle(filters.fuelTypes, opt.value) })}
              />
            ))}
          </div>
        );
      case "transmission":
        return (
          <div className="flex flex-wrap gap-2" style={{ padding: "16px 24px 24px" }}>
            {TRANSMISSION_OPTIONS.map(opt => (
              <PillButton
                key={opt.value}
                label={opt.label}
                selected={filters.transmissions.includes(opt.value)}
                onClick={() => update({ transmissions: toggle(filters.transmissions, opt.value) })}
              />
            ))}
          </div>
        );
      case "exterior-colour":
        if (availableColours.length === 0) {
          return (
            <div style={{ padding: "16px 24px 24px" }}>
              <p style={{ fontFamily: "var(--ac-font-body)", fontSize: 13, color: "#8492A8" }}>
                No colours in current results
              </p>
            </div>
          );
        }
        return (
          <div className="flex flex-wrap gap-2" style={{ padding: "16px 24px 24px" }}>
            {availableColours.map(c => (
              <PillButton
                key={c}
                label={c.charAt(0).toUpperCase() + c.slice(1)}
                selected={filters.colours.includes(c)}
                onClick={() => update({ colours: toggle(filters.colours, c) })}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const activeCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    filters.makes.length +
    filters.models.length +
    filters.trims.length +
    filters.bodyTypes.length +
    filters.fuelTypes.length +
    filters.transmissions.length +
    (filters.minYear ? 1 : 0) +
    (filters.maxMileage ? 1 : 0) +
    filters.colours.length;

  return (
    <aside
      className={className}
      style={{
        width: 280, position: "sticky", top: 80,
        backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0",
        borderRadius: 12, overflowY: "auto",
        maxHeight: "calc(100vh - 100px)", flexShrink: 0,
      }}
    >
      {activeCount > 0 && (
        <div className="flex items-center justify-between" style={{ padding: "16px 24px", borderBottom: "1px solid #EAECEF" }}>
          <span style={{ fontFamily: "var(--ac-font-body)", fontSize: 13, fontWeight: 600, color: "#008C7C" }}>
            {activeCount} filter{activeCount === 1 ? "" : "s"} active
          </span>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            style={{
              fontFamily: "var(--ac-font-body)", fontSize: 12, fontWeight: 600,
              color: "#8492A8", background: "transparent", border: "none", cursor: "pointer",
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {FILTER_CATEGORIES.map((category, index) => {
        const isOpen = openSections.has(category.id);
        const isLast = index === FILTER_CATEGORIES.length - 1;

        return (
          <div key={category.id}>
            <button
              type="button"
              onClick={() => toggleSection(category.id)}
              className="flex w-full items-center justify-between"
              style={{
                padding: "24px",
                fontFamily: "var(--ac-font-body)",
                fontSize: 14, fontWeight: 600,
                color: "#0F1724",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isLast && !isOpen ? "none" : "1px solid #EAECEF",
                cursor: "pointer", transition: "background-color 150ms ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F7F8F9")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>{category.label}</span>
              <ChevronIcon open={isOpen} />
            </button>
            {isOpen && renderContent(category.id)}
          </div>
        );
      })}
    </aside>
  );
}
