"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FilterSidebar, DEFAULT_FILTERS, type Filters } from "@/components/browse/filter-sidebar";
import { SearchBar } from "@/components/browse/search-bar";
import { FilterChips } from "@/components/browse/filter-chips";
import { VehicleCard } from "@/components/browse/vehicle-card";

interface ApiCar {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  mileageNumeric: number;
  price: number;
  imageUrl?: string;
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  exteriorColour?: string | null;
}

type SortKey = "recommended" | "price-asc" | "price-desc" | "year-desc" | "mileage-asc";

const SORT_LABELS: Record<SortKey, string> = {
  "recommended": "Recommended",
  "price-asc":   "Price: Low to High",
  "price-desc":  "Price: High to Low",
  "year-desc":   "Newest first",
  "mileage-asc": "Lowest mileage",
};

export default function CarsPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/vehicles")
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setCars(data.cars ?? []); })
      .catch(err => { if (!cancelled) console.error("[/cars] fetch failed:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Distinct lowercased colours for the sidebar's colour pill list. Pulled
  // from the full unfiltered set so the operator can re-add a filter they
  // just cleared without losing options.
  const availableColours = useMemo(() => {
    const set = new Set<string>();
    for (const c of cars) {
      if (c.exteriorColour) set.add(c.exteriorColour.toLowerCase());
    }
    return Array.from(set).sort();
  }, [cars]);

  // Make/model/trim cascade — models scoped to selected makes, trims scoped
  // to selected makes+models. Pulled from the unfiltered dataset so changing
  // an unrelated filter (price, body) doesn't make options vanish.
  const availableMakes = useMemo(() => {
    const set = new Set<string>();
    for (const c of cars) if (c.make) set.add(c.make);
    return Array.from(set).sort();
  }, [cars]);

  const availableModels = useMemo(() => {
    const set = new Set<string>();
    const makeFilter = filters.makes.length ? new Set(filters.makes) : null;
    for (const c of cars) {
      if (makeFilter && (!c.make || !makeFilter.has(c.make))) continue;
      if (c.model) set.add(c.model);
    }
    return Array.from(set).sort();
  }, [cars, filters.makes]);

  const availableTrims = useMemo(() => {
    const set = new Set<string>();
    const makeFilter = filters.makes.length ? new Set(filters.makes) : null;
    const modelFilter = filters.models.length ? new Set(filters.models) : null;
    for (const c of cars) {
      if (makeFilter && (!c.make || !makeFilter.has(c.make))) continue;
      if (modelFilter && (!c.model || !modelFilter.has(c.model))) continue;
      if (c.trim) set.add(c.trim);
    }
    return Array.from(set).sort();
  }, [cars, filters.makes, filters.models]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minP = filters.minPrice ? parseInt(filters.minPrice, 10) : 0;
    const maxP = filters.maxPrice ? parseInt(filters.maxPrice, 10) : Infinity;
    const minY = filters.minYear ? parseInt(filters.minYear, 10) : 0;
    const maxM = filters.maxMileage ? parseInt(filters.maxMileage, 10) : Infinity;

    return cars.filter(c => {
      if (q && !`${c.year} ${c.make} ${c.model} ${c.trim}`.toLowerCase().includes(q)) return false;
      if (c.price < minP) return false;
      if (c.price > maxP) return false;
      if (c.year < minY) return false;
      if (c.mileageNumeric > maxM) return false;
      if (filters.makes.length        && (!c.make         || !filters.makes.includes(c.make))) return false;
      if (filters.models.length       && (!c.model        || !filters.models.includes(c.model))) return false;
      if (filters.trims.length        && (!c.trim         || !filters.trims.includes(c.trim))) return false;
      if (filters.bodyTypes.length    && (!c.bodyType     || !filters.bodyTypes.includes(c.bodyType))) return false;
      if (filters.fuelTypes.length    && (!c.fuelType     || !filters.fuelTypes.includes(c.fuelType))) return false;
      if (filters.transmissions.length && (!c.transmission || !filters.transmissions.includes(c.transmission))) return false;
      if (filters.colours.length) {
        const colour = c.exteriorColour?.toLowerCase();
        if (!colour || !filters.colours.includes(colour)) return false;
      }
      return true;
    });
  }, [cars, searchQuery, filters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case "price-asc":   copy.sort((a, b) => a.price - b.price); break;
      case "price-desc":  copy.sort((a, b) => b.price - a.price); break;
      case "year-desc":   copy.sort((a, b) => b.year - a.year); break;
      case "mileage-asc": copy.sort((a, b) => a.mileageNumeric - b.mileageNumeric); break;
      default: break; // "recommended" — keep API order (newest createdAt first)
    }
    return copy;
  }, [filtered, sort]);

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-ac-6 pt-ac-6">
        <div className="flex flex-row gap-ac-6">
          {/* ── Left column: filter sidebar (desktop only) ── */}
          <div className="hidden w-[280px] flex-shrink-0 md:block">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              availableColours={availableColours}
              availableMakes={availableMakes}
              availableModels={availableModels}
              availableTrims={availableTrims}
            />
          </div>

          {/* ── Right column: main content ── */}
          <div className="flex-1">
            {/* Search bar */}
            <div className="mb-ac-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Filter chips */}
            <div className="mb-ac-4">
              <FilterChips filters={filters} onChange={setFilters} />
            </div>

            {/* Results bar */}
            <div className="mb-ac-5 flex flex-wrap items-center justify-between gap-ac-3">
              <span className="font-body text-sm font-medium text-slate-600">
                {loading ? "Loading…" : `${sorted.length} car${sorted.length === 1 ? "" : "s"}`}
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
                <div className="relative flex items-center gap-ac-2">
                  <span className="font-body text-[13px] text-slate-400">
                    Sort by
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortMenuOpen(o => !o)}
                    className="flex items-center gap-1 font-body text-sm font-semibold text-slate-900 transition-colors duration-150 hover:text-teal-600"
                  >
                    {SORT_LABELS[sort]}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {sortMenuOpen && (
                    <div
                      className="absolute right-0 top-full z-10 mt-2 w-[200px] rounded-[12px] border border-slate-200 bg-white py-1 shadow-lg"
                    >
                      {(Object.keys(SORT_LABELS) as SortKey[]).map(key => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => { setSort(key); setSortMenuOpen(false); }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left font-body text-[13px] text-slate-900 transition-colors hover:bg-slate-50"
                        >
                          <span>{SORT_LABELS[key]}</span>
                          {sort === key && <span className="text-teal-600">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle cards grid */}
            {!loading && sorted.length === 0 && (
              <div className="rounded-[12px] border border-slate-200 bg-white px-ac-6 py-ac-8 text-center font-body text-sm text-slate-500">
                {cars.length === 0
                  ? "No cars listed yet. New listings appear here automatically."
                  : "No cars match your filters."}
              </div>
            )}
            <div className="grid grid-cols-1 gap-ac-4 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((car) => (
                <Link key={car.id} href={`/cars/${car.id}/${car.slug}`} className="block">
                  <VehicleCard {...car} />
                </Link>
              ))}
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
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              availableColours={availableColours}
              availableMakes={availableMakes}
              availableModels={availableModels}
              availableTrims={availableTrims}
            />
          </div>
        </div>
      )}
    </>
  );
}
