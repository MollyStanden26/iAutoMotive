// Register — new buyers and consigning sellers
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

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

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isLoading: loading } = useAuth();

  const [role, setRole] = useState<"seller" | "buyer" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please select whether you want to sell or buy");
      return;
    }
    const result = await signUp({ name, email, password, phone: phone || undefined, role });
    if (result.success) {
      router.push("/auth/verify");
    } else {
      setError(result.error || "Registration failed");
    }
  }

  const roleCardStyle = (selected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "20px 16px",
    borderRadius: 16,
    border: selected ? "2px solid #008C7C" : "2px solid #EAECEF",
    backgroundColor: selected ? "#E0FAF5" : "#FFFFFF",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s",
  });

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
          iAuto
        </span>
        <span
          style={{
            fontFamily: "var(--ac-font-heading)",
            fontSize: 28,
            fontWeight: 700,
            color: "#008C7C",
          }}
        >
          Motive
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
        Create your account
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
        Choose how you want to use iAutoMotive
      </p>

      {/* Role selector */}
      <div className="mb-6 flex gap-3">
        <button type="button" onClick={() => setRole("seller")} style={roleCardStyle(role === "seller")}>
          {/* Car + money icon */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: "0 auto 8px" }}
          >
            <path
              d="M6 20h20M8 24h2M22 24h2M7 16l2-6h14l2 6M6 16h20v8H6z"
              stroke={role === "seller" ? "#008C7C" : "#8492A8"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="8" r="4" stroke={role === "seller" ? "#008C7C" : "#8492A8"} strokeWidth="1.5" />
            <text
              x="24"
              y="10"
              textAnchor="middle"
              fill={role === "seller" ? "#008C7C" : "#8492A8"}
              fontSize="7"
              fontWeight="bold"
            >
              $
            </text>
          </svg>
          <div
            style={{
              fontFamily: "var(--ac-font-heading)",
              fontSize: 14,
              fontWeight: 700,
              color: role === "seller" ? "#008C7C" : "#0F1724",
            }}
          >
            I want to sell
          </div>
          <div
            style={{
              fontFamily: "var(--ac-font-body)",
              fontSize: 12,
              color: "#8492A8",
              marginTop: 2,
            }}
          >
            Consign your car
          </div>
        </button>

        <button type="button" onClick={() => setRole("buyer")} style={roleCardStyle(role === "buyer")}>
          {/* Shopping bag icon */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: "0 auto 8px" }}
          >
            <path
              d="M8 12h16l-1.5 14H9.5L8 12z"
              stroke={role === "buyer" ? "#008C7C" : "#8492A8"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 12V9a4 4 0 0 1 8 0v3"
              stroke={role === "buyer" ? "#008C7C" : "#8492A8"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              fontFamily: "var(--ac-font-heading)",
              fontSize: 14,
              fontWeight: 700,
              color: role === "buyer" ? "#008C7C" : "#0F1724",
            }}
          >
            I want to buy
          </div>
          <div
            style={{
              fontFamily: "var(--ac-font-body)",
              fontSize: 12,
              color: "#8492A8",
              marginTop: 2,
            }}
          >
            Browse and purchase
          </div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Full name */}
        <div className="mb-4">
          <label style={labelStyle}>Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#008C7C")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#EAECEF")}
          />
        </div>

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

        {/* Phone */}
        <div className="mb-4">
          <label style={labelStyle}>
            Phone <span style={{ fontWeight: 400, color: "#8492A8" }}>(optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07700 900000"
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
            placeholder="Create a password"
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Sign in link */}
      <p
        className="mt-6 text-center"
        style={{
          fontFamily: "var(--ac-font-body)",
          fontSize: 14,
          color: "#4A556B",
          margin: "24px 0 0",
        }}
      >
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          style={{ color: "#008C7C", fontWeight: 600, textDecoration: "none" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
