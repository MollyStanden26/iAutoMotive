"use client";

import { useEffect, useRef, useState } from "react";

const T = {
  bgPanel:     "#0D1525",
  bgInput:     "#0B111E",
  bgSection:   "#111D30",
  border:      "#1E2D4A",
  border2:     "#0F1828",
  textPrimary: "#F1F5F9",
  textSecondary: "#8492A8",
  textMuted:   "#6B7A90",
  textDim:     "#4A556B",
  teal:        "#008C7C",
  teal200:     "#4DD9C7",
  tealBg:      "#0A2A26",
  red:         "#F87171",
};

interface AddVehicleDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type PhotoSlotKey = "front_34" | "rear" | "interior" | "driver_side" | "dashboard";

interface PhotoEntry {
  file: File;
  url: string;
  category: string;
}

interface VehicleForm {
  registration: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  exteriorColour: string;
  owners: string;
  hpiClear: boolean;
  conditionGrade: string;
  serviceHistory: string;
  listingPriceGbp: string;
  floorPriceGbp: string;
  lot: string;
  stage: string;
  sellerId: string;
  slotPhotos: Partial<Record<PhotoSlotKey, PhotoEntry>>;
  extraPhotos: PhotoEntry[];
  hpiCertificate: File | null;
  conditionReport: File | null;
  v5cLogbook: File | null;
}

type VehicleDocKey = "hpiCertificate" | "conditionReport" | "v5cLogbook";

const VEHICLE_DOCS: { key: VehicleDocKey; label: string; description: string }[] = [
  { key: "hpiCertificate", label: "HPI check certificate", description: "Confirms no outstanding finance, theft, or write-off." },
  { key: "conditionReport", label: "Condition report",     description: "Inspector grading + photo annotations." },
  { key: "v5cLogbook",      label: "V5C logbook",          description: "DVLA registration document for the vehicle." },
];

interface SellerVehicleSnapshot {
  registration: string;
  year: number | null;
  make: string;
  model: string;
  trim: string;
  mileage: number | null;
  askingPriceGbp: number | null;
  bodyType: string;
  fuelType: string;
  transmission: string;
  location: string;
}

interface SellerOption {
  id: string;
  email: string;
  name: string;
  vehicle: SellerVehicleSnapshot | null;
}

const SLOTS: { key: PhotoSlotKey; label: string; category: string }[] = [
  { key: "front_34",    label: "Front 3/4 (hero)", category: "exterior_front_34" },
  { key: "rear",        label: "Rear",             category: "exterior_rear_34" },
  { key: "interior",    label: "Interior",         category: "interior_driver_seat" },
  { key: "driver_side", label: "Driver side",      category: "exterior_driver_side" },
  { key: "dashboard",   label: "Dashboard",        category: "dashboard" },
];

const EMPTY: VehicleForm = {
  registration: "", year: "", make: "", model: "", trim: "",
  mileage: "", fuelType: "petrol", transmission: "manual", bodyType: "hatchback",
  exteriorColour: "", owners: "1", hpiClear: false,
  conditionGrade: "good", serviceHistory: "full",
  listingPriceGbp: "", floorPriceGbp: "",
  lot: "Lot 1 Birmingham", stage: "offer_accepted",
  sellerId: "",
  slotPhotos: {}, extraPhotos: [],
  hpiCertificate: null, conditionReport: null, v5cLogbook: null,
};

const FUEL_TYPES   = ["petrol", "diesel", "hybrid", "plugin_hybrid", "electric", "mild_hybrid"];
const TRANSMISSIONS = ["manual", "automatic", "semi_automatic", "cvt"];
const BODY_TYPES   = ["hatchback", "saloon", "estate", "suv", "coupe", "convertible", "mpv", "pickup", "van"];
const CONDITIONS   = ["excellent", "good", "fair", "below_average"];
const SERVICE      = ["full", "partial", "none"];
const LOTS_LIST    = ["Lot 1 Birmingham", "Lot 2 Manchester", "Lot 3 Bristol"];
const STAGES       = [
  "offer_accepted", "collected", "inspecting", "in_mechanical",
  "in_body_paint", "in_detail", "in_photography", "listing_ready", "live",
];

