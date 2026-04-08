// Sign in — email/password, routes to correct portal by role
"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, DEMO_ACCOUNTS } from "@/hooks/use-auth";

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

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#008C7C] border-t-transparent" /></div>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { signIn, isLoading: loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const result = await signIn(email, password);
    if (result.success) {
      router.push(redirect || result.redirectTo || "/");
    } else {
      setError(result.error || "Sign in failed");
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo");
    setError("");
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
        Welcome back
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
        Sign in to your account
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="mb-4">
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

        {/* Password */}
        <div className="mb-4">
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#008C7C")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#EAECEF")}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            className="mb-4"
            style={{
              fontFamily: "var(--ac-font-body)",
              fontSize: 14,
              color: "#EF4444",
              margin: "0 0 16px",
            }}
          >
            {error}
          </p>
        )}

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
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Forgot password */}
      <div className="mt-4 text-center">
        <Link
          href="/auth/reset"
          style={{
            fontFamily: "var(--ac-font-body)",
            fontSize: 14,
            color: "#008C7C",
            textDecoration: "none",
          }}
        >
          Forgot password?
        </Link>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1" style={{ height: 1, backgroundColor: "#EAECEF" }} />
        <span
          style={{
            fontFamily: "var(--ac-font-body)",
            fontSize: 13,
            color: "#8492A8",
          }}
        >
          or
        </span>
        <div className="flex-1" style={{ height: 1, backgroundColor: "#EAECEF" }} />
      </div>

      {/* Register link */}
      <p
        className="text-center"
        style={{
          fontFamily: "var(--ac-font-body)",
          fontSize: 14,
          color: "#4A556B",
          margin: 0,
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          style={{ color: "#008C7C", fontWeight: 600, textDecoration: "none" }}
        >
          Register
        </Link>
      </p>

      {/* ── Demo section ──────────────────────────────────── */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1" style={{ height: 1, backgroundColor: "#EAECEF" }} />
          <span
            style={{
              fontFamily: "var(--ac-font-heading)",
              fontSize: 13,
              fontWeight: 600,
              color: "#8492A8",
              whiteSpace: "nowrap",
            }}
          >
            Quick demo access
          </span>
          <div className="flex-1" style={{ height: 1, backgroundColor: "#EAECEF" }} />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {DEMO_ACCOUNTS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => fillDemo(demo.email)}
              style={{
                fontFamily: "var(--ac-font-body)",
                fontSize: 13,
                fontWeight: 500,
                color: "#4A556B",
                backgroundColor: "#F7F8F9",
                border: "1.5px solid #EAECEF",
                borderRadius: 100,
                padding: "6px 14px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#E0FAF5";
                e.currentTarget.style.borderColor = "#008C7C";
                e.currentTarget.style.color = "#008C7C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F7F8F9";
                e.currentTarget.style.borderColor = "#EAECEF";
                e.currentTarget.style.color = "#4A556B";
              }}
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
