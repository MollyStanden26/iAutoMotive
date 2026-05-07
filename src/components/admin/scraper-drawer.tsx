"use client";

import { useEffect, useState } from "react";

const T = {
  bgPanel:     "#0D1525",
  bgInput:     "#0B111E",
  bgSection:   "#111D30",
  border:      "#1E2D4A",
  textPrimary: "#F1F5F9",
  textSecondary: "#8492A8",
  textMuted:   "#6B7A90",
  textDim:     "#4A556B",
  teal:        "#008C7C",
  teal200:     "#4DD9C7",
  tealBg:      "#0A2A26",
  red:         "#F87171",
  redBg:       "#3B1820",
  green:       "#34D399",
  greenBg:     "#0B2A22",
  amber:       "#F59E0B",
  amberBg:     "#3A2510",
};

interface ScraperDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const URL_RE = /^https:\/\/(www\.)?autotrader\.co\.uk\/car-details\/\d+/;
const SLOT_COUNT = 10;

interface PerUrlResult {
  url: string;
  status: "pending" | "running" | "created" | "duplicate" | "failed";
  error?: string;
  title?: string;
  vehicleId?: string;
  photoCount?: number;
}

export function ScraperDrawer({ open, onClose, onCreated }: ScraperDrawerProps) {
  const [urls, setUrls] = useState<string[]>(Array(SLOT_COUNT).fill(""));
  const [mounted, setMounted] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<PerUrlResult[]>([]);
  const [topError, setTopError] = useState<string | null>(null);

  const cancel = () => {
    if (running) return; // don't allow close mid-batch
    setUrls(Array(SLOT_COUNT).fill(""));
    setResults([]);
    setTopError(null);
    onClose();
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

  if (!open) return null;

  const validUrls = urls.map(u => u.trim()).filter(u => URL_RE.test(u));

  async function handleRun() {
    if (running) return;
    setTopError(null);
    if (validUrls.length === 0) {
      setTopError("Add at least one valid AutoTrader car-details URL.");
      return;
    }
    // Seed result rows so the list renders immediately with "pending".
    const seeded: PerUrlResult[] = validUrls.map(u => ({ url: u, status: "pending" }));
    setResults(seeded);
    setRunning(true);

    try {
      const res = await fetch("/api/admin/scraper/autotrader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: validUrls }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const serverResults: PerUrlResult[] = (body.results ?? []).map((r: PerUrlResult) => r);
      // Map server results back onto our seeded order
      const merged = seeded.map(s => {
        const match = serverResults.find(r => r.url === s.url);
        return match ?? { ...s, status: "failed", error: "No result returned" };
      });
      setResults(merged);
      onCreated?.();
    } catch (err) {
      setTopError(err instanceof Error ? err.message : "Scrape failed");
      setResults(prev => prev.map(p => p.status === "pending" || p.status === "running"
        ? { ...p, status: "failed", error: "Batch aborted" }
        : p));
    } finally {
      setRunning(false);
    }
  }

  const updateUrl = (i: number, value: string) => {
    setUrls(prev => prev.map((u, idx) => idx === i ? value : u));
  };

  const statusBadge = (r: PerUrlResult) => {
    const color =
      r.status === "created" ? T.green :
      r.status === "duplicate" ? T.amber :
      r.status === "failed" ? T.red :
      r.status === "running" ? T.teal200 : T.textMuted;
    const bg =
      r.status === "created" ? T.greenBg :
      r.status === "duplicate" ? T.amberBg :
      r.status === "failed" ? T.redBg :
      r.status === "running" ? T.tealBg : T.bgSection;
    const label =
      r.status === "created" ? "Created" :
      r.status === "duplicate" ? "Duplicate" :
      r.status === "failed" ? "Failed" :
      r.status === "running" ? "Running…" : "Pending";
    return (
      <span style={{
        display: "inline-block", padding: "2px 8px", borderRadius: 999,
        background: bg, color, fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
      }}>{label}</span>
    );
  };

  return (
    <>
      <div onClick={cancel}
        style={{ position: "fixed", inset: 0, background: "rgba(7, 13, 24, 0.6)", backdropFilter: "blur(2px)", zIndex: 60, opacity: mounted ? 1 : 0, transition: "opacity 200ms ease" }} />
      <aside role="dialog" aria-label="AutoTrader scraper"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, maxWidth: "100vw", background: T.bgPanel, borderLeft: `1px solid ${T.border}`, zIndex: 61, display: "flex", flexDirection: "column", transform: mounted ? "translateX(0)" : "translateX(100%)", transition: "transform 280ms cubic-bezier(.25,.46,.45,.94)", boxShadow: "-20px 0 40px rgba(0,0,0,0.4)" }}>
        <header className="flex items-center justify-between px-5"
          style={{ height: 64, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>
              AutoTrader bulk import
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              Paste up to 10 listing URLs — each becomes a Lead → Seller → Vehicle. Processed one at a time.
            </div>
          </div>
          <button onClick={cancel} aria-label="Close" disabled={running}
            className="rounded-[8px] hover:opacity-80"
            style={{ width: 32, height: 32, background: T.bgSection, border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: 18, lineHeight: 1, opacity: running ? 0.4 : 1, cursor: running ? "not-allowed" : "pointer" }}>×</button>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* URL inputs */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim, marginBottom: 10 }}>
              Listing URLs ({validUrls.length} valid)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {urls.map((u, i) => {
                const trimmed = u.trim();
                const isValid = trimmed === "" || URL_RE.test(trimmed);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 18, fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim, textAlign: "right" }}>{i + 1}</span>
                    <input
                      type="url"
                      value={u}
                      onChange={e => updateUrl(i, e.target.value)}
                      disabled={running}
                      placeholder="https://www.autotrader.co.uk/car-details/202604081370506"
                      style={{
                        flex: 1, height: 32, padding: "0 10px",
                        background: T.bgInput,
                        border: `1px solid ${isValid ? T.border : T.red}`,
                        borderRadius: 8, color: T.textPrimary,
                        fontFamily: "var(--font-body)", fontSize: 12, outline: "none",
                        opacity: running ? 0.5 : 1,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results panel */}
          {results.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim, marginBottom: 10 }}>
                Results
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.map((r, i) => (
                  <div key={i} style={{
                    background: T.bgSection,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex", flexDirection: "column", gap: 4,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {statusBadge(r)}
                      <span style={{
                        flex: 1, fontFamily: "var(--font-body)", fontSize: 12, color: T.textPrimary,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {r.title ?? r.url}
                      </span>
                      {typeof r.photoCount === "number" && (
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>
                          {r.photoCount} photos
                        </span>
                      )}
                    </div>
                    {r.title && (
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim, paddingLeft: 56 }}>
                        {r.url}
                      </div>
                    )}
                    {r.error && (
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.red, paddingLeft: 56 }}>
                        {r.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 px-5"
          style={{ height: 64, borderTop: `1px solid ${T.border}`, background: T.bgPanel, flexShrink: 0 }}>
          {topError && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.red, flex: 1 }}>{topError}</span>
          )}
          {!topError && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, flex: 1 }}>
              {running ? "Processing… each listing takes 15–30s. Don't close this drawer." : `${validUrls.length} URL${validUrls.length === 1 ? "" : "s"} ready.`}
            </span>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={cancel} disabled={running}
              className="px-4 py-[7px] rounded-[8px] hover:opacity-80"
              style={{ background: T.bgSection, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: T.textSecondary, opacity: running ? 0.5 : 1 }}>
              {results.some(r => r.status === "created") ? "Done" : "Cancel"}
            </button>
            <button type="button" onClick={handleRun} disabled={running || validUrls.length === 0}
              className="px-4 py-[7px] rounded-[8px] hover:opacity-90"
              style={{ background: T.tealBg, border: `1px solid ${T.teal}`, color: T.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, opacity: (running || validUrls.length === 0) ? 0.5 : 1, cursor: running ? "wait" : "pointer" }}>
              {running ? "Scraping…" : `Run scraper (${validUrls.length})`}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
