"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface PressItem {
  date: string;
  outlet: string;
  title: string;
  excerpt: string;
  url: string;
  logo: React.ReactNode;
}

const pressReleases: {
  date: string;
  title: string;
  excerpt: string;
  tag: string;
}[] = [
  {
    date: "20 Mar 2026",
    title: "iAutoSale Launches Nationwide Collection Service Across England & Wales",
    excerpt:
      "Sellers can now have their vehicles collected from any address in England and Wales at no extra cost, expanding our reach to over 50 million potential customers.",
    tag: "Expansion",
  },
  {
    date: "4 Mar 2026",
    title: "iAutoSale Reaches 1,000 Vehicles Sold Milestone",
    excerpt:
      "Just nine months after launch, iAutoSale has facilitated the sale of over 1,000 consignment vehicles, with an average selling price 18% above traditional trade-in values.",
    tag: "Milestone",
  },
  {
    date: "12 Feb 2026",
    title: "iAutoSale Partners with RAC for 82-Point Vehicle Inspections",
    excerpt:
      "Every vehicle listed on iAutoSale will now receive a comprehensive RAC-approved 82-point mechanical and cosmetic inspection, giving buyers complete confidence.",
    tag: "Partnership",
  },
  {
    date: "28 Jan 2026",
    title: "iAutoSale Secures FCA Authorisation for Finance Introductions",
    excerpt:
      "iAutoSale is now authorised and regulated by the Financial Conduct Authority to introduce customers to a panel of FCA-regulated finance providers.",
    tag: "Regulatory",
  },
  {
    date: "9 Jan 2026",
    title: "iAutoSale Raises \u00a34.5M Seed Round Led by Octopus Ventures",
    excerpt:
      "Funding will accelerate platform development, expand the vehicle operations team, and open two new preparation centres in the Midlands and North West.",
    tag: "Funding",
  },
  {
    date: "15 Nov 2025",
    title: "iAutoSale Appoints Former Auto Trader VP as Chief Commercial Officer",
    excerpt:
      "Sarah Mitchell brings over 15 years of automotive marketplace experience to lead commercial strategy, dealer partnerships, and revenue growth.",
    tag: "Leadership",
  },
  {
    date: "2 Oct 2025",
    title: "iAutoSale Beta Launches in Greater London",
    excerpt:
      "The UK\u2019s first dedicated vehicle consignment platform opens to sellers and buyers in the Greater London area, offering a transparent alternative to part-exchange.",
    tag: "Launch",
  },
  {
    date: "18 Aug 2025",
    title: "iAutoSale Announces Advisory Board with Industry Veterans",
    excerpt:
      "Four automotive and fintech leaders join iAutoSale\u2019s advisory board to guide the company through its growth phase and national expansion.",
    tag: "Leadership",
  },
];

const mediaCoverage: PressItem[] = [
  {
    date: "18 Mar 2026",
    outlet: "The Times",
    title: "The startup promising car sellers thousands more",
    excerpt:
      "iAutoSale\u2019s consignment model is disrupting the traditional dealer trade-in, delivering an average of 18% more for sellers.",
    url: "#",
    logo: (
      <svg width="100" height="28" viewBox="0 0 100 28" fill="none">
        <text x="0" y="22" fontFamily="Georgia, serif" fontSize="22" fontWeight="700" fill="#1A1A2E">
          The Times
        </text>
      </svg>
    ),
  },
  {
    date: "5 Mar 2026",
    outlet: "Auto Express",
    title: "iAutoSale review: Is consignment the future of car selling?",
    excerpt:
      "We tested the full iAutoSale experience from listing to sale \u2014 here\u2019s how it compares to selling privately or trading in.",
    url: "#",
    logo: (
      <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
        <text x="0" y="22" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#E63946">
          Auto Express
        </text>
      </svg>
    ),
  },
  {
    date: "14 Feb 2026",
    outlet: "TechCrunch",
    title: "iAutoSale wants to be the Carvana of the UK \u2014 but with your car",
    excerpt:
      "The London-based startup is betting that British car owners would rather consign than trade in, and the numbers are starting to prove them right.",
    url: "#",
    logo: (
      <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
        <text x="0" y="22" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#0A9B4A">
          TechCrunch
        </text>
      </svg>
    ),
  },
  {
    date: "30 Jan 2026",
    outlet: "Financial Times",
    title: "UK car consignment platform secures FCA approval",
    excerpt:
      "iAutoSale becomes one of the first vehicle consignment platforms in the UK to receive full FCA authorisation for finance introductions.",
    url: "#",
    logo: (
      <svg width="130" height="28" viewBox="0 0 130 28" fill="none">
        <text x="0" y="22" fontFamily="Georgia, serif" fontSize="18" fontWeight="700" fill="#FCD0B4" stroke="#333" strokeWidth="0.5">
          Financial Times
        </text>
      </svg>
    ),
  },
  {
    date: "10 Jan 2026",
    outlet: "Sifted",
    title: "iAutoSale closes \u00a34.5M to shake up UK used car market",
    excerpt:
      "The Octopus Ventures-backed startup plans to use the funding to expand beyond London and open new vehicle preparation centres.",
    url: "#",
    logo: (
      <svg width="70" height="28" viewBox="0 0 70 28" fill="none">
        <text x="0" y="22" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="#6C63FF">
          Sifted
        </text>
      </svg>
    ),
  },
  {
    date: "22 Nov 2025",
    outlet: "Car Dealer Magazine",
    title: "Could consignment disrupt the UK dealer model?",
    excerpt:
      "iAutoSale\u2019s launch has dealers watching closely as the platform offers sellers retail prices without the hassle of private sales.",
    url: "#",
    logo: (
      <svg width="140" height="28" viewBox="0 0 140 28" fill="none">
        <text x="0" y="22" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700" fill="#1A1A2E">
          Car Dealer Mag
        </text>
      </svg>
    ),
  },
];

