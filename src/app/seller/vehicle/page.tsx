import {
  MOCK_VEHICLE,
  MOCK_PRICE_HISTORY,
  MOCK_OFFER_HISTORY,
  formatSellerGBP,
} from '@/lib/seller/seller-mock-data';

const BADGE_MAP: Record<string, { bg: string; color: string; label: string }> = {
  listed:   { bg: '#E0FAF5', color: '#006058', label: 'Listed' },
  adjusted: { bg: '#FFF8E6', color: '#92400E', label: 'Price adjusted' },
  current:  { bg: '#E0FAF5', color: '#006058', label: 'Live now' },
};

const PARTY_MAP: Record<string, { bg: string; color: string; icon: string }> = {
  iautosale: { bg: '#E0FAF5', color: '#006058', icon: 'AC' },
  seller:      { bg: '#FFF8E6', color: '#92400E', icon: 'JS' },
  agreed:      { bg: '#D1FAE5', color: '#064E3B', icon: '✓' },
};

const PHOTO_LABELS = [
  'Front 3/4 Studio',
  'Rear',
  'Interior',
  'Driver side',
  'Dashboard',
  '+ 27 more',
];

const LEFT_SPECS = [
  { key: 'Registration', value: MOCK_VEHICLE.registration },
  { key: 'Year', value: String(MOCK_VEHICLE.year) },
  { key: 'Mileage', value: `${MOCK_VEHICLE.mileage.toLocaleString('en-GB')} mi` },
  { key: 'Fuel type', value: MOCK_VEHICLE.fuelType },
  { key: 'Gearbox', value: MOCK_VEHICLE.gearbox },
];

const RIGHT_SPECS = [
  { key: 'Colour', value: MOCK_VEHICLE.colour },
  { key: 'Owners', value: String(MOCK_VEHICLE.owners) },
  { key: 'HPI status', value: 'Clear ✓', color: '#34D399' },
  { key: 'Condition', value: MOCK_VEHICLE.conditionGrade },
  { key: 'Service history', value: MOCK_VEHICLE.serviceHistory },
];

export default function SellerVehiclePage() {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── 1. Recon Photo Gallery ── */}
      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: '#E2E8F0' }}>
        <p style={{ fontWeight: 700, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Recon photos — your car in our care
        </p>

        {/* TODO: Replace with actual recon photo URLs from lib/seller/seller-mock-data.ts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {PHOTO_LABELS.map((label, i) => (
            <div
              key={label}
              className="rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: '#F7F8F9',
                border: '1px solid #E2E8F0',
                aspectRatio: '4/3',
                ...(i === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center', padding: 8 }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontWeight: 400, fontSize: 12, color: '#94A3B8', textAlign: 'right', marginTop: 8 }}>
          {MOCK_VEHICLE.photoCount} photos taken — 6 shown
        </p>
      </div>

      {/* ── 2. Vehicle Details ── */}
      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: '#E2E8F0' }}>
        <p style={{ fontWeight: 700, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Vehicle details
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24 }}>
          {/* Left column */}
          <div>
            {LEFT_SPECS.map((spec, i) => (
              <div
                key={spec.key}
                className="flex justify-between items-center"
                style={{ paddingTop: 8, paddingBottom: 8, borderBottom: i < LEFT_SPECS.length - 1 ? '1px solid #F7F8F9' : 'none' }}
              >
                <span style={{ fontWeight: 400, fontSize: 13, color: '#94A3B8' }}>{spec.key}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div>
            {RIGHT_SPECS.map((spec, i) => (
              <div
                key={spec.key}
                className="flex justify-between items-center"
                style={{ paddingTop: 8, paddingBottom: 8, borderBottom: i < RIGHT_SPECS.length - 1 ? '1px solid #F7F8F9' : 'none' }}
              >
                <span style={{ fontWeight: 400, fontSize: 13, color: '#94A3B8' }}>{spec.key}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: spec.color ?? '#1E293B' }}>{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Price History ── */}
      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: '#E2E8F0' }}>
        <p style={{ fontWeight: 700, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Price history
        </p>

        {MOCK_PRICE_HISTORY.map((entry, i) => {
          const badge = BADGE_MAP[entry.event];
          const isCurrent = entry.event === 'current';

          return (
            <div
              key={i}
              className="flex items-center justify-between"
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                borderBottom: i < MOCK_PRICE_HISTORY.length - 1 ? '1px solid #F7F8F9' : 'none',
                ...(isCurrent
                  ? { backgroundColor: '#F7F8F9', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20, borderRadius: 8 }
                  : {}),
              }}
            >
              <span
                style={{
                  fontWeight: isCurrent ? 700 : 400,
                  fontSize: 12,
                  color: isCurrent ? '#1E293B' : '#94A3B8',
                }}
              >
                {entry.date}
              </span>

              <div className="flex items-center" style={{ gap: 10 }}>
                <span
                  style={{
                    fontWeight: isCurrent ? 800 : 700,
                    fontSize: isCurrent ? 16 : 14,
                    color: isCurrent ? '#008C7C' : '#1E293B',
                  }}
                >
                  {formatSellerGBP(entry.priceGbp)}
                </span>

                <span
                  className="rounded-full"
                  style={{
                    display: 'inline-block',
                    backgroundColor: badge.bg,
                    color: badge.color,
                    fontWeight: 600,
                    fontSize: 11,
                    padding: '2px 10px',
                  }}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. Offer & Negotiation History ── */}
      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: '#E2E8F0' }}>
        <p style={{ fontWeight: 700, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Offer & negotiation history
        </p>

        {MOCK_OFFER_HISTORY.map((entry, i) => {
          const party = PARTY_MAP[entry.party];

          return (
            <div
              key={entry.id}
              className="flex items-start"
              style={{
                gap: 12,
                paddingTop: 10,
                paddingBottom: 10,
                borderBottom: i < MOCK_OFFER_HISTORY.length - 1 ? '1px solid #F7F8F9' : 'none',
              }}
            >
              {/* Icon circle */}
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  backgroundColor: party.bg,
                  color: party.color,
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                {party.icon}
              </div>

              {/* Body */}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: '#1E293B', marginBottom: 2 }}>
                  {entry.label}
                </p>
                <p style={{ fontWeight: 400, fontSize: 12, color: '#64748B' }}>
                  {entry.detail}
                </p>
                <p style={{ fontWeight: 400, fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  {entry.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
