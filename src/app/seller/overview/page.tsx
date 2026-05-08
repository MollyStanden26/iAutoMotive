"use client";

import { useEffect, useState } from "react";
import {
  RECON_STAGES,
  formatSellerGBP,
} from "@/lib/seller/seller-mock-data";

const DOT_COLORS: Record<string, string> = {
  teal: "#008C7C",
  green: "#34D399",
  amber: "#F5A623",
};

/** DB stage → seller-facing 7-step display index. */
const STAGE_TO_DISPLAY_INDEX: Record<string, number> = {
  offer_accepted: 0,
  collected: 1,
  inspecting: 2,
  in_mechanical: 3,
  in_body_paint: 3,
  in_detail: 3,
  in_photography: 3,
  listing_ready: 3,
  live: 4,
  sale_agreed: 5,
  sold: 6,
  returned: 4,
  withdrawn: 4,
};

interface SellerData {
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim: string | null;
    registration: string;
    mileageAtIntake: number;
    exteriorColour: string | null;
    transmission: string;
    currentStage: string;
    listingPriceGbp: number | null;
  } | null;
  consignment: {
    status: string;
    platformFeeGbp: number;
    reconMechanicalGbp: number;
    reconDetailGbp: number;
    transportGbp: number;
    listedAt: string | null;
  } | null;
  photos: { url: string; isPrimary: boolean }[];
  activity: { views7d: number; saves: number; enquiries7d: number };
  lastPriceChangeAt: string | null;
  updates: { id: string; dotColor: "teal" | "green" | "amber"; text: string; timestamp: string }[];
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export default function SellerOverviewPage() {
  const [data, setData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/seller/me", { cache: "no-store" })
      .then(r => {
        if (r.status === 401 || r.status === 403) { setUnauthorized(true); return null; }
        return r.ok ? r.json() : null;
      })
      .then(d => { if (!cancelled && d) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8F9", padding: 24, fontFamily: "var(--font-body)", color: "#94A3B8" }}>
        Loading your portal…
      </div>
    );
  }
  if (unauthorized) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8F9", padding: 24, fontFamily: "var(--font-body)", color: "#1E293B" }}>
        Please sign in to your seller account to view this page.
      </div>
    );
  }
  if (!data?.vehicle || !data?.consignment) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8F9", padding: 24, fontFamily: "var(--font-body)", color: "#1E293B" }}>
        We don&apos;t have a vehicle linked to your account yet. Your sales rep will set this up shortly.
      </div>
    );
  }

  const { vehicle, consignment, photos } = data;
  const activeIndex = STAGE_TO_DISPLAY_INDEX[vehicle.currentStage] ?? 0;
  const listingPence = vehicle.listingPriceGbp ?? 0;
  const totalCostsPence = consignment.platformFeeGbp + consignment.reconMechanicalGbp + consignment.reconDetailGbp + consignment.transportGbp;
  const netPayoutGbp = Math.max(0, Math.round((listingPence - totalCostsPence) / 100));
  const listingPriceGbp = Math.round(listingPence / 100);
  const listedDays = daysSince(consignment.listedAt);
  const heroPhoto = photos.find(p => p.isPrimary)?.url ?? photos[0]?.url ?? null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F8F9",
        fontFamily: "var(--font-body)",
        padding: "24px 16px",
      }}
    >
      {/* ── 1. Vehicle Hero Strip ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 16,
        }}
      >
        {/* Photo placeholder */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            background: "#F7F8F9",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {heroPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                color: "#94A3B8",
                letterSpacing: "0.05em",
              }}
            >
              PHOTO
            </span>
          )}
        </div>

        {/* Middle info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: 19,
              color: "#1E293B",
              lineHeight: 1.25,
            }}
          >
            {vehicle.year} {vehicle.make} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ""}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 13,
              color: "#64748B",
              marginTop: 2,
            }}
          >
            {vehicle.registration} &middot;{" "}
            {vehicle.mileageAtIntake.toLocaleString("en-GB")} miles
            {vehicle.exteriorColour ? ` · ${vehicle.exteriorColour}` : ""}
            {vehicle.transmission ? ` · ${vehicle.transmission.replace("_", " ")}` : ""}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              background: "#E0FAF5",
              color: "#006058",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 100,
              padding: "4px 12px",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#008C7C",
                flexShrink: 0,
              }}
            />
            {consignment.status.replace(/_/g, " ")}
            {listedDays !== null ? ` · Listed ${listedDays} day${listedDays === 1 ? "" : "s"} ago` : ""}
          </div>
        </div>

        {/* Right payout */}
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 11,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            ESTIMATED PAYOUT
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 900,
              fontSize: 28,
              color: "#B87209",
              lineHeight: 1.1,
            }}
          >
            {formatSellerGBP(netPayoutGbp)}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 11,
              color: "#94A3B8",
              marginTop: 2,
            }}
          >
            Updates as price changes
          </div>
        </div>
      </div>

      {/* ── 2. Recon Stage Tracker ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 13,
            color: "#1E293B",
            marginBottom: 16,
          }}
        >
          Where your car is right now
        </div>

        <div style={{ display: "flex", alignItems: "start" }}>
          {RECON_STAGES.map((stage, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;

            const dotStyle: React.CSSProperties = {
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
              ...(isDone
                ? { background: "#008C7C", color: "#fff" }
                : isActive
                ? {
                    background: "#008C7C",
                    color: "#fff",
                    boxShadow: "0 0 0 4px #E0FAF5",
                  }
                : { background: "#E2E8F0", color: "#94A3B8" }),
            };

            const labelStyle: React.CSSProperties = {
              fontFamily: "var(--font-body)",
              fontWeight: isActive ? 700 : 600,
              fontSize: 11,
              marginTop: 6,
              textAlign: "center",
              maxWidth: 72,
              lineHeight: 1.3,
              color: isDone ? "#008C7C" : isActive ? "#1E293B" : "#94A3B8",
            };

            return (
              <div
                key={stage.key}
                style={{ display: "contents" }}
              >
                {/* Connector before (except first) */}
                {i > 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      marginTop: 14,
                      marginLeft: -4,
                      marginRight: -4,
                      background: i <= activeIndex ? "#008C7C" : "#E2E8F0",
                    }}
                  />
                )}

                {/* Step */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <div style={dotStyle}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div style={labelStyle}>{stage.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Stats Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Card 1 — Listing price */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 11,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current listing price
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: 22,
              color: "#008C7C",
              marginTop: 4,
            }}
          >
            {formatSellerGBP(listingPriceGbp)}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 12,
              color: "#94A3B8",
              marginTop: 4,
            }}
          >
            Market price{(() => {
              if (!data.lastPriceChangeAt) return null;
              const d = Math.max(0, Math.floor((Date.now() - new Date(data.lastPriceChangeAt).getTime()) / 86_400_000));
              return (
                <>
                  {" "}&middot;{" "}
                  <span style={{ color: "#B87209" }}>
                    Last reduced {d === 0 ? "today" : `${d} day${d === 1 ? "" : "s"} ago`}
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Card 2 — Buyer activity */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 11,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Buyer activity (7 days)
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: 22,
              color: "#1E293B",
              marginTop: 4,
            }}
          >
            {data.activity.views7d.toLocaleString("en-GB")} view{data.activity.views7d === 1 ? "" : "s"}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 12,
              color: "#94A3B8",
              marginTop: 4,
            }}
          >
            {data.activity.saves} save{data.activity.saves === 1 ? "" : "s"} &middot; {data.activity.enquiries7d} enquir{data.activity.enquiries7d === 1 ? "y" : "ies"}
          </div>
        </div>
      </div>

      {/* ── 4. Latest Updates ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          padding: 20,
          marginBottom: 16,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              color: "#1E293B",
            }}
          >
            Latest updates
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 11,
              color: "#94A3B8",
            }}
          >
            {data.updates[0]?.timestamp ?? "—"}
          </div>
        </div>

        {/* Update items */}
        {data.updates.length === 0 ? (
          <div style={{
            fontFamily: "var(--font-body)", fontSize: 13, color: "#94A3B8",
            padding: "16px 0",
          }}>
            We&apos;ll post updates here as your car moves through the process.
          </div>
        ) : data.updates.map((update, i) => (
          <div
            key={update.id}
            style={{
              display: "flex",
              alignItems: "start",
              gap: 10,
              paddingTop: 10,
              paddingBottom: 10,
              borderBottom:
                i < data.updates.length - 1
                  ? "1px solid #F7F8F9"
                  : "none",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                marginTop: 4,
                flexShrink: 0,
                background: DOT_COLORS[update.dotColor] || "#94A3B8",
              }}
            />
            <div
              style={{
                flex: 1,
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 13,
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              {update.text}
            </div>
            <div
              style={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 11,
                color: "#94A3B8",
              }}
            >
              {update.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
