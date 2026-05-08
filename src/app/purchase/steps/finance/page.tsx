"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PreQual {
  vehicleId: string | null;
  dateOfBirth: string | null;
  dependantsCount: number | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postcode: string | null;
  yearsAtAddress: number | null;
  employmentStatus: string | null;
  employerName: string | null;
  occupation: string | null;
  yearsAtEmployer: number | null;
  monthsAtEmployer: number | null;
  annualIncomeGbp: number | null;
  monthlyHousingGbp: number | null;
  monthlyDebtsGbp: number | null;
  depositGbp: number | null;
  termMonths: number | null;
  bankSortCode: string | null;
  bankAccountLast4: string | null;
  marketingConsent: boolean;
  hardCheckConsent: boolean;
}

interface VehicleCtx {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number; // pounds
}

const EMPLOYMENT_OPTIONS = [
  { value: "employed",      label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "retired",       label: "Retired" },
  { value: "student",       label: "Student" },
  { value: "unemployed",    label: "Unemployed" },
  { value: "other",         label: "Other" },
];

const TERM_OPTIONS = [
  { value: 24, label: "24 months" },
  { value: 36, label: "36 months" },
  { value: 48, label: "48 months" },
  { value: 60, label: "60 months" },
  { value: 72, label: "72 months" },
];

/** Indicative rate used for the live monthly-payment estimate. The real rate
 *  comes from the lender after credit check; this just gives the buyer a
 *  feel for how deposit / term affect their monthly while filling the form. */
const INDICATIVE_APR = 0.0999;

