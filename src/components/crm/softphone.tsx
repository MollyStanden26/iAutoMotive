"use client";

/**
 * Softphone — the rep's click-to-dial panel for the /admin CRM shell.
 *
 * Aircall is the call provider. The call audio happens in the rep's Aircall app
 * (desktop / web / mobile); this panel just *triggers* outbound calls
 * (POST /api/voice/aircall/dial) and exposes window.iaDial(number) so lead rows,
 * call history and the power dialler can start a call by clicking. Inbound calls
 * ring the Aircall app directly and are logged back via the Aircall webhook.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Phone, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const T = {
  bgCard: "#0D1525", bgSidebar: "#070D18", bgRow: "#111D30",
  border: "#1E2D4A", textPrimary: "#F1F5F9", textSecondary: "#8492A8",
  textMuted: "#6B7A90", teal: "#008C7C", teal200: "#4DD9C7",
  green: "#34D399", greenBg: "#0B2B1A", amber: "#FCD34D",
  red: "#F87171", redBg: "#2B0F0F",
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

type DialState =
  | { phase: "idle" }
  | { phase: "dialing"; to: string }
  | { phase: "ringing"; to: string; agent?: string }
  | { phase: "error"; message: string };

export function Softphone() {
  // Starts collapsed as a phone bubble; expands to the full panel on click.
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [state, setState] = useState<DialState>({ phase: "idle" });
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dial = useCallback(async (number: string) => {
    const to = number.trim();
    if (!to) return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setState({ phase: "dialing", to });
    try {
      const res = await fetch("/api/voice/aircall/dial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const data = await res.json().catch(() => ({} as Record<string, string>));
      if (!res.ok) {
        setState({ phase: "error", message: data.error ?? "Couldn’t start the call" });
        return;
      }
      setState({ phase: "ringing", to: data.to ?? to, agent: data.agent });
      // Audio lives in the Aircall app — clear the status banner after a beat.
      resetTimer.current = setTimeout(() => setState({ phase: "idle" }), 8000);
    } catch {
      setState({ phase: "error", message: "Network error — couldn’t reach Aircall" });
    }
  }, []);

  // Global click-to-call bridge used across the CRM (lead rows, dialler, drawers).
  useEffect(() => {
    (window as unknown as { iaDial?: (n: string) => void }).iaDial = (number: string) => {
      setOpen(true);
      void dial(number);
    };
    return () => { delete (window as unknown as { iaDial?: (n: string) => void }).iaDial; };
  }, [dial]);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const onDial = useCallback(() => { void dial(input); }, [input, dial]);

  const busy = state.phase === "dialing";
  const active = state.phase === "dialing" || state.phase === "ringing";

  return (
    <div
      className={`fixed right-3 bottom-3 sm:right-5 sm:bottom-5 z-[60] ${
        open ? "w-[min(300px,calc(100vw-24px))]" : "w-auto max-w-[calc(100vw-24px)]"
      }`}
      style={{ fontFamily: "var(--font-body)" }}>
      {/* Collapsed phone bubble (FAB) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open dialler"
          className="relative flex items-center justify-center ml-auto"
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: active ? T.green : T.teal,
            border: "none", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,.45)",
            transition: "transform 150ms ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {active && (
            <span className="absolute inset-0 rounded-full animate-ping"
              style={{ background: T.green, opacity: 0.35 }} />
          )}
          <Phone size={22} color={active ? "#04150C" : "#FFFFFF"} className="relative" />
        </button>
      )}

      {open && (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
          overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
          {/* Header */}
          <div className="flex items-center justify-between gap-2"
            style={{ padding: "10px 14px", background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 min-w-0">
              <Phone size={13} color={T.teal200} className="shrink-0" />
              <span className="shrink-0" style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}>Aircall dialler</span>
            </div>
            <X size={15} className="shrink-0" style={{ color: T.textMuted, cursor: "pointer" }} onClick={() => setOpen(false)} />
          </div>

          <div style={{ padding: 14 }}>
            {/* Status banner */}
            <StatusBanner state={state} />

            {/* Dialer */}
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onDial()}
                placeholder="+44…"
                className="min-w-0"
                style={{ flex: 1, background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "8px 12px", color: T.textPrimary, fontSize: 14, outline: "none" }} />
              <button onClick={onDial} aria-label="Call" disabled={busy || !input.trim()}
                className="shrink-0"
                style={{ background: busy || !input.trim() ? T.bgRow : T.green,
                  border: `1px solid ${busy || !input.trim() ? T.border : T.green}`,
                  borderRadius: 10, width: 40, height: 38,
                  display: "grid", placeItems: "center",
                  cursor: busy || !input.trim() ? "default" : "pointer" }}>
                {busy ? <Loader2 size={16} color={T.textMuted} className="animate-spin" />
                  : <Phone size={16} color={input.trim() ? "#04150C" : T.textMuted} />}
              </button>
            </div>
            <Keypad onKey={k => setInput(v => v + k)} />

            <p style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.5, marginTop: 10 }}>
              Calls connect through your <strong style={{ color: T.textSecondary }}>Aircall app</strong> —
              keep it open and set yourself available to take the audio.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBanner({ state }: { state: DialState }) {
  if (state.phase === "idle") return null;

  const map = {
    dialing: { bg: T.greenBg, color: T.green, icon: <Loader2 size={14} className="animate-spin" />, text: `Calling ${state.phase === "dialing" ? state.to : ""}…` },
    ringing: { bg: T.greenBg, color: T.green, icon: <CheckCircle2 size={14} />, text: state.phase === "ringing" ? `Ringing ${state.to} — answer on your Aircall app` : "" },
    error: { bg: T.redBg, color: T.red, icon: <AlertCircle size={14} />, text: state.phase === "error" ? state.message : "" },
  } as const;
  const s = map[state.phase];

  return (
    <div className="flex items-start gap-2" style={{
      background: s.bg, borderRadius: 10, padding: "8px 10px", marginBottom: 10,
    }}>
      <span className="shrink-0" style={{ color: s.color, marginTop: 1 }}>{s.icon}</span>
      <span style={{ fontSize: 11, color: s.color, lineHeight: 1.45 }}>{s.text}</span>
    </div>
  );
}

function Keypad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
      {KEYS.map(k => (
        <button key={k} onClick={() => onKey(k)}
          style={{ background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 10,
            padding: "8px 0", color: T.textPrimary, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          {k}
        </button>
      ))}
    </div>
  );
}
