// Forgot password — email reset link
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

/* ── shared inline styles ────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--ac-font-body)",
  fontSize: 13,
  fontWeight: 600,
  color: "#0F1724",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#F7F8F9",
  border: "1.5px solid #EAECEF",
  borderRadius: 12,
  padding: "12px 16px",
  fontFamily: "var(--ac-font-body)",
  fontSize: 15,
  color: "#0F1724",
  outline: "none",
  transition: "border-color 0.2s",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  backgroundColor: "#008C7C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 100,
  fontFamily: "var(--ac-font-heading)",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  transition: "background-color 0.2s",
};

/* ── component ───────────────────────────────────────────── */

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div>
      {/* Logo */}
      <div className="mb-6 text-center">
        <span
          style={{
            fontFamily: "var(--ac-font-heading)",
            fontSize: 28,
            fontWeight: 300,
            color: "#8492A8",
          }}
        >
          Auto
        </span>
        <span
          style={{
            fontFamily: "var(--ac-font-heading)",
            fontSize: 28,
            fontWeight: 700,
            color: "#008C7C",
          }}
        >
          Consign
        </span>
      </div>

      {/* Heading */}
      <h1
        className="mb-1 text-center"
        style={{
          fontFamily: "var(--ac-font-heading)",
          fontSize: 28,
          fontWeight: 800,
          color: "#0F1724",
          margin: 0,
        }}
      >
        Reset your password
      </h1>
      <p
        className="mb-8 text-center"
        style={{
          fontFamily: "var(--ac-font-body)",
          fontSize: 15,
          color: "#4A556B",
          marginTop: 6,
        }}
      >
        Enter your email and we&apos;ll send a reset link
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-6">
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#008C7C")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#EAECEF")}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#006058")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#008C7C")}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      ) : (
        /* Success message */
        <div
          className="text-center"
          style={{
            backgroundColor: "#E0FAF5",
            borderRadius: 12,
            padding: "20px 16px",
            marginBottom: 24,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: "0 auto 10px", display: "block" }}
          >
            <path
              d="M7 14l5 5 9-11"
              stroke="#008C7C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p
            style={{
              fontFamily: "var(--ac-font-body)",
              fontSize: 15,
              color: "#006058",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            If an account exists with that email, we&apos;ve sent a reset link.
          </p>
        </div>
      )}

      {/* Back to sign in */}
      <div className="mt-6 text-center">
        <Link
          href="/auth/signin"
          style={{
            fontFamily: "var(--ac-font-body)",
            fontSize: 14,
            color: "#008C7C",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
