"use client";

/**
 * LeadDetailDrawer — right-side drawer opened from a pipeline card.
 *
 * View mode surfaces a Salesforce-style record: score/tier + compliance in the
 * header, acquisition signals (source, days-on-market), photos, contact +
 * vehicle, and a merged activity timeline (calls, SMS, logged outreach, offers)
 * fetched from /api/admin/leads/[id]. Reps can Call, Log an activity (writes to
 * the timeline), or Edit. Everything here is backed by data we already store.
 */

import { useEffect, useState } from "react";
import { Phone, Pencil, X, ExternalLink, ShieldCheck, ShieldAlert, ClipboardCheck } from "lucide-react";

const T = {
  bgPanel: "#0D1525", bgInput: "#0B111E", bgSection: "#111D30", bgRow: "#111D30",
  border: "#1E2D4A", textPrimary: "#F1F5F9", textSecondary: "#8492A8",
  textMuted: "#6B7A90", textDim: "#4A556B", teal: "#008C7C", teal200: "#4DD9C7",
  tealBg: "#0A2A26", green: "#34D399", greenBg: "#0B2B1A", amber: "#F5A623", amberBg: "#2B1A00",
  red: "#F87171", redBg: "#2B0F0F",
};

export interface LeadDetail {
  id: string;
  seller: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  vehicleReg: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleTrim: string | null;
  vehicleMileage: number | null;
  askingPriceGbp: number | null;
  score: number;
  pipelineStage: string;
  notes: string | null;
}

interface LeadExtra {
  scoutScore: number; scoutTier: string | null; status: string;
  askingPriceGbp: number | null; estimatedRetailGbp: number | null;
  doNotCall: boolean; doNotSms: boolean; source: string;
  listingUrl: string | null; photos: string[];
  daysListedAtImport: number | null; importedAt: string; ownerName: string | null;
}
type Tone = "good" | "warn" | "bad" | "neutral";
interface TimelineEntry { id: string; kind: string; at: string; title: string; detail: string | null; tone: Tone; }

const STAGE_LABEL: Record<string, string> = {
  new_lead: "New Lead", contacted: "Contacted", call_back: "Call Back",
  contract_sent: "Contract Sent", handover_scheduled: "Handover Scheduled", collected: "Collected",
};
const STAGE_OPTIONS = Object.keys(STAGE_LABEL);
const TIER_COLOR: Record<string, string> = { hot: T.red, warm: T.amber, cold: T.teal200 };
const TONE_COLOR: Record<Tone, string> = { good: T.green, warn: T.amber, bad: T.red, neutral: T.textMuted };

const OUTCOME_OPTIONS = [
  { v: "connected", l: "Connected" }, { v: "interested", l: "Interested" },
  { v: "callback_requested", l: "Callback requested" }, { v: "voicemail", l: "Voicemail" },
  { v: "no_answer", l: "No answer" }, { v: "not_interested", l: "Not interested" },
  { v: "wrong_number", l: "Wrong number" },
];
const METHOD_OPTIONS = [{ v: "phone_call", l: "Call" }, { v: "sms", l: "SMS" }, { v: "email", l: "Email" }];

interface EditForm {
  firstName: string; lastName: string; phone: string; email: string; locationPostcode: string;
  vehicleReg: string; vehicleYear: string; vehicleMake: string; vehicleModel: string;
  vehicleTrim: string; vehicleMileage: string; askingPriceGbp: string; estimatedRetailGbp: string; notes: string;
  pipelineStage: string;
}
function toForm(l: LeadDetail): EditForm {
  return {
    firstName: l.firstName ?? "", lastName: l.lastName ?? "", phone: l.phone ?? "", email: l.email ?? "",
    locationPostcode: l.location ?? "", vehicleReg: l.vehicleReg ?? "",
    vehicleYear: l.vehicleYear ? String(l.vehicleYear) : "", vehicleMake: l.vehicleMake ?? "",
    vehicleModel: l.vehicleModel ?? "", vehicleTrim: l.vehicleTrim ?? "",
    vehicleMileage: l.vehicleMileage ? String(l.vehicleMileage) : "",
    askingPriceGbp: l.askingPriceGbp ? String(l.askingPriceGbp) : "", estimatedRetailGbp: "", notes: l.notes ?? "",
    pipelineStage: l.pipelineStage,
  };
}
function gbp(n: number | null): string { return n ? `£${Number(n).toLocaleString()}` : "—"; }
const EMPTY_LOG = { method: "phone_call", outcome: "connected", notes: "", nextContactAt: "" };

function shortDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === new Date().toDateString()) return `Today · ${time}`;
  return `${d.getDate()} ${months[d.getMonth()]} · ${time}`;
}

export function LeadDetailDrawer({ lead, onClose, onUpdated, onActivityLogged }: {
  lead: LeadDetail | null;
  onClose: () => void;
  onUpdated: (updated: LeadDetail) => void;
  onActivityLogged?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [current, setCurrent] = useState<LeadDetail | null>(lead);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<LeadExtra | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [logForm, setLogForm] = useState(EMPTY_LOG);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    setCurrent(lead); setMode("view"); setError(null); setLogOpen(false);
    setForm(lead ? toForm(lead) : null);
    setDetail(null); setTimeline([]);
  }, [lead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch full detail + activity timeline.
  useEffect(() => {
    if (!lead?.id) return;
    let cancelled = false;
    fetch(`/api/admin/leads/${lead.id}`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (!cancelled) { setDetail(d.detail); setTimeline(d.timeline ?? []); } })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [lead?.id]);

  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => setMounted(true));
    return () => { window.removeEventListener("keydown", onKey); setMounted(false); };
  }, [lead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lead || !current) return null;

  const upd = <K extends keyof EditForm>(k: K, v: EditForm[K]) => setForm(f => (f ? { ...f, [k]: v } : f));

  const reloadTimeline = async () => {
    const d = await fetch(`/api/admin/leads/${current.id}`, { cache: "no-store" }).then(r => r.json()).catch(() => null);
    if (d) { setDetail(d.detail); setTimeline(d.timeline ?? []); }
  };

  const call = () => {
    if (detail?.doNotCall) return;
    const dial = (window as unknown as { iaDial?: (n: string) => void }).iaDial;
    if (dial && current.phone) dial(current.phone);
  };

  // Estimated retail lives on the detail fetch, so seed it into the edit form here.
  const enterEdit = () => {
    setForm({ ...toForm(current), estimatedRetailGbp: detail?.estimatedRetailGbp ? String(detail.estimatedRetailGbp) : "" });
    setMode("edit");
  };

  const submitLog = async () => {
    setLogging(true); setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${current.id}/activity`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(logForm),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Failed (${res.status})`); }
      setLogForm(EMPTY_LOG); setLogOpen(false);
      await reloadTimeline();
      onActivityLogged?.();
    } catch (e) { setError(e instanceof Error ? e.message : "Log failed"); }
    finally { setLogging(false); }
  };

  const save = async () => {
    if (!form) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${current.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Save failed (${res.status})`); }
      const updated: LeadDetail = {
        ...current,
        firstName: form.firstName.trim(), lastName: form.lastName.trim() || null,
        seller: [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ") || "New lead",
        phone: form.phone.trim() || null, email: form.email.trim() || null,
        location: form.locationPostcode.trim() || null,
        vehicleReg: form.vehicleReg.trim().toUpperCase() || null, vehicleMake: form.vehicleMake.trim() || null,
        vehicleModel: form.vehicleModel.trim() || null, vehicleYear: form.vehicleYear ? parseInt(form.vehicleYear, 10) : null,
        vehicleTrim: form.vehicleTrim.trim() || null, vehicleMileage: form.vehicleMileage ? parseInt(form.vehicleMileage, 10) : null,
        askingPriceGbp: form.askingPriceGbp ? parseInt(form.askingPriceGbp, 10) : null,
        notes: form.notes.trim() || null, pipelineStage: form.pipelineStage,
      };
      setCurrent(updated); setMode("view"); onUpdated(updated);
      setDetail(d => d ? { ...d, estimatedRetailGbp: form.estimatedRetailGbp ? parseInt(form.estimatedRetailGbp, 10) : null } : d);
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  const vehicleLine = [current.vehicleYear, current.vehicleMake, current.vehicleModel, current.vehicleTrim]
    .filter(Boolean).join(" ") || "—";
  const tier = detail?.scoutTier;
  const daysListed = detail?.daysListedAtImport ??
    (detail ? Math.floor((Date.now() - new Date(detail.importedAt).getTime()) / 86400000) : null);

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(7,13,24,0.6)", backdropFilter: "blur(2px)",
          zIndex: 62, opacity: mounted ? 1 : 0, transition: "opacity 200ms ease" }} />
      <aside role="dialog" aria-label="Lead details"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, maxWidth: "100vw",
          background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 63,
          display: "flex", flexDirection: "column",
          transform: mounted ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)",
          fontFamily: "var(--font-body)" }}>
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-5"
          style={{ minHeight: 58, padding: "10px 20px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div className="min-w-0">
            <div className="truncate" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>
              {current.seller}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 3 }}>
              <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: T.bgSection, color: T.teal200 }}>
                {STAGE_LABEL[current.pipelineStage] ?? "New Lead"}
              </span>
              <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: T.bgSection,
                color: tier ? TIER_COLOR[tier] ?? T.textSecondary : T.textSecondary }}>
                Score {current.score}{tier ? ` · ${tier}` : ""}
              </span>
              {detail?.doNotCall && (
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: T.redBg, color: T.red }}>
                  Do not call
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-[8px] shrink-0 hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, display: "grid", placeItems: "center" }}>
            <X size={16} />
          </button>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {mode === "view" ? (
            <>
              {/* Valuation hero — the consignment pitch */}
              {detail && (() => {
                const retail = detail.estimatedRetailGbp;
                const asking = current.askingPriceGbp ?? detail.askingPriceGbp;
                if (!retail) {
                  return (
                    <div className="flex items-center justify-between gap-2" style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 10, background: T.bgSection, border: `1px dashed ${T.border}` }}>
                      <span style={{ fontSize: 12, color: T.textMuted }}>Add an estimated retail price to show the pitch</span>
                      <button onClick={enterEdit} style={{ fontSize: 12, fontWeight: 700, color: T.teal200, background: "none", border: "none", cursor: "pointer" }}>Add</button>
                    </div>
                  );
                }
                const nets = asking != null ? retail - asking : null;
                const win = nets != null && nets > 0;
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div style={{ background: T.bgSection, borderRadius: 8, padding: "9px 10px" }}>
                        <div style={{ fontSize: 10, color: T.textMuted }}>Est. retail</div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>{gbp(retail)}</div>
                      </div>
                      <div style={{ background: T.bgSection, borderRadius: 8, padding: "9px 10px" }}>
                        <div style={{ fontSize: 10, color: T.textMuted }}>Their asking</div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>{gbp(asking)}</div>
                      </div>
                      <div style={{ background: win ? T.greenBg : T.bgSection, borderRadius: 8, padding: "9px 10px" }}>
                        <div style={{ fontSize: 10, color: win ? T.green : T.textMuted }}>Seller nets</div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: win ? T.green : T.textSecondary }}>
                          {nets == null ? "—" : `${nets > 0 ? "+" : ""}${gbp(nets)}`}
                        </div>
                      </div>
                    </div>
                    {win && (
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>
                        ~{gbp(nets)} more than their current plan · 0% commission
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Compliance strip */}
              {detail && (
                <div className="flex items-center gap-2" style={{ marginBottom: 16, padding: "8px 11px", borderRadius: 8,
                  background: detail.doNotCall ? T.redBg : T.greenBg, color: detail.doNotCall ? T.red : T.green }}>
                  {detail.doNotCall ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {detail.doNotCall ? "Do not call — flagged" : "Safe to call"}
                    {detail.doNotSms ? " · no SMS" : ""}
                  </span>
                </div>
              )}

              {/* Signals */}
              <Section title="Signals">
                <DetailRow label="Source" value={detail?.source ?? "—"} link={detail?.listingUrl ? { label: "View listing", href: detail.listingUrl } : undefined} />
                <DetailRow label="Days listed" value={daysListed != null ? `${daysListed} days` : "—"} />
                <DetailRow label="Owner" value={detail?.ownerName ?? "—"} />
              </Section>

              {/* Photos */}
              {detail && detail.photos.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim, marginBottom: 10 }}>Photos</div>
                  <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {detail.photos.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" style={{ width: 88, height: 64, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}`, flexShrink: 0 }} />
                    ))}
                  </div>
                </div>
              )}

              <Section title="Contact">
                <DetailRow label="Phone" value={current.phone ?? "—"} />
                <DetailRow label="Email" value={current.email ?? "—"} />
                <DetailRow label="Postcode" value={current.location ?? "—"} />
              </Section>
              <Section title="Vehicle">
                <DetailRow label="Vehicle" value={vehicleLine} />
                <DetailRow label="Registration" value={current.vehicleReg ?? "—"} />
                <DetailRow label="Mileage" value={current.vehicleMileage ? `${current.vehicleMileage.toLocaleString()} mi` : "—"} />
                <DetailRow label="Asking price" value={gbp(current.askingPriceGbp)} />
              </Section>
              {current.notes && (
                <Section title="Notes">
                  <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>{current.notes}</p>
                </Section>
              )}

              {/* Activity timeline */}
              <div style={{ marginBottom: 8 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim }}>
                    Activity{timeline.length ? ` · ${timeline.length}` : ""}
                  </span>
                  <button onClick={() => setLogOpen(o => !o)}
                    className="flex items-center gap-1 hover:opacity-80"
                    style={{ fontSize: 11, fontWeight: 600, color: T.teal200, background: "none", border: "none", cursor: "pointer" }}>
                    <ClipboardCheck size={13} /> Log activity
                  </button>
                </div>

                {logOpen && (
                  <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: T.bgSection, border: `1px solid ${T.border}` }}>
                    <Row>
                      <Field label="Channel">
                        <Select value={logForm.method} onChange={v => setLogForm(f => ({ ...f, method: v }))} options={METHOD_OPTIONS} />
                      </Field>
                      <Field label="Outcome">
                        <Select value={logForm.outcome} onChange={v => setLogForm(f => ({ ...f, outcome: v }))} options={OUTCOME_OPTIONS} />
                      </Field>
                    </Row>
                    <div style={{ marginTop: 10 }}>
                      <Field label="Notes">
                        <Input value={logForm.notes} onChange={v => setLogForm(f => ({ ...f, notes: v }))} placeholder="What happened?" />
                      </Field>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Field label="Callback (optional)">
                        <Input value={logForm.nextContactAt} onChange={v => setLogForm(f => ({ ...f, nextContactAt: v }))} type="datetime-local" />
                      </Field>
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: 12 }}>
                      <button onClick={() => setLogOpen(false)} disabled={logging}
                        className="px-3 py-1.5 rounded-[8px] hover:opacity-80"
                        style={{ background: T.bgRow, border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: 12, fontWeight: 600 }}>Cancel</button>
                      <button onClick={submitLog} disabled={logging}
                        className="px-3 py-1.5 rounded-[8px] hover:opacity-90"
                        style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontSize: 12, fontWeight: 700, cursor: logging ? "wait" : "pointer" }}>
                        {logging ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                )}

                {timeline.length === 0 ? (
                  <p style={{ fontSize: 12, color: T.textDim }}>No activity logged yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {timeline.map(e => (
                      <div key={e.id} className="flex gap-2.5" style={{ alignItems: "flex-start" }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: TONE_COLOR[e.tone], flexShrink: 0, marginTop: 5 }} />
                        <div className="min-w-0" style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: T.textPrimary }}>{e.title}</div>
                          {e.detail && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{e.detail}</div>}
                          <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{shortDate(e.at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : form && (
            <>
              <Section title="Contact">
                <Row>
                  <Field label="First name"><Input value={form.firstName} onChange={v => upd("firstName", v)} placeholder="New lead" /></Field>
                  <Field label="Last name"><Input value={form.lastName} onChange={v => upd("lastName", v)} /></Field>
                </Row>
                <Row>
                  <Field label="Phone"><Input value={form.phone} onChange={v => upd("phone", v)} type="tel" /></Field>
                  <Field label="Email"><Input value={form.email} onChange={v => upd("email", v)} type="email" /></Field>
                </Row>
                <Field label="Postcode"><Input value={form.locationPostcode} onChange={v => upd("locationPostcode", v)} /></Field>
              </Section>
              <Section title="Vehicle">
                <Row>
                  <Field label="Registration"><Input value={form.vehicleReg} onChange={v => upd("vehicleReg", v.toUpperCase())} /></Field>
                  <Field label="Year"><Input value={form.vehicleYear} onChange={v => upd("vehicleYear", v)} type="number" /></Field>
                </Row>
                <Row>
                  <Field label="Make"><Input value={form.vehicleMake} onChange={v => upd("vehicleMake", v)} /></Field>
                  <Field label="Model"><Input value={form.vehicleModel} onChange={v => upd("vehicleModel", v)} /></Field>
                </Row>
                <Row>
                  <Field label="Trim"><Input value={form.vehicleTrim} onChange={v => upd("vehicleTrim", v)} /></Field>
                  <Field label="Mileage"><Input value={form.vehicleMileage} onChange={v => upd("vehicleMileage", v)} type="number" /></Field>
                </Row>
                <Row>
                  <Field label="Asking price (£)"><Input value={form.askingPriceGbp} onChange={v => upd("askingPriceGbp", v)} type="number" /></Field>
                  <Field label="Est. retail (£)"><Input value={form.estimatedRetailGbp} onChange={v => upd("estimatedRetailGbp", v)} type="number" /></Field>
                </Row>
              </Section>
              <Section title="Pipeline">
                <Field label="Stage">
                  <select value={form.pipelineStage} onChange={e => upd("pipelineStage", e.target.value)}
                    style={{ width: "100%", height: 36, padding: "0 11px", background: T.bgInput, border: `1px solid ${T.border}`,
                      borderRadius: 8, color: T.textPrimary, fontSize: 13, outline: "none" }}>
                    {STAGE_OPTIONS.map(s => <option key={s} value={s} style={{ background: T.bgInput }}>{STAGE_LABEL[s]}</option>)}
                  </select>
                </Field>
                <Field label="Notes">
                  <textarea value={form.notes} onChange={e => upd("notes", e.target.value)} rows={3}
                    style={{ width: "100%", padding: "8px 11px", resize: "vertical", background: T.bgInput,
                      border: `1px solid ${T.border}`, borderRadius: 8, color: T.textPrimary, fontSize: 13, outline: "none" }} />
                </Field>
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center gap-2 px-5"
          style={{ minHeight: 64, borderTop: `1px solid ${T.border}`, background: T.bgPanel, flexShrink: 0 }}>
          {error && <span style={{ fontSize: 12, color: T.red, flex: 1 }}>{error}</span>}
          {mode === "view" ? (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={call} disabled={!current.phone || detail?.doNotCall}
                title={detail?.doNotCall ? "Lead is flagged do-not-call" : undefined}
                className="flex items-center gap-1.5 px-4 py-[7px] rounded-[8px] hover:opacity-90"
                style={{ background: T.greenBg, border: `1px solid ${T.green}33`, color: T.green, fontWeight: 700, fontSize: 13,
                  opacity: current.phone && !detail?.doNotCall ? 1 : 0.45, cursor: current.phone && !detail?.doNotCall ? "pointer" : "not-allowed" }}>
                <Phone size={14} /> Call
              </button>
              <button onClick={enterEdit}
                className="flex items-center gap-1.5 px-4 py-[7px] rounded-[8px] hover:opacity-90"
                style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontWeight: 700, fontSize: 13 }}>
                <Pencil size={14} /> Edit
              </button>
            </div>
          ) : (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => { setMode("view"); setError(null); }} disabled={saving}
                className="px-4 py-[7px] rounded-[8px] hover:opacity-80"
                style={{ background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontWeight: 600, fontSize: 13, opacity: saving ? 0.5 : 1 }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
                style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontWeight: 700, fontSize: 13, cursor: saving ? "wait" : "pointer" }}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </footer>
      </aside>
    </>
  );
}

/* ── primitives ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}
function DetailRow({ label, value, link }: { label: string; value: string; link?: { label: string; href: string } }) {
  return (
    <div className="flex items-baseline gap-3">
      <span style={{ width: 92, flexShrink: 0, fontSize: 11, color: T.textMuted }}>{label}</span>
      <span className="min-w-0 break-words" style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
        {value}
        {link && (
          <>
            {" · "}
            <a href={link.href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1" style={{ color: T.teal200, fontWeight: 600 }}>
              {link.label}<ExternalLink size={11} />
            </a>
          </>
        )}
      </span>
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontWeight: 600, fontSize: 11, color: T.textMuted }}>{label}</span>
      {children}
    </label>
  );
}
function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", height: 36, padding: "0 11px", background: T.bgInput, border: `1px solid ${T.border}`,
        borderRadius: 8, color: T.textPrimary, fontSize: 13, outline: "none" }}
      onFocus={e => (e.currentTarget.style.borderColor = T.teal)}
      onBlur={e => (e.currentTarget.style.borderColor = T.border)} />
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", height: 36, padding: "0 11px", background: T.bgInput, border: `1px solid ${T.border}`,
        borderRadius: 8, color: T.textPrimary, fontSize: 13, outline: "none" }}>
      {options.map(o => <option key={o.v} value={o.v} style={{ background: T.bgInput }}>{o.l}</option>)}
    </select>
  );
}
