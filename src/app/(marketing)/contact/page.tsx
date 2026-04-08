"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Browse Topics Data                                                */
/* ------------------------------------------------------------------ */

const browseTopics = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="18" width="36" height="18" rx="3" />
        <circle cx="15" cy="36" r="4" />
        <circle cx="33" cy="36" r="4" />
        <path d="M6 26h36" />
        <path d="M14 18V10h12l6 8" />
      </svg>
    ),
    title: "About Our Vehicles",
    desc: "Vehicle history, inspection reports, condition guarantees",
    href: "/faq?cat=general",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="40" height="28" rx="3" />
        <path d="M4 16h40" />
        <path d="M12 24h8" />
        <path d="M12 30h12" />
        <circle cx="36" cy="28" r="5" />
        <path d="M34 28l1.5 1.5 3-3" />
      </svg>
    ),
    title: "Purchasing a Car",
    desc: "How to buy, reservations, checkout process",
    href: "/faq?cat=buying",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 28h10l4-8h12l4 8h2" />
        <circle cx="16" cy="34" r="4" />
        <circle cx="32" cy="34" r="4" />
        <path d="M24 8v8" />
        <path d="M20 12l4-4 4 4" />
        <path d="M36 16v-6h-6" />
        <path d="M36 10l-6 6" />
      </svg>
    ),
    title: "Selling & Consignment",
    desc: "How consignment works, valuations, payouts",
    href: "/faq?cat=selling",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="12" width="40" height="24" rx="3" />
        <path d="M4 20h40" />
        <path d="M16 28h4" />
        <path d="M26 28h6" />
        <circle cx="24" cy="8" r="4" />
        <path d="M24 4v0" />
      </svg>
    ),
    title: "Payment & Finance",
    desc: "Finance options, payouts, fees, payment methods",
    href: "/buy/finance",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="20" width="36" height="16" rx="3" />
        <circle cx="15" cy="36" r="3" />
        <circle cx="33" cy="36" r="3" />
        <path d="M10 20v-4a2 2 0 012-2h6l4 6" />
        <path d="M24 8l6 4-6 4" />
        <path d="M30 12H18" />
      </svg>
    ),
    title: "Collection & Delivery",
    desc: "Vehicle collection, delivery timescales, locations",
    href: "/sell/how-it-works",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 4l6 12h12l-10 8 4 12-12-8-12 8 4-12L6 16h12z" />
      </svg>
    ),
    title: "Returns & Protection",
    desc: "7-day return policy, consumer rights, warranties",
    href: "/faq?cat=buying",
  },
];

/* ------------------------------------------------------------------ */
/*  Popular Articles                                                  */
/* ------------------------------------------------------------------ */