function estimateMonthly(vehiclePricePounds: number, depositPounds: number, termMonths: number): number {
  const principal = Math.max(0, vehiclePricePounds - depositPounds);
  if (principal === 0 || termMonths <= 0) return 0;
  const r = INDICATIVE_APR / 12;
  // Standard amortising loan formula
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

const fmtGBP = (pounds: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(pounds);

export default function FinancePage() {
  const router = useRouter();
  const search = useSearchParams();
  const vehicleId = search.get("vehicleId");

  const [vehicle, setVehicle] = useState<VehicleCtx | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state — flat, mirrors PreQual but as the strings/numbers the inputs use.
  const [dob, setDob]                 = useState("");
  const [dependants, setDependants]   = useState("");
  const [addr1, setAddr1]             = useState("");
  const [addr2, setAddr2]             = useState("");
  const [city, setCity]               = useState("");
  const [postcode, setPostcode]       = useState("");
  const [yearsHere, setYearsHere]     = useState("");
  const [empStatus, setEmpStatus]     = useState("");
  const [employer, setEmployer]       = useState("");
  const [occupation, setOccupation]   = useState("");
  const [yearsJob, setYearsJob]       = useState("");
  const [monthsJob, setMonthsJob]     = useState("");
  const [income, setIncome]           = useState(""); // £/year
  const [housing, setHousing]         = useState(""); // £/month
  const [debts, setDebts]             = useState(""); // £/month
  const [deposit, setDeposit]         = useState(""); // £
  const [term, setTerm]               = useState(60); // months
  const [sortCode, setSortCode]       = useState("");
  const [accountLast4, setAccountLast4] = useState("");
  const [marketing, setMarketing]     = useState(false);
  const [hardCheck, setHardCheck]     = useState(false);

  useEffect(() => {
    if (!vehicleId) { setLoaded(true); return; }
    let cancelled = false;
    Promise.all([
      fetch(`/api/vehicles/${vehicleId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/buyer/finance-prequal?vehicleId=${vehicleId}`, { cache: "no-store" })
        .then(r => r.ok ? r.json() : null),
    ])
      .then(([vehResp, prResp]) => {
        if (cancelled) return;
        if (vehResp?.car) {
          setVehicle({
            id: vehResp.car.id, year: vehResp.car.year, make: vehResp.car.make,
            model: vehResp.car.model, price: vehResp.car.price,
          });
        }
        const p: PreQual | undefined = prResp?.prequal;
        if (p) {
          setDob(p.dateOfBirth ?? "");
          setDependants(p.dependantsCount?.toString() ?? "");
          setAddr1(p.addressLine1 ?? "");
          setAddr2(p.addressLine2 ?? "");
          setCity(p.city ?? "");
          setPostcode(p.postcode ?? "");
          setYearsHere(p.yearsAtAddress?.toString() ?? "");
          setEmpStatus(p.employmentStatus ?? "");
          setEmployer(p.employerName ?? "");
          setOccupation(p.occupation ?? "");
          setYearsJob(p.yearsAtEmployer?.toString() ?? "");
          setMonthsJob(p.monthsAtEmployer?.toString() ?? "");
          setIncome(p.annualIncomeGbp != null ? Math.round(p.annualIncomeGbp / 100).toString() : "");
          setHousing(p.monthlyHousingGbp != null ? Math.round(p.monthlyHousingGbp / 100).toString() : "");
          setDebts(p.monthlyDebtsGbp != null ? Math.round(p.monthlyDebtsGbp / 100).toString() : "");
          setDeposit(p.depositGbp != null ? Math.round(p.depositGbp / 100).toString() : "");
          if (p.termMonths) setTerm(p.termMonths);
          setSortCode(p.bankSortCode ?? "");
          setAccountLast4(p.bankAccountLast4 ?? "");
          setMarketing(!!p.marketingConsent);
          setHardCheck(!!p.hardCheckConsent);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [vehicleId]);

  const monthly = useMemo(() => {
    if (!vehicle) return 0;
    const dep = Number(deposit) || 0;
    return estimateMonthly(vehicle.price, dep, term);
  }, [vehicle, deposit, term]);

  const handleSubmit = async (e: React.FormEvent, submitFinal: boolean) => {
    e.preventDefault();
    if (!vehicleId || saving) return;
    if (submitFinal && !hardCheck) {
      setError("Tick the credit-check consent box to submit.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        vehicleId,
        dateOfBirth: dob || null,
        dependantsCount: dependants === "" ? null : Number(dependants),
        addressLine1: addr1 || null,
        addressLine2: addr2 || null,
        city: city || null,
        postcode: postcode || null,
        yearsAtAddress: yearsHere === "" ? null : Number(yearsHere),
        employmentStatus: empStatus || null,
        employerName: employer || null,
        occupation: occupation || null,
        yearsAtEmployer: yearsJob === "" ? null : Number(yearsJob),
        monthsAtEmployer: monthsJob === "" ? null : Number(monthsJob),
        annualIncomeGbp: income === "" ? null : Math.round(Number(income) * 100),
        monthlyHousingGbp: housing === "" ? null : Math.round(Number(housing) * 100),
        monthlyDebtsGbp: debts === "" ? null : Math.round(Number(debts) * 100),
        depositGbp: deposit === "" ? null : Math.round(Number(deposit) * 100),
        termMonths: term,
        bankSortCode: sortCode || null,
        bankAccountLast4: accountLast4 || null,
        marketingConsent: marketing,
        hardCheckConsent: hardCheck,
      };
      if (submitFinal) payload.submit = true;
      const res = await fetch("/api/buyer/finance-prequal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      const next = vehicleId ? `/purchase/steps/delivery-options?vehicleId=${vehicleId}` : "/purchase/steps/delivery-options";
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
  if (!vehicleId) {
    return <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#94A3B8" }}>
      No vehicle attached to this purchase — go back to a listing and click &ldquo;Get started&rdquo;.
    </div>;
  }

  return (
    <form onSubmit={e => handleSubmit(e, true)} style={{ maxWidth: 760 }}>
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 28,
        color: "#0D1525", marginBottom: 6,
      }}>Finance</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#64748B", marginBottom: 28 }}>
        Tell us a few details so we can match you to the best lender on our 40+ lender panel.
        Saving as you go is automatic.
      </p>

      {/* Live payment estimator */}
      {vehicle && (
        <div style={{
          background: "#0D1525", color: "#FFFFFF", borderRadius: 16,
          padding: "20px 24px", marginBottom: 28,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Indicative monthly
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 28, marginTop: 4 }}>
              {monthly > 0 ? fmtGBP(Math.round(monthly)) : "—"}<span style={{ fontSize: 14, fontWeight: 400, color: "#94A3B8" }}> /mo</span>
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
              At {Math.round(INDICATIVE_APR * 1000) / 10}% APR · subject to credit check
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-body)", fontSize: 13 }}>
            <Row k="Vehicle"  v={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
            <Row k="Price"    v={fmtGBP(vehicle.price)} />
            <Row k="Deposit"  v={deposit ? fmtGBP(Number(deposit)) : "—"} />
            <Row k="Term"     v={`${term} months`} />
          </div>
        </div>
      )}

      <Section title="About you">
        <FieldRow>
          <Field label="Date of birth*" value={dob} onChange={setDob} type="date" />
          <Field label="Dependants" value={dependants} onChange={setDependants} type="number" placeholder="0" />
        </FieldRow>
      </Section>

      <Section title="Current address" subtitle="If you've lived here less than 3 years, we'll ask about a previous address next.">
        <Field label="Address line 1*" value={addr1} onChange={setAddr1} />
        <Field label="Address line 2" value={addr2} onChange={setAddr2} />
        <FieldRow>
          <Field label="City*" value={city} onChange={setCity} />
          <Field label="Postcode*" value={postcode} onChange={setPostcode} />
        </FieldRow>
        <Field label="Years at this address*" value={yearsHere} onChange={setYearsHere} type="number" placeholder="3" />
      </Section>

      <Section title="Employment & income">
        <Select label="Employment status*" value={empStatus} onChange={setEmpStatus}
          options={[{ value: "", label: "Select…" }, ...EMPLOYMENT_OPTIONS]} />
        {empStatus === "employed" || empStatus === "self_employed" ? (
          <>
            <FieldRow>
              <Field label="Employer name*" value={employer} onChange={setEmployer} />
              <Field label="Occupation*" value={occupation} onChange={setOccupation} />
            </FieldRow>
            <FieldRow>
              <Field label="Years at employer" value={yearsJob} onChange={setYearsJob} type="number" />
              <Field label="Months at employer" value={monthsJob} onChange={setMonthsJob} type="number" />
            </FieldRow>
          </>
        ) : null}
        <FieldRow>
          <Field label="Gross annual income (£)*" value={income} onChange={setIncome} type="number" prefix="£" />
          <Field label="Monthly housing payment (£)" value={housing} onChange={setHousing} type="number" prefix="£" />
        </FieldRow>
        <Field label="Other monthly debts (£)" value={debts} onChange={setDebts} type="number" prefix="£" />
      </Section>

      <Section title="Loan structure">
        <FieldRow>
          <Field label="Deposit (£)" value={deposit} onChange={setDeposit} type="number" prefix="£" placeholder="0" />
          <Select label="Term" value={String(term)} onChange={v => setTerm(Number(v))}
            options={TERM_OPTIONS.map(o => ({ value: String(o.value), label: o.label }))} />
        </FieldRow>
      </Section>

      <Section title="Bank for direct debit" subtitle="We use this for the affordability check. Only the last 4 digits are stored on our side.">
        <FieldRow>
          <Field label="Sort code (XX-XX-XX)*" value={sortCode} onChange={setSortCode} placeholder="04-00-04" />
          <Field label="Account number*" value={accountLast4} onChange={v => setAccountLast4(v.replace(/\D/g, "").slice(0, 8))} type="text" placeholder="12345678" />
        </FieldRow>
      </Section>

      <Section title="Consents">
        <Checkbox checked={hardCheck} onChange={setHardCheck} required>
          I authorise iAutoMotive and its lender panel to perform a hard credit search.
          I understand this will leave a footprint on my credit file.
        </Checkbox>
        <Checkbox checked={marketing} onChange={setMarketing}>
          I&apos;m happy to receive marketing about other vehicles and offers from iAutoMotive.
        </Checkbox>
      </Section>

      {error && (
        <div style={{
          padding: "10px 14px",
          background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 12,
          fontFamily: "var(--font-body)", fontSize: 13, color: "#991B1B",
          marginBottom: 16,
        }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            height: 52, padding: "0 40px", borderRadius: 9999,
            background: "#008C7C", color: "#FFFFFF", border: "none",
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
          }}
        >{saving ? "Submitting…" : "Submit application"}</button>
        <button
          type="button"
          disabled={saving}
          onClick={e => handleSubmit(e, false)}
          style={{
            height: 52, padding: "0 28px", borderRadius: 9999,
            background: "#FFFFFF", color: "#0D1525",
            border: "1.5px solid #CBD5E1",
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
          }}
        >Save & finish later</button>
      </div>
    </form>
  );
}

/* ── primitives ─────────────────────────────────────────────── */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16, color: "#0D1525", marginBottom: 4 }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#64748B", marginTop: 0, marginBottom: 14 }}>{subtitle}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function Field({
  label, value, onChange, type = "text", placeholder, prefix,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; prefix?: string;
}) {
  return (
    <label style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", top: 8, left: 14, fontFamily: "var(--font-body)", fontSize: 11, color: "#64748B" }}>{label}</span>
      {prefix && (
        <span style={{ position: "absolute", left: 14, bottom: 14, fontFamily: "var(--font-body)", fontSize: 14, color: "#64748B" }}>{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", height: 56,
          padding: prefix ? "22px 14px 8px 26px" : "22px 14px 8px",
          background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 12,
          fontFamily: "var(--font-body)", fontSize: 15, color: "#0D1525", outline: "none",
        }}
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", top: 8, left: 14, fontFamily: "var(--font-body)", fontSize: 11, color: "#64748B" }}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", height: 56, padding: "22px 14px 8px",
          background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 12,
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

function Checkbox({ checked, onChange, children, required }: {
  checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; required?: boolean;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 14px", border: "1px solid #E2E8F0", borderRadius: 12,
      fontFamily: "var(--font-body)", fontSize: 13, color: "#334155",
      lineHeight: 1.5, cursor: "pointer",
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        required={required}
        style={{ marginTop: 3, accentColor: "#008C7C" }}
      />
      <span>{children}</span>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span style={{ color: "#94A3B8" }}>{k}</span>
      <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{v}</span>
    </div>
  );
}
