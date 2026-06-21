"use client";

import { useEffect, useState } from "react";

const T = {
  bgPanel: "#0D1525", bgInput: "#0B111E", bgSection: "#111D30", border: "#1E2D4A",
  textPrimary: "#F1F5F9", textSecondary: "#8492A8", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7", tealBg: "#0A2A26", green: "#34D399", greenBg: "#0B2B1A",
  red: "#F87171",
};

export interface StaffEdit {
  id: string; firstName: string; lastName: string; email: string; role: string;
  lotId: string | null; dailyCallTarget: number | null; weeklyConversionTarget: number | null;
  isRemote: boolean; hireDate: string | null;
}

interface AddStaffDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  /** When set, the drawer edits this existing staff member instead of creating one. */
  staff?: StaffEdit | null;
}

interface StaffForm {
  firstName: string; lastName: string; email: string; role: string;
  lotId: string; dailyCallTarget: string; weeklyConversionTarget: string;
  isRemote: boolean; hireDate: string;
}

const EMPTY: StaffForm = {
  firstName: "", lastName: "", email: "", role: "sales",
  lotId: "", dailyCallTarget: "", weeklyConversionTarget: "", isRemote: false, hireDate: "",
};

const ROLE_OPTIONS = [
  { value: "sales", label: "Sales" },
  { value: "site-manager", label: "Site manager" },
  { value: "finance", label: "Finance" },
  { value: "recon-tech", label: "Recon tech" },
  { value: "compliance", label: "Compliance" },
  { value: "read-only", label: "Read only" },
];

interface CreatedStaff { name: string; email: string; tempPassword: string; role: string; }