const labelize = (v: string) =>
  v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

/**
 * Try to map a free-text value (from a scraped lead) onto one of the enum
 * options the drawer's Select expects. Returns null if no clean match.
 */
function matchEnum(value: string | null | undefined, options: string[]): string | null {
  if (!value) return null;
  const normalised = value.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (options.includes(normalised)) return normalised;
  // Common alias mappings for fuel/transmission/body
  const aliases: Record<string, string> = {
    "plug_in_hybrid": "plugin_hybrid",
    "plug-in_hybrid": "plugin_hybrid",
    "phev": "plugin_hybrid",
    "ev": "electric",
    "automatic_dsg": "automatic",
    "auto": "automatic",
    "manual_gearbox": "manual",
    "semi-automatic": "semi_automatic",
    "saloon_car": "saloon",
    "sedan": "saloon",
  };
  if (aliases[normalised] && options.includes(aliases[normalised])) {
    return aliases[normalised];
  }
  return null;
}

export function AddVehicleDrawer({ open, onClose, onCreated }: AddVehicleDrawerProps) {
  const [form, setForm] = useState<VehicleForm>(EMPTY);
  const [mounted, setMounted] = useState(false);
  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleCancel(); };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => setMounted(true));

    let cancelled = false;
    setSellersLoading(true);
    fetch("/api/admin/sellers")
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setSellers(data.sellers ?? []); })
      .catch(err => { if (!cancelled) console.error("[AddVehicleDrawer] fetch sellers failed:", err); })
      .finally(() => { if (!cancelled) setSellersLoading(false); });

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof VehicleForm>(key: K, value: VehicleForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSellerPick = (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    setForm(prev => {
      const next: VehicleForm = { ...prev, sellerId };
      const v = seller?.vehicle;
      if (v) {
        // Only overwrite a field if it's empty/default — never clobber what
        // the admin has already typed.
        const isEmpty = (val: string) => !val || val.trim() === "";
        if (isEmpty(prev.registration) && v.registration) next.registration = v.registration;
        if (isEmpty(prev.year) && v.year != null) next.year = String(v.year);
        if (isEmpty(prev.make) && v.make) next.make = v.make;
        if (isEmpty(prev.model) && v.model) next.model = v.model;
        if (isEmpty(prev.trim) && v.trim) next.trim = v.trim;
        if (isEmpty(prev.mileage) && v.mileage != null) next.mileage = String(v.mileage);
        if (isEmpty(prev.listingPriceGbp) && v.askingPriceGbp != null) next.listingPriceGbp = String(v.askingPriceGbp);
        const fuel = matchEnum(v.fuelType, FUEL_TYPES);
        if (fuel && prev.fuelType === EMPTY.fuelType) next.fuelType = fuel;
        const trans = matchEnum(v.transmission, TRANSMISSIONS);
        if (trans && prev.transmission === EMPTY.transmission) next.transmission = trans;
        const body = matchEnum(v.bodyType, BODY_TYPES);
        if (body && prev.bodyType === EMPTY.bodyType) next.bodyType = body;
      }
      return next;
    });
  };

  const revokeAllPhotoUrls = (f: VehicleForm) => {
    Object.values(f.slotPhotos).forEach(p => p && URL.revokeObjectURL(p.url));
    f.extraPhotos.forEach(p => URL.revokeObjectURL(p.url));
  };

  const setSlotPhoto = (key: PhotoSlotKey, file: File) => {
    setForm(prev => {
      const existing = prev.slotPhotos[key];
      if (existing) URL.revokeObjectURL(existing.url);
      const slot = SLOTS.find(s => s.key === key)!;
      return {
        ...prev,
        slotPhotos: {
          ...prev.slotPhotos,
          [key]: { file, url: URL.createObjectURL(file), category: slot.category },
        },
      };
    });
  };

  const removeSlotPhoto = (key: PhotoSlotKey) => {
    setForm(prev => {
      const existing = prev.slotPhotos[key];
      if (existing) URL.revokeObjectURL(existing.url);
      const next = { ...prev.slotPhotos };
      delete next[key];
      return { ...prev, slotPhotos: next };
    });
  };

  const addExtraPhotos = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!arr.length) return;
    setForm(prev => ({
      ...prev,
      extraPhotos: [
        ...prev.extraPhotos,
        ...arr.map(file => ({ file, url: URL.createObjectURL(file), category: "exterior_front_34" })),
      ],
    }));
  };

  const removeExtraPhoto = (idx: number) => {
    setForm(prev => {
      const photo = prev.extraPhotos[idx];
      if (photo) URL.revokeObjectURL(photo.url);
      return { ...prev, extraPhotos: prev.extraPhotos.filter((_, i) => i !== idx) };
    });
  };

  const setVehicleDoc = (key: VehicleDocKey, file: File | null) => {
    setForm(prev => ({ ...prev, [key]: file }));
    if (file && submitError) setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sellerId) { setSubmitError("Pick a seller before saving."); return; }

    const missingPhotos = SLOTS.filter(s => !form.slotPhotos[s.key]);
    if (missingPhotos.length) {
      setSubmitError(
        `Photos required: ${missingPhotos.map(s => s.label.replace(" (hero)", "")).join(", ")}.`
      );
      return;
    }

    const missingDocs = VEHICLE_DOCS.filter(d => !form[d.key]);
    if (missingDocs.length) {
      setSubmitError(`Required document missing: ${missingDocs.map(d => d.label).join(", ")}.`);
      return;
    }
    const nonPdfDoc = VEHICLE_DOCS.find(d => {
      const f = form[d.key] as File | null;
      return f && f.type !== "application/pdf";
    });
    if (nonPdfDoc) { setSubmitError(`${nonPdfDoc.label} must be a PDF file.`); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      // Scalar/text fields. Skip the file collections — they go in below.
      const skip = new Set(["slotPhotos", "extraPhotos", "hpiCertificate", "conditionReport", "v5cLogbook"]);
      Object.entries(form).forEach(([k, v]) => {
        if (skip.has(k)) return;
        if (v == null) return;
        fd.append(k, typeof v === "boolean" ? (v ? "true" : "false") : String(v));
      });
      // Named photos
      for (const slot of SLOTS) {
        const p = form.slotPhotos[slot.key];
        if (p) fd.append(`photo_${slot.key}`, p.file, p.file.name);
      }
      // Extras
      form.extraPhotos.forEach(p => fd.append("photo_extra", p.file, p.file.name));
      // Required PDFs
      VEHICLE_DOCS.forEach(d => {
        const f = form[d.key] as File | null;
        if (f) fd.append(d.key, f, f.name);
      });

      const res = await fetch("/api/admin/vehicles", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Save failed (${res.status})`);
      }
      onCreated?.();
      revokeAllPhotoUrls(form);
      setForm(EMPTY);
      setSubmitError(null);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    revokeAllPhotoUrls(form);
    setForm(EMPTY);
    setSubmitError(null);
    onClose();
  };

  return (
    <>
      <div
        onClick={handleCancel}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(7, 13, 24, 0.6)",
          backdropFilter: "blur(2px)",
          zIndex: 60,
          opacity: mounted ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      />
      <aside
        role="dialog"
        aria-label="Add vehicle"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: 480, maxWidth: "100vw",
          background: T.bgPanel,
          borderLeft: `1px solid ${T.border}`,
          zIndex: 61,
          display: "flex", flexDirection: "column",
          transform: mounted ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)",
          boxShadow: "-20px 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <header className="flex items-center justify-between px-5"
          style={{ height: 58, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Add vehicle</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>Intake a new consignment</div>
          </div>
          <button onClick={handleCancel} aria-label="Close"
            className="rounded-[8px] hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: 18, lineHeight: 1 }}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            <Section title="Seller">
              <Field label="Seller" required>
                <select
                  value={form.sellerId}
                  onChange={e => handleSellerPick(e.target.value)}
                  disabled={sellersLoading}
                  style={{
                    width: "100%", height: 36, padding: "0 11px",
                    background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8,
                    color: form.sellerId ? T.textPrimary : T.textMuted,
                    fontFamily: "var(--font-body)", fontSize: 13, outline: "none",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%238492A8' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center", paddingRight: 28,
                    cursor: sellersLoading ? "wait" : "pointer",
                  }}
                >
                  <option value="" disabled style={{ background: T.bgInput }}>
                    {sellersLoading ? "Loading sellers…" : sellers.length === 0 ? "No sellers in the database" : "Select a seller"}
                  </option>
                  {sellers.map(s => (
                    <option key={s.id} value={s.id} style={{ background: T.bgInput }}>
                      {s.name} — {s.email}
                    </option>
                  ))}
                </select>
              </Field>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: -4 }}>
                Pick the seller this consignment belongs to. Convert a lead first if the seller doesn&rsquo;t exist yet.
              </p>
            </Section>

            <Section title="Vehicle details">
              <Row>
                <Field label="Registration" required>
                  <Input value={form.registration} onChange={v => update("registration", v.toUpperCase())} placeholder="AB21 XYZ" />
                </Field>
                <Field label="Year" required>
                  <Input value={form.year} onChange={v => update("year", v)} placeholder="2021" type="number" />
                </Field>
              </Row>
              <Row>
                <Field label="Make" required>
                  <Input value={form.make} onChange={v => update("make", v)} placeholder="Volkswagen" />
                </Field>
                <Field label="Model" required>
                  <Input value={form.model} onChange={v => update("model", v)} placeholder="Golf" />
                </Field>
              </Row>
              <Field label="Trim / variant">
                <Input value={form.trim} onChange={v => update("trim", v)} placeholder="GTI" />
              </Field>
              <Row>
                <Field label="Mileage" required>
                  <Input value={form.mileage} onChange={v => update("mileage", v)} placeholder="41200" type="number" suffix="mi" />
                </Field>
                <Field label="Owners">
                  <Input value={form.owners} onChange={v => update("owners", v)} type="number" />
                </Field>
              </Row>
              <Row>
                <Field label="Fuel type">
                  <Select value={form.fuelType} onChange={v => update("fuelType", v)} options={FUEL_TYPES} />
                </Field>
                <Field label="Gearbox">
                  <Select value={form.transmission} onChange={v => update("transmission", v)} options={TRANSMISSIONS} />
                </Field>
              </Row>
              <Row>
                <Field label="Body type">
                  <Select value={form.bodyType} onChange={v => update("bodyType", v)} options={BODY_TYPES} />
                </Field>
                <Field label="Colour">
                  <Input value={form.exteriorColour} onChange={v => update("exteriorColour", v)} placeholder="Tornado Red" />
                </Field>
              </Row>
              <Row>
                <Field label="Condition">
                  <Select value={form.conditionGrade} onChange={v => update("conditionGrade", v)} options={CONDITIONS} />
                </Field>
                <Field label="Service history">
                  <Select value={form.serviceHistory} onChange={v => update("serviceHistory", v)} options={SERVICE} />
                </Field>
              </Row>
              <Field label="HPI status">
                <Toggle checked={form.hpiClear} onChange={v => update("hpiClear", v)} onLabel="Clear ✓" offLabel="Check pending" />
              </Field>
            </Section>

            <Section title="Photos">
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: -4, marginBottom: 4 }}>
                These photos appear on the public listing and in the seller&rsquo;s portal. Front 3/4 is used as the listing hero.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {SLOTS.map(slot => (
                  <PhotoSlotTile
                    key={slot.key}
                    label={slot.label}
                    photo={form.slotPhotos[slot.key]}
                    onPick={file => setSlotPhoto(slot.key, file)}
                    onRemove={() => removeSlotPhoto(slot.key)}
                  />
                ))}
                <ExtraPhotoTile
                  count={form.extraPhotos.length}
                  onPick={files => addExtraPhotos(files)}
                />
              </div>
              {form.extraPhotos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 4 }}>
                  {form.extraPhotos.map((p, i) => (
                    <ExtraThumb key={p.url} photo={p} onRemove={() => removeExtraPhoto(i)} />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Vehicle documents">
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: -4, marginBottom: 4 }}>
                All three are required. Uploads sit on the seller&rsquo;s portal and the deal-room.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {VEHICLE_DOCS.map(doc => (
                  <PdfDocRow
                    key={doc.key}
                    label={doc.label}
                    description={doc.description}
                    file={form[doc.key] as File | null}
                    onPick={f => setVehicleDoc(doc.key, f)}
                    onRemove={() => setVehicleDoc(doc.key, null)}
                  />
                ))}
              </div>
            </Section>

            <Section title="Listing & pricing">
              <Row>
                <Field label="Listing price" required>
                  <Input value={form.listingPriceGbp} onChange={v => update("listingPriceGbp", v)} placeholder="21200" type="number" suffix="£" prefix />
                </Field>
                <Field label="Floor price (internal)">
                  <Input value={form.floorPriceGbp} onChange={v => update("floorPriceGbp", v)} placeholder="19500" type="number" suffix="£" prefix />
                </Field>
              </Row>
              <Row>
                <Field label="Lot">
                  <Select value={form.lot} onChange={v => update("lot", v)} options={LOTS_LIST} format={s => s} />
                </Field>
                <Field label="Stage">
                  <Select value={form.stage} onChange={v => update("stage", v)} options={STAGES} />
                </Field>
              </Row>
            </Section>

          </div>

          <footer className="flex items-center gap-2 px-5"
            style={{ height: 64, borderTop: `1px solid ${T.border}`, background: T.bgPanel, flexShrink: 0 }}>
            {submitError && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.red, flex: 1 }}>{submitError}</span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button type="button" onClick={handleCancel} disabled={submitting}
                className="px-4 py-[7px] rounded-[8px] hover:opacity-80"
                style={{ background: T.bgSection, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: T.textSecondary, opacity: submitting ? 0.5 : 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
                style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, opacity: submitting ? 0.6 : 1, cursor: submitting ? "wait" : "pointer" }}>
                {submitting ? "Saving…" : "Save vehicle"}
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

function Input({ value, onChange, placeholder, type = "text", suffix, prefix }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; suffix?: string; prefix?: boolean;
}) {
  const showPrefix = prefix && suffix;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {showPrefix && (
        <span style={{ position: "absolute", left: 11, fontFamily: "var(--font-body)", fontSize: 13, color: T.textMuted, pointerEvents: "none" }}>{suffix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 36,
          padding: showPrefix ? "0 11px 0 24px" : (suffix ? "0 30px 0 11px" : "0 11px"),
          background: T.bgInput,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          color: T.textPrimary,
          fontFamily: "var(--font-body)",
          fontSize: 13,
          outline: "none",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = T.teal)}
        onBlur={e => (e.currentTarget.style.borderColor = T.border)}
      />
      {!showPrefix && suffix && (
        <span style={{ position: "absolute", right: 11, fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, pointerEvents: "none" }}>{suffix}</span>
      )}
    </div>
  );
}

function Select({ value, onChange, options, format = labelize }: {
  value: string; onChange: (v: string) => void; options: string[];
  format?: (v: string) => string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%",
        height: 36,
        padding: "0 11px",
        background: T.bgInput,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        color: T.textPrimary,
        fontFamily: "var(--font-body)",
        fontSize: 13,
        outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%238492A8' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 11px center",
        paddingRight: 28,
      }}
    >
      {options.map(o => (
        <option key={o} value={o} style={{ background: T.bgInput }}>{format(o)}</option>
      ))}
    </select>
  );
}

function PdfDocRow({ label, description, file, onPick, onRemove }: {
  label: string;
  description: string;
  file: File | null;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: file ? T.bgSection : T.bgInput,
        border: `1px ${file ? "solid" : "dashed"} ${file ? T.teal : T.border}`,
        borderRadius: 8,
        cursor: file ? "default" : "pointer",
      }}
      onClick={() => { if (!file) inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }}
      />
      <span style={{
        width: 28, height: 28, borderRadius: 6,
        background: file ? T.tealBg : T.bgRow,
        color: file ? T.teal200 : T.textDim,
        fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 9,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>PDF</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textPrimary,
        }}>
          {label}
          <span style={{ color: T.red, fontWeight: 700 }}>*</span>
        </div>
        <div style={{
          fontFamily: "var(--font-body)", fontSize: 10,
          color: file ? T.teal200 : T.textMuted,
          marginTop: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {file
            ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB`
            : description}
        </div>
      </div>
      {file ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            background: "transparent", color: T.textMuted,
            fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
          }}>Remove</button>
      ) : (
        <span style={{ color: T.textMuted, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600 }}>Upload</span>
      )}
    </div>
  );
}

