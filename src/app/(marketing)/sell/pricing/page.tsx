"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const comparisonRows = [
  {
    feature: "Sale price achieved",
    iautosale: "Full retail price",
    tradeIn: "Wholesale price",
    privateSale: "Retail (if lucky)",
  },
  {
    feature: "Average seller uplift",
    iautosale: "+18% vs trade-in",
    tradeIn: "Baseline",
    privateSale: "+10\u201320% (variable)",
  },
  {
    feature: "Effort required",
    iautosale: "Hand over keys",
    tradeIn: "Drive to dealer",
    privateSale: "Ads, calls, viewings, negotiation",
  },
  {
    feature: "Time to sale",
    iautosale: "14 days average",
    tradeIn: "Same day",
    privateSale: "Weeks to months",
  },
  {
    feature: "Vehicle preparation",
    iautosale: "Professional valet & photography",
    tradeIn: "None",
    privateSale: "DIY",
  },
  {
    feature: "82-point RAC inspection",
    iautosale: "Included",
    tradeIn: "No",
    privateSale: "No",
  },
  {
    feature: "Nationwide advertising",
    iautosale: "Included",
    tradeIn: "N/A",
    privateSale: "Self-funded",
  },
  {
    feature: "Test drives & enquiries",
    iautosale: "We handle everything",
    tradeIn: "N/A",
    privateSale: "You handle everything",
  },
  {
    feature: "Paperwork & payment",
    iautosale: "We handle everything",
    tradeIn: "Dealer handles",
    privateSale: "You handle everything",
  },
  {
    feature: "Buyer protection",
    iautosale: "7-day money-back guarantee",
    tradeIn: "Limited",
    privateSale: "None",
  },
  {
    feature: "Safety risk",
    iautosale: "None — no strangers at your door",
    tradeIn: "None",
    privateSale: "Strangers visiting your home",
  },
];

const includedServices = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="12" width="24" height="12" rx="2" />
        <circle cx="10" cy="24" r="3" />
        <circle cx="22" cy="24" r="3" />
        <path d="M10 12v-3h8l4 3" />
      </svg>
    ),
    title: "Free collection",
    desc: "From any address in England & Wales",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="12" />
        <path d="M12 16l3 3 5-5" />
      </svg>
    ),
    title: "82-point RAC inspection",
    desc: "Comprehensive mechanical & cosmetic check",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="24" height="18" rx="3" />
        <circle cx="16" cy="17" r="5" />
        <path d="M12 8l2-3h4l2 3" />
      </svg>
    ),
    title: "Professional photography",
    desc: "Studio-quality images for maximum appeal",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h24v18H4z" />
        <path d="M4 14h24" />
        <path d="M10 20h4" />
      </svg>
    ),
    title: "Full valet & preparation",
    desc: "Interior deep clean, exterior polish, wheels & tyres",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="20" height="24" rx="2" />
        <path d="M12 10h8" />
        <path d="M12 14h8" />
        <path d="M12 18h5" />
      </svg>
    ),
    title: "Nationwide advertising",
    desc: "Listed on iAutoSale, Auto Trader, eBay Motors & more",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4l3 6h7l-5 4 2 7-7-4-7 4 2-7-5-4h7z" />
      </svg>
    ),
    title: "Enquiries & test drives",
    desc: "We handle all buyer communication & viewings",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="24" height="20" rx="3" />
        <path d="M4 6l12 10L28 6" />
      </svg>
    ),
    title: "Paperwork & transfers",
    desc: "V5C, finance settlement, DVLA notification — all handled",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="10" width="24" height="16" rx="3" />
        <circle cx="16" cy="18" r="4" />
        <path d="M16 15v1.5" />
        <path d="M16 19.5v1" />
        <path d="M14.5 16.5h3a1.5 1.5 0 010 3h-3" />
      </svg>
    ),
    title: "Secure payment",
    desc: "Funds in your account within 24 hours of sale",
  },
];