const companyFacts = [
  { label: "Founded", value: "2025" },
  { label: "Headquarters", value: "London, UK" },
  { label: "Vehicles sold", value: "1,000+" },
  { label: "Avg. seller uplift", value: "+18%" },
  { label: "Team size", value: "45+" },
  { label: "Funding raised", value: "\u00a34.5M" },
];

const brandAssets = [
  {
    title: "Primary logo",
    desc: "Full colour logo on white or light backgrounds",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="10" width="36" height="28" rx="4" />
        <path d="M6 18h36" />
        <circle cx="16" cy="30" r="4" />
        <path d="M24 26h12" />
        <path d="M24 32h8" />
      </svg>
    ),
  },
  {
    title: "Brand guidelines",
    desc: "Colour palette, typography, and usage rules",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6h24v36H12z" />
        <path d="M18 14h12" />
        <path d="M18 20h12" />
        <path d="M18 26h8" />
        <circle cx="32" cy="36" r="6" fill="#008C7C" stroke="none" opacity="0.15" />
        <path d="M30 36l2 2 4-4" stroke="#008C7C" />
      </svg>
    ),
  },
  {
    title: "Photography",
    desc: "High-resolution product and team photography",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="12" width="40" height="28" rx="4" />
        <circle cx="24" cy="26" r="8" />
        <circle cx="24" cy="26" r="3" />
        <path d="M16 12l2-4h12l2 4" />
      </svg>
    ),
  },
  {
    title: "Fact sheet",
    desc: "Company overview, key stats, and milestones",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 6h20l8 8v28a2 2 0 01-2 2H10a2 2 0 01-2-2V8a2 2 0 012-2z" />
        <path d="M30 6v8h8" />
        <path d="M16 22h16" />
        <path d="M16 28h16" />
        <path d="M16 34h10" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Tag colours                                                        */
/* ------------------------------------------------------------------ */

const tagColours: Record<string, { bg: string; text: string }> = {
  Expansion: { bg: "#E0F5F1", text: "#006058" },
  Milestone: { bg: "#FFF3CD", text: "#856404" },
  Partnership: { bg: "#D4EDFC", text: "#0C5FA5" },
  Regulatory: { bg: "#EDE0F5", text: "#5B21B6" },
  Funding: { bg: "#D1FAE5", text: "#065F46" },
  Leadership: { bg: "#FEE2E2", text: "#991B1B" },
  Launch: { bg: "#E0F5F1", text: "#008C7C" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Tab = "releases" | "coverage";

export default function PressPage() {
  const [activeTab, setActiveTab] = useState<Tab>("releases");

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16534C 50%, #008C7C 100%)",
        }}
        className="relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-10"
          style={{
            background: "radial-gradient(circle, #4DD9C7 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 opacity-10"
          style={{
            background: "radial-gradient(circle, #F5A623 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: "#4DD9C7" }}
          >
            Newsroom
          </p>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
            style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Press &amp; Media
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            The latest news, announcements, and media coverage from
            iAutoSale — the UK&rsquo;s first dedicated vehicle consignment
            platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:press@iautosale.co.uk"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-base transition-all"
              style={{
                background: "#008C7C",
                color: "#FFFFFF",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="14" height="10" rx="2" />
                <path d="M2 4l7 5 7-5" />
              </svg>
              Media enquiries
            </a>
            <a
              href="#press-kit"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-base transition-all border-2"
              style={{
                borderColor: "rgba(255,255,255,0.4)",
                color: "#FFFFFF",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 15V3h8l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                <path d="M11 3v4h4" />
                <path d="M7 10l2 2 3-3" />
              </svg>
              Press kit
            </a>
          </div>
        </div>
      </section>

      {/* ── Company facts bar ───────────────────────────────────── */}
      <section className="border-b" style={{ background: "#F8FAFB" }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-center">
            {companyFacts.map((f) => (
              <div key={f.label}>
                <p
                  className="text-2xl md:text-3xl font-extrabold"
                  style={{
                    color: "#008C7C",
                    fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  {f.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab navigation ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-16">
        <div className="flex gap-2 mb-10">
          {(["releases", "coverage"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-3 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: isActive ? "#008C7C" : "#F1F5F9",
                  color: isActive ? "#FFFFFF" : "#64748B",
                }}
              >
                {tab === "releases" ? "Press releases" : "Media coverage"}
              </button>
            );
          })}
        </div>

        {/* ── Press releases ─────────────────────────────────────── */}
        {activeTab === "releases" && (
          <div className="space-y-6 pb-20">
            {pressReleases.map((pr, i) => {
              const tag = tagColours[pr.tag] ?? { bg: "#F1F5F9", text: "#334155" };
              return (
                <article
                  key={i}
                  className="group rounded-2xl border border-gray-100 p-6 md:p-8 transition-all hover:shadow-lg hover:border-gray-200"
                  style={{ background: "#FFFFFF" }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <time className="text-sm text-gray-400 font-medium">{pr.date}</time>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: tag.bg, color: tag.text }}
                    >
                      {pr.tag}
                    </span>
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#008C7C] transition-colors"
                    style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
                  >
                    {pr.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{pr.excerpt}</p>
                  <button
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                    style={{ color: "#008C7C" }}
                  >
                    Read full release
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* ── Media coverage ─────────────────────────────────────── */}
        {activeTab === "coverage" && (
          <div className="space-y-6 pb-20">
            {mediaCoverage.map((item, i) => (
              <article
                key={i}
                className="group rounded-2xl border border-gray-100 p-6 md:p-8 transition-all hover:shadow-lg hover:border-gray-200 flex flex-col md:flex-row gap-6"
                style={{ background: "#FFFFFF" }}
              >
                {/* Outlet logo */}
                <div className="flex-shrink-0 flex items-start justify-center md:justify-start md:w-40">
                  <div className="h-12 flex items-center">{item.logo}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <time className="text-sm text-gray-400 font-medium">{item.date}</time>
                    <span className="text-sm text-gray-500">&middot;</span>
                    <span className="text-sm font-semibold text-gray-500">{item.outlet}</span>
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#008C7C] transition-colors"
                    style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.excerpt}</p>
                  <span
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                    style={{ color: "#008C7C" }}
                  >
                    Read article
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 3l5 5-5 5" />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Press Kit ───────────────────────────────────────────── */}
      <section id="press-kit" style={{ background: "#F8FAFB" }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div
              className="w-12 h-1 rounded-full mx-auto mb-6"
              style={{ background: "#F5A623" }}
            />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
            >
              Press kit
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Download brand assets, logos, photography, and company information
              for editorial use.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandAssets.map((asset) => (
              <div
                key={asset.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 text-center transition-all hover:shadow-lg hover:border-gray-200 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "#E0F5F1" }}
                >
                  {asset.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{asset.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{asset.desc}</p>
                <span
                  className="inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: "#008C7C" }}
                >
                  Download
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 2v8" />
                    <path d="M3 7l4 4 4-4" />
                    <path d="M2 12h10" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About iAutoSale ───────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div
              className="w-12 h-1 rounded-full mx-auto mb-6"
              style={{ background: "#F5A623" }}
            />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
            >
              About iAutoSale
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 md:p-12 max-w-3xl mx-auto">
            <p className="text-gray-600 leading-relaxed mb-6">
              iAutoSale is the UK&rsquo;s first dedicated vehicle consignment
              platform. We sell cars on behalf of private owners at full retail
              price — handling collection, inspection, photography, advertising,
              test drives, paperwork, and payment — so sellers get thousands
              more than a dealer trade-in, and buyers get transparent pricing
              with full vehicle history.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Founded in 2025 and headquartered in London, iAutoSale is
              authorised and regulated by the Financial Conduct Authority for
              finance introductions. The company is backed by Octopus Ventures
              and a group of angel investors with deep automotive and fintech
              expertise.
            </p>
            <p className="text-gray-600 leading-relaxed">
              For more information visit{" "}
              <Link href="/" className="font-semibold" style={{ color: "#008C7C" }}>
                iautosale.co.uk
              </Link>{" "}
              or contact{" "}
              <a
                href="mailto:press@iautosale.co.uk"
                className="font-semibold"
                style={{ color: "#008C7C" }}
              >
                press@iautosale.co.uk
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── Media contact CTA ───────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #006058 0%, #008C7C 50%, #4DD9C7 100%)",
        }}
        className="py-20"
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white mb-4"
            style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Media enquiries
          </h2>
          <p className="text-lg text-white/80 mb-8">
            For press enquiries, interview requests, or high-resolution imagery
            please get in touch with our communications team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:press@iautosale.co.uk"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all"
              style={{ background: "#FFFFFF", color: "#008C7C" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="14" height="10" rx="2" />
                <path d="M2 4l7 5 7-5" />
              </svg>
              press@iautosale.co.uk
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all border-2"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "#FFFFFF" }}
            >
              Contact page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
