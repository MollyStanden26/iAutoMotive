"use client";

import { useState } from "react";
import { FilterSidebar } from "@/components/browse/filter-sidebar";
import { SearchBar } from "@/components/browse/search-bar";
import { FilterChips } from "@/components/browse/filter-chips";
import { VehicleCard } from "@/components/browse/vehicle-card";

const MOCK_CARS = [
  { id: "car-001", year: 2024, make: "BMW", model: "3 Series", trim: "320i Sport", mileage: "12k", price: 28990, monthlyEstimate: 459, badge: "Just Listed", deliveryDate: "Thursday" },
  { id: "car-002", year: 2023, make: "Mercedes-Benz", model: "A-Class", trim: "A200 AMG Line", mileage: "18k", price: 24500, monthlyEstimate: 389, deliveryDate: "Friday" },
  { id: "car-003", year: 2024, make: "Audi", model: "A3", trim: "35 TFSI S Line", mileage: "8k", price: 26750, monthlyEstimate: 425, badge: "Price Drop", deliveryDate: "Thursday" },
  { id: "car-004", year: 2022, make: "Volkswagen", model: "Golf", trim: "R-Line 1.5 TSI", mileage: "24k", price: 21990, monthlyEstimate: 349, deliveryDate: "Wednesday" },
  { id: "car-005", year: 2023, make: "Ford", model: "Puma", trim: "ST-Line X 1.0", mileage: "15k", price: 19750, monthlyEstimate: 315, badge: "Just Listed", deliveryDate: "Friday" },
  { id: "car-006", year: 2024, make: "Toyota", model: "Corolla", trim: "Design 1.8 Hybrid", mileage: "5k", price: 23490, monthlyEstimate: 373, deliveryDate: "Thursday" },
  { id: "car-007", year: 2023, make: "Hyundai", model: "Tucson", trim: "Premium 1.6T", mileage: "20k", price: 27500, monthlyEstimate: 437, deliveryDate: "Wednesday" },
  { id: "car-008", year: 2022, make: "Nissan", model: "Qashqai", trim: "Tekna+ 1.3 DIG-T", mileage: "28k", price: 22990, monthlyEstimate: 365, badge: "Price Drop", deliveryDate: "Friday" },
  { id: "car-009", year: 2024, make: "Kia", model: "Sportage", trim: "GT-Line S 1.6T", mileage: "3k", price: 31500, monthlyEstimate: 499, badge: "Just Listed", deliveryDate: "Thursday" },
];

export default function CarsPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-ac-6 pt-ac-6">
        <div className="flex flex-row gap-ac-6">
          {/* ── Left column: filter sidebar (desktop only) ── */}
          <div className="hidden w-[280px] flex-shrink-0 md:block">
            <FilterSidebar />
          </div>

          {/* ── Right column: main content ── */}
          <div className="flex-1">
            {/* Search bar */}
            <div className="mb-ac-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Filter chips */}
            <div className="mb-ac-4">
              <FilterChips />
            </div>

            {/* Results bar */}
            <div className="mb-ac-5 flex flex-wrap items-center justify-between gap-ac-3">
              <span className="font-body text-sm font-medium text-slate-600">
                2,847 cars
              </span>

              <div className="flex items-center gap-ac-4">
                {/* Save search */}
                <button className="flex items-center gap-1 font-body text-[13px] font-medium text-teal-600 transition-colors duration-150 hover:text-teal-800">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Save Search
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-ac-2">
                  <span className="font-body text-[13px] text-slate-400">
                    Sort by
                  </span>
                  <button className="flex items-center gap-1 font-body text-sm font-semibold text-slate-900 transition-colors duration-150 hover:text-teal-600">
                    Recommended
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle cards grid */}
            <div className="grid grid-cols-1 gap-ac-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_CARS.map((car) => (
                <VehicleCard key={car.id} {...car} />
              ))}
            </div>

            {/* Load more button */}
            <div className="mt-ac-8">
              <button className="w-full rounded-pill border-[1.5px] border-teal-600 bg-white px-ac-4 py-[14px] font-body text-sm font-semibold text-teal-600 transition-colors duration-150 hover:bg-teal-50">
                Show more cars
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile filter button (fixed at bottom) ── */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-ac-2 rounded-pill bg-teal-600 px-ac-6 py-ac-3 font-body text-sm font-semibold text-white shadow-lg transition-colors duration-150 hover:bg-teal-800"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filters
        </button>
      </div>

      {/* ── Mobile filter drawer (full-screen overlay) ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer from left */}
          <div className="absolute inset-y-0 left-0 w-full max-w-[320px] overflow-y-auto bg-white p-ac-6 shadow-xl">
            <div className="mb-ac-6 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-slate-900">
                Filters
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-600"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </>
  );
}