const faqs = [
  {
    q: "Is there a commission fee?",
    a: "No. We do not charge a percentage-based commission fee. You keep the full sale proceeds minus any pre-agreed costs such as reconditioning or transport. Payment is made to your bank account within 24 hours of sale completion.",
  },
  {
    q: "Are there any upfront costs?",
    a: "None at all. Collection, inspection, photography, advertising, and storage are all included. There are no hidden fees.",
  },
  {
    q: "What if I change my mind?",
    a: "You can withdraw your vehicle at any time before a sale is agreed. There\u2019s no cancellation fee or penalty. We\u2019ll arrange free return delivery to your address.",
  },
  {
    q: "What costs are deducted from the sale price?",
    a: "Only pre-agreed costs such as reconditioning work or transport are deducted. These are always discussed and approved by you in advance. There is no commission or platform fee.",
  },
  {
    q: "What if my car needs work before listing?",
    a: "Minor cosmetic work (touch-ups, dent removal, alloy refurbishment) can be arranged at cost. We\u2019ll always discuss this with you before proceeding, and any costs are deducted from the sale proceeds \u2014 never charged upfront.",
  },
];

/* ------------------------------------------------------------------ */
/*  Calculator helper                                                  */
/* ------------------------------------------------------------------ */

function calcNet(salePrice: number) {
  const fee = 0;
  const net = salePrice - fee;
  return { fee, net: Math.max(net, 0) };
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [salePrice, setSalePrice] = useState(15000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { fee, net } = calcNet(salePrice);

  // Trade-in estimate (18% less)
  const tradeIn = Math.round(salePrice / 1.18);
  const uplift = salePrice - fee - tradeIn;

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16534C 50%, #008C7C 100%)",
        }}
        className="relative overflow-hidden"
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-10"
          style={{ background: "radial-gradient(circle, #4DD9C7 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 opacity-10"
          style={{ background: "radial-gradient(circle, #F5A623 0%, transparent 70%)" }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: "#4DD9C7" }}
          >
            Simple, transparent pricing
          </p>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
            style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
          >
            No commission fee.
            <br />
            <span style={{ color: "#4DD9C7" }}>Keep what your car is worth.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            No upfront costs, no hidden fees, no commission. Sell your car at
            full retail price and keep the proceeds.
          </p>
        </div>
      </section>

      {/* ── Fee explainer cards ─────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Fee card */}
            <div className="rounded-2xl border-2 border-[#008C7C] p-8 text-center relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ background: "#008C7C" }}
              />
              <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Commission fee
              </p>
              <p
                className="text-5xl md:text-6xl font-extrabold mb-2"
                style={{
                  color: "#008C7C",
                  fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                £0
              </p>
              <p className="text-gray-500 text-sm">No percentage-based fee</p>
              <p className="text-gray-400 text-xs mt-2">Fee-free selling</p>
            </div>

            {/* Upfront card */}
            <div className="rounded-2xl border border-gray-100 p-8 text-center bg-gray-50">
              <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Upfront cost
              </p>
              <p
                className="text-5xl md:text-6xl font-extrabold mb-2"
                style={{
                  color: "#1A1A2E",
                  fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                £0
              </p>
              <p className="text-gray-500 text-sm">Nothing to pay until sold</p>
            </div>

            {/* Hidden fees card */}
            <div className="rounded-2xl border border-gray-100 p-8 text-center bg-gray-50">
              <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Hidden fees
              </p>
              <p
                className="text-5xl md:text-6xl font-extrabold mb-2"
                style={{
                  color: "#1A1A2E",
                  fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                Zero
              </p>
              <p className="text-gray-500 text-sm">What you see is what you pay</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive calculator ──────────────────────────────── */}
      <section style={{ background: "#F8FAFB" }} className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div
              className="w-12 h-1 rounded-full mx-auto mb-6"
              style={{ background: "#F5A623" }}
            />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
            >
              See what you&rsquo;d keep
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Drag the slider to see your estimated proceeds. No commission deducted.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 md:p-12">
            {/* Slider */}
            <div className="mb-10">
              <label className="flex justify-between items-baseline mb-3">
                <span className="text-sm font-semibold text-gray-500">Expected sale price</span>
                <span
                  className="text-2xl font-extrabold"
                  style={{
                    color: "#008C7C",
                    fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  {fmt(salePrice)}
                </span>
              </label>
              <input
                type="range"
                min={2000}
                max={100000}
                step={500}
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #008C7C ${((salePrice - 2000) / (100000 - 2000)) * 100}%, #E2E8F0 ${((salePrice - 2000) / (100000 - 2000)) * 100}%)`,
                  accentColor: "#008C7C",
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>£2,000</span>
                <span>£100,000</span>
              </div>
            </div>

            {/* Results grid */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Our fee
                </p>
                <p
                  className="text-2xl font-extrabold"
                  style={{
                    color: "#E63946",
                    fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  {fmt(fee)}
                </p>
              </div>
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: "#E0F5F1" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#006058" }}>
                  You keep
                </p>
                <p
                  className="text-2xl font-extrabold"
                  style={{
                    color: "#008C7C",
                    fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  {fmt(net)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  vs trade-in est.
                </p>
                <p
                  className="text-2xl font-extrabold"
                  style={{
                    color: uplift > 0 ? "#008C7C" : "#E63946",
                    fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  {uplift > 0 ? "+" : ""}{fmt(uplift)} more
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
              Trade-in estimate assumes 18% below retail price. Actual results
              vary. No commission fee applies.
            </p>
          </div>
        </div>
      </section>

      {/* ── What's included ─────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="w-12 h-1 rounded-full mx-auto mb-6"
              style={{ background: "#F5A623" }}
            />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
            >
              Everything&rsquo;s included
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Our fee-free consignment service covers everything end-to-end.
              There are no add-ons or extras.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {includedServices.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "#E0F5F1" }}
                >
                  {s.icon}
                </div>
                <h3
                  className="font-bold text-gray-900 mb-1 text-sm"
                  style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
                >
                  {s.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ────────────────────────────────────── */}
      <section style={{ background: "#F8FAFB" }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="w-12 h-1 rounded-full mx-auto mb-6"
              style={{ background: "#F5A623" }}
            />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
            >
              How we compare
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              iAutoSale vs dealer trade-in vs selling privately.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#F8FAFB" }}>
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider w-1/4">
                      Feature
                    </th>
                    <th className="text-left px-6 py-4 font-bold text-xs uppercase tracking-wider" style={{ color: "#008C7C" }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ background: "#008C7C" }}
                        />
                        iAutoSale
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Dealer trade-in
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Private sale
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-50"
                      style={{ background: i % 2 === 0 ? "#FFFFFF" : "#FAFBFC" }}
                    >
                      <td className="px-6 py-4 font-medium text-gray-700">{row.feature}</td>
                      <td className="px-6 py-4 font-semibold" style={{ color: "#008C7C" }}>
                        {row.iautosale}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{row.tradeIn}</td>
                      <td className="px-6 py-4 text-gray-500">{row.privateSale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="w-12 h-1 rounded-full mx-auto mb-6"
              style={{ background: "#F5A623" }}
            />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
            >
              Pricing FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border transition-all"
                  style={{
                    borderColor: isOpen ? "#008C7C" : "#F1F5F9",
                    background: isOpen ? "#F0FAF8" : "#FFFFFF",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span
                      className="font-semibold text-gray-900 pr-4"
                      style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                      {item.q}
                    </span>
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all text-lg font-bold"
                      style={{
                        background: isOpen ? "#008C7C" : "#E0F5F1",
                        color: isOpen ? "#FFFFFF" : "#008C7C",
                      }}
                    >
                      {isOpen ? "\u2212" : "+"}
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isOpen ? "300px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <p className="px-6 pb-5 text-gray-600 leading-relaxed text-sm">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────── */}
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
            Ready to get more for your car?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Get a free, no-obligation valuation in under 60 seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all"
              style={{ background: "#FFFFFF", color: "#008C7C" }}
            >
              Get your free valuation
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all border-2"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "#FFFFFF" }}
            >
              More questions?
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
