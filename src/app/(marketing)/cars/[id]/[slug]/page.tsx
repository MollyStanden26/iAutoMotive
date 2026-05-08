"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { SignInUpModal } from "@/components/auth/sign-in-up-modal";

interface CarDetails {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  title: string;
  subtitle: string;
  mileage: number;
  price: number;
  monthlyEstimate: number;
  details: {
    fuelType: string;
    transmission: string;
    bodyType: string;
    exteriorColour: string;
    owners: number | null;
    conditionGrade: string;
    serviceHistory: string;
    hpiClear: boolean;
    location: string | null;
  };
  photos: { url: string; isPrimary: boolean; category: string }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 }).format(n);

export default function VehicleDetailPage() {
  const params = useParams<{ id: string; slug: string }>();
  const [car, setCar] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  // What "Get started" does: drop the user into the multi-step purchase
  // flow with this vehicle pre-attached. Signed-in users go straight there;
  // everyone else gets the sign-in/sign-up modal first, then we resume on
  // success via `onAuthed`.
  const startCheckout = () => {
    if (!params?.id) return;
    router.push(`/purchase/steps/personal-details?vehicleId=${params.id}`);
  };
  const handleGetStarted = () => {
    if (userLoading) return;
    if (user) startCheckout();
    else setAuthOpen(true);
  };

  useEffect(() => {
    if (!params?.id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/vehicles/${params.id}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setCar(data.car); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "Not found"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-ac-6 py-ac-8 font-body text-sm text-slate-500">
        Loading vehicle…
      </div>
    );
  }
  if (error || !car) {
    return (
      <div className="mx-auto max-w-[1400px] px-ac-6 py-ac-8">
        <Link href="/cars" className="font-body text-sm font-medium text-teal-700 hover:text-teal-900">
          ← Back to all cars
        </Link>
        <div className="mt-ac-6 rounded-[12px] border border-slate-200 bg-white p-ac-6">
          <h1 className="font-heading text-2xl font-bold text-slate-900">Vehicle not found</h1>
          <p className="mt-ac-2 font-body text-sm text-slate-500">
            {error ?? "This listing may have been removed or sold."}
          </p>
        </div>
      </div>
    );
  }

  const heroPhoto = car.photos[activePhotoIdx]?.url ?? car.photos.find(p => p.isPrimary)?.url ?? car.photos[0]?.url;

  const detailRows = [
    { label: "MPG",            value: "—" },
    { label: "Drivetrain",     value: "FWD" },
    { label: "Exterior color", value: car.details.exteriorColour },
    { label: "Body type",      value: car.details.bodyType },
    { label: "Seating",        value: "5 Seats" },
    { label: "Fuel type",      value: car.details.fuelType },
    { label: "Transmission",   value: car.details.transmission },
    { label: "Owners",         value: car.details.owners != null ? String(car.details.owners) : "—" },
    { label: "HPI status",     value: car.details.hpiClear ? "Clear ✓" : "Pending" },
    { label: "Service history", value: car.details.serviceHistory },
    { label: "Condition",      value: car.details.conditionGrade },
    { label: "Location",       value: car.details.location ?? "—" },
  ];

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1400px] px-ac-6 pt-ac-4 pb-ac-12">
        {/* Breadcrumb */}
        <div className="font-body text-[13px] text-slate-500 mb-ac-4">
          <Link href="/cars" className="hover:text-slate-900">All Cars</Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-slate-900">{car.make}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{car.model}</span>
        </div>

        <div className="grid grid-cols-1 gap-ac-6 lg:grid-cols-[1fr_360px]">
          {/* ── Left column ── */}
          <div>
            {/* Hero photo */}
            <div
              className="relative w-full overflow-hidden rounded-[16px] bg-slate-100"
              style={{ aspectRatio: "16 / 10" }}
            >
              {heroPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={heroPhoto} alt={car.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center font-body text-sm text-slate-400">
                  No photos available
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {car.photos.length > 1 && (
              <div className="mt-ac-3 grid grid-cols-4 gap-ac-2 sm:grid-cols-5">
                {car.photos.slice(0, 5).map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhotoIdx(i)}
                    className="relative overflow-hidden rounded-[10px] border-2 transition-colors"
                    style={{
                      aspectRatio: "4 / 3",
                      borderColor: i === activePhotoIdx ? "#008C7C" : "transparent",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                    {i === 4 && car.photos.length > 5 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/70 font-body text-sm font-semibold text-white">
                        +{car.photos.length - 5} more
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Tab nav (cosmetic). Each tab takes an equal share of the bar. */}
            <div className="mt-ac-6 flex w-full items-center rounded-pill border border-slate-200 bg-white p-1">
              {["Overview", "Features", "Vehicle Details", "Pricing", "Inspection"].map((tab, i) => (
                <button
                  key={tab}
                  className="flex-1 rounded-pill py-1.5 font-body text-[13px] font-semibold text-center transition-colors"
                  style={{
                    background: i === 2 ? "#E0FAF5" : "transparent",
                    color: i === 2 ? "#008C7C" : "#0F1724",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Vehicle details */}
            <div className="mt-ac-6 rounded-[16px] border border-slate-200 bg-white p-ac-6">
              <div className="flex items-baseline gap-ac-2">
                <span className="h-[3px] w-[24px] rounded bg-amber-400" />
                <h2 className="font-heading text-2xl font-bold text-slate-900">Vehicle Details</h2>
              </div>
              <div className="mt-ac-4 grid grid-cols-1 gap-x-ac-6 gap-y-ac-3 sm:grid-cols-2 lg:grid-cols-3">
                {detailRows.map(row => (
                  <div key={row.label} className="flex flex-col border-b border-slate-100 py-ac-2">
                    <span className="font-body text-[12px] uppercase tracking-wide text-slate-400">{row.label}</span>
                    <span className="font-body text-[14px] font-semibold text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price details */}
            <div className="mt-ac-6 rounded-[16px] bg-sky-50 p-ac-6">
              <div className="flex items-baseline gap-ac-2 justify-center">
                <span className="h-[3px] w-[24px] rounded bg-amber-400" />
                <h2 className="font-heading text-2xl font-bold text-slate-900">Price Details</h2>
              </div>
              <div className="mt-ac-4 grid grid-cols-1 gap-ac-4 md:grid-cols-2">
                <div className="rounded-[12px] bg-white p-ac-5">
                  <div className="font-body text-[14px] font-semibold text-slate-900">Pay monthly</div>
                  <div className="mt-ac-2">
                    <span className="font-heading text-3xl font-bold text-slate-900">{fmt(car.monthlyEstimate)}</span>
                    <span className="font-body text-sm text-slate-500">/mo*</span>
                  </div>
                  <p className="mt-ac-3 font-body text-[13px] text-slate-500">
                    Estimated based on a 60-month plan with iAutoMotive Finance.
                  </p>
                </div>
                <div className="rounded-[12px] bg-white p-ac-5">
                  <div className="font-body text-[14px] font-semibold text-slate-900">Pay once</div>
                  <div className="mt-ac-2">
                    <span className="font-heading text-3xl font-bold text-slate-900">{fmt(car.price)}</span>
                    <span className="ml-ac-2 font-body text-sm font-semibold text-emerald-600">Free shipping</span>
                  </div>
                  <div className="mt-ac-4 space-y-ac-2 font-body text-[13px]">
                    <div className="flex justify-between"><span className="text-slate-500">Vehicle price</span><span className="text-slate-900">{fmt(car.price)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Shipping fee</span><span className="font-semibold text-emerald-600">£0</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column: sticky price card.
              Navbar is sticky at the top with height 79px (see src/components/layout/navbar.tsx);
              offset by 79 + 16px gap so the card never overlaps it. ── */}
          <aside className="lg:sticky lg:self-start" style={{ top: 95 }}>
            <div className="rounded-[16px] border border-slate-200 bg-white p-ac-5 shadow-sm">
              <div>
                <div className="font-heading text-2xl font-bold text-slate-900">{car.title}</div>
                <div className="mt-ac-1 font-body text-sm text-slate-500">{car.subtitle}</div>
              </div>
              <div className="mt-ac-4 flex items-baseline gap-ac-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-heading text-3xl font-extrabold text-slate-900">{fmt(car.price)}</span>
              </div>
              <p className="mt-ac-1 font-body text-[13px] text-slate-500">
                {fmt(car.monthlyEstimate)}/mo estimated · £0 cash down
              </p>
              <p className="mt-ac-1 font-body text-[13px] font-semibold text-emerald-600">
                Free shipping
              </p>
              <button
                type="button"
                onClick={handleGetStarted}
                disabled={userLoading}
                className="mt-ac-4 w-full rounded-pill bg-teal-600 px-ac-4 py-3 font-heading text-base font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Get started
              </button>
              <div className="mt-ac-4 flex items-center justify-between border-t border-slate-100 pt-ac-3 font-body text-sm">
                <button type="button" className="flex items-center gap-1 text-slate-500 hover:text-slate-900">↗ Share</button>
                <button type="button" className="flex items-center gap-1 text-slate-500 hover:text-slate-900">♡ Save</button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SignInUpModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={() => startCheckout()}
        heading="Welcome to iAutoMotive"
      />
    </div>
  );
}
