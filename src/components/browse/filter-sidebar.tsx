"use client";

import { useState } from "react";

interface FilterSidebarProps {
  className?: string;
}

const FILTER_CATEGORIES = [
  { id: "budget", label: "Budget & Price" },
  { id: "make-model", label: "Make & Model" },
  { id: "body-type", label: "Body Type" },
  { id: "year-mileage", label: "Year & Mileage" },
  { id: "delivery", label: "Free Delivery" },
  { id: "fuel-type", label: "Fuel Type" },
  { id: "mpg-emissions", label: "MPG & Emissions" },
  { id: "features", label: "Features" },
  { id: "exterior-colour", label: "Exterior Colour" },
  { id: "interior-colour", label: "Interior Colour" },
] as const;

const BODY_TYPES = [
  "SUV",
  "Saloon",
  "Hatchback",
  "Estate",
  "Coupe",
  "Convertible",
  "MPV",
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
      <path
        d="M4 6L8 10L12 6"
        stroke="#8492A8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BudgetFilter() {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--ac-font-body)',
    fontSize: "14px",
    fontWeight: 400,
    borderRadius: "12px",
    backgroundColor: "#F7F8F9",
    border: "1.5px solid #EAECEF",
    padding: "10px 12px 10px 28px",
    width: "100%",
    outline: "none",
    color: "#0F1724",
  };

  const prefixStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontFamily: 'var(--ac-font-body)',
    fontSize: "14px",
    fontWeight: 500,
    color: "#8492A8",
    pointerEvents: "none",
  };

  return (
    <div className="flex gap-3" style={{ padding: "0 24px 24px" }}>
      <div className="relative flex-1">
        <span style={prefixStyle}>&pound;</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
          style={inputStyle}
        />
      </div>
      <div className="relative flex-1">
        <span style={prefixStyle}>&pound;</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
          style={inputStyle}
        />
      </div>
    </div>
  );
}

function BodyTypeFilter() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (type: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-wrap gap-2" style={{ padding: "0 24px 24px" }}>
      {BODY_TYPES.map((type) => {
        const isSelected = selected.has(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            style={{
              fontFamily: 'var(--ac-font-body)',
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "8px",
              border: isSelected
                ? "1px solid #008C7C"
                : "1px solid #EAECEF",
              backgroundColor: isSelected ? "#E0FAF5" : "transparent",
              color: isSelected ? "#008C7C" : "#0F1724",
              padding: "8px 16px",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}

function PlaceholderContent() {
  return (
    <div style={{ padding: "0 24px 24px" }}>
      <p
        style={{
          fontFamily: 'var(--ac-font-body)',
          fontSize: "13px",
          fontWeight: 400,
          color: "#8492A8",
        }}
      >
        Filter options coming soon
      </p>
    </div>
  );
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["budget"])
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderContent = (id: string) => {
    switch (id) {
      case "budget":
        return <BudgetFilter />;
      case "body-type":
        return <BodyTypeFilter />;
      default:
        return <PlaceholderContent />;
    }
  };

  return (
    <aside
      className={className}
      style={{
        width: "280px",
        position: "sticky",
        top: "80px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        overflowY: "auto",
        maxHeight: "calc(100vh - 100px)",
        flexShrink: 0,
      }}
    >
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
                fontFamily: 'var(--ac-font-body)',
                fontSize: "14px",
                fontWeight: 600,
                color: "#0F1724",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isLast && !isOpen ? "none" : "1px solid #EAECEF",
                cursor: "pointer",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F7F8F9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
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
