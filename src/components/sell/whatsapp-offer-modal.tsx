"use client";

import { useEffect, useState } from "react";

/**
 * Confirmation popup that appears when a /sell visitor clicks "Get your
 * offer". The hero form collects a Reg or VIN; we don't run a valuation
 * here yet — instead we pop a friendly modal with a one-click handoff to
 * WhatsApp where a real person picks up the conversation.
 *
 * The pre-filled message embeds whichever identifier the visitor provided
 * (or asks them to attach details inline) so the team can act on it
 * immediately.
 */

const WHATSAPP_NUMBER = "447418605138"; // E.164 minus the "+"
const PHONE_DISPLAY = "+44 7418 605138";

interface WhatsAppOfferModalProps {
  open: boolean;
  /** "reg" | "vin" — which tab the visitor was on */
  identifierKind: "reg" | "vin";
  /** What the visitor typed (may be empty — modal still works) */
  identifierValue: string;
  onClose: () => void;
}

export function WhatsAppOfferModal({
  open,
  identifierKind,
  identifierValue,
  onClose,
}: WhatsAppOfferModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => setMounted(true));
    return () => {
      window.removeEventListener("keydown", onKey);
      setMounted(false);
    };
  }, [open, onClose]);

  if (!open) return null;

  const trimmedId = identifierValue.trim();
  const idLine = trimmedId
    ? `My ${identifierKind === "reg" ? "registration" : "VIN"} is ${trimmedId}.`
    : "I'd like to share my car's details.";
  const message =
    `Hi iAutoMotive — I'd like an offer to sell my car. ${idLine} ` +
    `What information do you need from me to get started?`;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 70,
          background: "rgba(7, 13, 24, 0.55)",
          backdropFilter: "blur(2px)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      />
      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Continue your sale on WhatsApp"
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748B",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.821 11.821 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.41c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            Continue on WhatsApp
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 9999,
              background: "#F7F8F9", border: "none",
              fontSize: 18, lineHeight: 1, color: "#64748B",
              cursor: "pointer",
            }}
          >×</button>
        </div>

        <h2 style={{
          fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22,
          color: "#0D1525", textAlign: "center", margin: "4px 0 8px",
          letterSpacing: "0.02em",
        }}>
          Talk to a real person
        </h2>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 13, color: "#64748B",
          textAlign: "center", margin: "0 0 18px", lineHeight: 1.55,
        }}>
          We&apos;ll pick up your conversation on WhatsApp at <strong style={{ color: "#0D1525" }}>{PHONE_DISPLAY}</strong>{" "}
          and get back to you with an offer in under an hour during UK business hours.
        </p>

        {/* Message preview */}
        <div style={{
          background: "#F7F8F9",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "12px 14px",
          fontFamily: "var(--font-body)", fontSize: 13,
          color: "#334155", lineHeight: 1.55,
          marginBottom: 18,
        }}>
          <div style={{
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748B",
            marginBottom: 6,
          }}>
            Your message
          </div>
          {message}
        </div>

        {/* Primary CTA */}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            // Close after the click commits so the new tab opens before the
            // backdrop unmounts — feels snappier than a navigate-then-close.
            setTimeout(onClose, 50);
          }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", height: 48, borderRadius: 9999,
            background: "#25D366", color: "#FFFFFF",
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
            textDecoration: "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.821 11.821 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.41c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          Open WhatsApp
        </a>

        <button
          type="button"
          onClick={onClose}
          style={{
            display: "block",
            width: "100%", marginTop: 8,
            padding: "10px 0", border: "none", background: "transparent",
            fontFamily: "var(--font-body)", fontSize: 13, color: "#64748B",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
