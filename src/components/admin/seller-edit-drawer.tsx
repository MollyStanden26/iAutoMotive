"use client";

import { useEffect, useRef, useState } from "react";

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
  green:         "#34D399",
  amber:         "#F59E0B",
};

const STAGE_OPTIONS = [
  { value: "offer_accepted", label: "Offer accepted" },
  { value: "collected",      label: "Collected" },
  { value: "inspecting",     label: "Inspecting" },
  { value: "in_mechanical",  label: "In mechanical" },
  { value: "in_body_paint",  label: "In body & paint" },
  { value: "in_detail",      label: "In detail" },
  { value: "in_photography", label: "In photography" },
  { value: "listing_ready",  label: "Listing ready" },
  { value: "live",           label: "Live for sale" },
  { value: "sale_agreed",    label: "Sale agreed" },
  { value: "sold",           label: "Sold" },
  { value: "withdrawn",      label: "Withdrawn" },
];

const PAYOUT_METHODS = [
  { value: "",                 label: "— not set —" },
  { value: "faster_payments",  label: "Faster Payments" },
  { value: "bacs",             label: "BACS" },
  { value: "chaps",            label: "CHAPS" },
];

const OFFER_TYPES = [
  { value: "initial",        label: "Initial offer (iAutoMotive → seller)" },
  { value: "counter_iauto",  label: "Counter from iAutoMotive" },
  { value: "counter_seller", label: "Counter from seller" },
  { value: "final",          label: "Final agreed offer" },
];

const OFFER_STATUSES = [
  { value: "pending",   label: "Pending" },
  { value: "accepted",  label: "Accepted" },
  { value: "rejected",  label: "Rejected" },
  { value: "countered", label: "Countered" },
  { value: "expired",   label: "Expired" },
];

