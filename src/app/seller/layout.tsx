"use client";

import { usePathname, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

/* ── Colour tokens (light surface) ── */
const C = {
  bgPage: "#F7F8F9",
  white: "#FFFFFF",
  border: "#E2E8F0",
  teal: "#008C7C",
  teal50: "#E0FAF5",
  teal800: "#006058",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  textDim: "#4A556B",
  teal200: "#4DD9C7",
  bgSidebar: "#0F1724",
};

/* ================================================================== */
/*  SELLER NAV                                                         */
/* ================================================================== */
const NAV_LINKS = [
  { label: "Overview", href: "/seller/overview" },
  { label: "My vehicle", href: "/seller/vehicle" },
  { label: "Financials", href: "/seller/financials" },
  { label: "Documents", href: "/seller/documents" },
];

function SellerNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      style={{
        height: 58, background: C.white, borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", padding: "0 24px",
      }}
    >
      {/* Logo */}
      <div style={{ cursor: "pointer", marginRight: 32, flexShrink: 0 }} onClick={() => router.push("/")}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: 17, color: C.textMuted }}>iAuto</span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 900, fontSize: 17, color: C.teal }}>Motive</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {NAV_LINKS.map(link => {
          const isActive = pathname.startsWith(link.href);
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              style={{
                fontFamily: "var(--font-body)", fontWeight: isActive ? 700 : 500, fontSize: 13,
                color: isActive ? C.teal800 : C.textSecondary,
                background: isActive ? C.teal50 : "transparent",
                borderRadius: 9999, padding: "6px 12px",
                border: "none", cursor: "pointer", transition: "background 150ms ease",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.bgPage; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Support button */}
      <button
        onClick={() => router.push("/seller/documents")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: C.bgPage, border: `1px solid ${C.border}`, borderRadius: 9999,
          padding: "6px 16px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
          color: C.textSecondary, cursor: "pointer", marginRight: 12,
        }}
      >
        <MessageCircle size={14} />
        Support
      </button>

      {/* Avatar */}
      <a
        href="/seller/overview"
        title="James Smith"
        onClick={(e) => { e.preventDefault(); router.push("/seller/overview"); }}
        style={{
          width: 32, height: 32, borderRadius: 9999,
          background: C.teal, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "#FFFFFF",
          textDecoration: "none", cursor: "pointer",
        }}
      >
        JS
      </a>
    </nav>
  );
}

/* ================================================================== */
/*  SELLER FOOTER                                                      */
/* ================================================================== */
function SellerFooter() {
  return (
    <footer style={{ background: C.bgSidebar, padding: "16px 24px" }}>
      <div style={{
        maxWidth: 960, margin: "0 auto",
        fontFamily: "var(--font-body)", fontSize: 11, color: C.textDim,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        <span>iAutoMotive Ltd — Registered in England & Wales</span>
        <span>FCA status: [placeholder] · ICO registration: [placeholder]</span>
        <span>
          Consumer Rights Act 2015 ·{" "}
          <span style={{ color: C.teal200, cursor: "pointer" }}>Privacy policy</span> ·{" "}
          <span style={{ color: C.teal200, cursor: "pointer" }}>Complaints policy</span>
        </span>
      </div>
    </footer>
  );
}

/* ================================================================== */
/*  LAYOUT                                                             */
/* ================================================================== */
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bgPage }}>
      <SellerNav />
      <main style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: "24px 24px" }}>
        {children}
      </main>
      <SellerFooter />
    </div>
  );
}
