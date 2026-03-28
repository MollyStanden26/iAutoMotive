"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white"
      style={{ borderBottom: "1.5px solid #EAECEF" }}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-8"
        style={{ height: "62px" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0 shrink-0">
          <span
            className="font-heading"
            style={{ fontWeight: 300, fontSize: "22px", color: "#4A556B" }}
          >
            Auto
          </span>
          <span
            className="font-heading"
            style={{ fontWeight: 800, fontSize: "22px", color: "#008C7C" }}
          >
            Consign
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center md:flex" style={{ gap: "22px" }}>
          <Link
            href="/cars"
            className="font-body transition-colors duration-150 hover:text-[#008C7C]"
            style={{ fontSize: "13px", fontWeight: 600, color: "#4A556B" }}
          >
            Browse cars
          </Link>
          <Link
            href="/sell"
            className="font-body transition-colors duration-150 hover:text-[#008C7C]"
            style={{ fontSize: "13px", fontWeight: 600, color: "#4A556B" }}
          >
            Sell your car
          </Link>
          <Link
            href="/sell/how-it-works"
            className="font-body transition-colors duration-150 hover:text-[#008C7C]"
            style={{ fontSize: "13px", fontWeight: 600, color: "#4A556B" }}
          >
            How it works
          </Link>
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Ghost Sign in button */}
          <Link
            href="/auth/signin"
            className="font-body transition-all duration-150 hover:border-[#008C7C] hover:text-[#008C7C]"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0F1724",
              border: "2px solid #C8CDD6",
              borderRadius: "100px",
              padding: "8px 18px",
            }}
          >
            Sign in
          </Link>
          {/* Primary CTA */}
          <Link
            href="/sell/offer"
            className="font-heading text-white transition-colors duration-150 hover:bg-[#006058]"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              backgroundColor: "#008C7C",
              borderRadius: "100px",
              padding: "10px 20px",
            }}
          >
            Get an offer
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ width: "40px", height: "40px" }}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F1724" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 top-[62px] z-40 flex flex-col bg-white md:hidden">
          <div className="flex flex-col gap-2 p-6">
            <Link href="/cars" className="font-body text-[16px] font-semibold text-[#0F1724] py-3" onClick={() => setMenuOpen(false)}>
              Browse cars
            </Link>
            <Link href="/sell" className="font-body text-[16px] font-semibold text-[#0F1724] py-3" onClick={() => setMenuOpen(false)}>
              Sell your car
            </Link>
            <Link href="/sell/how-it-works" className="font-body text-[16px] font-semibold text-[#0F1724] py-3" onClick={() => setMenuOpen(false)}>
              How it works
            </Link>
            <Link href="/auth/signin" className="font-body text-[16px] font-semibold text-[#0F1724] py-3" onClick={() => setMenuOpen(false)}>
              Sign in
            </Link>
          </div>
          <div className="mt-auto p-6">
            <Link
              href="/sell/offer"
              className="block w-full text-center font-heading text-white"
              style={{
                backgroundColor: "#008C7C",
                borderRadius: "100px",
                padding: "15px 30px",
                fontSize: "16px",
                fontWeight: 800,
              }}
              onClick={() => setMenuOpen(false)}
            >
              Get an offer
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
