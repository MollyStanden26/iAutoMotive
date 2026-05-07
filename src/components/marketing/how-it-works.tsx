"use client";

import { useState } from "react";

const SLIDES = [
  { src: "/images/get-free-offer.png",     alt: "Get a free offer — enter your reg number for a consignment offer" },
  { src: "/images/we-collect-your-car.png", alt: "We collect your car — door-to-door collection at no extra cost" },
  { src: "/images/We-fix-and-list-it.png",  alt: "We fix and list it — full recon and listing on iAutoMotive" },
  { src: "/images/we-sell-it-for-you.png",   alt: "We sell it for you — we handle viewings, negotiations, and paperwork" },
];

export function HowItWorks() {
  return (
    <section className="w-full bg-white py-12">
      {/* ── Mobile: carousel ── */}
      <div className="md:hidden mx-auto max-w-[700px] px-6 sm:px-8">
        <Carousel />
      </div>

      {/* ── Desktop: 4-up row, left → right ── */}
      <div className="hidden md:block mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-4 gap-6">
          {SLIDES.map(slide => (
            <div key={slide.src} className="overflow-hidden rounded-[20px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="block w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Carousel() {
  const [index, setIndex] = useState(0);
  const total = SLIDES.length;
  const go = (delta: number) => setIndex((index + delta + total) % total);

  return (
    <div className="relative">
      <div className="overflow-hidden" style={{ borderRadius: "20px" }}>
        <div
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: "transform 350ms cubic-bezier(.25,.46,.45,.94)",
          }}
        >
          {SLIDES.map(slide => (
            <div key={slide.src} className="relative w-full flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="block w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prev */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          left: -16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          cursor: "pointer",
        }}
      >
        <ChevronLeft />
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          right: -16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          cursor: "pointer",
        }}
      >
        <ChevronRight />
      </button>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === index ? 24 : 8,
              height: 8,
              borderRadius: 999,
              background: i === index ? "#1B5E20" : "#CBD5E1",
              border: "none",
              cursor: "pointer",
              transition: "width 200ms ease, background-color 200ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F1724" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F1724" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
