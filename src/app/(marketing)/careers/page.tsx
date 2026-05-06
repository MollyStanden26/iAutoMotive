"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const quickApplyTeams = [
  {
    title: "Vehicle Operations",
    desc: "Join the team that collects, inspects, photographs, and prepares every vehicle to retail standard.",
    cta: "View roles",
  },
  {
    title: "Customer Experience",
    desc: "Help sellers and buyers have the smoothest, most transparent car transaction of their lives.",
    cta: "View roles",
  },
  {
    title: "Growth & Marketing",
    desc: "Drive awareness, acquisition, and brand love for the UK\u2019s newest consignment platform.",
    cta: "View roles",
  },
];

const departments = [
  {
    title: "Engineering",
    desc: "Build the platform that\u2019s changing how the UK buys and sells cars. Full-stack, data, and infrastructure roles.",
    gradient: "linear-gradient(135deg, #006058 0%, #008C7C 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 24 16 30" />
        <line x1="26" y1="30" x2="32" y2="30" />
        <rect x="4" y="6" width="40" height="36" rx="4" />
      </svg>
    ),
  },
  {
    title: "Vehicle Operations",
    desc: "Collection drivers, PDI technicians, reconditioning specialists, photographers, and lot managers.",
    gradient: "linear-gradient(135deg, #222D3F 0%, #4A556B 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="18" width="40" height="16" rx="3" />
        <circle cx="14" cy="34" r="4" />
        <circle cx="34" cy="34" r="4" />
        <path d="M12 18v-4h12l6 4" />
        <path d="M4 26h40" />
      </svg>
    ),
  },
  {
    title: "Customer Experience",
    desc: "Be the voice of iAutoMotive \u2014 guide customers from first enquiry to successful sale.",
    gradient: "linear-gradient(135deg, #008C7C 0%, #4DD9C7 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H23l-4 4v-4a2 2 0 01-2-2z" />
        <path d="M9 9a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
  {
    title: "Growth & Marketing",
    desc: "Performance marketing, brand, content, partnerships, and community building across the UK.",
    gradient: "linear-gradient(135deg, #F5A623 0%, #B87209 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 36V20" />
        <path d="M14 36V14" />
        <path d="M22 36V24" />
        <path d="M30 36V10" />
        <path d="M38 36V18" />
        <circle cx="38" cy="14" r="3" />
        <path d="M35 17l3-3 3 3" />
      </svg>
    ),
  },
  {
    title: "Finance & Compliance",
    desc: "FCA compliance, AML, financial operations, and ensuring we do things the right way.",
    gradient: "linear-gradient(135deg, #0F1724 0%, #222D3F 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="18" width="32" height="24" rx="3" />
        <path d="M8 24h32" />
        <path d="M16 8h16l4 10H12z" />
        <circle cx="24" cy="32" r="4" />
      </svg>
    ),
  },
];

const values = [
  {
    title: "Transparency first",
    desc: "No hidden fees, no games. We believe trust is built through radical honesty \u2014 with customers and with each other.",
    icon: "\uD83D\uDD0D",
  },
  {
    title: "Obsess over the customer",
    desc: "Every decision starts with the seller or buyer. If it doesn\u2019t make their experience better, we question it.",
    icon: "\u2764\uFE0F",
  },
  {
    title: "Move fast, stay sharp",
    desc: "We\u2019re a startup. We ship quickly, learn from data, and iterate. Perfection is the enemy of progress.",
    icon: "\u26A1",
  },
  {
    title: "Own your lane",
    desc: "Everyone here has genuine ownership. We hire smart people and trust them to make great decisions.",
    icon: "\uD83C\uDFAF",
  },
  {
    title: "Build for the long run",
    desc: "We\u2019re creating a category-defining platform, not chasing short-term wins. Sustainable growth over hype.",
    icon: "\uD83C\uDF31",
  },
  {
    title: "Win as a team",
    desc: "No egos. The best idea wins, regardless of who said it. We celebrate each other\u2019s successes.",
    icon: "\uD83E\uDD1D",
  },
];

