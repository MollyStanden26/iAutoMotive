"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, ROLE_HOME_ROUTE } from "@/hooks/use-auth";

export function Navbar() {
  const { user, isLoading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favoritesTab, setFavoritesTab] = useState<"vehicles" | "searches">("vehicles");
  const pathname = usePathname();

  const dashboardHref = user ? ROLE_HOME_ROUTE[user.role] : "/auth/signin";
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "";

  const navLinks = [
    { href: "/cars", label: "Browse Cars", icon: "search" },
    { href: "/sell", label: "Sell Your Car", icon: null },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50" style={{ borderBottom: "1px solid #E2E8F0" }}>
      <div
        className="mx-auto flex items-center"
        style={{
          maxWidth: 1800,
          height: 79,
          padding: "16px 40px",
          gap: 24,
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex shrink-0 items-center gap-0">
          <span
            className="font-heading"
            style={{ fontSize: 22, fontWeight: 300, color: "#4A556B" }}
          >
            iAuto
          </span>
          <span
            className="font-heading"
            style={{ fontSize: 22, fontWeight: 800, color: "#008C7C" }}
          >
            Sale
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <nav className="hidden items-center md:flex" style={{ gap: 8 }}>
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="font-body flex items-center transition-colors"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: active ? "#008C7C" : "#0F1724",
                  backgroundColor: active ? "#E0FAF5" : "transparent",
                  padding: "0 16px",
                  height: 44,
                  borderRadius: 99999,
                  gap: 8,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#F7F8F9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {link.icon === "search" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Desktop right side ── */}
        <div className="hidden items-center md:flex" style={{ gap: 16 }}>
          {isLoading ? (
            <div className="animate-pulse" style={{ width: 120, height: 44, borderRadius: 99999, backgroundColor: "#F7F8F9" }} />
          ) : (
            <>
              {/* Heart / favorites icon */}
              <button
                onClick={() => { setFavoritesOpen(true); setMobileOpen(false); }}
                className="flex items-center justify-center transition-colors"
                style={{ width: 44, height: 44, borderRadius: 99999, color: "#0F1724", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F8F9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                title="Favorites"
                aria-label="Favorites"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* User + menu pill */}
              {user ? (
                <div className="flex items-center" style={{ border: "1px solid #C8CDD6", borderRadius: 99999, padding: "6px 12px 6px 6px", gap: 8, height: 44 }}>
                  {/* Avatar */}
                  <Link
                    href={dashboardHref}
                    className="flex items-center justify-center font-body"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 99999,
                      backgroundColor: "#008C7C",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                    title={user.name}
                  >
                    {userInitial}
                  </Link>

                  {/* Dropdown menu button */}
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center justify-center"
                    style={{ width: 24, height: 24, color: "#4A556B", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                    aria-label="Menu"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center" style={{ border: "1px solid #C8CDD6", borderRadius: 99999, padding: "6px 12px 6px 6px", gap: 8, height: 44 }}>
                  {/* User icon */}
                  <Link
                    href="/auth/signin"
                    className="flex items-center justify-center"
                    style={{ width: 32, height: 32, borderRadius: 99999, backgroundColor: "#F7F8F9", color: "#4A556B" }}
                    title="Sign in"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>

                  {/* Hamburger menu */}
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center justify-center"
                    style={{ width: 24, height: 24, color: "#4A556B", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                    aria-label="Menu"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ width: 44, height: 44, color: "#0F1724", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
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
      </div>

      {/* ── Slide-out panel (right side, Carvana-style) ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: "rgba(15,23,36,0.4)", transition: "opacity 300ms" }}
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed right-0 top-0 z-[70] flex flex-col overflow-y-auto"
            style={{
              width: 370,
              maxWidth: "85vw",
              height: "100vh",
              backgroundColor: "#FFFFFF",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.15)",
              animation: "slideInRight 250ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Close button */}
            <div className="flex justify-end" style={{ padding: "20px 24px 0" }}>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center transition-colors"
                style={{ width: 36, height: 36, borderRadius: 99999, color: "#4A556B", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F8F9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Welcome / User section */}
            <div style={{ padding: "8px 32px 28px" }}>
              {isLoading ? (
                <div className="animate-pulse" style={{ height: 32, borderRadius: 8, backgroundColor: "#F7F8F9" }} />
              ) : user ? (
                <>
                  <div className="flex items-center" style={{ gap: 14, marginBottom: 4 }}>
                    <div
                      className="flex items-center justify-center font-body"
                      style={{ width: 44, height: 44, borderRadius: 99999, backgroundColor: "#008C7C", color: "#FFF", fontSize: 16, fontWeight: 700 }}
                    >
                      {userInitial}
                    </div>
                    <div>
                      <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 700, color: "#0F1724", margin: 0 }}>
                        Welcome back
                      </h2>
                      <p className="font-body" style={{ fontSize: 14, color: "#8492A8", margin: 0 }}>
                        {user.name}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-heading" style={{ fontSize: 24, fontWeight: 700, color: "#0F1724", margin: "0 0 4px" }}>
                    Welcome to iAutoSale
                  </h2>
                  <p className="font-body" style={{ fontSize: 14, color: "#8492A8", margin: "0 0 20px" }}>
                    Personalise your experience
                  </p>
                  <Link
                    href="/auth/signin"
                    className="font-body flex items-center justify-center"
                    style={{
                      width: "fit-content",
                      height: 44,
                      padding: "0 28px",
                      border: "1.5px solid #0F1724",
                      borderRadius: 99999,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F1724",
                      textDecoration: "none",
                      transition: "all 200ms",
                    }}
                    onClick={() => setMobileOpen(false)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F8F9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            {/* ── CTA Cards ── */}
            <div style={{ padding: "0 32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Get an Offer card */}
              <div>
                <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 700, color: "#0F1724", margin: "0 0 10px" }}>
                  Sell Your Car
                </h3>
                <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: 20 }}>
                  <p className="font-body" style={{ fontSize: 14, color: "#4A556B", margin: "0 0 16px", lineHeight: 1.6 }}>
                    Get a real offer in less than 2 minutes — consign, sell outright, or track your value.{" "}
                    <span style={{ fontWeight: 600 }}>No obligation.</span>
                  </p>
                  <Link
                    href="/sell/offer"
                    className="font-body flex items-center justify-center"
                    style={{
                      width: "100%",
                      height: 44,
                      border: "1.5px solid #008C7C",
                      borderRadius: 99999,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#008C7C",
                      textDecoration: "none",
                      transition: "all 200ms",
                    }}
                    onClick={() => setMobileOpen(false)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E0FAF5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    Get Your Offer
                  </Link>
                </div>
              </div>

              {/* Finance card */}
              <div>
                <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 700, color: "#0F1724", margin: "0 0 10px" }}>
                  Finance
                </h3>
                <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: 20 }}>
                  <p className="font-body" style={{ fontSize: 14, color: "#4A556B", margin: "0 0 16px", lineHeight: 1.6 }}>
                    Get pre-approved and shop with real terms.{" "}
                    <span style={{ fontWeight: 600 }}>No hit to your credit.</span>
                  </p>
                  <Link
                    href="/buy/finance"
                    className="font-body flex items-center justify-center"
                    style={{
                      width: "100%",
                      height: 44,
                      border: "1.5px solid #008C7C",
                      borderRadius: 99999,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#008C7C",
                      textDecoration: "none",
                      transition: "all 200ms",
                    }}
                    onClick={() => setMobileOpen(false)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E0FAF5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    Get Pre-Approved
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Nav links ── */}
            <div style={{ padding: "0 32px", display: "flex", flexDirection: "column", gap: 0 }}>
              {user && (
                <Link
                  href={dashboardHref}
                  className="font-body flex items-center transition-colors"
                  style={{ padding: "14px 0", fontSize: 15, fontWeight: 500, color: "#0F1724", textDecoration: "none", gap: 12, borderBottom: "1px solid #EAECEF" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Dashboard
                </Link>
              )}

              <Link
                href="/contact"
                className="font-body flex items-center transition-colors"
                style={{ padding: "14px 0", fontSize: 15, fontWeight: 500, color: "#0F1724", textDecoration: "none", gap: 12, borderBottom: "1px solid #EAECEF" }}
                onClick={() => setMobileOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Support and Contact
              </Link>

              <Link
                href="/about"
                className="font-body flex items-center transition-colors"
                style={{ padding: "14px 0", fontSize: 15, fontWeight: 500, color: "#0F1724", textDecoration: "none", gap: 12 }}
                onClick={() => setMobileOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                About iAutoSale
              </Link>
            </div>

            {/* ── Sign out (for authenticated users) ── */}
            {user && !isLoading && (
              <div style={{ marginTop: "auto", padding: "20px 32px", borderTop: "1px solid #EAECEF" }}>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="font-body flex w-full items-center justify-center transition-colors"
                  style={{
                    height: 44,
                    border: "1.5px solid #EF4444",
                    borderRadius: 99999,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#EF4444",
                    background: "none",
                    cursor: "pointer",
                    gap: 8,
                    transition: "all 200ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Slide-in animation */}
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
      {/* ── Favorites slide-out panel (right side) ── */}
      {favoritesOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: "rgba(15,23,36,0.4)", transition: "opacity 300ms" }}
            onClick={() => setFavoritesOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed right-0 top-0 z-[70] flex flex-col"
            style={{
              width: 420,
              maxWidth: "90vw",
              height: "100vh",
              backgroundColor: "#FFFFFF",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.15)",
              animation: "slideInRight 250ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between" style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
              <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: "#0F1724", margin: 0 }}>
                Favourites
              </h2>
              <button
                onClick={() => setFavoritesOpen(false)}
                className="flex items-center justify-center transition-colors"
                style={{ width: 36, height: 36, borderRadius: 99999, color: "#4A556B", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F8F9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                aria-label="Close favourites"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div style={{ padding: "16px 24px 0" }}>
              <div
                className="flex"
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 99999,
                  padding: 4,
                  backgroundColor: "#F7F8F9",
                }}
              >
                <button
                  onClick={() => setFavoritesTab("vehicles")}
                  className="font-body flex-1 transition-all"
                  style={{
                    height: 40,
                    borderRadius: 99999,
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    color: favoritesTab === "vehicles" ? "#0F1724" : "#8492A8",
                    backgroundColor: favoritesTab === "vehicles" ? "#FFFFFF" : "transparent",
                    boxShadow: favoritesTab === "vehicles" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  Vehicles
                </button>
                <button
                  onClick={() => setFavoritesTab("searches")}
                  className="font-body flex-1 transition-all"
                  style={{
                    height: 40,
                    borderRadius: 99999,
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    color: favoritesTab === "searches" ? "#0F1724" : "#8492A8",
                    backgroundColor: favoritesTab === "searches" ? "#FFFFFF" : "transparent",
                    boxShadow: favoritesTab === "searches" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  Searches
                </button>
              </div>
            </div>

            {/* Empty state content */}
            <div className="flex flex-1 flex-col items-center justify-start" style={{ padding: "40px 32px", textAlign: "center" }}>
              {favoritesTab === "vehicles" ? (
                <>
                  {/* Car illustration placeholder */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 200,
                      height: 140,
                      borderRadius: 16,
                      backgroundColor: "#F1F5F9",
                      marginBottom: 28,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Car silhouette icon */}
                    <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
                      <path d="M12 38h-4a4 4 0 0 1-4-4v-8a4 4 0 0 1 1.2-2.8l8-8A4 4 0 0 1 16 14h28a4 4 0 0 1 3.2 1.6l6.4 8.5A4 4 0 0 1 54 25.6V34a4 4 0 0 1-4 4h-4" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="20" cy="38" r="5" stroke="#CBD5E1" strokeWidth="2.5" />
                      <circle cx="42" cy="38" r="5" stroke="#CBD5E1" strokeWidth="2.5" />
                    </svg>
                    {/* Heart badge */}
                    <div
                      className="flex items-center justify-center"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 32,
                        height: 32,
                        borderRadius: 99999,
                        backgroundColor: "#FFFFFF",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: "#0F1724", margin: "0 0 10px" }}>
                    You haven&apos;t favourited any vehicles
                  </h3>
                  <p className="font-body" style={{ fontSize: 14, color: "#8492A8", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 280 }}>
                    Find a vehicle you love and favourite it using the heart icon.
                  </p>

                  <Link
                    href="/cars"
                    className="font-body flex items-center justify-center"
                    style={{
                      height: 48,
                      padding: "0 32px",
                      borderRadius: 99999,
                      backgroundColor: "#008C7C",
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "background-color 200ms",
                    }}
                    onClick={() => setFavoritesOpen(false)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#006B5E"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#008C7C"; }}
                  >
                    Search vehicles
                  </Link>

                  {!user && (
                    <p className="font-body" style={{ fontSize: 14, color: "#8492A8", marginTop: 20 }}>
                      Already have an account?{" "}
                      <Link
                        href="/auth/signin"
                        style={{ color: "#008C7C", fontWeight: 600, textDecoration: "none" }}
                        onClick={() => setFavoritesOpen(false)}
                      >
                        Sign in
                      </Link>{" "}
                      to see your favourites.
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* Search illustration */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 200,
                      height: 140,
                      borderRadius: 16,
                      backgroundColor: "#F1F5F9",
                      marginBottom: 28,
                    }}
                  >
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>

                  <h3 className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: "#0F1724", margin: "0 0 10px" }}>
                    You haven&apos;t saved any searches
                  </h3>
                  <p className="font-body" style={{ fontSize: 14, color: "#8492A8", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 280 }}>
                    Save a search to get notified when new cars match your criteria.
                  </p>

                  <Link
                    href="/cars"
                    className="font-body flex items-center justify-center"
                    style={{
                      height: 48,
                      padding: "0 32px",
                      borderRadius: 99999,
                      backgroundColor: "#008C7C",
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "background-color 200ms",
                    }}
                    onClick={() => setFavoritesOpen(false)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#006B5E"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#008C7C"; }}
                  >
                    Search vehicles
                  </Link>

                  {!user && (
                    <p className="font-body" style={{ fontSize: 14, color: "#8492A8", marginTop: 20 }}>
                      Already have an account?{" "}
                      <Link
                        href="/auth/signin"
                        style={{ color: "#008C7C", fontWeight: 600, textDecoration: "none" }}
                        onClick={() => setFavoritesOpen(false)}
                      >
                        Sign in
                      </Link>{" "}
                      to see your saved searches.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Slide-in animation (shared with menu panel) */}
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </header>
  );
}
