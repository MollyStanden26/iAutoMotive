"use client";

import { useEffect, useState } from "react";

const T = {
  bgPanel:     "#0D1525",
  bgInput:     "#0B111E",
  bgSection:   "#111D30",
  border:      "#1E2D4A",
  textPrimary: "#F1F5F9",
  textSecondary: "#8492A8",
  textMuted:   "#6B7A90",
  textDim:     "#4A556B",
  teal:        "#008C7C",
  teal200:     "#4DD9C7",
  tealBg:      "#0A2A26",
  red:         "#F87171",
};

interface AddLeadDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface LeadForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicleReg: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleTrim: string;
  vehicleMileage: string;
  askingPriceGbp: string;
  locationPostcode: string;
  source: string;
  listingUrl: string;
  notes: string;
}

const EMPTY: LeadForm = {
  firstName: "", lastName: "",
  phone: "", email: "",
  vehicleReg: "", vehicleYear: "", vehicleMake: "", vehicleModel: "", vehicleTrim: "",
  vehicleMileage: "",
  askingPriceGbp: "",
  locationPostcode: "",
  source: "manual_entry",
  listingUrl: "",
  notes: "",
};

const SOURCES = ["manual_entry", "autotrader", "facebook", "phone_in", "referral", "walk_in", "other"];

const labelize = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export function AddLeadDrawer({ open, onClose, onCreated }: AddLeadDrawerProps) {
  const [form, setForm] = useState<LeadForm>(EMPTY);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => { setForm(EMPTY); setError(null); onClose(); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cancel(); };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => setMounted(true));
    return () => {
      window.removeEventListener("keydown", onKey);
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof LeadForm>(key: K, value: LeadForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.phone) { setError("First name and phone are required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Save failed (${res.status})`);
      }
      onCreated?.();
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
      <aside role="dialog" aria-label="Add lead"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, maxWidth: "100vw", background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 61, display: "flex", flexDirection: "column", transform: mounted ? "translateX(0)" : "translateX(100%)", transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)" }}>
        <header className="flex items-center justify-between px-5"
          style={{ height: 58, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Add lead</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>Capture a manual lead for the CRM pipeline</div>
          </div>
          <button onClick={cancel} aria-label="Close"
            className="rounded-[8px] hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: 18, lineHeight: 1 }}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            <Section title="Contact">
              <Row>
                <Field label="First name" required>
                  <Input value={form.firstName} onChange={v => update("firstName", v)} />
                </Field>
                <Field label="Last name">
                  <Input value={form.lastName} onChange={v => update("lastName", v)} />
                </Field>
              </Row>
              <Row>
                <Field label="Phone" required>
                  <Input value={form.phone} onChange={v => update("phone", v)} placeholder="+447700900123" type="tel" />
                </Field>
                <Field label="Email">
                  <Input value={form.email} onChange={v => update("email", v)} type="email" />
                </Field>
              </Row>
              <Field label="Postcode">
                <Input value={form.locationPostcode} onChange={v => update("locationPostcode", v)} placeholder="B12 9AA" />
              </Field>
            </Section>

            <Section title="Vehicle">
              <Row>
                <Field label="Registration">
                  <Input value={form.vehicleReg} onChange={v => update("vehicleReg", v.toUpperCase())} placeholder="AB21 XYZ" />
                </Field>
                <Field label="Year">
                  <Input value={form.vehicleYear} onChange={v => update("vehicleYear", v)} placeholder="2021" type="number" />
                </Field>
              </Row>
              <Row>
                <Field label="Make">
                  <Input value={form.vehicleMake} onChange={v => update("vehicleMake", v)} placeholder="BMW" />
                </Field>
                <Field label="Model">
                  <Input value={form.vehicleModel} onChange={v => update("vehicleModel", v)} placeholder="3 Series" />
                </Field>
              </Row>
              <Row>
                <Field label="Trim">
                  <Input value={form.vehicleTrim} onChange={v => update("vehicleTrim", v)} placeholder="320i Sport" />
                </Field>
                <Field label="Mileage">
                  <Input value={form.vehicleMileage} onChange={v => update("vehicleMileage", v)} placeholder="45000" type="number" />
                </Field>
              </Row>
              <Field label="Asking price (£)">
                <Input value={form.askingPriceGbp} onChange={v => update("askingPriceGbp", v)} placeholder="18400" type="number" />
              </Field>
            </Section>

            <Section title="Source">
              <Row>
                <Field label="Source">
                  <Select value={form.source} onChange={v => update("source", v)} options={SOURCES} />
                </Field>
                <Field label="Listing URL">
                  <Input value={form.listingUrl} onChange={v => update("listingUrl", v)} placeholder="https://…" />
                </Field>
              </Row>
              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={e => update("notes", e.target.value)}
                  placeholder="Anything the rep should know — context, preferences, urgency."
                  rows={3}
                  style={{
                    width: "100%", padding: "8px 11px", resize: "vertical",
                    background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8,
                    color: T.textPrimary, fontFamily: "var(--font-body)", fontSize: 13, outline: "none",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = T.teal)}
                  onBlur={e => (e.currentTarget.style.borderColor = T.border)}
                />
              </Field>
            </Section>
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
              <button type="submit" disabled={submitting}
                className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
                style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, opacity: submitting ? 0.6 : 1, cursor: submitting ? "wait" : "pointer" }}>
                {submitting ? "Saving…" : "Save lead"}
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

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
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

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
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
