"use client";

import { useEffect, useState } from "react";

interface LeaveMessageModalProps {
  open: boolean;
  onClose: () => void;
}

const FIELD_STYLE: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#F7F8F9",
  border: "1.5px solid #EAECEF",
  borderRadius: "12px",
  padding: "11px 14px",
  fontFamily: "var(--font-body)",
  fontSize: "15px",
  color: "#0F1724",
  outline: "none",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  fontWeight: 600,
  color: "#0F1724",
  marginBottom: "6px",
};

export function LeaveMessageModal({ open, onClose }: LeaveMessageModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — hidden from humans
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Reset + Esc-to-close whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setError(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => {
    setName(""); setEmail(""); setSubject(""); setMessage(""); setCompany("");
    setSent(false); setError(null);
  };

  const close = () => { reset(); onClose(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        background: "rgba(15,23,36,0.45)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Leave us a message"
        style={{
          width: "100%", maxWidth: "460px", background: "#FFFFFF",
          borderRadius: "20px", padding: "28px 26px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {sent ? (
          <div style={{ textAlign: "center", padding: "12px 4px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E0FAF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#008C7C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-heading" style={{ fontSize: "20px", fontWeight: 800, color: "#0F1724", margin: 0 }}>
              Message sent
            </p>
            <p className="font-body" style={{ fontSize: "14px", color: "#4A556B", margin: "10px 0 0", lineHeight: 1.6 }}>
              Thanks{name ? `, ${name.split(" ")[0]}` : ""}. Our team will reply to{" "}
              <strong style={{ color: "#0F1724" }}>{email}</strong> &mdash; usually within one working day
              (support hours Mon&ndash;Fri 9am&ndash;6pm, Sat 10am&ndash;4pm).
            </p>
            <button
              onClick={close}
              style={{ marginTop: "22px", padding: "11px 22px", borderRadius: "100px", background: "#008C7C", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
              <h3 className="font-heading" style={{ fontSize: "20px", fontWeight: 800, color: "#0F1724", margin: 0 }}>
                Leave us a message
              </h3>
              <button onClick={close} aria-label="Close" style={{ background: "none", border: "none", fontSize: "22px", lineHeight: 1, color: "#8492A8", cursor: "pointer", padding: 0 }}>&times;</button>
            </div>
            <p className="font-body" style={{ fontSize: "13.5px", color: "#4A556B", margin: "0 0 20px", lineHeight: 1.55 }}>
              Send our team a message and we&rsquo;ll reply by email. We typically respond within one working day.
            </p>

            <form onSubmit={submit}>
              {/* Honeypot — visually hidden, off-screen, not tab-reachable */}
              <input
                type="text" name="company" tabIndex={-1} autoComplete="off"
                value={company} onChange={(e) => setCompany(e.target.value)}
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
              />

              <div style={{ marginBottom: "14px" }}>
                <label style={LABEL_STYLE} htmlFor="lm-name">Your name</label>
                <input id="lm-name" required value={name} onChange={(e) => setName(e.target.value)} style={FIELD_STYLE} placeholder="Jane Smith" maxLength={120} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={LABEL_STYLE} htmlFor="lm-email">Email</label>
                <input id="lm-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={FIELD_STYLE} placeholder="you@example.com" maxLength={200} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={LABEL_STYLE} htmlFor="lm-subject">Subject <span style={{ color: "#8492A8", fontWeight: 400 }}>(optional)</span></label>
                <input id="lm-subject" value={subject} onChange={(e) => setSubject(e.target.value)} style={FIELD_STYLE} placeholder="What's it about?" maxLength={160} />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label style={LABEL_STYLE} htmlFor="lm-message">Message</label>
                <textarea id="lm-message" required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} style={{ ...FIELD_STYLE, resize: "vertical", minHeight: "96px" }} placeholder="How can we help?" maxLength={4000} />
              </div>

              {error && (
                <p className="font-body" style={{ fontSize: "13px", color: "#EF4444", margin: "4px 0 0" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{ width: "100%", marginTop: "18px", padding: "13px", borderRadius: "100px", background: "#008C7C", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "15px", cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Sending…" : "Send message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
