"use client";

import { useEffect, useState } from "react";

const BADGE_MAP: Record<string, { bg: string; color: string; label: string }> = {
  listed:   { bg: '#E0FAF5', color: '#006058', label: 'Listed' },
  adjusted: { bg: '#FFF8E6', color: '#92400E', label: 'Price adjusted' },
  current:  { bg: '#E0FAF5', color: '#006058', label: 'Live now' },
};

const PARTY_MAP: Record<string, { bg: string; color: string; icon: string }> = {
  initial:        { bg: '#E0FAF5', color: '#006058', icon: 'AC' },
  counter_iauto:  { bg: '#E0FAF5', color: '#006058', icon: 'AC' },
  counter_seller: { bg: '#FFF8E6', color: '#92400E', icon: 'JS' },
  final:          { bg: '#D1FAE5', color: '#064E3B', icon: '✓' },
};

const OFFER_TYPE_LABEL: Record<string, string> = {
  initial:        'Initial offer from iAutoMotive',
  counter_iauto:  'Counter from iAutoMotive',
  counter_seller: 'Counter from you',
  final:          'Final agreed offer',
};

const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#F7F8F9', color: '#64748B', label: 'Pending' },
  accepted:   { bg: '#D1FAE5', color: '#064E3B', label: 'Accepted' },
  rejected:   { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
  withdrawn:  { bg: '#F7F8F9', color: '#64748B', label: 'Withdrawn' },
  expired:    { bg: '#F7F8F9', color: '#94A3B8', label: 'Expired' },
};

interface Photo { id: string; url: string; isPrimary: boolean; sortOrder: number; }
interface PriceEntry { changedAt: string; previousPriceGbp: number | null; priceGbp: number; reason: string | null; }
interface Offer { id: string; offerType: string; offeredPriceGbp: number; status: string; offeredAt: string; respondedAt: string | null; notes: string | null; }
interface Vehicle {
  registration: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileageAtIntake: number;
  exteriorColour: string | null;
  fuelType: string | null;
  transmission: string | null;
  ownersCountAtIntake: number | null;
  conditionGrade: string | null;
  serviceHistoryType: string | null;
  listingPriceGbp: number | null;
}
interface MeData {
  vehicle: Vehicle | null;
  photos: Photo[];
  priceHistory: PriceEntry[];
  offers: Offer[];
}

const fmtGBP = (pence: number) => '£' + Math.round(pence / 100).toLocaleString('en-GB');
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const tcase = (s: string | null) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '—';