interface SellerEditDrawerProps {
  open: boolean;
  sellerId: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

interface SellerData {
  seller: {
    id: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    firstName: string;
    lastName: string;
    addressLine1: string | null;
    city: string | null;
    postcode: string | null;
    payoutMethod: string | null;
    consignmentAgreementUrl: string | null;
  };
  consignment: {
    id: string;
    leadId: string | null;
    status: string;
    agreedListingPriceGbp: number;
    platformFeeGbp: number;
    reconMechanicalGbp: number;
    reconDetailGbp: number;
    transportGbp: number;
    lot: string | null;
    agreementSignedAt: string | null;
    v5cNotifiedAt: string | null;
    returnWindowExpiresAt: string | null;
    disputesOpen: boolean;
  } | null;
  vehicle: {
    id: string;
    registration: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    currentStage: string;
    listingPriceGbp: number | null;
    mileageAtIntake: number;
    exteriorColour: string | null;
  } | null;
  photos: { id: string; url: string; isPrimary: boolean; sortOrder: number }[];
  offers: { id: string; offerType: string; offeredPriceGbp: number; status: string; offeredAt: string; notes: string | null }[];
}

export function SellerEditDrawer({ open, sellerId, onClose, onSaved }: SellerEditDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SellerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add-offer form state — lives at the top so the form can reset on save.
  const [offerBusy, setOfferBusy] = useState(false);
  const [newOfferType, setNewOfferType] = useState("initial");
  const [newOfferPounds, setNewOfferPounds] = useState("");
  const [newOfferStatus, setNewOfferStatus] = useState("pending");
  const [newOfferNotes, setNewOfferNotes] = useState("");

  // Edit-buffer state — populated from `data` when fetched, then submitted.
  const [stage, setStage] = useState("");
  const [listingPricePounds, setListingPricePounds] = useState("");
  const [platformFeePounds, setPlatformFeePounds] = useState("");
  const [reconMechPounds, setReconMechPounds] = useState("");
  const [reconDetailPounds, setReconDetailPounds] = useState("");
  const [transportPounds, setTransportPounds] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  // Escrow toggles
  const [agreementSigned, setAgreementSigned] = useState(false);
  const [v5cNotified, setV5cNotified] = useState(false);
  const [returnWindowExpired, setReturnWindowExpired] = useState(false);
  const [disputesOpen, setDisputesOpen] = useState(false);

  const cancel = () => {
    if (saving) return;
    onClose();
    setData(null);
    setError(null);
    setSavedFlash(false);
  };

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

  const refetch = async () => {
    if (!sellerId) return;
    const fresh = await fetch(`/api/admin/sellers/${sellerId}`).then(r => r.json());
    setData(fresh);
  };

  useEffect(() => {
    if (!open || !sellerId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/sellers/${sellerId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: SellerData) => {
        if (cancelled) return;
        setData(d);
        setStage(d.vehicle?.currentStage ?? "offer_accepted");
        setListingPricePounds(d.vehicle?.listingPriceGbp ? Math.round(d.vehicle.listingPriceGbp / 100).toString() : "");
        setPlatformFeePounds(d.consignment ? Math.round(d.consignment.platformFeeGbp / 100).toString() : "0");
        setReconMechPounds(d.consignment ? Math.round(d.consignment.reconMechanicalGbp / 100).toString() : "0");
        setReconDetailPounds(d.consignment ? Math.round(d.consignment.reconDetailGbp / 100).toString() : "0");
        setTransportPounds(d.consignment ? Math.round(d.consignment.transportGbp / 100).toString() : "0");
        setPayoutMethod(d.seller.payoutMethod ?? "");
        setEmail(d.seller.email);
        setNewPassword("");
        setIsActive(d.seller.isActive);
        setAgreementSigned(!!d.consignment?.agreementSignedAt);
        setV5cNotified(!!d.consignment?.v5cNotifiedAt);
        setReturnWindowExpired(!!d.consignment?.returnWindowExpiresAt && new Date(d.consignment.returnWindowExpiresAt).getTime() <= Date.now());
        setDisputesOpen(!!d.consignment?.disputesOpen);
      })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, sellerId]);

  const handleSave = async () => {
    if (!sellerId || saving) return;
    setSaving(true);
    setError(null);
    setSavedFlash(false);
    try {
      const patch: Record<string, unknown> = {
        currentStage:       stage,
        listingPriceGbp:    Math.round(Number(listingPricePounds || 0) * 100),
        platformFeeGbp:     Math.round(Number(platformFeePounds || 0) * 100),
        reconMechanicalGbp: Math.round(Number(reconMechPounds || 0) * 100),
        reconDetailGbp:     Math.round(Number(reconDetailPounds || 0) * 100),
        transportGbp:       Math.round(Number(transportPounds || 0) * 100),
        payoutMethod:       payoutMethod || null,
        isActive,
        agreementSigned,
        v5cNotified,
        returnWindowExpired,
        disputesOpen,
      };
      if (data && email !== data.seller.email) patch.email = email;
      if (newPassword) patch.password = newPassword;

      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      await refetch();
      setNewPassword("");
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!sellerId || !files || files.length === 0 || photoBusy) return;
    setPhotoBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("photos", f);
      const res = await fetch(`/api/admin/sellers/${sellerId}/photos`, { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      await refetch();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPhotoBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePhotoDelete = async (mediaId: string) => {
    if (!sellerId || photoBusy) return;
    if (!confirm("Delete this photo? This can't be undone.")) return;
    setPhotoBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/photos?mediaId=${mediaId}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      await refetch();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleAddOffer = async () => {
    if (!sellerId || offerBusy) return;
    const pounds = Number(newOfferPounds);
    if (!Number.isFinite(pounds) || pounds <= 0) {
      setError("Offer amount must be a positive number");
      return;
    }
    setOfferBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerType: newOfferType,
          offeredPriceGbp: Math.round(pounds * 100),
          status: newOfferStatus,
          notes: newOfferNotes.trim() || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      // Reset just the volatile fields — keep type/status so back-to-back
      // entries (e.g. logging a chain of counter-offers) stay quick.
      setNewOfferPounds("");
      setNewOfferNotes("");
      await refetch();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add offer");
    } finally {
      setOfferBusy(false);
    }
  };

  const handlePhotoSetPrimary = async (mediaId: string) => {
    if (!sellerId || photoBusy) return;
    setPhotoBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/photos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      await refetch();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setPhotoBusy(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div onClick={cancel}
        style={{ position: "fixed", inset: 0, background: "rgba(7, 13, 24, 0.6)", backdropFilter: "blur(2px)", zIndex: 60, opacity: mounted ? 1 : 0, transition: "opacity 200ms ease" }} />
      <aside role="dialog" aria-label="Manage seller"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 540, maxWidth: "100vw", background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 61, display: "flex", flexDirection: "column", transform: mounted ? "translateX(0)" : "translateX(100%)", transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)" }}>
        <header className="flex items-start justify-between px-5"
          style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>
              {data ? `${data.seller.firstName} ${data.seller.lastName}` : "Manage seller"}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {data?.seller.email ?? "Loading…"}
            </div>
          </div>
          <button onClick={cancel} aria-label="Close" disabled={saving}
            className="rounded-[8px] hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: 18, lineHeight: 1, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1 }}>×</button>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {loading && <div style={loadingStyle}>Loading seller…</div>}
          {!loading && error && <div style={errorBoxStyle}>{error}</div>}
          {!loading && data && (
            <>
              {data.vehicle ? (
                <div style={contextBoxStyle}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                    {data.vehicle.year} {data.vehicle.make} {data.vehicle.model}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                    {data.vehicle.registration}{data.vehicle.trim ? ` · ${data.vehicle.trim}` : ""}
                    {data.consignment?.lot ? ` · ${data.consignment.lot}` : ""}
                  </div>
                </div>
              ) : (
                <div style={{ ...contextBoxStyle, color: T.textMuted, fontSize: 12 }}>
                  This seller has no vehicle yet — listing fields below are disabled until one is created.
                </div>
              )}

              <Section title="Listing">
                <Row>
                  <Field label="Stage">
                    <Select value={stage} onChange={setStage} options={STAGE_OPTIONS} disabled={!data.vehicle} />
                  </Field>
                  <Field label="Listing price (£)">
                    <Input value={listingPricePounds} onChange={setListingPricePounds} type="number" prefix="£" disabled={!data.vehicle} />
                  </Field>
                </Row>
              </Section>

              <Section title="Cost breakdown · seen on the seller's Financials tab">
                <Row>
                  <Field label="Platform fee (£)">
                    <Input value={platformFeePounds} onChange={setPlatformFeePounds} type="number" prefix="£" disabled={!data.consignment} />
                  </Field>
                  <Field label="Recon — mechanical (£)">
                    <Input value={reconMechPounds} onChange={setReconMechPounds} type="number" prefix="£" disabled={!data.consignment} />
                  </Field>
                </Row>
                <Row>
                  <Field label="Recon — detail & valet (£)">
                    <Input value={reconDetailPounds} onChange={setReconDetailPounds} type="number" prefix="£" disabled={!data.consignment} />
                  </Field>
                  <Field label="Transport & collection (£)">
                    <Input value={transportPounds} onChange={setTransportPounds} type="number" prefix="£" disabled={!data.consignment} />
                  </Field>
                </Row>
                <NetPreview
                  listingPence={Math.round(Number(listingPricePounds || 0) * 100)}
                  platformPence={Math.round(Number(platformFeePounds || 0) * 100)}
                  mechPence={Math.round(Number(reconMechPounds || 0) * 100)}
                  detailPence={Math.round(Number(reconDetailPounds || 0) * 100)}
                  transportPence={Math.round(Number(transportPounds || 0) * 100)}
                />
              </Section>

              <Section title="Escrow & release conditions · seen on the seller's Financials tab">
                <Toggle
                  label="Consignment agreement signed"
                  checked={agreementSigned}
                  onChange={setAgreementSigned}
                  disabled={!data.consignment}
                />
                <Toggle
                  label="V5C transfer notified to DVLA"
                  checked={v5cNotified}
                  onChange={setV5cNotified}
                  disabled={!data.consignment}
                />
                <Toggle
                  label="7-day buyer return window expired"
                  checked={returnWindowExpired}
                  onChange={setReturnWindowExpired}
                  disabled={!data.consignment}
                />
                <Toggle
                  label="Disputes open on the deal"
                  checked={disputesOpen}
                  onChange={setDisputesOpen}
                  disabled={!data.consignment}
                  warn
                />
              </Section>

              <Section title="Payout">
                <Field label="Method">
                  <Select value={payoutMethod} onChange={setPayoutMethod} options={PAYOUT_METHODS} />
                </Field>
              </Section>

              <Section title="Account">
                <Field label="Email" required>
                  <Input value={email} onChange={setEmail} type="email" />
                </Field>
                <Field label="Set new password (optional, ≥ 8 chars)">
                  <Input value={newPassword} onChange={setNewPassword} type="password" placeholder="Leave blank to keep current" />
                </Field>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontFamily: "var(--font-body)", fontSize: 12, color: T.textSecondary }}>
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                  Account active (uncheck to disable login)
                </label>
              </Section>

              <Section title="Photos · seen on the seller's Vehicle tab">
                {data.photos.length === 0 ? (
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textDim }}>
                    No photos yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {data.photos.map(p => (
                      <div key={p.id} style={{ position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" style={{
                          width: "100%", aspectRatio: "1 / 1", objectFit: "cover",
                          borderRadius: 6, border: `1px solid ${p.isPrimary ? T.teal : T.border}`,
                        }} />
                        {p.isPrimary && (
                          <span style={{
                            position: "absolute", top: 4, left: 4,
                            background: T.tealBg, color: T.teal200,
                            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9,
                            borderRadius: 4, padding: "2px 5px", border: `1px solid ${T.teal}`,
                          }}>HERO</span>
                        )}
                        <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                          {!p.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handlePhotoSetPrimary(p.id)}
                              disabled={photoBusy}
                              style={{
                                flex: 1, fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 600,
                                background: T.bgInput, color: T.textSecondary,
                                border: `1px solid ${T.border}`, borderRadius: 4, padding: "3px 4px",
                                cursor: photoBusy ? "not-allowed" : "pointer", opacity: photoBusy ? 0.5 : 1,
                              }}
                            >Set hero</button>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePhotoDelete(p.id)}
                            disabled={photoBusy}
                            style={{
                              flex: p.isPrimary ? 1 : 0.4, fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 600,
                              background: T.bgInput, color: T.red,
                              border: `1px solid ${T.border}`, borderRadius: 4, padding: "3px 4px",
                              cursor: photoBusy ? "not-allowed" : "pointer", opacity: photoBusy ? 0.5 : 1,
                            }}
                          >×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => handlePhotoUpload(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!data.vehicle || photoBusy}
                  style={{
                    marginTop: 10, width: "100%",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12,
                    background: T.bgInput, color: T.teal200,
                    border: `1px dashed ${T.teal}`, borderRadius: 8, padding: "10px",
                    cursor: !data.vehicle || photoBusy ? "not-allowed" : "pointer",
                    opacity: !data.vehicle || photoBusy ? 0.5 : 1,
                  }}
                >
                  {photoBusy ? "Uploading…" : "+ Add photos"}
                </button>
              </Section>

              <Section title="Buyer offers & negotiation · seen on the seller's Vehicle tab">
                {data.offers.length === 0 ? (
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textDim }}>
                    No buyer offers logged yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {data.offers.map(o => (
                      <div key={o.id} style={{
                        background: T.bgSection, border: `1px solid ${T.border}`,
                        borderRadius: 8, padding: "8px 10px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: T.textPrimary }}>
                            £{(o.offeredPriceGbp / 100).toLocaleString("en-GB")}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600,
                            color: o.status === "accepted" ? T.green : o.status === "rejected" ? T.red : T.textSecondary,
                            textTransform: "uppercase", letterSpacing: "0.06em",
                          }}>{o.status}</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                          {o.offerType.replace(/_/g, " ")} · {new Date(o.offeredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        {o.notes && (
                          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textSecondary, marginTop: 4 }}>
                            {o.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add-offer form: only available when the consignment came from
                    a lead (current schema constraint — see /api/admin/sellers/[id]/offers). */}
                {data.consignment?.leadId ? (
                  <div style={{
                    marginTop: 12, padding: "10px 12px",
                    background: T.bgInput, border: `1px dashed ${T.border}`, borderRadius: 8,
                  }}>
                    <div style={{
                      fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: T.textDim, marginBottom: 8,
                    }}>+ Log a new offer</div>
                    <Row>
                      <Field label="Type">
                        <Select value={newOfferType} onChange={setNewOfferType} options={OFFER_TYPES} />
                      </Field>
                      <Field label="Amount (£)">
                        <Input value={newOfferPounds} onChange={setNewOfferPounds} type="number" prefix="£" placeholder="0" />
                      </Field>
                    </Row>
                    <Row>
                      <Field label="Status">
                        <Select value={newOfferStatus} onChange={setNewOfferStatus} options={OFFER_STATUSES} />
                      </Field>
                      <Field label="Notes (optional)">
                        <Input value={newOfferNotes} onChange={setNewOfferNotes} placeholder="via SMS, etc." />
                      </Field>
                    </Row>
                    <button
                      type="button"
                      onClick={handleAddOffer}
                      disabled={offerBusy || !newOfferPounds}
                      style={{
                        marginTop: 8, width: "100%",
                        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12,
                        background: T.tealBg, color: T.teal200,
                        border: `1px solid ${T.teal}`, borderRadius: 8, padding: "8px",
                        cursor: offerBusy || !newOfferPounds ? "not-allowed" : "pointer",
                        opacity: offerBusy || !newOfferPounds ? 0.55 : 1,
                      }}
                    >
                      {offerBusy ? "Adding…" : "Add offer"}
                    </button>
                  </div>
                ) : data.consignment ? (
                  <div style={{
                    marginTop: 12, padding: "8px 12px",
                    background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8,
                    fontFamily: "var(--font-body)", fontSize: 11, color: T.textDim,
                  }}>
                    This consignment was created directly without a CRM lead — manual offers
                    can&apos;t be logged here yet. Tracked under the originating lead in the CRM
                    workspace when one exists.
                  </div>
                ) : null}
              </Section>
            </>
          )}
        </div>

        <footer className="flex items-center gap-2 px-5"
          style={{ height: 64, borderTop: `1px solid ${T.border}`, background: T.bgPanel, flexShrink: 0 }}>
          {savedFlash && <span style={{ color: T.green, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600 }}>✓ Saved — seller portal updated</span>}
          {error && !saving && <span style={{ color: T.red, fontFamily: "var(--font-body)", fontSize: 12 }}>{error}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button type="button" onClick={cancel} disabled={saving}
              className="px-4 py-[7px] rounded-[8px] hover:opacity-80"
              style={{ background: T.bgSection, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: T.textSecondary, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1 }}>
              Close
            </button>
            <button type="button" onClick={handleSave} disabled={saving || loading || !data}
              className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
              style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, cursor: saving || loading || !data ? "not-allowed" : "pointer", opacity: saving || loading || !data ? 0.55 : 1 }}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}

/* ── primitives ─────────────────────────────────────────────────── */

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

function Input({ value, onChange, type = "text", placeholder, prefix, disabled }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; prefix?: string; disabled?: boolean;
}) {
  return (
    <div style={{ position: "relative" }}>
      {prefix && (
        <span style={{
          position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
          fontFamily: "var(--font-body)", fontSize: 13, color: T.textMuted,
        }}>{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%", height: 36, padding: prefix ? "0 11px 0 24px" : "0 11px",
          background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8,
          color: T.textPrimary, fontFamily: "var(--font-body)", fontSize: 13, outline: "none",
          opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = T.teal; }}
        onBlur={e => (e.currentTarget.style.borderColor = T.border)}
      />
    </div>
  );
}

function Select({ value, onChange, options, disabled }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: "100%", height: 36, padding: "0 11px",
        background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8,
        color: T.textPrimary, fontFamily: "var(--font-body)", fontSize: 13, outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%238492A8' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center", paddingRight: 28,
        opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {options.map(o => <option key={o.value} value={o.value} style={{ background: T.bgInput }}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ label, checked, onChange, disabled, warn }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; warn?: boolean;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, padding: "8px 12px",
      background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 8,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    }}>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: 12,
        color: warn && checked ? T.red : T.textSecondary,
      }}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        style={{ accentColor: warn ? T.red : T.teal, cursor: disabled ? "not-allowed" : "pointer" }}
      />
    </label>
  );
}

function NetPreview({ listingPence, platformPence, mechPence, detailPence, transportPence }: {
  listingPence: number; platformPence: number; mechPence: number; detailPence: number; transportPence: number;
}) {
  const net = listingPence - platformPence - mechPence - detailPence - transportPence;
  const netGbp = (net / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (
    <div style={{
      marginTop: 8, padding: "10px 12px",
      background: T.bgInput, border: `1px solid ${T.border}`,
      borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>
        Estimated net to seller
      </span>
      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16, color: net >= 0 ? T.teal200 : T.red }}>
        £{netGbp}
      </span>
    </div>
  );
}

const loadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted, padding: "32px 0", textAlign: "center",
};
const errorBoxStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 12, color: T.red,
  background: "#3B1820", border: `1px solid ${T.red}`, borderRadius: 8, padding: "10px 12px", marginBottom: 12,
};
const contextBoxStyle: React.CSSProperties = {
  background: T.bgSection, border: `1px solid ${T.border}`,
  borderRadius: 10, padding: "12px 14px", marginBottom: 16,
};