function PhotoSlotTile({ label, photo, onPick, onRemove }: {
  label: string;
  photo: PhotoEntry | undefined;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const filled = !!photo;
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "4 / 3",
        background: filled ? "transparent" : T.bgInput,
        border: `1px ${filled ? "solid" : "dashed"} ${filled ? T.teal : T.border}`,
        borderRadius: 8,
        overflow: "hidden",
        cursor: filled ? "default" : "pointer",
      }}
      onClick={() => { if (!filled) inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }}
      />
      {filled ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo!.url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            aria-label={`Remove ${label}`}
            style={{
              position: "absolute", top: 5, right: 5,
              width: 22, height: 22, borderRadius: 999,
              background: "rgba(7,13,24,0.8)",
              color: T.textPrimary, fontSize: 14, lineHeight: 1,
              border: `1px solid ${T.border}`,
            }}
          >×</button>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "4px 6px",
            background: "linear-gradient(transparent, rgba(7,13,24,0.85))",
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10,
            color: T.textPrimary, letterSpacing: "0.04em",
          }}>{label}</div>
        </>
      ) : (
        <div style={{
          height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 4,
        }}>
          <span style={{ fontSize: 18, color: T.textDim }}>+</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, color: T.textMuted, textAlign: "center", letterSpacing: "0.04em", padding: "0 4px" }}>{label}</span>
        </div>
      )}
    </div>
  );
}

