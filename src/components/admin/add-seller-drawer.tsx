"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  amber:       "#F5A623",
};

interface ConvertibleLead {
  id: string;
  seller: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  location: string | null;
  askingPriceGbp: number | null;
}

interface AddSellerDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface SellerForm {
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  postcode: string;
  source: string;
  password: string;
  sendInviteEmail: boolean;
  requirePasswordChange: boolean;
}

const EMPTY: SellerForm = {
  leadId: "",
  firstName: "", lastName: "",
  email: "", phone: "",
  addressLine1: "", city: "", postcode: "",
  source: "autotrader",
  password: "",
  sendInviteEmail: true,
  requirePasswordChange: true,
};

const SOURCES = ["autotrader", "direct", "referral", "other"];

const labelize = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export function AddSellerDrawer({ open, onClose, onCreated }: AddSellerDrawerProps) {
  const [form, setForm] = useState<SellerForm>(EMPTY);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [leads, setLeads] = useState<ConvertibleLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cancel = () => {
    setForm(EMPTY);
    setSearch("");
    setError(null);
    setAgreementFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cancel(); };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => setMounted(true));

    // Load leads from the database every time the drawer opens.
    let cancelled = false;
    setLeadsLoading(true);
    fetch("/api/admin/leads")
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setLeads(data.leads ?? []); })
      .catch(err => { if (!cancelled) console.error("[AddSellerDrawer] fetch leads failed:", err); })
      .finally(() => { if (!cancelled) setLeadsLoading(false); });

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads.slice(0, 12);
    const q = search.toLowerCase();
    return leads.filter(l =>
      l.seller.toLowerCase().includes(q) ||
      (l.vehicleMake?.toLowerCase().includes(q) ?? false) ||
      (l.vehicleModel?.toLowerCase().includes(q) ?? false) ||
      (l.location?.toLowerCase().includes(q) ?? false)
    ).slice(0, 12);
  }, [leads, search]);

  if (!open) return null;

  const update = <K extends keyof SellerForm>(key: K, value: SellerForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const pickLead = (lead: ConvertibleLead) => {
    setForm(prev => ({
      ...prev,
      leadId: lead.id,
      firstName: lead.firstName || prev.firstName,
      lastName: lead.lastName || prev.lastName,
      email: lead.email || prev.email,
      phone: lead.phone || prev.phone,
      city: lead.location || prev.city,
    }));
    setSearch("");
  };

  const clearLead = () => setForm(prev => ({ ...prev, leadId: "" }));

  const pickedLead = leads.find(l => l.id === form.leadId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leadId) { setError("Pick a lead to convert."); return; }
    if (!form.firstName || !form.lastName) { setError("First and last name are required."); return; }
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!agreementFile) { setError("Upload the signed consignment agreement (PDF) before saving."); return; }
    if (agreementFile.type !== "application/pdf") { setError("The agreement must be a PDF file."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, typeof v === "boolean" ? (v ? "true" : "false") : String(v));
      });
      fd.append("agreement", agreementFile, agreementFile.name);
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        body: fd, // browser sets multipart Content-Type with correct boundary
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
      <aside role="dialog" aria-label="Add seller"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, maxWidth: "100vw", background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 61, display: "flex", flexDirection: "column", transform: mounted ? "translateX(0)" : "translateX(100%)", transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)" }}>
        <header className="flex items-center justify-between px-5"
          style={{ height: 58, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Add seller</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>Convert a lead and create login credentials</div>
          </div>
          <button onClick={cancel} aria-label="Close"
            className="rounded-[8px] hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: 18, lineHeight: 1 }}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            <Section title="Source lead">
              {pickedLead ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: T.bgSection, border: `1px solid ${T.teal}`, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>{pickedLead.seller}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                      {[pickedLead.vehicleYear, pickedLead.vehicleMake, pickedLead.vehicleModel].filter(Boolean).join(" ") || "Vehicle —"}
                      {pickedLead.location ? ` · ${pickedLead.location}` : ""}
                      {pickedLead.askingPriceGbp ? ` · £${pickedLead.askingPriceGbp.toLocaleString()}` : ""}
                    </div>
                  </div>
                  <button type="button" onClick={clearLead}
                    style={{ background: "transparent", color: T.textMuted, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600 }}>Change</button>
                </div>
              ) : (
                <>
                  <Field label="Pick a lead to convert" required>
                    <Input value={search} onChange={setSearch} placeholder="Search by seller name, make/model, or location" />
                  </Field>
                  <div style={{ maxHeight: 230, overflowY: "auto", border: `1px solid ${T.border}`, borderRadius: 8, marginTop: -2 }}>
                    {leadsLoading ? (
                      <div style={{ padding: 14, fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted, textAlign: "center" }}>Loading leads…</div>
                    ) : filteredLeads.length === 0 ? (
                      <div style={{ padding: 14, fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted, textAlign: "center" }}>
                        {leads.length === 0 ? "No leads in the database yet" : "No matching leads"}
                      </div>
                    ) : filteredLeads.map(l => (
                      <button key={l.id} type="button" onClick={() => pickLead(l)}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "9px 12px",
                          borderBottom: `1px solid ${T.border2}`,
                          background: "transparent",
                          fontFamily: "var(--font-body)", fontSize: 12, color: T.textPrimary,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = T.bgSection)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ fontWeight: 700 }}>{l.seller}</span>
                        <span style={{ color: T.textMuted, marginLeft: 6 }}>
                          · {[l.vehicleYear, l.vehicleMake, l.vehicleModel].filter(Boolean).join(" ") || "—"}
                        </span>
                        <span style={{ color: T.textDim, marginLeft: 6, fontSize: 11 }}>
                          {l.location || ""}{l.askingPriceGbp ? ` · £${l.askingPriceGbp.toLocaleString()}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Section>

            <Section title="Seller details">
              <Row>
                <Field label="First name" required>
                  <Input value={form.firstName} onChange={v => update("firstName", v)} />
                </Field>
                <Field label="Last name" required>
                  <Input value={form.lastName} onChange={v => update("lastName", v)} />
                </Field>
              </Row>
              <Field label="Phone" required>
                <Input value={form.phone} onChange={v => update("phone", v)} placeholder="+447700900123" type="tel" />
              </Field>
              <Field label="Address line 1">
                <Input value={form.addressLine1} onChange={v => update("addressLine1", v)} placeholder="12 Main St" />
              </Field>
              <Row>
                <Field label="City">
                  <Input value={form.city} onChange={v => update("city", v)} />
                </Field>
                <Field label="Postcode">
                  <Input value={form.postcode} onChange={v => update("postcode", v)} placeholder="B12 9AA" />
                </Field>
              </Row>
              <Field label="Source">
                <Select value={form.source} onChange={v => update("source", v)} options={SOURCES} />
              </Field>
            </Section>

            <Section title="Login credentials">
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: -4, marginBottom: 4 }}>
                Creates a User account (role: seller) and SellerProfile. The seller will use this email + password to sign in.
              </div>
              <Field label="Email" required>
                <Input value={form.email} onChange={v => update("email", v)} type="email" placeholder="seller@example.com" />
              </Field>
              <Field label="Temporary password" required>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ flex: 1 }}>
                    <Input value={form.password} onChange={v => update("password", v)} type={showPassword ? "text" : "password"} placeholder="Generate or type" />
                  </div>
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="rounded-[8px] hover:opacity-80"
                    style={{ height: 36, padding: "0 10px", background: T.bgSection, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <button type="button" onClick={() => { update("password", generatePassword()); setShowPassword(true); }}
                    className="rounded-[8px] hover:opacity-80"
                    style={{ height: 36, padding: "0 10px", background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11 }}>
                    Generate
                  </button>
                </div>
              </Field>
              <CheckboxRow checked={form.sendInviteEmail} onChange={v => update("sendInviteEmail", v)}
                label="Email these credentials to the seller" />
              <CheckboxRow checked={form.requirePasswordChange} onChange={v => update("requirePasswordChange", v)}
                label="Force password change on first login" />
            </Section>

            <Section title="Consignment agreement">
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: -4, marginBottom: 4 }}>
                Required. Upload the signed PDF of the consignment agreement before completing the conversion.
              </div>
              <Field label="Signed agreement (PDF)" required>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={e => {
                    const f = e.target.files?.[0] || null;
                    setAgreementFile(f);
                    if (f && error) setError(null);
                  }}
                  style={{ display: "none" }}
                />
                {agreementFile ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    background: T.bgSection,
                    border: `1px solid ${T.teal}`,
                    borderRadius: 8,
                  }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 6,
                      background: T.tealBg, color: T.teal200,
                      fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 9,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>PDF</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                        color: T.textPrimary,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{agreementFile.name}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>
                        {(agreementFile.size / 1024).toFixed(0)} KB · uploaded
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAgreementFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      style={{
                        background: "transparent",
                        color: T.textMuted,
                        fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
                      }}>Remove</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      height: 64, width: "100%",
                      background: T.bgInput,
                      border: `1px dashed ${T.border}`,
                      borderRadius: 8,
                      color: T.textMuted,
                      fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                      cursor: "pointer",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 2,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.teal; e.currentTarget.style.color = T.teal200; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                    <span>Click to upload PDF</span>
                  </button>
                )}
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
                {submitting ? "Creating…" : "Create seller account"}
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

function CheckboxRow({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "4px 0" }}>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: 18, height: 18, borderRadius: 4,
          background: checked ? T.tealBg : T.bgInput,
          border: `1.5px solid ${checked ? T.teal : T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          color: T.teal200, fontSize: 12, fontWeight: 900, lineHeight: 1,
        }}
      >{checked ? "✓" : ""}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textSecondary }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} style={{ display: "none" }} />
    </label>
  );
}
