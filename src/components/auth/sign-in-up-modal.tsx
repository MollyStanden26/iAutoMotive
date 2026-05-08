"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Marketing-site sign-in / sign-up modal — Carvana-style two-step flow.
 *
 *   step 1: email → /api/auth/probe → branches to step 2a or 2b
 *   step 2a (existing user): password → /api/auth/signin
 *   step 2b (new user):      name + password → /api/auth/register (role=buyer)
 *
 * On success, fires onAuthed() so the parent page can resume whatever the
 * user was trying to do (e.g. continue to checkout for a vehicle).
 *
 * Visual: white card centered over a translucent backdrop, rounded-pill
 * buttons (per AGENTS.md brand rules), Plus Jakarta Sans for headings.
 */
interface SignInUpModalProps {
  open: boolean;
  onClose: () => void;
  onAuthed?: () => void;
  /** Title shown at the top of the modal — defaults to "Welcome to iAutoMotive". */
  heading?: string;
}

type Step = "email" | "signin" | "signup";

export function SignInUpModal({ open, onClose, onAuthed, heading }: SignInUpModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Slide / fade in + escape-to-close + focus management
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => {
      setMounted(true);
      emailRef.current?.focus();
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // When the step transitions, focus the most relevant input
  useEffect(() => {
    if (step === "signin" || step === "signup") {
      passwordRef.current?.focus();
    }
  }, [step]);

  const handleClose = () => {
    if (busy) return;
    setStep("email");
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
    onClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Probe failed");
      setEmail(trimmed);
      setStep(body.exists ? "signin" : "signup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check email");
    } finally {
      setBusy(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Sign in failed");
      // Close first so the parent's re-render fires before we navigate; then
      // navigate. If we call them in the other order, the modal unmount can
      // race the App Router transition and the navigation never commits.
      handleClose();
      onAuthed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) { setError("Enter your name"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password, role: "buyer" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Sign up failed");
      handleClose();
      onAuthed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 70,
          background: "rgba(7, 13, 24, 0.55)",
          backdropFilter: "blur(2px)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in or sign up"
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: `translate(-50%, -50%) ${mounted ? "scale(1)" : "scale(0.96)"}`,
          opacity: mounted ? 1 : 0,
          transition: "opacity 200ms ease, transform 200ms ease",
          width: "min(440px, calc(100vw - 32px))",
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 30px 80px rgba(7, 13, 24, 0.35)",
          zIndex: 71,
          padding: "28px 28px 24px",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748B",
          }}>
            {heading ?? "Welcome to iAutoMotive"}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            disabled={busy}
            style={{
              width: 28, height: 28, borderRadius: 9999,
              background: "#F7F8F9", border: "none",
              fontSize: 18, lineHeight: 1, color: "#64748B",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >×</button>
        </div>

        <h2 style={{
          fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22,
          color: "#0D1525", textAlign: "center", margin: "4px 0 8px",
          letterSpacing: "0.02em",
        }}>
          {step === "email"  && "Sign in or sign up"}
          {step === "signin" && "Welcome back"}
          {step === "signup" && "Create your account"}
        </h2>

        {step === "email" && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#64748B", textAlign: "center", margin: "0 0 20px" }}>
            We&apos;ll use your email to look up your account or create a new one.
          </p>
        )}
        {step === "signin" && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#64748B", textAlign: "center", margin: "0 0 20px" }}>
            Sign in to <span style={{ color: "#0D1525", fontWeight: 600 }}>{email}</span>
          </p>
        )}
        {step === "signup" && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#64748B", textAlign: "center", margin: "0 0 20px" }}>
            New here — let&apos;s get you set up at <span style={{ color: "#0D1525", fontWeight: 600 }}>{email}</span>
          </p>
        )}

        {/* Forms */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <Field label="Email">
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={busy}
                style={inputStyle}
              />
            </Field>
            {error && <ErrorRow text={error} />}
            <SubmitButton disabled={busy || !email.trim()} label={busy ? "Checking…" : "Continue"} />
          </form>
        )}

        {step === "signin" && (
          <form onSubmit={handleSignIn}>
            <Field label="Password">
              <input
                ref={passwordRef}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={busy}
                style={inputStyle}
              />
            </Field>
            {error && <ErrorRow text={error} />}
            <SubmitButton disabled={busy || !password} label={busy ? "Signing in…" : "Sign in"} />
            <BackRow onClick={() => { setStep("email"); setPassword(""); setError(null); }} disabled={busy} />
          </form>
        )}

        {step === "signup" && (
          <form onSubmit={handleSignUp}>
            <Field label="Your name">
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                disabled={busy}
                style={inputStyle}
              />
            </Field>
            <Field label="Choose a password">
              <input
                ref={passwordRef}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8+ characters"
                disabled={busy}
                style={inputStyle}
              />
            </Field>
            {error && <ErrorRow text={error} />}
            <SubmitButton disabled={busy || !name.trim() || password.length < 8} label={busy ? "Creating…" : "Create account"} />
            <BackRow onClick={() => { setStep("email"); setPassword(""); setName(""); setError(null); }} disabled={busy} />
          </form>
        )}

        {/* Terms */}
        <p style={{
          marginTop: 20, paddingTop: 16, borderTop: "1px solid #F1F5F9",
          fontFamily: "var(--font-body)", fontSize: 11, color: "#94A3B8",
          lineHeight: 1.55,
        }}>
          By continuing, you agree to iAutoMotive&apos;s{" "}
          <a href="/legal/terms" style={{ color: "#008C7C", textDecoration: "underline" }}>Terms of Service</a>{" "}
          and{" "}
          <a href="/legal/privacy" style={{ color: "#008C7C", textDecoration: "underline" }}>Privacy Notice</a>.
        </p>
      </div>
    </>
  );
}

/* ── primitives ────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748B",
      }}>{label}</span>
      {children}
    </label>
  );
}

function SubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        width: "100%", height: 46, borderRadius: 9999,
        background: "#008C7C", color: "#FFFFFF",
        border: "none", marginTop: 8,
        fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 120ms ease, background 120ms ease",
      }}
    >{label}</button>
  );
}

function BackRow({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <div style={{ marginTop: 10, textAlign: "center" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          background: "transparent", border: "none",
          fontFamily: "var(--font-body)", fontSize: 12, color: "#64748B",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >← Use a different email</button>
    </div>
  );
}

function ErrorRow({ text }: { text: string }) {
  return (
    <div style={{
      background: "#FEE2E2", border: "1px solid #FCA5A5",
      borderRadius: 8, padding: "8px 10px",
      fontFamily: "var(--font-body)", fontSize: 12, color: "#991B1B",
      marginBottom: 4, marginTop: 4,
    }}>{text}</div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 14px",
  background: "#FFFFFF",
  border: "1px solid #E2E8F0", borderRadius: 12,
  fontFamily: "var(--font-body)", fontSize: 14, color: "#0D1525",
  outline: "none",
};
