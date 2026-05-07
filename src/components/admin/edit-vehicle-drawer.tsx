"use client";

import { useEffect, useState } from "react";

const T = {
  bgPanel:       "#0D1525",
  bgInput:       "#0B111E",
  bgSection:     "#111D30",
  border:        "#1E2D4A",
  textPrimary:   "#F1F5F9",
  textSecondary: "#8492A8",
  textMuted:     "#6B7A90",
  textDim:       "#4A556B",
  teal:          "#008C7C",
  teal200:       "#4DD9C7",
  tealBg:        "#0A2A26",
  red:           "#F87171",
};

interface EditVehicleDrawerProps {
  open: boolean;
  vehicleId: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

interface VehicleDetails {
  id: string;
  registration: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileageAtIntake: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  exteriorColour: string | null;
  ownersCountAtIntake: number | null;
  conditionGrade: string;
  serviceHistoryType: string;
  currentStage: string;
  listingPriceGbp: number | null;
  floorPriceGbp: number | null;
  hasHpiClear: boolean;
  lot: string | null;
  seller: { firstName: string; lastName: string; email?: string } | null;
  photos: { url: string; category: string; isPrimary: boolean }[];
}

const FUEL_TYPES   = ["petrol", "diesel", "hybrid", "plugin_hybrid", "electric", "mild_hybrid"];
const TRANSMISSIONS = ["manual", "automatic", "semi_automatic", "cvt"];
const BODY_TYPES   = ["hatchback", "saloon", "estate", "suv", "coupe", "convertible", "mpv", "pickup", "van"];
const CONDITIONS   = ["excellent", "good", "fair", "below_average"];
const SERVICE      = ["full", "partial", "none"];
const STAGES       = [
  "offer_accepted", "collected", "inspecting", "in_mechanical",
  "in_body_paint", "in_detail", "in_photography", "listing_ready", "live",
  "sale_agreed", "sold", "returned", "withdrawn",
];

const labelize = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export function EditVehicleDrawer({ open, vehicleId, onClose, onSaved }: EditVehicleDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    setVehicle(null);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!open || !vehicleId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cancel(); };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => setMounted(true));

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/vehicles/${vehicleId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setVehicle(data.vehicle); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicleId]);

  if (!open) return null;

  const update = <K extends keyof VehicleDetails>(key: K, value: VehicleDetails[K]) => {
    setVehicle(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        registration: vehicle.registration,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim ?? "",
        mileageAtIntake: vehicle.mileageAtIntake,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        bodyType: vehicle.bodyType,
        exteriorColour: vehicle.exteriorColour ?? "",
        ownersCountAtIntake: vehicle.ownersCountAtIntake ?? 0,
        conditionGrade: vehicle.conditionGrade,
        serviceHistoryType: vehicle.serviceHistoryType,
        currentStage: vehicle.currentStage,
        listingPriceGbp: vehicle.listingPriceGbp ?? 0,
        floorPriceGbp: vehicle.floorPriceGbp ?? 0,
        hasHpiClear: vehicle.hasHpiClear,
      };
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Save failed (${res.status})`);
      }
      onSaved?.();
      cancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div onClick={cancel}
        style={{ position: "fixed", inset: 0, background: "rgba(7, 13, 24, 0.6)", backdropFilter: "blur(2px)", zIndex: 60, opacity: mounted ? 1 : 0, transition: "opacity 200ms ease" }} />
      <aside role="dialog" aria-label="Edit vehicle"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, maxWidth: "100vw", background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 61, display: "flex", flexDirection: "column", transform: mounted ? "translateX(0)" : "translateX(100%)", transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)" }}>
        <header className="flex items-center justify-between px-5"
          style={{ height: 58, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Edit vehicle</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} · ${vehicle.registration}` : "Loading…"}
            </div>
          </div>
          <button onClick={cancel} aria-label="Close"
            className="rounded-[8px] hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: 18, lineHeight: 1 }}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {loading && (
              <div style={{ padding: 20, fontFamily: "var(--font-body)", fontSize: 13, color: T.textMuted, textAlign: "center" }}>
                Loading vehicle…
              </div>
            )}

            {!loading && vehicle && (
              <>
                {(vehicle.seller || vehicle.lot) && (
                  <Section title="Context">
                    <ReadOnlyRow label="Seller" value={vehicle.seller ? `${vehicle.seller.firstName} ${vehicle.seller.lastName}${vehicle.seller.email ? ` · ${vehicle.seller.email}` : ""}` : "—"} />
                    <ReadOnlyRow label="Lot" value={vehicle.lot ?? "—"} />
                  </Section>
                )}

                {vehicle.photos.length > 0 && (
                  <Section title="Photos">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                      {vehicle.photos.slice(0, 8).map((p, i) => (
                        <div key={i} style={{
                          aspectRatio: "1 / 1",
                          background: T.bgInput,
                          border: `1px solid ${p.isPrimary ? T.teal : T.border}`,
                          borderRadius: 6,
                          overflow: "hidden",
                          position: "relative",
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {p.isPrimary && (
                            <span style={{
                              position: "absolute", top: 4, left: 4,
                              padding: "1px 5px", borderRadius: 4,
                              background: T.tealBg, color: T.teal200,
                              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 8,
                            }}>HERO</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 4 }}>
                      Photo and document re-uploads aren&rsquo;t supported here yet — manage those from the vehicle detail page.
                    </p>
                  </Section>
                )}

                <Section title="Vehicle details">
                  <Row>
                    <Field label="Registration" required>
                      <Input value={vehicle.registration} onChange={v => update("registration", v.toUpperCase())} />
                    </Field>
                    <Field label="Year" required>
                      <Input value={String(vehicle.year)} onChange={v => update("year", parseInt(v, 10) || 0)} type="number" />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Make" required>
                      <Input value={vehicle.make} onChange={v => update("make", v)} />
                    </Field>
                    <Field label="Model" required>
                      <Input value={vehicle.model} onChange={v => update("model", v)} />
                    </Field>
                  </Row>
                  <Field label="Trim / variant">
                    <Input value={vehicle.trim ?? ""} onChange={v => update("trim", v)} />
                  </Field>
                  <Row>
                    <Field label="Mileage" required>
                      <Input value={String(vehicle.mileageAtIntake)} onChange={v => update("mileageAtIntake", parseInt(v, 10) || 0)} type="number" />
                    </Field>
                    <Field label="Owners">
                      <Input value={String(vehicle.ownersCountAtIntake ?? "")} onChange={v => update("ownersCountAtIntake", parseInt(v, 10) || 0)} type="number" />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Fuel type">
                      <Select value={vehicle.fuelType} onChange={v => update("fuelType", v)} options={FUEL_TYPES} />
                    </Field>
                    <Field label="Gearbox">
                      <Select value={vehicle.transmission} onChange={v => update("transmission", v)} options={TRANSMISSIONS} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Body type">
                      <Select value={vehicle.bodyType} onChange={v => update("bodyType", v)} options={BODY_TYPES} />
                    </Field>
                    <Field label="Colour">
                      <Input value={vehicle.exteriorColour ?? ""} onChange={v => update("exteriorColour", v)} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Condition">
                      <Select value={vehicle.conditionGrade} onChange={v => update("conditionGrade", v)} options={CONDITIONS} />
                    </Field>
                    <Field label="Service history">
                      <Select value={vehicle.serviceHistoryType} onChange={v => update("serviceHistoryType", v)} options={SERVICE} />
                    </Field>
                  </Row>
                  <Field label="HPI status">
                    <Toggle checked={vehicle.hasHpiClear} onChange={v => update("hasHpiClear", v)} onLabel="Clear ✓" offLabel="Check pending" />
                  </Field>
                </Section>

                <Section title="Listing & pricing">
                  <Row>
                    <Field label="Listing price">
                      <Input value={String(vehicle.listingPriceGbp ?? "")} onChange={v => update("listingPriceGbp", parseInt(v, 10) || 0)} type="number" />
                    </Field>
                    <Field label="Floor price (internal)">
                      <Input value={String(vehicle.floorPriceGbp ?? "")} onChange={v => update("floorPriceGbp", parseInt(v, 10) || 0)} type="number" />
                    </Field>
                  </Row>
                  <Field label="Stage">
                    <Select value={vehicle.currentStage} onChange={v => update("currentStage", v)} options={STAGES} />
                  </Field>
                </Section>
              </>
            )}
          </div>

          <footer className="flex items-center gap-2 px-5"
            style={{ height: 64, borderTop: `1px solid ${T.border}`, background: T.bgPanel, flexShrink: 0 }}>
            {error && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.red, flex: 1 }}>{error}</span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button type="button" onClick={cancel} disabled={submitting}
                className="px-4 py-[7px] rounded-[8px] hover:opacity-80"
                style={{ background: T.bgSection, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: T.textSecondary, opacity: submitting ? 0.5 : 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting || !vehicle}
                className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
                style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, opacity: (submitting || !vehicle) ? 0.6 : 1, cursor: submitting ? "wait" : "pointer" }}>
                {submitting ? "Saving…" : "Save changes"}
              </button>
            </div>
          </footer>
        </form>
      </aside>
    </>
  );
}

/* ─── Form primitives ─────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textMuted }}>
        {label}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
      </span>
      {children}
    </label>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textMuted, minWidth: 80 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textPrimary }}>{value}</span>
    </div>
  );
}

function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", height: 36, padding: "0 11px",
        background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8,
        color: T.textPrimary, fontFamily: "var(--font-body)", fontSize: 13, outline: "none",
      }}
      onFocus={e => (e.currentTarget.style.borderColor = T.teal)}
      onBlur={e => (e.currentTarget.style.borderColor = T.border)}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", height: 36, padding: "0 11px",
        background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8,
        color: T.textPrimary, fontFamily: "var(--font-body)", fontSize: 13, outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%238492A8' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center", paddingRight: 28,
      }}
    >
      {options.map(o => (
        <option key={o} value={o} style={{ background: T.bgInput }}>{labelize(o)}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, onLabel, offLabel }: {
  checked: boolean; onChange: (v: boolean) => void; onLabel: string; offLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="rounded-[8px] hover:opacity-80"
      style={{
        height: 36, padding: "0 14px",
        background: checked ? T.tealBg : T.bgInput,
        border: `1px solid ${checked ? T.teal : T.border}`,
        color: checked ? T.teal200 : T.textMuted,
        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, textAlign: "left",
      }}
    >
      {checked ? onLabel : offLabel}
    </button>
  );
}
