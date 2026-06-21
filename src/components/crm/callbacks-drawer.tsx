"use client";

/**
 * CallbacksDrawer — right-side drawer listing the rep's leads that need a
 * callback (data from /api/admin/crm/callbacks). Opened from the CRM topbar
 * badge and the "Callbacks overdue" KPI card. Each row can be dialled via the
 * softphone bridge; the footer jumps into the dialler's Callbacks queue.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Phone, PhoneForwarded, AlertTriangle } from "lucide-react";

const T = {
  bgPanel: "#0D1525", bgSection: "#111D30", border: "#1E2D4A",
  textPrimary: "#F1F5F9", textSecondary: "#8492A8", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7", tealBg: "#0A2A26", amber: "#F5A623", red: "#F87171", redBg: "#2B0F0F",
};

interface CallbackRow {
  id: string;
  seller: string;
  phone: string | null;
  vehicleYear: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleTrim: string | null;
  nextContactAt: string;
  overdue: boolean;
}

function dueLabel(iso: string, overdue: boolean): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${overdue ? "Overdue" : "Due"} ${date}`;
}

export function CallbacksDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<CallbackRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setMounted(true));
    else setMounted(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/crm/callbacks", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) setRows(d.callbacks ?? []); })
      .catch(err => { if (!cancelled) console.error("[CallbacksDrawer] fetch failed:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  const overdueCount = rows.filter(r => r.overdue).length;
  const call = (phone: string | null) => {
    if (!phone) return;
    const dial = (window as unknown as { iaDial?: (n: string) => void }).iaDial;
    if (dial) dial(phone);
  };

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(7,13,24,0.6)", backdropFilter: "blur(2px)",
          zIndex: 62, opacity: mounted ? 1 : 0, transition: "opacity 200ms ease" }} />
      <aside role="dialog" aria-label="Callbacks"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 440, maxWidth: "100vw",
          background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 63,
          display: "flex", flexDirection: "column",
          transform: mounted ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)",
          fontFamily: "var(--font-body)" }}>

        <header className="flex items-center justify-between gap-3"
          style={{ minHeight: 58, padding: "10px 20px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>
              <PhoneForwarded size={16} style={{ color: T.amber }} /> Callbacks
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {rows.length} pending{overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-[8px] shrink-0 hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, display: "grid", placeItems: "center" }}>
            <X size={16} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {loading && rows.length === 0 && <div style={{ fontSize: 12, color: T.textMuted }}>Loading…</div>}
          {!loading && rows.length === 0 && (
            <div style={{ fontSize: 13, color: T.textMuted, textAlign: "center", padding: "32px 12px" }}>
              No callbacks scheduled.
            </div>
          )}
          <div className="flex flex-col gap-2">
            {rows.map(r => {
              const vehicle = [r.vehicleYear, r.vehicleMake, r.vehicleModel, r.vehicleTrim].filter(Boolean).join(" ") || "—";
              return (
                <div key={r.id} className="flex items-center gap-3"
                  style={{ padding: "10px 12px", borderRadius: 10, background: T.bgSection, border: `1px solid ${r.overdue ? "#3a1d1d" : T.border}` }}>
                  <div className="min-w-0 flex-1">
                    <div className="truncate" style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{r.seller}</div>
                    <div className="truncate" style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{vehicle}</div>
                    <div className="inline-flex items-center gap-1" style={{ fontSize: 10, fontWeight: 700, color: r.overdue ? T.red : T.textSecondary, marginTop: 3 }}>
                      {r.overdue && <AlertTriangle size={10} />} {dueLabel(r.nextContactAt, r.overdue)}
                    </div>
                  </div>
                  <button onClick={() => call(r.phone)} disabled={!r.phone} aria-label={`Call ${r.seller}`}
                    className="rounded-[8px] shrink-0 hover:opacity-90"
                    style={{ width: 34, height: 34, background: r.phone ? "#0B2B1A" : T.bgSection,
                      border: `1px solid ${r.phone ? "#34D399" : T.border}`, color: r.phone ? "#34D399" : T.textDim,
                      display: "grid", placeItems: "center", cursor: r.phone ? "pointer" : "not-allowed" }}>
                    <Phone size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="flex items-center justify-between gap-2"
          style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button onClick={() => { onClose(); router.push("/admin/crm/dialler?queue=callbacks"); }}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-[8px] rounded-[8px] hover:opacity-90"
            style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontWeight: 700, fontSize: 13,
              opacity: rows.length === 0 ? 0.5 : 1, cursor: rows.length === 0 ? "not-allowed" : "pointer" }}>
            <PhoneForwarded size={14} /> Work callbacks in dialler
          </button>
          <button onClick={onClose}
            className="px-4 py-[8px] rounded-[8px] hover:opacity-90"
            style={{ background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontWeight: 700, fontSize: 13 }}>
            Close
          </button>
        </footer>
      </aside>
    </>
  );
}
