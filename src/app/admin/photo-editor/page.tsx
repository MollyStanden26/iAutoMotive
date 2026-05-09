"use client";

import { useEffect, useMemo, useState } from "react";

interface VehicleRow {
  id: string;
  registration: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  photoCount: number;
  rawCount: number;
  processedCount: number;
  primaryCdnUrl: string | null;
}

interface Photo {
  id: string;
  cdnUrl: string;
  originalCdnUrl: string | null;
  isPrimary: boolean;
  isProcessed: boolean;
  sortOrder: number;
  mimeType: string | null;
}

interface VehicleDetail {
  id: string;
  registration: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  photos: Photo[];
}

const T = {
  bg:        "#070D18",
  panel:     "#0D1525",
  section:   "#111D30",
  border:    "#1E2D4A",
  text:      "#F1F5F9",
  textDim:   "#8492A8",
  textMuted: "#6B7A90",
  teal:      "#008C7C",
  teal200:   "#4DD9C7",
  tealBg:    "#0A2A26",
  red:       "#F87171",
  green:     "#34D399",
  amber:     "#F59E0B",
};

export default function PhotoEditorPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [detail, setDetail] = useState<VehicleDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Initial vehicle load
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/photos", { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: { vehicles: VehicleRow[] }) => { if (!cancelled) setVehicles(d.vehicles ?? []); })
      .catch(err => setFlash({ kind: "err", text: err.message }))
      .finally(() => { if (!cancelled) setVehiclesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Pull selected vehicle's photos when activeId changes
  useEffect(() => {
    if (!activeId) { setDetail(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    setSelected(new Set());
    fetch(`/api/admin/photos?vehicleId=${activeId}`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: { vehicle: VehicleDetail }) => { if (!cancelled) setDetail(d.vehicle); })
      .catch(err => setFlash({ kind: "err", text: err.message }))
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [activeId]);

  const filteredVehicles = useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(v =>
      `${v.year} ${v.make} ${v.model} ${v.trim ?? ""} ${v.registration}`.toLowerCase().includes(q)
    );
  }, [vehicles, vehicleQuery]);

  const refresh = async () => {
    if (!activeId) return;
    const d = await fetch(`/api/admin/photos?vehicleId=${activeId}`, { cache: "no-store" }).then(r => r.json());
    setDetail(d.vehicle);
    // Also refresh the vehicle row counts in the side list.
    const vs = await fetch("/api/admin/photos", { cache: "no-store" }).then(r => r.json());
    setVehicles(vs.vehicles ?? []);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectRaw = () => {
    if (!detail) return;
    setSelected(new Set(detail.photos.filter(p => !p.isProcessed).map(p => p.id)));
  };
  const selectAll = () => {
    if (!detail) return;
    setSelected(new Set(detail.photos.map(p => p.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const processSelected = async () => {
    if (selected.size === 0 || busy) return;
    setBusy(true);
    setFlash(null);
    try {
      // No `background` override — the server reads the iAutoMotive backdrop
      // from public/images/iautomotive-backdrop.jpg by default.
      const res = await fetch("/api/admin/photos/replace-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaIds: Array.from(selected) }),
      });
      const body = await res.json();
      if (!res.ok && !body.processed) {
        // When EVERY photo failed, surface the first per-photo error
        // verbatim — usually identical across the batch (auth, billing,
        // quota) and far more useful than "HTTP 502".
        const firstErr = body?.results?.find?.((r: { ok: boolean; error?: string }) => !r.ok)?.error;
        throw new Error(firstErr || body.error || `HTTP ${res.status}`);
      }
      setFlash({
        kind: body.processed === body.total ? "ok" : "err",
        text: `Processed ${body.processed} of ${body.total}` +
              (body.processed < body.total ? ` — see results below` : "."),
      });
      await refresh();
      clearSelection();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Process failed" });
    } finally {
      setBusy(false);
    }
  };

  const revertSelected = async () => {
    if (selected.size === 0 || busy) return;
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/photos/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaIds: Array.from(selected) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setFlash({ kind: "ok", text: `Reverted ${body.reverted} photos to raw.` });
      await refresh();
      clearSelection();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Revert failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-theme="dark" style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      fontFamily: "var(--font-body)",
      display: "grid", gridTemplateColumns: "minmax(260px, 320px) 1fr",
    }}>
      {/* Vehicle picker column */}
      <aside style={{
        background: T.panel, borderRight: `1px solid ${T.border}`,
        height: "100vh", position: "sticky", top: 0,
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16 }}>
            Photo editor
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
            Cut cars out and paste onto the iAutoMotive Studio backdrop
          </div>
        </div>
        <div style={{ padding: "12px 18px" }}>
          <input
            placeholder="Search reg / make / model"
            value={vehicleQuery}
            onChange={e => setVehicleQuery(e.target.value)}
            style={{
              width: "100%", height: 36, padding: "0 12px",
              background: T.section, border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.text, fontFamily: "var(--font-body)", fontSize: 13, outline: "none",
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
          {vehiclesLoading && <Empty text="Loading…" />}
          {!vehiclesLoading && filteredVehicles.length === 0 && <Empty text="No matching vehicles" />}
          {filteredVehicles.map(v => {
            const isActive = v.id === activeId;
            return (
              <button
                key={v.id}
                onClick={() => setActiveId(v.id)}
                style={{
                  display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 10,
                  width: "100%", textAlign: "left", padding: "8px 10px",
                  background: isActive ? T.tealBg : "transparent",
                  border: `1px solid ${isActive ? T.teal : "transparent"}`,
                  borderRadius: 10, marginBottom: 4, cursor: "pointer", color: T.text,
                }}
              >
                <span style={{
                  width: 44, height: 32, borderRadius: 6, overflow: "hidden",
                  background: T.section, flexShrink: 0,
                }}>
                  {v.primaryCdnUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.primaryCdnUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : null}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 12, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.year} {v.make} {v.model}
                  </span>
                  <span style={{ display: "block", fontSize: 10, color: T.textMuted, marginTop: 1 }}>
                    {v.registration}
                  </span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                  <Badge kind="raw"  count={v.rawCount} />
                  <Badge kind="done" count={v.processedCount} />
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Photo grid + actions */}
      <main style={{ padding: "24px 28px 64px", overflowY: "auto" }}>
        {!detail && !detailLoading && (
          <div style={{ padding: "80px 0", textAlign: "center", color: T.textMuted, fontSize: 14 }}>
            Pick a vehicle on the left to start editing.
          </div>
        )}
        {detailLoading && <Empty text="Loading photos…" />}
        {detail && (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22 }}>
                  {detail.year} {detail.make} {detail.model}
                </div>
                <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>
                  {detail.registration}{detail.trim ? ` · ${detail.trim}` : ""} · {detail.photos.length} photos
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <SecondaryButton onClick={selectRaw} disabled={busy}>Select raw only</SecondaryButton>
                <SecondaryButton onClick={selectAll} disabled={busy}>Select all</SecondaryButton>
                <SecondaryButton onClick={clearSelection} disabled={busy}>Clear</SecondaryButton>
              </div>
            </div>

            {/* Action bar — every photo gets composited onto the iAutoMotive
                showroom backdrop served from public/images. Designers can
                swap the file there without code changes. */}
            <div style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14,
              padding: "12px 14px", marginBottom: 18,
              background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12,
              alignItems: "center",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/iautomotive-backdrop.png"
                alt="iAutoMotive Studio backdrop"
                onError={e => {
                  // Fall back to .jpg if the PNG isn't there.
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = "jpg";
                    e.currentTarget.src = "/images/iautomotive-backdrop.jpg";
                  } else {
                    e.currentTarget.style.display = "none";
                  }
                }}
                style={{
                  width: 60, height: 44, objectFit: "cover", borderRadius: 8,
                  border: `1px solid ${T.border}`,
                }}
              />
              <div>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Replacing with
                </div>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginTop: 2 }}>
                  iAutoMotive Studio backdrop
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                  Edit at <code style={{ color: T.teal200 }}>public/images/iautomotive-backdrop.png</code>
                </div>
              </div>
              <PrimaryButton onClick={processSelected} disabled={busy || selected.size === 0}>
                {busy ? "Processing…" : `Process ${selected.size} photo${selected.size === 1 ? "" : "s"}`}
              </PrimaryButton>
              <SecondaryButton onClick={revertSelected} disabled={busy || selected.size === 0}>
                Revert
              </SecondaryButton>
            </div>

            {flash && (
              <div style={{
                padding: "10px 14px", marginBottom: 16,
                background: flash.kind === "ok" ? "#0A2A26" : "#3B1820",
                border: `1px solid ${flash.kind === "ok" ? T.teal : T.red}`,
                color: flash.kind === "ok" ? T.teal200 : T.red,
                fontFamily: "var(--font-body)", fontSize: 13, borderRadius: 10,
              }}>{flash.text}</div>
            )}

            {/* Photo grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {detail.photos.map(p => {
                const isSel = selected.has(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    style={{
                      position: "relative", cursor: "pointer",
                      border: `2px solid ${isSel ? T.teal : T.border}`,
                      borderRadius: 12, overflow: "hidden",
                      background: T.panel, transition: "border-color 120ms ease",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cdnUrl} alt="" style={{
                      display: "block", width: "100%", aspectRatio: "4/3", objectFit: "cover",
                    }} />
                    <div style={{
                      position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                      padding: 8, pointerEvents: "none",
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: isSel ? T.teal : "rgba(7,13,24,0.7)",
                        color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, border: `1px solid ${isSel ? T.teal : "rgba(255,255,255,0.3)"}`,
                      }}>{isSel ? "✓" : ""}</span>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        {p.isPrimary && <Pill bg="#0A2A26" border={T.teal} fg={T.teal200}>HERO</Pill>}
                        {p.isProcessed
                          ? <Pill bg="#0A2A26" border={T.teal} fg={T.teal200}>PROCESSED</Pill>
                          : <Pill bg="#3B2A10" border={T.amber} fg="#FCD34D">RAW</Pill>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ── primitives ─────────────────────────────────────────── */

function Empty({ text }: { text: string }) {
  return <div style={{ padding: "32px 0", textAlign: "center", color: "#6B7A90", fontSize: 12 }}>{text}</div>;
}
function Badge({ kind, count }: { kind: "raw" | "done"; count: number }) {
  if (count === 0) return null;
  const colors = kind === "raw"
    ? { bg: "#3B2A10", border: "#F59E0B", fg: "#FCD34D", label: "raw" }
    : { bg: "#0A2A26", border: "#008C7C", fg: "#4DD9C7", label: "done" };
  return (
    <span style={{
      background: colors.bg, border: `1px solid ${colors.border}`, color: colors.fg,
      borderRadius: 9999, padding: "1px 6px", fontSize: 9, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase",
    }}>{count} {colors.label}</span>
  );
}
function Pill({ bg, border, fg, children }: { bg: string; border: string; fg: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: bg, border: `1px solid ${border}`, color: fg,
      borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 800,
      letterSpacing: "0.06em",
    }}>{children}</span>
  );
}
function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{
        height: 38, padding: "0 18px", borderRadius: 9999,
        background: T.tealBg, color: T.teal200, border: `1px solid ${T.teal}`,
        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      }}
    >{children}</button>
  );
}
function SecondaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{
        height: 38, padding: "0 14px", borderRadius: 9999,
        background: T.section, color: T.text, border: `1px solid ${T.border}`,
        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      }}
    >{children}</button>
  );
}
