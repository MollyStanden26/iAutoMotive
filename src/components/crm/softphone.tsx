"use client";

/**
 * Softphone — the rep's WebRTC dialler. A fixed, collapsible panel for the
 * /admin CRM shell. Drives useTelnyxDevice for outbound dial + inbound answer
 * with in-call controls (mute, hold, keypad, hangup).
 *
 * Self-contained on purpose: it gives reps working calling without depending on
 * the larger power-dialler queue UI, and exposes window.iaDial(number) so other
 * CRM screens (lead rows, call history) can trigger a call by clicking.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Phone, PhoneOff, PhoneIncoming, PhoneOutgoing, Mic, MicOff,
  Pause, Play, Grid3x3, X, Wifi, WifiOff, Loader2,
} from "lucide-react";
import { useTelnyxDevice } from "@/lib/telnyx/use-telnyx-device";

const T = {
  bgCard: "#0D1525", bgSidebar: "#070D18", bgRow: "#111D30",
  border: "#1E2D4A", textPrimary: "#F1F5F9", textSecondary: "#8492A8",
  textMuted: "#6B7A90", teal: "#008C7C", teal200: "#4DD9C7",
  green: "#34D399", greenBg: "#0B2B1A", amber: "#FCD34D",
  red: "#F87171", redBg: "#2B0F0F",
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

/** Colour for the small connection-status dot on the collapsed bubble. */
function bubbleStatusColor(status: string): string {
  if (status === "ready") return T.green;
  if (status === "connecting") return T.amber;
  if (status === "error") return T.red;
  return T.textMuted; // idle / unconfigured
}

