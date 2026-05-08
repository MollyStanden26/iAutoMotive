"use client";

import { useEffect, useState } from "react";
import {
  MOCK_ESCROW_CONDITIONS,
  formatSellerGBP,
} from "@/lib/seller/seller-mock-data";

const PAYOUT_LABELS: Record<string, string> = {
  faster_payments: "Faster Payments (bank transfer)",
  bacs:            "BACS",
  chaps:           "CHAPS",
};

interface SellerData {
  vehicle: { listingPriceGbp: number | null } | null;
  consignment: {
    platformFeeGbp: number;
    reconMechanicalGbp: number;
    reconDetailGbp: number;
    transportGbp: number;
  } | null;
  seller: { payoutMethod: string | null };
}

export default function SellerFinancialsPage() {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(true);
  const [data, setData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/seller/me", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled && d) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div style={{ padding: 24, fontFamily: "var(--font-body)", color: "#94A3B8" }}>Loading…</div>;
  }

  // All values from API are in pence; the display helper formatSellerGBP
  // expects pounds, so we divide by 100 at every boundary.
  const listingPence = data?.vehicle?.listingPriceGbp ?? 0;
  const c = data?.consignment ?? { platformFeeGbp: 0, reconMechanicalGbp: 0, reconDetailGbp: 0, transportGbp: 0 };
  const listingGbp   = Math.round(listingPence / 100);
  const platformGbp  = Math.round(c.platformFeeGbp / 100);
  const mechGbp      = Math.round(c.reconMechanicalGbp / 100);
  const detailGbp    = Math.round(c.reconDetailGbp / 100);
  const transportGbp = Math.round(c.transportGbp / 100);
  const netDerived = listingGbp - platformGbp - mechGbp - detailGbp - transportGbp;

  const breakdownRows = [
    { label: "Sale price (current listing)", value: formatSellerGBP(listingGbp), color: "#1E293B" },
    { label: "iAutoMotive platform fee", value: `−${formatSellerGBP(platformGbp)}`, color: "#F87171" },
    { label: "Reconditioning — mechanical", value: `−${formatSellerGBP(mechGbp)}`, color: "#F87171" },
    { label: "Reconditioning — detail & valet", value: `−${formatSellerGBP(detailGbp)}`, color: "#F87171" },
    { label: "Transport & collection", value: `−${formatSellerGBP(transportGbp)}`, color: "#F87171" },
  ];

  // Escrow conditions still mock for Phase 1 — schema for these lands later.
  const completeCount = MOCK_ESCROW_CONDITIONS.filter(c => c.status === "complete").length;
  const totalCount = MOCK_ESCROW_CONDITIONS.length;

  const payoutSpecRows = [
    { key: "Method", value: data?.seller.payoutMethod
      ? (PAYOUT_LABELS[data.seller.payoutMethod] ?? data.seller.payoutMethod)
      : "Not set yet — your sales rep will configure this" },
    { key: "Expected timing", value: "Within 24 hours of release" },
  ];

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* ── 1. Payout Hero ── */}
      <div
        style={{
          background: "#FFF8E6",
          borderRadius: 16,
          border: "1px solid #FFE9A0",
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 11,
            color: "#92400E",
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          YOUR ESTIMATED PAYOUT
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 900,
            fontSize: 42,
            color: "#B87209",
            letterSpacing: "-0.025em",
          }}
        >
          {formatSellerGBP(netDerived)}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: 13,
            color: "#92400E",
          }}
        >
          Based on current listing price of {formatSellerGBP(listingGbp)} — updates automatically
        </div>

        <div
          style={{
            borderTop: "1px solid #FFE9A0",
            marginTop: 12,
            paddingTop: 12,
          }}
        >
          <button
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              color: "#92400E",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            {isBreakdownOpen ? "Hide breakdown ▲" : "See full breakdown ▾"}
          </button>
        </div>

        {isBreakdownOpen && (
          <div style={{ marginTop: 8 }}>
            {breakdownRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 6,
                  paddingBottom: 6,
                  borderBottom: "1px solid rgba(255, 233, 160, 0.3)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: 13,
                    color: "#64748B",
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: 13,
                    color: row.color,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}

            {/* Total row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "2px solid #FFD980",
                paddingTop: 8,
                marginTop: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#92400E",
                }}
              >
                Net payout to you
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 900,
                  fontSize: 15,
                  color: "#B87209",
                }}
              >
                {formatSellerGBP(netDerived)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Escrow Release Conditions ── */}
      <div
        style={{
          background: "#FFFFFF",
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
          }}
        >
          Escrow release conditions
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: 12,
            color: "#94A3B8",
            marginTop: 4,
            marginBottom: 12,
          }}
        >
          Your money releases when all five conditions are met. Currently{" "}
          {completeCount} of {totalCount} complete.
        </div>

        {MOCK_ESCROW_CONDITIONS.map((cond, i) => {
          const done = cond.status === "complete";
          const isLast = i === MOCK_ESCROW_CONDITIONS.length - 1;
          return (
            <div
              key={cond.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingTop: 8,
                paddingBottom: 8,
                borderBottom: isLast ? "none" : "1px solid #F7F8F9",
              }}
            >
              {/* Status circle */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: done ? "#D1FAE5" : "#E2E8F0",
                  color: done ? "#064E3B" : "#94A3B8",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {done ? "✓" : i + 1}
              </div>

              {/* Label */}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: 13,
                  color: done ? "#1E293B" : "#94A3B8",
                  flex: 1,
                }}
              >
                {cond.label}
              </span>

              {/* Badge */}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 10,
                  background: done ? "#D1FAE5" : "#E2E8F0",
                  color: done ? "#064E3B" : "#94A3B8",
                  borderRadius: 9999,
                  padding: "2px 8px",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {done ? "Complete" : "Waiting for sale"}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── 3. Buyer Return Window ── */}
      <div
        style={{
          background: "#FFFFFF",
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
          }}
        >
          Buyer return window
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: 13,
            color: "#64748B",
            marginTop: 6,
          }}
        >
          Once sold, the buyer has 7 days to return the vehicle. Your payout
          releases after day 7 if no return is initiated.
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 14, marginBottom: 2 }}>
          <div
            style={{
              background: "#F7F8F9",
              borderRadius: 9999,
              height: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#008C7C",
                borderRadius: 9999,
                height: 8,
                width: "0%",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: 12,
            color: "#94A3B8",
            marginTop: 4,
          }}
        >
          <span>Sale date</span>
          <span>Day 7 — payout released</span>
        </div>

        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: 12,
            color: "#94A3B8",
            textAlign: "center" as const,
            marginTop: 8,
          }}
        >
          Not yet in return window — vehicle not sold yet
        </div>
      </div>

      {/* ── 4. Payout Method ── */}
      <div
        style={{
          background: "#FFFFFF",
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
            fontSize: 11,
            color: "#94A3B8",
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          PAYOUT METHOD
        </div>

        {payoutSpecRows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 13,
                color: "#94A3B8",
              }}
            >
              {row.key}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 13,
                color: "#1E293B",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}

        <button
          onClick={() => console.log("Update bank details")}
          style={{
            marginTop: 12,
            background: "#F7F8F9",
            border: "1px solid #E2E8F0",
            borderRadius: 9999,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 6,
            paddingBottom: 6,
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 12,
            color: "#64748B",
            cursor: "pointer",
          }}
        >
          Update bank details
        </button>
      </div>
    </div>
  );
}
