"use client";

import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "1,000+", label: "Vehicles sold" },
  { value: "+18%", label: "More than trade-in" },
  { value: "4.9\u2605", label: "Seller rating" },
  { value: "14 days", label: "Avg. time to sale" },
];

const timeline = [
  {
    date: "Aug 2025",
    title: "The idea",
    desc: "After watching friends lose thousands on dealer trade-ins, our founders set out to build a better way to sell a car in the UK.",
  },
  {
    date: "Oct 2025",
    title: "Beta launch in London",
    desc: "iAutoMotive opens to the first sellers and buyers in Greater London, proving the consignment model works for private owners.",
  },
  {
    date: "Jan 2026",
    title: "\u00a34.5M seed round",
    desc: "Octopus Ventures leads our seed funding to accelerate platform development and expand our vehicle operations team.",
  },
  {
    date: "Jan 2026",
    title: "FCA authorisation",
    desc: "iAutoMotive receives Financial Conduct Authority authorisation for finance introductions, a first for a UK consignment platform.",
  },
  {
    date: "Feb 2026",
    title: "RAC partnership",
    desc: "Every vehicle now receives a comprehensive RAC-approved 82-point inspection before listing.",
  },
  {
    date: "Mar 2026",
    title: "Nationwide expansion",
    desc: "Free vehicle collection launches across England and Wales, opening iAutoMotive to over 50 million potential customers.",
  },
];

const values = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="20" r="16" />
        <path d="M20 12v8l5 3" />
      </svg>
    ),
    title: "Transparency first",
    desc: "No hidden fees, no surprise deductions. Every seller and buyer sees the full picture before committing.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6l4 8h8l-6 5 2 9-8-5-8 5 2-9-6-5h8z" />
      </svg>
    ),
    title: "Obsess over the customer",
    desc: "We measure success by one metric: did the customer feel like they got the best possible outcome?",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="16" width="28" height="16" rx="3" />
        <circle cx="14" cy="32" r="3" />
        <circle cx="26" cy="32" r="3" />
        <path d="M12 16v-4h10l4 4" />
      </svg>
    ),
    title: "Respect every vehicle",
    desc: "Whether it\u2019s a five-year-old hatchback or a brand-new SUV, every car gets the same care, preparation, and presentation.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 32V14" />
        <path d="M16 32V8" />
        <path d="M24 32V20" />
        <path d="M32 32V12" />
      </svg>
    ),
    title: "Build for the long run",
    desc: "We\u2019re creating a category-defining platform, not chasing short-term wins. Sustainable growth over hype.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="14" r="6" />
        <path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" />
        <circle cx="32" cy="14" r="4" />
        <path d="M36 26c0-3 -1.8-5.5-4-6.5" />
      </svg>
    ),
    title: "Win as a team",
    desc: "Great things happen when smart people collaborate. We hire the best and trust them to make great decisions.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6v28" />
        <path d="M6 20h28" />
        <circle cx="20" cy="20" r="14" />
      </svg>
    ),
    title: "Regulated & responsible",
    desc: "FCA authorised, GDPR compliant, and committed to treating every customer fairly under UK consumer law.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "You list, we collect",
    desc: "Tell us about your car and we\u2019ll come to collect it from anywhere in England & Wales \u2014 completely free.",
    gradient: "linear-gradient(135deg, #006058 0%, #008C7C 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="18" width="36" height="16" rx="3" />
        <circle cx="14" cy="34" r="4" />
        <circle cx="34" cy="34" r="4" />
        <path d="M14 18v-4h12l6 4" />
        <path d="M42 24h-4" />
      </svg>
    ),
  },
  {
    step: "2",
    title: "We prepare & photograph",
    desc: "Your car gets an 82-point RAC inspection, a professional valet, and studio-quality photography.",
    gradient: "linear-gradient(135deg, #008C7C 0%, #4DD9C7 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="14" width="36" height="24" rx="4" />
        <circle cx="24" cy="26" r="7" />
        <circle cx="24" cy="26" r="3" />
        <path d="M18 14l2-4h8l2 4" />
      </svg>
    ),
  },
  {
    step: "3",
    title: "We sell at retail price",
    desc: "Your car is listed on our platform and all major marketplaces. We handle enquiries, test drives, and negotiation.",
    gradient: "linear-gradient(135deg, #F5A623 0%, #E09100 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="6" width="36" height="36" rx="4" />
        <path d="M6 18h36" />
        <path d="M18 6v36" />
        <path d="M24 28l3 3 5-5" />
      </svg>
    ),
  },
  {
    step: "4",
    title: "You get paid",
    desc: "Once the buyer\u2019s payment clears, your money hits your account within 24 hours. No deductions, no surprises.",
    gradient: "linear-gradient(135deg, #1A1A2E 0%, #4A556B 100%)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="12" width="40" height="24" rx="4" />
        <circle cx="24" cy="24" r="6" />
        <path d="M24 20v2" />
        <path d="M24 26v2" />
        <path d="M22 22h4a2 2 0 010 4h-4" />
      </svg>
    ),
  },
];