const perks = [
  { icon: "\uD83C\uDFE0", title: "Hybrid working", desc: "Flexible remote and office mix" },
  { icon: "\uD83C\uDF34", title: "28 days holiday", desc: "Plus bank holidays" },
  { icon: "\uD83D\uDCB0", title: "Competitive salary", desc: "Benchmarked to market" },
  { icon: "\uD83D\uDCC8", title: "Share options", desc: "Real equity from day one" },
  { icon: "\uD83E\uDDEC", title: "Health & wellbeing", desc: "Private medical and mental health support" },
  { icon: "\uD83D\uDE97", title: "Staff discount", desc: "Discounted platform fee for team" },
  { icon: "\uD83D\uDCDA", title: "Learning budget", desc: "\u00a31,000/year for development" },
  { icon: "\uD83C\uDF7D\uFE0F", title: "Team socials", desc: "Regular events and off-sites" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  return (
    <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      {/* ============================================================ */}
      {/* HERO                                                         */}
      {/* ============================================================ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: 480 }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, #0F1724 0%, #006058 50%, #008C7C 100%)",
          }}
        />
        {/* Decorative gradient circles */}
        <div
          className="absolute z-[1]"
          style={{
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(77,217,199,0.12) 0%, transparent 70%)",
            top: "-200px",
            right: "-100px",
          }}
        />
        <div
          className="absolute z-[1]"
          style={{
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)",
            bottom: "-100px",
            left: "-50px",
          }}
        />

        <div className="relative z-[2] mx-auto max-w-[900px] px-6 py-16 md:py-24 text-center">
          <p
            className="font-body"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#4DD9C7",
              marginBottom: "12px",
            }}
          >
            Careers at iAutoMotive
          </p>
          <h1
            className="font-heading text-white"
            style={{
              fontSize: "clamp(32px, 6vw, 52px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Work at iAutoMotive
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.75)",
              marginTop: "16px",
              maxWidth: "540px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
            }}
          >
            Be part of the team disrupting how the UK buys and sells cars
          </p>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            style={{
              maxWidth: "700px",
              margin: "32px auto 0",
              display: "flex",
              gap: "0",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#FFFFFF",
                padding: "0 16px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8492A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search all listings"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-body"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  padding: "16px 0",
                  fontSize: "15px",
                  color: "#0F1724",
                  backgroundColor: "transparent",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#FFFFFF",
                padding: "0 16px",
                borderLeft: "1px solid #EAECEF",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8492A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="text"
                placeholder="Select location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="font-body"
                style={{
                  width: "140px",
                  border: "none",
                  outline: "none",
                  padding: "16px 0",
                  fontSize: "15px",
                  color: "#0F1724",
                  backgroundColor: "transparent",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "0 20px",
                backgroundColor: "#008C7C",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          <Link
            href="#open-roles"
            className="font-body inline-block"
            style={{
              marginTop: "24px",
              padding: "14px 48px",
              borderRadius: "100px",
              fontSize: "14px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              backgroundColor: "#008C7C",
              color: "#FFFFFF",
              textDecoration: "none",
            }}
          >
            View Open Positions
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* QUICK APPLY TEAMS                                            */}
      {/* ============================================================ */}
      <section style={{ padding: "0", transform: "translateY(-1px)" }}>
        <div
          className="mx-auto max-w-[1100px] px-6"
          style={{ transform: "translateY(-40px)" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "0",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {quickApplyTeams.map((team, i) => (
              <div
                key={team.title}
                style={{
                  padding: "32px 28px",
                  textAlign: "center",
                  borderRight:
                    i < quickApplyTeams.length - 1 ? "1px solid #EAECEF" : "none",
                }}
              >
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#0F1724",
                    margin: "0 0 10px",
                    fontStyle: "italic",
                  }}
                >
                  {team.title}
                </h3>
                <p
                  className="font-body"
                  style={{
                    fontSize: "14px",
                    color: "#8492A8",
                    lineHeight: 1.6,
                    margin: "0 0 20px",
                  }}
                >
                  {team.desc}
                </p>
                <button
                  className="font-body"
                  style={{
                    padding: "12px 32px",
                    borderRadius: "100px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    border: "2px solid #008C7C",
                    backgroundColor: "transparent",
                    color: "#008C7C",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: "100%",
                    maxWidth: "220px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#008C7C";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#008C7C";
                  }}
                >
                  {team.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FIND YOUR HOME — Departments                                 */}
      {/* ============================================================ */}
      <section id="open-roles" style={{ padding: "40px 0 72px" }}>
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
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 800,
                color: "#0F1724",
                lineHeight: 1.1,
              }}
            >
              Find your home
            </h2>
            <p
              className="font-body"
              style={{
                fontSize: "16px",
                color: "#8492A8",
                marginTop: "10px",
              }}
            >
              Explore open positions within our major departments
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {departments.map((dept) => (
              <div
                key={dept.title}
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                }}
              >
                {/* Gradient header with icon */}
                <div
                  style={{
                    background: dept.gradient,
                    padding: "32px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "140px",
                  }}
                >
                  {dept.icon}
                </div>
                {/* Text */}
                <div style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
                  <h3
                    className="font-heading"
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0F1724",
                      margin: "0 0 8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {dept.title}
                  </h3>
                  <p
                    className="font-body"
                    style={{
                      fontSize: "14px",
                      color: "#8492A8",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {dept.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CULTURE & VALUES                                             */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: "#F7F8F9", padding: "72px 0" }}>
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="text-center" style={{ marginBottom: "48px" }}>
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
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 800,
                color: "#0F1724",
                lineHeight: 1.1,
              }}
            >
              Culture
            </h2>
            <p
              className="font-body"
              style={{
                fontSize: "16px",
                color: "#8492A8",
                marginTop: "10px",
                maxWidth: "520px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              We&rsquo;re building something special. These are the values that guide how we work.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {values.map((v) => (
              <div
                key={v.title}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "28px",
                  border: "1px solid #EAECEF",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{v.icon}</div>
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#0F1724",
                    margin: "0 0 8px",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  className="font-body"
                  style={{
                    fontSize: "14px",
                    color: "#4A556B",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PERKS & BENEFITS                                             */}
      {/* ============================================================ */}
      <section style={{ padding: "72px 0" }}>
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="text-center" style={{ marginBottom: "48px" }}>
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
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 800,
                color: "#0F1724",
                lineHeight: 1.1,
              }}
            >
              Perks &amp; Benefits
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {perks.map((p) => (
              <div
                key={p.title}
                style={{
                  textAlign: "center",
                  padding: "28px 20px",
                  borderRadius: "16px",
                  border: "1px solid #EAECEF",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>{p.icon}</div>
                <p
                  className="font-heading"
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0F1724",
                    margin: "0 0 4px",
                  }}
                >
                  {p.title}
                </p>
                <p
                  className="font-body"
                  style={{ fontSize: "13px", color: "#8492A8", margin: 0 }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA BANNER                                                   */}
      {/* ============================================================ */}
      <section
        style={{
          background: "linear-gradient(135deg, #008C7C 0%, #006058 100%)",
          padding: "72px 0",
        }}
      >
        <div className="mx-auto max-w-[700px] px-6 text-center">
          <h2
            className="font-heading text-white"
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            Don&rsquo;t see the right role?
          </h2>
          <p
            className="font-body"
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.8)",
              marginTop: "12px",
              lineHeight: 1.6,
              maxWidth: "480px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            We&rsquo;re always looking for talented people. Send us your CV and tell us why you want
            to join iAutoMotive.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "28px",
            }}
          >
            <a
              href="mailto:careers@iautomotive.co.uk"
              className="font-body"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 36px",
                borderRadius: "100px",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                backgroundColor: "#FFFFFF",
                color: "#008C7C",
                textDecoration: "none",
              }}
            >
              Send your CV
            </a>
            <Link
              href="/contact"
              className="font-body"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 36px",
                borderRadius: "100px",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                backgroundColor: "transparent",
                color: "#FFFFFF",
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.5)",
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
