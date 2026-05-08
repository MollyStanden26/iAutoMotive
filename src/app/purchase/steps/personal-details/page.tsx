"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ProfileData {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  nameSuffix: string | null;
  militaryStatus: string | null;
  maritalStatus: string | null;
  homeownershipStatus: string | null;
  phone: string | null;
  email: string;
}

const SUFFIXES = ["", "Jr.", "Sr.", "II", "III", "IV"];

export default function PersonalDetailsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const vehicleId = search.get("vehicleId");

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [noMiddle, setNoMiddle] = useState(false);
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [phone, setPhone] = useState("");
  const [militaryStatus, setMilitaryStatus] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [homeownershipStatus, setHomeownershipStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/buyer/profile", { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(({ profile }: { profile: ProfileData }) => {
        if (cancelled) return;
        setFirstName(profile.firstName ?? "");
        setMiddleName(profile.middleName ?? "");
        setNoMiddle(!profile.middleName && (profile.firstName || profile.lastName) ? false : false);
        setLastName(profile.lastName ?? "");
        setSuffix(profile.nameSuffix ?? "");
        setPhone(profile.phone ?? "");
        setMilitaryStatus(profile.militaryStatus ?? "");
        setMaritalStatus(profile.maritalStatus ?? "");
        setHomeownershipStatus(profile.homeownershipStatus ?? "");
      })
      .catch(err => setError(err instanceof Error ? err.message : "Could not load profile"))
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!firstName.trim() || !lastName.trim()) { setError("First and last name are required"); return; }
    if (!noMiddle && !middleName.trim()) { setError("Enter your middle name or check 'No middle name on licence'"); return; }
    if (!phone.trim()) { setError("Mobile number is required"); return; }
    if (!militaryStatus) { setError("Pick a military status"); return; }
    if (!maritalStatus)  { setError("Pick a marital status"); return; }
    if (!homeownershipStatus) { setError("Pick a homeownership status"); return; }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/buyer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: noMiddle ? "" : middleName.trim(),
          lastName: lastName.trim(),
          nameSuffix: suffix,
          phone: phone.trim(),
          militaryStatus,
          maritalStatus,
          homeownershipStatus,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      const next = vehicleId
        ? `/purchase/steps/trade-in?vehicleId=${vehicleId}`
        : `/purchase/steps/trade-in`;
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#94A3B8" }}>Loading…</div>;
  }

  return (
    <form onSubmit={handleNext} style={{ maxWidth: 720 }}>
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 28,
        color: "#0D1525", marginBottom: 28,
      }}>Personal details</h1>

      <Section title="Name and number" subtitle="Name must match your driving licence.">
        <Input label="First name" value={firstName} onChange={setFirstName} required />
        <Input label="Middle name" value={middleName} onChange={setMiddleName} disabled={noMiddle} required={!noMiddle} />
        <label style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 14px", border: "1px solid #E2E8F0", borderRadius: 12,
          fontFamily: "var(--font-body)", fontSize: 14, color: "#334155",
          cursor: "pointer", marginTop: 4,
        }}>
          <input type="checkbox" checked={noMiddle} onChange={e => {
            setNoMiddle(e.target.checked);
            if (e.target.checked) setMiddleName("");
          }} />
          No middle name on licence
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12, marginTop: 12 }}>
          <Input label="Last name" value={lastName} onChange={setLastName} required />
          <SelectField label="Suffix" value={suffix} onChange={setSuffix}
            options={SUFFIXES.map(s => ({ value: s, label: s || "—" }))} />
        </div>
        <Input label="Mobile number" value={phone} onChange={setPhone} type="tel"
          placeholder="07700 900000" required />
      </Section>

      <RadioGroup
        title="Military status" required
        value={militaryStatus} onChange={setMilitaryStatus}
        options={[
          { value: "none",    label: "None" },
          { value: "active",  label: "Active" },
          { value: "veteran", label: "Veteran" },
        ]}
      />

      <RadioGroup
        title="Marital status" required
        value={maritalStatus} onChange={setMaritalStatus}
        options={[
          { value: "married", label: "Married" },
          { value: "single",  label: "Single" },
          { value: "widowed", label: "Widowed" },
        ]}
      />

      <RadioGroup
        title="Homeownership status" required
        value={homeownershipStatus} onChange={setHomeownershipStatus}
        options={[
          { value: "own",  label: "Own" },
          { value: "rent", label: "Rent" },
        ]}
      />

      {error && (
        <div style={{
          marginTop: 16, padding: "10px 14px",
          background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 12,
          fontFamily: "var(--font-body)", fontSize: 13, color: "#991B1B",
        }}>{error}</div>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          marginTop: 28, height: 52,
          padding: "0 56px", borderRadius: 9999,
          background: "#008C7C", color: "#FFFFFF", border: "none",
          fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
          cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
        }}
      >{saving ? "Saving…" : "Next"}</button>
    </form>
  );
}

/* ── primitives ───────────────────────────────────────────────── */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16, color: "#0D1525", marginBottom: 4 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#64748B", marginTop: 0, marginBottom: 16 }}>
          {subtitle}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", placeholder, required, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <label style={{ position: "relative", display: "block" }}>
      <span style={{
        position: "absolute", top: 8, left: 14,
        fontFamily: "var(--font-body)", fontSize: 11, color: "#64748B",
      }}>
        {label}{required && "*"}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%", height: 56, padding: "22px 14px 8px",
          background: disabled ? "#F1F5F9" : "#FFFFFF",
          border: "1px solid #CBD5E1", borderRadius: 12,
          fontFamily: "var(--font-body)", fontSize: 15, color: "#0D1525",
          outline: "none",
        }}
      />
    </label>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label style={{ position: "relative", display: "block" }}>
      <span style={{
        position: "absolute", top: 8, left: 14,
        fontFamily: "var(--font-body)", fontSize: 11, color: "#64748B",
      }}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", height: 56, padding: "22px 14px 8px",
          background: "#FFFFFF",
          border: "1px solid #CBD5E1", borderRadius: 12,
          fontFamily: "var(--font-body)", fontSize: 15, color: "#0D1525",
          appearance: "none", outline: "none",
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2364748B' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function RadioGroup({
  title, value, onChange, options, required,
}: {
  title: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, color: "#0D1525", marginBottom: 12 }}>
        {title}{required && "*"}
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {options.map(o => {
          const selected = value === o.value;
          return (
            <label key={o.value} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 9999,
              border: `1px solid ${selected ? "#008C7C" : "#CBD5E1"}`,
              background: selected ? "#E0FAF5" : "#FFFFFF",
              cursor: "pointer",
            }}>
              <input
                type="radio"
                name={title}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                style={{ accentColor: "#008C7C" }}
              />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#0D1525" }}>{o.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
