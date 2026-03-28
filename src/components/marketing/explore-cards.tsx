"use client";

import { useState } from "react";

const cards = [
  {
    title: "Cars under £20K",
    desc: "Quality cars at prices you'll love",
    bg: "#008C7C",
    textColor: "#FFFFFF",
    descColor: "rgba(255,255,255,0.8)",
    btnBg: "#FFFFFF",
    btnColor: "#006058",
  },
  {
    title: "Great deals",
    desc: "Below market price, verified by data",
    bg: "#0F1724",
    textColor: "#FFFFFF",
    descColor: "rgba(255,255,255,0.8)",
    btnBg: "#FFFFFF",
    btnColor: "#0F1724",
  },
  {
    title: "Free delivery",
    desc: "Get your car delivered to your door",
    bg: "#E0FAF5",
    textColor: "#006058",
    descColor: "#4A556B",
    btnBg: "#008C7C",
    btnColor: "#FFFFFF",
  },
  {
    title: "Electric & hybrid",
    desc: "The future of driving, available now",
    bg: "#F7F8F9",
    textColor: "#0F1724",
    descColor: "#4A556B",
    btnBg: "#008C7C",
    btnColor: "#FFFFFF",
  },
] as const;

function ExploreCard({
  card,
}: {
  card: (typeof cards)[number];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        padding: 24,
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: card.bg,
        cursor: "pointer",
        transition: "transform 200ms cubic-bezier(.25,.46,.45,.94), box-shadow 200ms cubic-bezier(.25,.46,.45,.94)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.18)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
    >
      <div>
        {/* Title */}
        <h3
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: card.textColor,
            margin: 0,
          }}
        >
          {card.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: card.descColor,
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {card.desc}
        </p>
      </div>

      {/* CTA button */}
      <button
        style={{
          alignSelf: "flex-start",
          marginTop: 24,
          backgroundColor: card.btnBg,
          color: card.btnColor,
          border: "none",
          borderRadius: 100,
          padding: "10px 20px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Explore
      </button>
    </div>
  );
}

export function ExploreCards() {
  return (
    <section
      style={{
        backgroundColor: "#FFFFFF",
        padding: "48px 0",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          paddingLeft: "clamp(24px, 4vw, 32px)",
          paddingRight: "clamp(24px, 4vw, 32px)",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#0F1724",
            margin: 0,
          }}
        >
          Explore cars you&apos;ll love
        </h2>

        {/* Card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            marginTop: 32,
          }}
          className="explore-grid"
        >
          {cards.map((card) => (
            <ExploreCard key={card.title} card={card} />
          ))}
        </div>
      </div>

      {/* Responsive breakpoints */}
      <style>{`
        @media (max-width: 1024px) {
          .explore-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .explore-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
