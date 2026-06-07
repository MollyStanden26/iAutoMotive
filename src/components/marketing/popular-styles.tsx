"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * "Popular vehicle styles" — a horizontally-scrollable carousel of UK body
 * styles, each linking to the browse page pre-scoped to that type. Modelled on
 * Carvana's "Popular Body Styles" row but rebuilt in the iAutoMotive brand with
 * original car silhouettes (no third-party image assets).
 */

const TEAL = "#008C7C";
const TEAL_BADGE = "#E0FAF5";
const SILHOUETTE = "#2B3A55";
const WHEEL = "#1B2536";
const INK = "#0F1724";
const BORDER = "#EAECEF";

type StyleKey =
  | "suv" | "saloon" | "hatchback" | "estate"
  | "coupe" | "convertible" | "mpv";

// Greenhouse (cabin) polygon per body style — drawn on top of a shared body
// bar + wheels so the silhouettes stay consistent but read as distinct shapes.
const GREENHOUSE: Record<StyleKey, string> = {
  suv:         "28,40 34,16 126,16 132,40",
  saloon:      "50,40 62,24 100,24 114,40",
  hatchback:   "46,40 58,22 92,22 102,40",
  estate:      "46,40 58,22 120,22 128,40",
  coupe:       "52,40 74,27 98,27 112,40",
  convertible: "58,40 68,29 78,40",
  mpv:         "30,40 44,18 124,18 132,40",
};

function CarSilhouette({ type }: { type: StyleKey }) {
  return (
    <svg viewBox="0 0 160 72" width="100%" height="100%" role="img" aria-hidden="true">
      {/* body bar */}
      <rect x="8" y="40" width="144" height="16" rx="8" fill={SILHOUETTE} />
      {/* greenhouse */}
      <polygon points={GREENHOUSE[type]} fill={SILHOUETTE} />
      {/* wheels */}
      <circle cx="46" cy="54" r="11" fill={WHEEL} />
      <circle cx="46" cy="54" r="4.5" fill={TEAL} />
      <circle cx="114" cy="54" r="11" fill={WHEEL} />
      <circle cx="114" cy="54" r="4.5" fill={TEAL} />
    </svg>
  );
}

interface Tile {
  label: string;
  href: string;
  image?: string;        // real photo
  silhouette?: StyleKey; // SVG fallback shown only if no photo is set
}

const BS = "/images/body-styles";

// Body styles link by ?type=<bodyType>; fuel categories (Electric, Hybrids,
// Plug-in Hybrids) link by ?fuel=<fuelType>. Mirrors the Carvana set in UK terms
// (sedan→Saloon, truck→Pickup, wagon→Estate, minivan→MPV).
const TILES: Tile[] = [
  { label: "SUVs",            href: "/cars?type=suv",           image: `${BS}/suv.webp`,           silhouette: "suv" },
  { label: "Saloons",         href: "/cars?type=saloon",        image: `${BS}/saloon.webp`,        silhouette: "saloon" },
  { label: "Pickups",         href: "/cars?type=pickup",        image: `${BS}/pickup.webp` },
  { label: "Electric",        href: "/cars?fuel=electric",      image: `${BS}/electric.webp` },
  { label: "Hybrids",         href: "/cars?fuel=hybrid",        image: `${BS}/hybrid.webp` },
  { label: "Coupes",          href: "/cars?type=coupe",         image: `${BS}/coupe.webp`,         silhouette: "coupe" },
  { label: "Hatchbacks",      href: "/cars?type=hatchback",     image: `${BS}/hatchback.webp`,     silhouette: "hatchback" },
  { label: "Estates",         href: "/cars?type=estate",        image: `${BS}/estate.webp`,        silhouette: "estate" },
  { label: "Convertibles",    href: "/cars?type=convertible",   image: `${BS}/convertible.webp`,   silhouette: "convertible" },
  { label: "MPVs",            href: "/cars?type=mpv",           image: `${BS}/mpv.webp`,           silhouette: "mpv" },
  { label: "Plug-in Hybrids", href: "/cars?fuel=plugin_hybrid", image: `${BS}/plugin-hybrid.webp` },
  { label: "Shop all",        href: "/cars" },
];

export function PopularStyles() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  const arrowBtn = (dir: 1 | -1, disabled: boolean) => (
    <button
      type="button"
      onClick={() => scrollBy(dir)}
      disabled={disabled}
      aria-label={dir === -1 ? "Previous styles" : "Next styles"}
      className="hidden sm:flex items-center justify-center rounded-full transition-opacity"
      style={{
        width: 44, height: 44,
        border: `1.5px solid ${BORDER}`,
        background: "#fff",
        color: INK,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === -1 ? "rotate(180deg)" : "none" }}>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </button>
  );

  return (
    <section className="w-full bg-white" style={{ padding: "44px 0 52px" }} aria-label="Popular vehicle styles">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4" style={{ marginBottom: 20 }}>
          <h2 className="font-heading" style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 500, color: INK, margin: 0, letterSpacing: "-0.01em" }}>
            Popular vehicle styles
          </h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            {arrowBtn(-1, atStart)}
            {arrowBtn(1, atEnd)}
          </div>
        </div>

        {/* Scroller */}
        <style>{`.ps-scroll::-webkit-scrollbar{display:none}`}</style>
        <div
          ref={scrollRef}
          className="ps-scroll flex"
          style={{
            overflowX: "auto",
            scrollbarWidth: "none",
            scrollSnapType: "x mandatory",
            gap: 8,
          }}
        >
          {TILES.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className="group flex flex-col items-center flex-shrink-0"
              style={{
                scrollSnapAlign: "start",
                minWidth: 150,
                padding: "12px 8px 8px",
                textDecoration: "none",
                borderRadius: 16,
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 132, height: 84 }}
              >
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.image}
                    alt={t.label}
                    loading="lazy"
                    className="transition-transform duration-200 group-hover:scale-110"
                    style={{ width: 124, height: 76, objectFit: "contain" }}
                  />
                ) : t.silhouette ? (
                  <div
                    className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ width: 120, height: 64 }}
                  >
                    <CarSilhouette type={t.silhouette} />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                    style={{ width: 64, height: 64, background: TEAL_BADGE, color: TEAL }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </div>
                )}
              </div>
              <span
                className="font-body transition-colors"
                style={{ marginTop: 8, fontSize: 14, fontWeight: 400, color: INK, textAlign: "center", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = TEAL)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = INK)}
              >
                {t.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