const popularArticles = [
  { title: "How do I sell my car?", href: "/faq" },
  { title: "How does consignment work?", href: "/faq" },
  { title: "Is there a commission fee?", href: "/sell/pricing" },
  { title: "Can I finance my purchase?", href: "/buy/finance" },
  { title: "What documents do I need?", href: "/faq" },
  { title: "How long does delivery take?", href: "/faq" },
  { title: "What happens during inspection?", href: "/faq" },
  { title: "Can I sell a car with finance?", href: "/faq" },
  { title: "How is my money protected?", href: "/faq" },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                    */
/* ------------------------------------------------------------------ */

export default function ContactPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      {/* ============================================================ */}
      {/* HERO                                                         */}
      {/* ============================================================ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: 420 }}
      >
        {/* Dark gradient background (simulating the Carvana storefront) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, #0F1724 0%, #1a2a3f 40%, #006058 100%)",
          }}
        />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(circle at 70% 50%, rgba(0,140,124,0.15) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-[2] mx-auto max-w-[800px] px-6 py-16 md:py-20 text-center">
          <h1
            className="font-heading text-white"
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            What do you need help with?
          </h1>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/faq?q=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            style={{
              maxWidth: "560px",
              margin: "28px auto 0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "0 20px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8492A8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Ask anything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-body"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  padding: "18px 12px",
                  fontSize: "16px",
                  color: "#0F1724",
                  backgroundColor: "transparent",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8492A8",
                    fontSize: "18px",
                    padding: "4px",
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Sign in CTA */}
          <p
            className="font-body"
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginTop: "24px",
            }}
          >
            Sign in for personalised support
          </p>
          <Link
            href="/account/login"
            className="font-body inline-block"
            style={{
              marginTop: "12px",
              padding: "14px 48px",
              borderRadius: "100px",
              fontSize: "14px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              backgroundColor: "#008C7C",
              color: "#FFFFFF",
              textDecoration: "none",
              transition: "background-color 0.2s",
            }}
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BROWSE TOPICS                                                */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: "#F7F8F9", padding: "64px 0 72px" }}>
        <div className="mx-auto max-w-[1100px] px-6">
          {/* Section heading with accent bar */}
          <div className="text-center" style={{ marginBottom: "40px" }}>
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "#F5A623",
                borderRadius: "2px",
                margin: "0 auto 16px",
              }}
            />
            <h2
              className="font-heading"
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 800,
                color: "#0F1724",
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
              }}
            >
              Browse Topics
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {browseTopics.map((topic) => (
              <Link
                key={topic.title}
                href={topic.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  textDecoration: "none",
                  border: "1px solid #EAECEF",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#008C7C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#EAECEF";
                }}
              >
                <div style={{ flexShrink: 0 }}>{topic.icon}</div>
                <div>
                  <p
                    className="font-heading"
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#0F1724",
                      margin: "0 0 4px",
                    }}
                  >
                    {topic.title}
                  </p>
                  <p
                    className="font-body"
                    style={{
                      fontSize: "13px",
                      color: "#8492A8",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {topic.desc}
                  </p>
                </div>
                {/* Chevron */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C8CDD6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, marginLeft: "auto" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* POPULAR ARTICLES                                             */}
      {/* ============================================================ */}
      <section style={{ padding: "64px 0 72px" }}>
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="text-center" style={{ marginBottom: "40px" }}>
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "#F5A623",
                borderRadius: "2px",
                margin: "0 auto 16px",
              }}
            />
            <h2
              className="font-heading"
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 800,
                color: "#0F1724",
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
              }}
            >
              Popular Articles
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "0",
            }}
          >
            {popularArticles.map((article) => (
              <Link
                key={article.title}
                href={article.href}
                className="font-body"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "16px 8px",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#0F1724",
                  textDecoration: "none",
                  borderBottom: "1px solid #EAECEF",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#008C7C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#0F1724";
                }}
              >
                <span>{article.title}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CONTACT US SECTION                                           */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: "#F7F8F9", padding: "64px 0 72px" }}>
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="text-center" style={{ marginBottom: "40px" }}>
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "#F5A623",
                borderRadius: "2px",
                margin: "0 auto 16px",
              }}
            />
            <h2
              className="font-heading"
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 800,
                color: "#0F1724",
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
              }}
            >
              Get in Touch
            </h2>
            <p
              className="font-body"
              style={{
                fontSize: "15px",
                color: "#4A556B",
                marginTop: "8px",
                maxWidth: "480px",
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.6,
              }}
            >
              Can&rsquo;t find what you&rsquo;re looking for? Our team is here to help.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Email */}
            <a
              href="mailto:hello@iautosale.co.uk"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "32px 24px",
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                textDecoration: "none",
                border: "1px solid #EAECEF",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#008C7C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#EAECEF";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#E0FAF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <p className="font-heading" style={{ fontSize: "16px", fontWeight: 600, color: "#0F1724", margin: 0 }}>
                Email Us
              </p>
              <p className="font-body" style={{ fontSize: "13px", color: "#008C7C", margin: 0 }}>
                hello@iautosale.co.uk
              </p>
              <p className="font-body" style={{ fontSize: "12px", color: "#8492A8", margin: 0, textAlign: "center" }}>
                We typically respond within 2 hours
              </p>
            </a>

            {/* Phone */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "32px 24px",
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                border: "1px solid #EAECEF",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#E0FAF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <p className="font-heading" style={{ fontSize: "16px", fontWeight: 600, color: "#0F1724", margin: 0 }}>
                Call Us
              </p>
              <p className="font-body" style={{ fontSize: "13px", color: "#4A556B", margin: 0 }}>
                [Phone number &mdash; TBC]
              </p>
              <p className="font-body" style={{ fontSize: "12px", color: "#8492A8", margin: 0, textAlign: "center" }}>
                Mon&ndash;Fri 9am&ndash;6pm, Sat 10am&ndash;4pm
              </p>
            </div>

            {/* Live Chat */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "32px 24px",
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                border: "1px solid #EAECEF",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#E0FAF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <p className="font-heading" style={{ fontSize: "16px", fontWeight: 600, color: "#0F1724", margin: 0 }}>
                Live Chat
              </p>
              <p className="font-body" style={{ fontSize: "13px", color: "#4A556B", margin: 0 }}>
                Coming soon
              </p>
              <p className="font-body" style={{ fontSize: "12px", color: "#8492A8", margin: 0, textAlign: "center" }}>
                Chat with our team in real time
              </p>
            </div>

            {/* Complaints */}
            <Link
              href="/legal/complaints"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "32px 24px",
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                textDecoration: "none",
                border: "1px solid #EAECEF",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#008C7C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#EAECEF";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#E0FAF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <p className="font-heading" style={{ fontSize: "16px", fontWeight: 600, color: "#0F1724", margin: 0 }}>
                Make a Complaint
              </p>
              <p className="font-body" style={{ fontSize: "13px", color: "#008C7C", margin: 0 }}>
                complaints@iautosale.co.uk
              </p>
              <p className="font-body" style={{ fontSize: "12px", color: "#8492A8", margin: 0, textAlign: "center" }}>
                View our full complaints policy
              </p>
            </Link>
          </div>

          {/* Support hours */}
          <div
            className="text-center"
            style={{ marginTop: "40px" }}
          >
            <p
              className="font-body"
              style={{ fontSize: "13px", color: "#8492A8", margin: 0, lineHeight: 1.8 }}
            >
              <strong style={{ color: "#4A556B" }}>Support hours:</strong> Monday&ndash;Friday 9:00am&ndash;6:00pm &middot; Saturday 10:00am&ndash;4:00pm &middot; Sunday &amp; Bank Holidays: Closed
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* QUICK LINKS BANNER                                           */}
      {/* ============================================================ */}
      <section style={{ padding: "48px 0 56px" }}>
        <div className="mx-auto max-w-[1100px] px-6">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
              textAlign: "center",
            }}
          >
            {[
              { label: "FAQ", href: "/faq", icon: "?" },
              { label: "Sell your car", href: "/sell", icon: "\u00A3" },
              { label: "Browse cars", href: "/cars", icon: "\u25B6" },
              { label: "How it works", href: "/sell/how-it-works", icon: "\u2192" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "24px 16px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F7F8F9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "#E0FAF5",
                    color: "#008C7C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                  className="font-heading"
                >
                  {link.icon}
                </div>
                <p
                  className="font-body"
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0F1724",
                    margin: 0,
                  }}
                >
                  {link.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