export function AddStaffDrawer({ open, onClose, onCreated, staff }: AddStaffDrawerProps) {
  const isEdit = !!staff;
  const [form, setForm] = useState<StaffForm>(EMPTY);
  const [lots, setLots] = useState<{ id: string; name: string; city: string | null }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedStaff | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => { setForm(EMPTY); setError(null); setCreated(null); setCopied(false); };
  const close = () => { reset(); onClose(); };
  const done = () => { onCreated?.(); close(); };

  useEffect(() => {
    if (!open) return;
    setForm(staff
      ? {
          firstName: staff.firstName, lastName: staff.lastName, email: staff.email, role: staff.role,
          lotId: staff.lotId ?? "",
          dailyCallTarget: staff.dailyCallTarget != null ? String(staff.dailyCallTarget) : "",
          weeklyConversionTarget: staff.weeklyConversionTarget != null ? String(staff.weeklyConversionTarget) : "",
          isRemote: staff.isRemote, hireDate: staff.hireDate ? staff.hireDate.slice(0, 10) : "",
        }
      : EMPTY);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => setMounted(true));
    fetch("/api/admin/lots", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : { lots: [] }))
      .then(d => setLots(d.lots ?? []))
      .catch(() => {});
    return () => { window.removeEventListener("keydown", onKey); setMounted(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof StaffForm>(key: K, value: StaffForm[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const isSales = form.role === "sales";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) { setError("First and last name are required."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) { setError("A valid email is required."); return; }
    setSubmitting(true); setError(null);
    try {
      if (isEdit && staff) {
        // Edit mode — PATCH; email isn't changed here.
        const res = await fetch(`/api/admin/staff/${staff.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName, lastName: form.lastName, role: form.role,
            lotId: form.lotId, isRemote: form.isRemote, hireDate: form.hireDate || null,
            dailyCallTarget: isSales ? form.dailyCallTarget : "",
            weeklyConversionTarget: isSales ? form.weeklyConversionTarget : "",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
        onCreated?.(); close();
        return;
      }
      const res = await fetch("/api/admin/staff", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName, lastName: form.lastName, email: form.email, role: form.role,
          lotId: form.lotId || undefined,
          dailyCallTarget: isSales ? form.dailyCallTarget : undefined,
          weeklyConversionTarget: isSales ? form.weeklyConversionTarget : undefined,
          isRemote: form.isRemote, hireDate: form.hireDate || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Create failed (${res.status})`);
      setCreated({ name: data.user.name, email: data.user.email, tempPassword: data.tempPassword, role: data.user.role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = () => {
    if (!created) return;
    navigator.clipboard?.writeText(created.tempPassword).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {});
  };

  return (
    <>
      <div onClick={created ? undefined : close}
        style={{ position: "fixed", inset: 0, background: "rgba(7,13,24,0.6)", backdropFilter: "blur(2px)", zIndex: 60, opacity: mounted ? 1 : 0, transition: "opacity 200ms ease" }} />
      <aside role="dialog" aria-label="Add staff"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, maxWidth: "100vw", background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 61, display: "flex", flexDirection: "column", transform: mounted ? "translateX(0)" : "translateX(100%)", transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)" }}>
        <header className="flex items-center justify-between px-5" style={{ height: 58, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>{created ? "Staff member created" : isEdit ? "Edit staff member" : "Add staff"}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {created ? "Share their sign-in details securely" : isEdit ? "Update this team member's details" : "Create a portal login for a new team member"}
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="rounded-[8px] hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: 18, lineHeight: 1 }}>×</button>
        </header>

        {created ? (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 16, color: T.green, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14 }}>
                ✓ {created.name} added
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textSecondary, marginBottom: 14 }}>
                They can sign in at <span style={{ color: T.teal200 }}>/auth/signin</span> with the details below. Share these securely and ask them to change the password after first sign-in.
              </div>
              <div style={{ background: T.bgSection, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Email</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{created.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Temporary password</div>
                  <div className="flex items-center gap-2">
                    <code style={{ fontSize: 14, fontWeight: 700, color: T.teal200, fontFamily: "monospace", letterSpacing: "0.5px" }}>{created.tempPassword}</code>
                    <button onClick={copyPassword}
                      style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, borderRadius: 7, padding: "3px 10px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 12 }}>
                This password is shown once — it can&apos;t be retrieved later. If lost, you&apos;ll need to reset it.
              </div>
            </div>
            <footer className="flex items-center justify-end gap-2 px-5" style={{ height: 64, borderTop: `1px solid ${T.border}`, background: T.bgPanel, flexShrink: 0 }}>
              <button onClick={done} className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
                style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13 }}>Done</button>
            </footer>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <Section title="Identity">
                <Row>
                  <Field label="First name" required><Input value={form.firstName} onChange={v => update("firstName", v)} /></Field>
                  <Field label="Last name" required><Input value={form.lastName} onChange={v => update("lastName", v)} /></Field>
                </Row>
                <Field label="Email (sign-in)" required>
                  {isEdit
                    ? <div style={{ height: 36, padding: "0 11px", display: "flex", alignItems: "center", background: T.bgSection, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, fontFamily: "var(--font-body)", fontSize: 13 }}>{form.email}</div>
                    : <Input value={form.email} onChange={v => update("email", v)} type="email" placeholder="name@iautomotive.co.uk" />}
                </Field>
                <Field label="Role"><Select value={form.role} onChange={v => update("role", v)} options={ROLE_OPTIONS} /></Field>
              </Section>

              <Section title="Assignment">
                <Field label="Lot">
                  <Select value={form.lotId} onChange={v => update("lotId", v)}
                    options={[{ value: "", label: "— No lot (remote) —" }, ...lots.map(l => ({ value: l.id, label: l.city ? `${l.name} · ${l.city}` : l.name }))]} />
                </Field>
                <Field label="Working style">
                  <div className="flex" style={{ gap: 0 }}>
                    {[{ v: false, l: "On-site" }, { v: true, l: "Remote" }].map((o, i) => {
                      const active = form.isRemote === o.v;
                      return (
                        <button type="button" key={o.l} onClick={() => update("isRemote", o.v)}
                          style={{ padding: "7px 14px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, cursor: "pointer",
                            background: active ? T.tealBg : T.bgInput, color: active ? T.teal200 : T.textMuted,
                            border: `1px solid ${active ? T.teal : T.border}`, borderRadius: i === 0 ? "8px 0 0 8px" : "0 8px 8px 0", marginLeft: i > 0 ? -1 : 0 }}>
                          {o.l}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Hire date"><Input value={form.hireDate} onChange={v => update("hireDate", v)} type="date" /></Field>
              </Section>

              {isSales && (
                <Section title="Targets (optional)">
                  <Row>
                    <Field label="Daily call target"><Input value={form.dailyCallTarget} onChange={v => update("dailyCallTarget", v)} type="number" placeholder="40" /></Field>
                    <Field label="Weekly conversions"><Input value={form.weeklyConversionTarget} onChange={v => update("weeklyConversionTarget", v)} type="number" placeholder="5" /></Field>
                  </Row>
                </Section>
              )}
            </div>

            <footer className="flex items-center gap-2 px-5" style={{ height: 64, borderTop: `1px solid ${T.border}`, background: T.bgPanel, flexShrink: 0 }}>
              {error && <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.red, flex: 1 }}>{error}</span>}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button type="button" onClick={close} disabled={submitting} className="px-4 py-[7px] rounded-[8px] hover:opacity-80"
                  style={{ background: T.bgSection, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: T.textSecondary, opacity: submitting ? 0.5 : 1 }}>Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
                  style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, opacity: submitting ? 0.6 : 1, cursor: submitting ? "wait" : "pointer" }}>
                  {submitting ? "Saving…" : isEdit ? "Save changes" : "Create staff member"}
                </button>
              </div>
            </footer>
          </form>
        )}
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
function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", height: 36, padding: "0 11px", background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textPrimary, fontFamily: "var(--font-body)", fontSize: 13, outline: "none" }}
      onFocus={e => (e.currentTarget.style.borderColor = T.teal)}
      onBlur={e => (e.currentTarget.style.borderColor = T.border)} />
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", height: 36, padding: "0 28px 0 11px", background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textPrimary, fontFamily: "var(--font-body)", fontSize: 13, outline: "none", appearance: "none",
        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%238492A8' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center" }}>
      {options.map(o => <option key={o.value} value={o.value} style={{ background: T.bgInput }}>{o.label}</option>)}
    </select>
  );
}