function useCallTimer(answeredAt: number | null): string {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!answeredAt) return;
    const id = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, [answeredAt]);
  if (!answeredAt) return "";
  const s = Math.max(0, Math.floor((Date.now() - answeredAt) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function Softphone() {
  const dev = useTelnyxDevice();
  // Starts collapsed as a phone bubble; expands to the full panel on click.
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [keypad, setKeypad] = useState(false);
  const timer = useCallTimer(dev.call?.answeredAt ?? null);

  // Expose a global click-to-call so lead rows / call history can dial. Opening
  // the panel here means a click-to-call also surfaces the live call UI.
  useEffect(() => {
    (window as any).iaDial = (number: string) => {
      setOpen(true);
      if (dev.status === "ready") dev.dial(number);
      else setInput(number);
    };
    return () => { delete (window as any).iaDial; };
  }, [dev]);

  // Auto-expand on an incoming call so it can always be answered, even if the
  // rep had collapsed the softphone to the bubble.
  const callPhase = dev.call?.phase;
  useEffect(() => {
    if (callPhase === "incoming") setOpen(true);
  }, [callPhase]);

  const onDial = useCallback(() => {
    const n = input.trim();
    if (n) dev.dial(n);
  }, [input, dev]);

  const inCall = dev.call && dev.call.phase !== "idle";

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
          aria-label={inCall ? `On call ${timer}` : "Open softphone"}
          className="relative flex items-center justify-center ml-auto"
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: inCall ? T.green : T.teal,
            border: "none", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,.45)",
            transition: "transform 150ms ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {/* Live-call pulse ring */}
          {inCall && (
            <span className="absolute inset-0 rounded-full animate-ping"
              style={{ background: T.green, opacity: 0.35 }} />
          )}
          <Phone size={22} color={inCall ? "#04150C" : "#FFFFFF"} className="relative" />
          {/* Connection status dot */}
          <span
            className="absolute"
            style={{
              top: 2, right: 2, width: 13, height: 13, borderRadius: 999,
              border: "2px solid #0B111E",
              background: bubbleStatusColor(dev.status),
            }}
          />
        </button>
      )}

      {open && (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
          overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
          {/* Header */}
          <div className="flex items-center justify-between gap-2"
            style={{ padding: "10px 14px", background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0"><StatusDot status={dev.status} /></span>
              <span className="shrink-0" style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}>Softphone</span>
              {dev.callerNumber && (
                <span className="truncate" style={{ fontSize: 10, color: T.textMuted }}>· {dev.callerNumber}</span>
              )}
            </div>
            <X size={15} className="shrink-0" style={{ color: T.textMuted, cursor: "pointer" }} onClick={() => setOpen(false)} />
          </div>

          <div style={{ padding: 14 }}>
            {/* Offline / status states */}
            {dev.status === "idle" && (
              <OfflineState label="You're offline" cta="Go online" onClick={dev.connect} />
            )}
            {dev.status === "connecting" && (
              <div className="flex items-center gap-2" style={{ color: T.textSecondary, fontSize: 12, padding: "8px 0" }}>
                <Loader2 size={14} className="animate-spin" /> Connecting…
              </div>
            )}
            {dev.status === "unconfigured" && (
              <p style={{ fontSize: 11, color: T.amber, lineHeight: 1.5 }}>
                Voice isn’t configured yet. Add the Telnyx keys in Settings → Integrations,
                then assign this rep a number.
              </p>
            )}
            {dev.status === "error" && (
              <OfflineState label={dev.error ?? "Connection error"} cta="Retry" onClick={dev.connect} danger />
            )}

            {/* Ready + idle: dialer */}
            {dev.status === "ready" && !inCall && (
              <>
                <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && onDial()}
                    placeholder="+44…"
                    className="min-w-0"
                    style={{ flex: 1, background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 10,
                      padding: "8px 12px", color: T.textPrimary, fontSize: 14, outline: "none" }} />
                  <button onClick={onDial} aria-label="Call"
                    className="shrink-0"
                    style={{ background: T.green, border: "none", borderRadius: 10, width: 40, height: 38,
                      display: "grid", placeItems: "center", cursor: "pointer" }}>
                    <Phone size={16} color="#04150C" />
                  </button>
                </div>
                <Keypad onKey={k => setInput(v => v + k)} />
              </>
            )}

            {/* Incoming */}
            {dev.call?.phase === "incoming" && (
              <div style={{ textAlign: "center" }}>
                <PhoneIncoming size={22} style={{ color: T.teal200, margin: "4px auto 8px" }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{dev.call.remoteNumber}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12 }}>Incoming call</div>
                <div className="flex gap-2">
                  <ActionBtn label="Decline" color={T.red} bg={T.redBg} icon={<PhoneOff size={16} />} onClick={dev.hangup} />
                  <ActionBtn label="Answer" color="#04150C" bg={T.green} icon={<Phone size={16} />} onClick={dev.answer} />
                </div>
              </div>
            )}

            {/* In-call (dialing / active / held) */}
            {inCall && dev.call?.phase !== "incoming" && (
              <div>
                <div className="flex items-center justify-between gap-2" style={{ marginBottom: 12 }}>
                  <div className="flex items-center gap-2 min-w-0">
                    {dev.call?.direction === "inbound"
                      ? <PhoneIncoming size={15} color={T.teal200} className="shrink-0" />
                      : <PhoneOutgoing size={15} color={T.teal200} className="shrink-0" />}
                    <span className="truncate" style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{dev.call?.remoteNumber}</span>
                  </div>
                  <span className="shrink-0" style={{ fontSize: 12, color: T.textMuted }}>
                    {dev.call?.phase === "dialing" ? "Dialing…" : dev.call?.phase === "held" ? "On hold" : timer || "00:00"}
                  </span>
                </div>

                {keypad && <div style={{ marginBottom: 12 }}><Keypad onKey={dev.sendDigit} /></div>}

                <div className="flex items-center justify-between gap-2">
                  <CtlBtn active={dev.call?.muted} onClick={dev.toggleMute}
                    icon={dev.call?.muted ? <MicOff size={16} /> : <Mic size={16} />} label="Mute" />
                  <CtlBtn active={dev.call?.phase === "held"} onClick={dev.toggleHold}
                    icon={dev.call?.phase === "held" ? <Play size={16} /> : <Pause size={16} />} label="Hold" />
                  <CtlBtn active={keypad} onClick={() => setKeypad(v => !v)}
                    icon={<Grid3x3 size={16} />} label="Keys" />
                  <button onClick={dev.hangup} aria-label="Hang up"
                    className="shrink-0"
                    style={{ background: T.red, border: "none", borderRadius: 12, width: 48, height: 40,
                      display: "grid", placeItems: "center", cursor: "pointer" }}>
                    <PhoneOff size={18} color="#1A0606" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === "ready" ? T.green : status === "connecting" ? T.amber
    : status === "error" ? T.red : T.textMuted;
  const Icon = status === "ready" ? Wifi : status === "connecting" ? Loader2 : WifiOff;
  return <Icon size={13} color={color} className={status === "connecting" ? "animate-spin" : ""} />;
}

function OfflineState({ label, cta, onClick, danger }:
  { label: string; cta: string; onClick: () => void; danger?: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "6px 0" }}>
      <p style={{ fontSize: 12, color: danger ? T.red : T.textSecondary, marginBottom: 10 }}>{label}</p>
      <button onClick={onClick}
        style={{ background: T.teal, border: "none", borderRadius: 100, padding: "8px 18px",
          color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{cta}</button>
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

function ActionBtn({ label, color, bg, icon, onClick }:
  { label: string; color: string; bg: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center gap-2 min-w-0"
      style={{ flex: 1, background: bg, border: "none", borderRadius: 12, padding: "10px 0",
        color, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
      {icon}{label}
    </button>
  );
}

function CtlBtn({ active, onClick, icon, label }:
  { active?: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-0"
      style={{ flex: 1, background: active ? T.teal : T.bgRow, border: `1px solid ${active ? T.teal : T.border}`,
        borderRadius: 12, padding: "8px 0", color: active ? "#fff" : T.textSecondary, cursor: "pointer" }}>
      {icon}
      <span style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
    </button>
  );
}