export default function SellerVehiclePage() {
  const [data, setData] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/seller/me')
      .then(r => {
        if (r.status === 401) throw new Error('Sign in to your seller account to see your vehicle.');
        if (r.status === 403) throw new Error('Seller account required.');
        if (!r.ok) throw new Error(`Failed to load (HTTP ${r.status}).`);
        return r.json();
      })
      .then((d: MeData) => setData(d))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#94A3B8', padding: 32, textAlign: 'center' }}>Loading your vehicle…</div>;
  }
  if (error) {
    return <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#94A3B8', padding: 32, textAlign: 'center' }}>{error}</div>;
  }
  if (!data?.vehicle) {
    return <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#94A3B8', padding: 32, textAlign: 'center' }}>No vehicle on file yet — your iAutoMotive contact will set this up after intake.</div>;
  }

  const { vehicle, photos, priceHistory, offers } = data;
  const heroPhoto = photos.find(p => p.isPrimary)?.url ?? photos[0]?.url;
  const galleryPhotos = photos.filter(p => p.url !== heroPhoto).slice(0, 5);
  const moreCount = Math.max(0, photos.length - 1 - galleryPhotos.length);

  const leftSpecs = [
    { key: 'Registration', value: vehicle.registration },
    { key: 'Year',         value: String(vehicle.year) },
    { key: 'Mileage',      value: `${vehicle.mileageAtIntake.toLocaleString('en-GB')} mi` },
    { key: 'Fuel type',    value: tcase(vehicle.fuelType) },
    { key: 'Gearbox',      value: tcase(vehicle.transmission) },
  ];
  const rightSpecs = [
    { key: 'Colour',          value: vehicle.exteriorColour ?? '—' },
    { key: 'Owners',          value: vehicle.ownersCountAtIntake != null ? String(vehicle.ownersCountAtIntake) : '—' },
    { key: 'Condition',       value: tcase(vehicle.conditionGrade) },
    { key: 'Service history', value: tcase(vehicle.serviceHistoryType) },
  ];

  // Inject a synthetic "Current price" entry at the bottom so the live listing
  // value sits at the foot of the timeline like the design called for.
  const priceRows: { date: string; priceGbp: number; event: 'listed' | 'adjusted' | 'current' }[] = [];
  for (let i = 0; i < priceHistory.length; i++) {
    const h = priceHistory[i];
    priceRows.push({
      date: fmtDate(h.changedAt),
      priceGbp: h.priceGbp,
      event: i === 0 ? 'listed' : 'adjusted',
    });
  }
  if (vehicle.listingPriceGbp != null) {
    priceRows.push({ date: 'Current price', priceGbp: vehicle.listingPriceGbp, event: 'current' });
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: '#E2E8F0' }}>
        <p style={{ fontWeight: 700, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Recon photos — your car in our care
        </p>

        {photos.length === 0 ? (
          <div style={{ aspectRatio: '4/3', background: '#F7F8F9', border: '1px solid #E2E8F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase' }}>
            Photos coming soon
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {heroPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroPhoto} alt="Hero" style={{ gridColumn: 'span 2', gridRow: 'span 2', width: '100%', height: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, border: '1px solid #E2E8F0' }} />
            )}
            {galleryPhotos.map(p => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, border: '1px solid #E2E8F0' }} />
            ))}
            {moreCount > 0 && (
              <div className="rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F7F8F9', border: '1px solid #E2E8F0', aspectRatio: '4/3' }}>
                <span style={{ fontWeight: 600, fontSize: 11, color: '#94A3B8' }}>+ {moreCount} more</span>
              </div>
            )}
          </div>
        )}

        <p style={{ fontWeight: 400, fontSize: 12, color: '#94A3B8', textAlign: 'right', marginTop: 8 }}>
          {photos.length} photos taken
        </p>
      </div>

      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: '#E2E8F0' }}>
        <p style={{ fontWeight: 700, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Vehicle details
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24 }}>
          <div>
            {leftSpecs.map((spec, i) => (
              <div key={spec.key} className="flex justify-between items-center"
                style={{ paddingTop: 8, paddingBottom: 8, borderBottom: i < leftSpecs.length - 1 ? '1px solid #F7F8F9' : 'none' }}>
                <span style={{ fontWeight: 400, fontSize: 13, color: '#94A3B8' }}>{spec.key}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{spec.value}</span>
              </div>
            ))}
          </div>
          <div>
            {rightSpecs.map((spec, i) => (
              <div key={spec.key} className="flex justify-between items-center"
                style={{ paddingTop: 8, paddingBottom: 8, borderBottom: i < rightSpecs.length - 1 ? '1px solid #F7F8F9' : 'none' }}>
                <span style={{ fontWeight: 400, fontSize: 13, color: '#94A3B8' }}>{spec.key}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: '#E2E8F0' }}>
        <p style={{ fontWeight: 700, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Price history
        </p>

        {priceRows.length === 0 ? (
          <div style={{ fontSize: 12, color: '#94A3B8', padding: '8px 0' }}>No price changes yet.</div>
        ) : priceRows.map((entry, i) => {
          const badge = BADGE_MAP[entry.event];
          const isCurrent = entry.event === 'current';
          return (
            <div key={i} className="flex items-center justify-between"
              style={{
                paddingTop: 10, paddingBottom: 10,
                borderBottom: i < priceRows.length - 1 ? '1px solid #F7F8F9' : 'none',
                ...(isCurrent ? { backgroundColor: '#F7F8F9', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20, borderRadius: 8 } : {}),
              }}>
              <span style={{ fontWeight: isCurrent ? 700 : 400, fontSize: 12, color: isCurrent ? '#1E293B' : '#94A3B8' }}>
                {entry.date}
              </span>
              <div className="flex items-center" style={{ gap: 10 }}>
                <span style={{ fontWeight: isCurrent ? 800 : 700, fontSize: isCurrent ? 16 : 14, color: isCurrent ? '#008C7C' : '#1E293B' }}>
                  {fmtGBP(entry.priceGbp)}
                </span>
                <span className="rounded-full" style={{ display: 'inline-block', backgroundColor: badge.bg, color: badge.color, fontWeight: 600, fontSize: 11, padding: '2px 10px' }}>
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: '#E2E8F0' }}>
        <p style={{ fontWeight: 700, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Offer & negotiation history
        </p>

        {offers.length === 0 ? (
          <div style={{ fontSize: 12, color: '#94A3B8', padding: '8px 0' }}>
            No buyer offers yet — we&apos;ll log every offer here as soon as it comes in.
          </div>
        ) : offers.map((entry, i) => {
          const party = PARTY_MAP[entry.offerType] ?? PARTY_MAP.initial;
          const status = STATUS_MAP[entry.status] ?? STATUS_MAP.pending;
          return (
            <div key={entry.id} className="flex items-start"
              style={{
                gap: 12, paddingTop: 10, paddingBottom: 10,
                borderBottom: i < offers.length - 1 ? '1px solid #F7F8F9' : 'none',
              }}>
              <div className="rounded-full flex items-center justify-center"
                style={{ width: 28, height: 28, minWidth: 28, backgroundColor: party.bg, color: party.color, fontWeight: 700, fontSize: 11 }}>
                {party.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: '#1E293B', marginBottom: 2 }}>
                  {OFFER_TYPE_LABEL[entry.offerType] ?? tcase(entry.offerType)} — {fmtGBP(entry.offeredPriceGbp)}
                </p>
                {entry.notes && <p style={{ fontWeight: 400, fontSize: 12, color: '#64748B' }}>{entry.notes}</p>}
                <p style={{ fontWeight: 400, fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  {fmtDate(entry.offeredAt)}
                </p>
              </div>
              <span className="rounded-full" style={{ display: 'inline-block', backgroundColor: status.bg, color: status.color, fontWeight: 600, fontSize: 11, padding: '2px 10px' }}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