function ExtraPhotoTile({ count, onPick }: {
  count: number;
  onPick: (files: FileList) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={e => {
        e.preventDefault();
        setHover(false);
        if (e.dataTransfer.files.length) onPick(e.dataTransfer.files);
      }}
      style={{
        aspectRatio: "4 / 3",
        background: hover ? T.tealBg : T.bgInput,
        border: `1px dashed ${hover ? T.teal : T.border}`,
        borderRadius: 8,
        cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
        textAlign: "center",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => { if (e.target.files?.length) onPick(e.target.files); e.target.value = ""; }}
      />
      <span style={{ fontSize: 18, color: hover ? T.teal200 : T.textDim }}>+</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, color: hover ? T.teal200 : T.textMuted, letterSpacing: "0.04em", padding: "0 4px" }}>
        {count > 0 ? `Add more (${count})` : "Add more / drop"}
      </span>
    </div>
  );
}

function ExtraThumb({ photo, onRemove }: { photo: PhotoEntry; onRemove: () => void }) {
  return (
    <div style={{
      position: "relative", aspectRatio: "1 / 1",
      borderRadius: 6, overflow: "hidden",
      border: `1px solid ${T.border}`,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        style={{
          position: "absolute", top: 3, right: 3,
          width: 18, height: 18, borderRadius: 999,
          background: "rgba(7,13,24,0.8)", color: T.textPrimary,
          fontSize: 12, lineHeight: 1, border: `1px solid ${T.border}`,
        }}
      >×</button>
    </div>
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
        height: 36,
        padding: "0 14px",
        background: checked ? T.tealBg : T.bgInput,
        border: `1px solid ${checked ? T.teal : T.border}`,
        color: checked ? T.teal200 : T.textMuted,
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: 13,
        textAlign: "left",
      }}
    >
      {checked ? onLabel : offLabel}
    </button>
  );
}
