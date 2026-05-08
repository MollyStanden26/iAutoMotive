"use client";

// Client-only shell for /purchase/*. The route segment's
// `dynamic = "force-dynamic"` lives on the sibling server-component
// layout.tsx so useSearchParams() here doesn't bail prerendering.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PURCHASE_STEPS, type PurchaseStepId } from "@/lib/purchase/steps";

interface VehicleContext {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  primaryPhoto: string | null;
}

export default function PurchaseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const vehicleId = search.get("vehicleId");
  const [vehicle, setVehicle] = useState<VehicleContext | null>(null);

  // Pull the active step from the URL — used to highlight the sidebar row
  // and to know which steps are "completed" (everything before it).
  const activeStepId = (() => {
    for (const s of PURCHASE_STEPS) {
      if (pathname?.includes(`/purchase/steps/${s.id}`)) return s.id;
    }
    return PURCHASE_STEPS[0].id;
  })() as PurchaseStepId;
  const activeIdx = PURCHASE_STEPS.findIndex(s => s.id === activeStepId);

  useEffect(() => {
    if (!vehicleId) return;
    let cancelled = false;
    fetch(`/api/vehicles/${vehicleId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled || !d?.car) return;
        const photo = d.car.photos?.find((p: { isPrimary: boolean }) => p.isPrimary)?.url
                    ?? d.car.photos?.[0]?.url
                    ?? null;
        setVehicle({
          id: d.car.id, year: d.car.year, make: d.car.make,
          model: d.car.model, trim: d.car.trim, primaryPhoto: photo,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [vehicleId]);

  // The 35-minute countdown is purely cosmetic for now — same as Carvana's
  // "your order is reserved" timer. Hooking it up to a real reservation
  // record is a future step.
  const [secondsLeft, setSecondsLeft] = useState(35 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const stepHref = (stepId: PurchaseStepId) =>
    vehicleId ? `/purchase/steps/${stepId}?vehicleId=${vehicleId}` : `/purchase/steps/${stepId}`;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8F9", fontFamily: "var(--font-body)" }}>
      {/* Top bar: brand + timer + order summary placeholder */}
      <header style={{
        height: 64, background: "#FFFFFF", borderBottom: "1px solid #E2E8F0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", position: "sticky", top: 0, zIndex: 20,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22, color: "#0D1525" }}>
            iAuto<span style={{ color: "#008C7C" }}>Motive</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" style={pillButton("#008C7C", "#FFFFFF")}>Support &amp; Contact</button>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            border: "1px solid #E2E8F0", borderRadius: 9999,
            padding: "6px 14px", fontFamily: "var(--font-body)", fontSize: 13, color: "#334155",
            fontVariantNumeric: "tabular-nums",
          }}>
            <span aria-hidden>🕒</span> 00:{mm}:{ss}
          </span>
        </div>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 320px) 1fr",
        gap: 0, maxWidth: 1280, margin: "0 auto",
      }}>
        {/* Sidebar */}
        <aside style={{ padding: "24px 16px", borderRight: "1px solid #E2E8F0", background: "#FFFFFF", minHeight: "calc(100vh - 64px)" }}>
          {/* Vehicle context card */}
          {vehicle ? (
            <div style={{
              display: "flex", gap: 12, padding: "12px",
              border: "1px solid #E2E8F0", borderRadius: 12, marginBottom: 20,
            }}>
              {vehicle.primaryPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vehicle.primaryPhoto} alt="" style={{
                  width: 72, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0,
                }} />
              ) : (
                <div style={{ width: 72, height: 56, background: "#F1F5F9", borderRadius: 8 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "#0D1525", lineHeight: 1.3 }}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                {vehicle.trim && (
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#64748B", marginTop: 2 }}>
                    {vehicle.trim}
                  </div>
                )}
                <Link href={`/cars/${vehicle.id}/x`} style={{
                  fontFamily: "var(--font-body)", fontSize: 12, color: "#008C7C",
                  textDecoration: "none", marginTop: 4, display: "inline-block",
                }}>
                  View vehicle details
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              padding: "12px",
              border: "1px solid #E2E8F0", borderRadius: 12, marginBottom: 20,
              fontFamily: "var(--font-body)", fontSize: 12, color: "#94A3B8",
            }}>
              No vehicle selected — start from a car listing to attach one.
            </div>
          )}

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, color: "#0D1525" }}>
              Purchase process
            </span>
            <span style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
              background: "#E0FAF5", color: "#006058",
              padding: "3px 8px", borderRadius: 9999,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              In progress
            </span>
          </div>

          {/* Step list */}
          <nav>
            {PURCHASE_STEPS.map((step, i) => {
              const isActive = step.id === activeStepId;
              const isComplete = i < activeIdx;
              const dotBg = isActive ? "#008C7C" : isComplete ? "#008C7C" : "#FFFFFF";
              const dotInner = isComplete ? "✓" : isActive ? "●" : "";
              const dotBorder = isActive || isComplete ? "#008C7C" : "#CBD5E1";
              const labelColor = isActive ? "#0D1525" : isComplete ? "#0D1525" : "#94A3B8";
              return (
                <Link
                  key={step.id}
                  href={stepHref(step.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 12px",
                    background: isActive ? "#E0FAF5" : "transparent",
                    borderRadius: 12,
                    textDecoration: "none",
                    marginBottom: 4,
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `2px solid ${dotBorder}`,
                    background: dotBg, color: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, flexShrink: 0,
                  }}>{dotInner}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: labelColor }}>
                      {step.label}
                    </span>
                    <span style={{
                      display: "block", fontFamily: "var(--font-body)", fontSize: 11,
                      color: isComplete ? "#008C7C" : "#94A3B8", marginTop: 2,
                      fontWeight: isComplete ? 600 : 400,
                    }}>
                      {isComplete ? "Complete" : step.duration}
                    </span>
                  </span>
                  <span style={{ color: "#94A3B8", fontSize: 14 }}>›</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ padding: "32px clamp(20px, 4vw, 56px) 64px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function pillButton(bg: string, color: string): React.CSSProperties {
  return {
    height: 38, padding: "0 16px", borderRadius: 9999,
    background: bg, color, border: "none",
    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
    cursor: "pointer",
  };
}
