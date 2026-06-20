"use client";

/**
 * DealDetailDrawer — right-side drawer opened from a row on the Deals page.
 *
 * Shows the deal, the car (pulled from the originating lead), its now-in-
 * inventory status, and the lot it's stored at. View-only; data comes from
 * /api/admin/deals/[id]. Reps only see their own deals.
 */

import { useEffect, useState } from "react";
import { X, Warehouse, MapPin, Phone, Mail, ArrowLeft, UserRound, ShieldAlert } from "lucide-react";

const T = {
  bgPanel: "#0D1525", bgInput: "#0B111E", bgSection: "#111D30",
  border: "#1E2D4A", textPrimary: "#F1F5F9", textSecondary: "#8492A8",
  textMuted: "#6B7A90", textDim: "#4A556B", teal: "#008C7C", teal200: "#4DD9C7",
  tealBg: "#0A2A26", green: "#34D399", greenBg: "#0B2B1A",
  red: "#F87171", redBg: "#2B0F0F",
};

export interface DealSummary {
  id: string;
  year: number;
  make: string;
  model: string;
  stage: string;
  salePrice: number;
}

interface DealDetail {
  id: string;
  status: string;
  stage: string;
  stageKey: string;
  salePriceGbp: number | null;
  askingPriceGbp: number | null;
  buyer: string | null;
  collectedAt: string;
  inInventory: boolean;
  location: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  reg: string | null;
  vin: string | null;
  mileage: number | null;
  bodyType: string | null;
  fuelType: string | null;
  transmission: string | null;
  sellerName: string | null;
  sellerArea: string | null;
  sellerPhone: string | null;
  sellerEmail: string | null;
  doNotCall: boolean;
  doNotSms: boolean;
  leadId: string | null;
  photos: string[];
}