const team = [
  {
    name: "James Harrington",
    role: "Co-founder & CEO",
    bio: "Former McKinsey consultant and car enthusiast. Previously led digital transformation at a major UK dealer group.",
    initials: "JH",
    colour: "#008C7C",
  },
  {
    name: "Priya Sharma",
    role: "Co-founder & CTO",
    bio: "Ex-senior engineer at Auto Trader. Built scalable marketplace platforms serving millions of monthly users.",
    initials: "PS",
    colour: "#006058",
  },
  {
    name: "Sarah Mitchell",
    role: "Chief Commercial Officer",
    bio: "15 years in the UK automotive marketplace. Expert in marketplace growth and dealer partnerships.",
    initials: "SM",
    colour: "#F5A623",
  },
  {
    name: "David Chen",
    role: "VP of Engineering",
    bio: "Previously staff engineer at Monzo. Passionate about building reliable, user-friendly financial systems.",
    initials: "DC",
    colour: "#4A556B",
  },
  {
    name: "Emma Walters",
    role: "Head of Vehicle Operations",
    bio: "10 years in automotive logistics. Managed vehicle preparation for one of the UK\u2019s largest used car supermarkets.",
    initials: "EW",
    colour: "#4DD9C7",
  },
  {
    name: "Tom Bradley",
    role: "Head of Customer Experience",
    bio: "Former CX lead at Octopus Energy. Believes great service is the best marketing a company can have.",
    initials: "TB",
    colour: "#E63946",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
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
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10"
          style={{ background: "radial-gradient(circle, #4DD9C7 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-80 h-80 opacity-10"
          style={{ background: "radial-gradient(circle, #F5A623 0%, transparent 70%)" }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 text-center">
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: "#4DD9C7" }}
          >
            About iAutoMotive
          </p>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
            style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
          >
            We believe you deserve
            <br />
            <span style={{ color: "#4DD9C7" }}>more for your car</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            iAutoMotive is the UK&rsquo;s first dedicated vehicle consignment
            platform. We sell your car at full retail price, handle everything,
            and put thousands more in your pocket.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-base transition-all"
              style={{ background: "#008C7C", color: "#FFFFFF" }}
            >
              Sell your car
            </Link>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-base transition-all border-2"
              style={{ borderColor: "rgba(255,255,255,0.4)", color: "#FFFFFF" }}
            >
              Browse cars
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────── */}
      <section className="border-b" style={{ background: "#F8FAFB" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p
                  className="text-3xl md:text-4xl font-extrabold"
                  style={{
                    color: "#008C7C",
                    fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem / Our Mission ───────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left — the problem */}
            <div>
              <div
                className="w-12 h-1 rounded-full mb-6"
                style={{ background: "#F5A623" }}
              />
              <h2
                className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6"
                style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
              >
                The problem we&rsquo;re solving
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every year, millions of UK car owners accept dealer trade-in
                offers that are thousands of pounds below what their car is
                actually worth. They know it&rsquo;s a bad deal, but the
                alternative &mdash; selling privately &mdash; means weeks of
                tyre-kickers, no-shows, and safety concerns.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We built iAutoMotive to give car owners a third option: sell at
                full retail price with none of the hassle. We collect your car,
                prepare it to showroom standard, advertise it everywhere, handle
                every enquiry and test drive, and put the money in your account
                when it sells.
              </p>
            </div>

            {/* Right — mission card */}
            <div
              className="rounded-2xl p-8 md:p-10"
              style={{ background: "linear-gradient(135deg, #006058 0%, #008C7C 100%)" }}
            >
              <p
                className="text-sm font-semibold tracking-[0.15em] uppercase mb-4"
                style={{ color: "#4DD9C7" }}
              >
                Our mission
              </p>
              <h3
                className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-snug"
                style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
              >
                To make selling a car as easy as selling on eBay &mdash; but with
                a better price and zero effort.
              </h3>
              <p className="text-white/80 leading-relaxed">
                We handle collection, inspection, photography, advertising,
                enquiries, test drives, paperwork, and payment. You just hand
                over the keys and wait for the money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
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
              How it works
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              From your driveway to sold &mdash; in four simple steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="rounded-2xl overflow-hidden border border-gray-100 bg-white transition-all hover:shadow-lg"
              >
                <div
                  className="h-36 flex items-center justify-center"
                  style={{ background: step.gradient }}
                >
                  {step.icon}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: "#008C7C" }}
                    >
                      {step.step}
                    </span>
                    <h3
                      className="font-bold text-gray-900"
                      style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our values ──────────────────────────────────────────── */}
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
              What we stand for
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              The principles that guide every decision we make.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-gray-100 bg-white p-7 transition-all hover:shadow-lg hover:border-gray-200"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "#E0F5F1" }}
                >
                  {v.icon}
                </div>
                <h3
                  className="text-lg font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
                >
                  {v.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our story / Timeline ────────────────────────────────── */}
      <section style={{ background: "#F8FAFB" }} className="py-20">
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
              Our story so far
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5"
              style={{ background: "#D1E9E6" }}
            />

            <div className="space-y-10">
              {timeline.map((t, i) => (
                <div key={i} className="relative flex gap-6 md:gap-8">
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4"
                      style={{
                        borderColor: "#E0F5F1",
                        background: i === timeline.length - 1 ? "#008C7C" : "#FFFFFF",
                      }}
                    >
                      <span
                        className="text-xs md:text-sm font-bold"
                        style={{ color: i === timeline.length - 1 ? "#FFFFFF" : "#008C7C" }}
                      >
                        {t.date.split(" ")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-1 md:pt-3">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "#008C7C" }}
                    >
                      {t.date}
                    </p>
                    <h3
                      className="text-lg font-bold text-gray-900 mb-1"
                      style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                      {t.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Leadership team ─────────────────────────────────────── */}
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
              Leadership team
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Automotive experts, marketplace builders, and customer obsessives.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((person) => (
              <div
                key={person.name}
                className="rounded-2xl border border-gray-100 bg-white p-7 text-center transition-all hover:shadow-lg hover:border-gray-200"
              >
                {/* Avatar placeholder */}
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: person.colour }}
                >
                  {person.initials}
                </div>
                <h3
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)" }}
                >
                  {person.name}
                </h3>
                <p
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#008C7C" }}
                >
                  {person.role}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Backed by ───────────────────────────────────────────── */}
      <section style={{ background: "#F8FAFB" }} className="py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-400 mb-8">
            Backed by
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {["Octopus Ventures", "Seedcamp", "Angel investors"].map((name) => (
              <div key={name} className="text-xl md:text-2xl font-bold text-gray-300">
                {name}
              </div>
            ))}
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
            Join thousands of sellers who got an average of 18% more than their
            dealer trade-in offer.
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
              href="/careers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all border-2"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "#FFFFFF" }}
            >
              We&rsquo;re hiring
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
