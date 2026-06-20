"use client";

/**
 * useTelnyxDevice — React hook wrapping the Telnyx WebRTC SDK for the CRM
 * softphone. Handles token fetch + refresh, registration, and a single active
 * call (outbound dial + inbound answer), exposing a small imperative API the
 * dialler UI can drive.
 *
 * The heavy `@telnyx/webrtc` module is imported dynamically inside connect()
 * so it never runs during SSR (it touches `window`/`navigator` at init).
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type DeviceStatus =
  | "idle"          // not connected
  | "connecting"    // fetching token / registering
  | "ready"         // registered, can place/receive calls
  | "unconfigured"  // backend has no Telnyx creds yet
  | "error";

export type CallPhase =
  | "idle"
  | "incoming"      // inbound ringing, awaiting answer
  | "dialing"       // outbound, not yet answered
  | "active"
  | "held"
  | "ending";

export interface ActiveCall {
  direction: "inbound" | "outbound";
  remoteNumber: string;
  phase: CallPhase;
  muted: boolean;
  /** epoch ms when the call became active, else null */
  answeredAt: number | null;
}

interface TokenResponse {
  configured: boolean;
  login_token?: string;
  callerNumber?: string | null;
  refreshAfterSeconds?: number;
  error?: string;
}

const REMOTE_AUDIO_ID = "telnyx-remote-audio";

export function useTelnyxDevice() {
  const [status, setStatus] = useState<DeviceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [callerNumber, setCallerNumber] = useState<string | null>(null);
  const [call, setCall] = useState<ActiveCall | null>(null);

  // SDK client + current Call kept in refs — they aren't render state.
  const clientRef = useRef<any>(null);
  const callRef = useRef<any>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Reflect an SDK Call object's state into our render model. */
  const syncCall = useCallback((c: any) => {
    if (!c) {
      setCall(null);
      return;
    }
    const phase = mapPhase(c.state);
    if (phase === "idle") {
      callRef.current = null;
      setCall(null);
      return;
    }
    callRef.current = c;
    setCall({
      direction: c.direction === "inbound" ? "inbound" : "outbound",
      remoteNumber:
        c.options?.remoteCallerNumber || c.options?.destinationNumber || "Unknown",
      phase,
      muted: Boolean(c.options?.micMuted),
      answeredAt: phase === "active" || phase === "held" ? Date.now() : null,
    });
  }, []);

  const ensureAudioEl = useCallback(() => {
    if (typeof document === "undefined") return;
    if (!document.getElementById(REMOTE_AUDIO_ID)) {
      const el = document.createElement("audio");
      el.id = REMOTE_AUDIO_ID;
      el.autoplay = true;
      el.style.display = "none";
      document.body.appendChild(el);
    }
  }, []);

  const fetchToken = useCallback(async (): Promise<TokenResponse> => {
    const res = await fetch("/api/voice/token", { cache: "no-store" });
    if (res.status === 503) return { configured: false };
    if (!res.ok) throw new Error(`token ${res.status}`);
    return res.json();
  }, []);

  const connect = useCallback(async () => {
    if (clientRef.current) return; // already connected/connecting
    setStatus("connecting");
    setError(null);
    try {
      const tok = await fetchToken();
      if (!tok.configured || !tok.login_token) {
        setStatus("unconfigured");
        return;
      }
      setCallerNumber(tok.callerNumber ?? null);
      ensureAudioEl();

      const { TelnyxRTC } = await import("@telnyx/webrtc");
      const client = new TelnyxRTC({ login_token: tok.login_token });
      client.remoteElement = REMOTE_AUDIO_ID;

      client.on("telnyx.ready", () => setStatus("ready"));
      client.on("telnyx.error", (e: any) => {
        setError(e?.error?.message ?? "Voice connection error");
        setStatus("error");
      });
      client.on("telnyx.socket.close", () => setStatus("idle"));
      client.on("telnyx.notification", (n: any) => {
        if (n.type === "callUpdate" && n.call) syncCall(n.call);
      });

      clientRef.current = client;
      client.connect();

      // Re-mint the JWT before it expires and hand it to the live client.
      const refreshMs = (tok.refreshAfterSeconds ?? 12 * 60 * 60) * 1000;
      refreshTimer.current = setTimeout(async function refresh() {
        try {
          const next = await fetchToken();
          if (next.login_token && clientRef.current) {
            clientRef.current.login_token = next.login_token;
            setCallerNumber(next.callerNumber ?? null);
          }
        } catch {
          /* keep the existing token; next reconnect will refresh */
        }
        refreshTimer.current = setTimeout(refresh, refreshMs);
      }, refreshMs);
    } catch (err: any) {
      setError(err?.message ?? "Could not start voice");
      setStatus("error");
    }
  }, [fetchToken, ensureAudioEl, syncCall]);

  const disconnect = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = null;
    try {
      callRef.current?.hangup?.();
      clientRef.current?.disconnect?.();
    } catch {
      /* ignore */
    }
    clientRef.current = null;
    callRef.current = null;
    setCall(null);
    setStatus("idle");
  }, []);

  const dial = useCallback(
    (destinationNumber: string) => {
      const client = clientRef.current;
      if (!client || status !== "ready") return;
      const c = client.newCall({
        destinationNumber,
        callerNumber: callerNumber ?? undefined,
        audio: true,
        video: false,
      });
      syncCall(c);
    },
    [status, callerNumber, syncCall]
  );

  const answer = useCallback(() => callRef.current?.answer?.(), []);
  const hangup = useCallback(() => callRef.current?.hangup?.(), []);
  const sendDigit = useCallback((d: string) => callRef.current?.dtmf?.(d), []);

  const toggleMute = useCallback(() => {
    const c = callRef.current;
    if (!c) return;
    if (c.options?.micMuted) c.unmuteAudio();
    else c.muteAudio();
    syncCall(c);
  }, [syncCall]);

  const toggleHold = useCallback(() => {
    const c = callRef.current;
    if (!c) return;
    if (c.state === "held") c.unhold?.();
    else c.hold?.();
  }, []);

  // Tear down on unmount.
  useEffect(() => () => disconnect(), [disconnect]);

  return {
    status,
    error,
    callerNumber,
    call,
    connect,
    disconnect,
    dial,
    answer,
    hangup,
    sendDigit,
    toggleMute,
    toggleHold,
  };
}

function mapPhase(sdkState: string): CallPhase {
  switch (sdkState) {
    case "new":
    case "requesting":
    case "trying":
    case "early":
    case "recovering":
      return "dialing";
    case "ringing":
      return "incoming";
    case "active":
      return "active";
    case "held":
      return "held";
    case "hangup":
    case "destroy":
    case "purge":
      return "idle";
    default:
      return "dialing";
  }
}