const gbp = (n: number | null | undefined) => (n == null ? "—" : `£${n.toLocaleString()}`);
const titleCase = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export function DealDetailDrawer({ deal, onClose }: { deal: DealSummary | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [detail, setDetail] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"deal" | "seller">("deal");

  useEffect(() => {
    if (deal) { setMode("deal"); requestAnimationFrame(() => setMounted(true)); }
    else setMounted(false);
  }, [deal]);

  const call = () => {
    if (detail?.doNotCall || !detail?.sellerPhone) return;
    const dial = (window as unknown as { iaDial?: (n: string) => void }).iaDial;
    if (dial) dial(detail.sellerPhone);
  };

  useEffect(() => {
    if (!deal) { setDetail(null); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/deals/${deal.id}`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) setDetail(d.detail); })
      .catch(err => { if (!cancelled) console.error("[DealDetailDrawer] fetch failed:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [deal]);

  if (!deal) return null;

  const carTitle = [detail?.year ?? deal.year, detail?.make ?? deal.make, detail?.model ?? deal.model]
    .filter(Boolean).join(" ") || "Deal";
  const collected = detail?.collectedAt
    ? new Date(detail.collectedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const mileage = detail?.mileage != null ? `${detail.mileage.toLocaleString()} mi` : "—";
  const vehicleSub = [detail?.trim, detail?.bodyType].filter(Boolean).join(" · ") || null;
  const canCall = !!detail?.sellerPhone && !detail?.doNotCall;
  const callTitle = detail?.doNotCall ? "Seller is flagged do-not-call"
    : !detail?.sellerPhone ? "No phone number on file" : undefined;

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(7,13,24,0.6)", backdropFilter: "blur(2px)",
          zIndex: 62, opacity: mounted ? 1 : 0, transition: "opacity 200ms ease" }} />
      <aside role="dialog" aria-label="Deal details"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, maxWidth: "100vw",
          background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 63,
          display: "flex", flexDirection: "column",
          transform: mounted ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)",
          fontFamily: "var(--font-body)" }}>

        {/* Header */}
        <header className="flex items-center justify-between gap-3"
          style={{ minHeight: 58, padding: "10px 20px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div className="min-w-0">
            <div className="truncate" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>
              {carTitle}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 3 }}>
              <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: T.bgSection, color: T.teal200 }}>
                {detail?.stage ?? deal.stage}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: T.greenBg, color: T.green }}>
                <Warehouse size={10} /> In inventory
              </span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-[8px] shrink-0 hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, display: "grid", placeItems: "center" }}>
            <X size={16} />
          </button>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {mode === "deal" ? (
          <>
          {/* Inventory & location hero */}
          <div style={{ marginBottom: 18, padding: "12px 14px", borderRadius: 10, background: T.bgSection, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 700, color: T.green }}>
                <Warehouse size={13} /> In stock
              </span>
              {collected && <span style={{ fontSize: 11, color: T.textMuted }}>· Collected {collected}</span>}
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={14} style={{ color: T.teal200, marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{detail?.location ?? "Awaiting allocation"}</div>
              </div>
            </div>
          </div>

          {loading && !detail && <div style={{ fontSize: 12, color: T.textMuted }}>Loading…</div>}

          {/* Photos */}
          {detail && detail.photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto" style={{ marginBottom: 18, paddingBottom: 4 }}>
              {detail.photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" style={{ height: 72, width: 104, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: `1px solid ${T.border}` }} />
              ))}
            </div>
          )}

          {/* Vehicle */}
          <Section title="Vehicle">
            <DetailRow label="Registration" value={detail?.reg ?? "—"} />
            <DetailRow label="Mileage" value={mileage} />
            {vehicleSub && <DetailRow label="Spec" value={vehicleSub} />}
            <DetailRow label="Fuel" value={detail?.fuelType ? titleCase(detail.fuelType) : "—"} />
            <DetailRow label="Transmission" value={detail?.transmission ? titleCase(detail.transmission) : "—"} />
            {detail?.vin && <DetailRow label="VIN" value={detail.vin} />}
          </Section>

          {/* Deal */}
          <Section title="Deal">
            <DetailRow label="Stage" value={detail?.stage ?? deal.stage} />
            <DetailRow label="Target price" value={gbp(detail?.salePriceGbp ?? deal.salePrice)} />
            <DetailRow label="Was asking" value={gbp(detail?.askingPriceGbp)} />
            <DetailRow label="Buyer" value={detail?.buyer ?? "Awaiting buyer"} />
          </Section>

          {/* Origin */}
          <Section title="Origin">
            <DetailRow label="Seller" value={detail?.sellerName ?? "—"} />
            <DetailRow label="Collected from" value={detail?.sellerArea ?? "—"} />
          </Section>
          </>
          ) : (
          <>
            {/* Seller contact — the collected lead is now the consignor */}
            <div className="flex items-center gap-2.5" style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: T.bgSection, border: `1px solid ${T.border}` }}>
              <div style={{ width: 38, height: 38, borderRadius: 999, background: T.tealBg, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <UserRound size={18} style={{ color: T.teal200 }} />
              </div>
              <div className="min-w-0">
                <div className="truncate" style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{detail?.sellerName ?? "Seller"}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Seller · consignor on this deal</div>
              </div>
            </div>

            {detail?.doNotCall && (
              <div className="flex items-center gap-1.5" style={{ marginBottom: 14, padding: "8px 10px", borderRadius: 8, background: T.redBg, color: T.red, fontSize: 12, fontWeight: 600 }}>
                <ShieldAlert size={13} /> Marked do not call
              </div>
            )}

            <Section title="Contact">
              <DetailRow label="Phone" value={detail?.sellerPhone ?? "—"} />
              <DetailRow label="Email" value={detail?.sellerEmail ?? "—"} />
              <DetailRow label="Area" value={detail?.sellerArea ?? "—"} />
            </Section>

            <div className="flex gap-2">
              <button onClick={call} disabled={!canCall} title={callTitle}
                aria-label={callTitle ? `Call seller — ${callTitle}` : "Call seller"}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-[9px] rounded-[8px] hover:opacity-90"
                style={{ background: T.greenBg, border: `1px solid ${T.green}33`, color: T.green, fontWeight: 700, fontSize: 13,
                  opacity: canCall ? 1 : 0.45, cursor: canCall ? "pointer" : "not-allowed" }}>
                <Phone size={14} /> Call
              </button>
              {detail?.sellerEmail ? (
                <a href={`mailto:${detail.sellerEmail}`} aria-label="Email seller"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-[9px] rounded-[8px] hover:opacity-90"
                  style={{ background: T.bgSection, border: `1px solid ${T.border}`, color: T.teal200, fontWeight: 700, fontSize: 13 }}>
                  <Mail size={14} /> Email
                </a>
              ) : (
                <button disabled title="No email address on file" aria-label="Email seller — no email address on file"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-[9px] rounded-[8px]"
                  style={{ background: T.bgSection, border: `1px solid ${T.border}`, color: T.teal200, fontWeight: 700, fontSize: 13, opacity: 0.45, cursor: "not-allowed" }}>
                  <Mail size={14} /> Email
                </button>
              )}
            </div>
          </>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-2"
          style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          {mode === "deal" ? (
            <button onClick={() => setMode("seller")}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] hover:opacity-90"
              style={{ background: T.bgSection, border: `1px solid ${T.border}`, color: T.teal200, fontWeight: 700, fontSize: 13 }}>
              <UserRound size={14} /> View seller
            </button>
          ) : (
            <button onClick={() => setMode("deal")}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] hover:opacity-90"
              style={{ background: T.bgSection, border: `1px solid ${T.border}`, color: T.teal200, fontWeight: 700, fontSize: 13 }}>
              <ArrowLeft size={14} /> Back to deal
            </button>
          )}
          <button onClick={onClose}
            className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
            style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontWeight: 700, fontSize: 13 }}>
            Close
          </button>
        </footer>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span style={{ width: 100, flexShrink: 0, fontSize: 11, color: T.textMuted }}>{label}</span>
      <span className="min-w-0 break-words" style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{value}</span>
    </div>
  );
}
