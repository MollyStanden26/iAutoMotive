// Email verification — required before portal access
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ROLE_HOME_ROUTE } from "@/hooks/use-auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
    }
  }, [user, router]);

  function handleContinue() {
    if (user) {
      router.push(ROLE_HOME_ROUTE[user.role]);
    }
  }

  return (
    <div className="text-center">
      {/* Checkmark icon */}
      <div className="mb-6 flex justify-center">
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#E0FAF5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18l6 6 10-12"
              stroke="#008C7C"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--ac-font-heading)",
          fontSize: 28,
          fontWeight: 800,
          color: "#0F1724",
          margin: "0 0 8px",
        }}
      >
        Email verified!
      </h1>
      <p
        style={{
          fontFamily: "var(--ac-font-body)",
          fontSize: 15,
          color: "#4A556B",
          margin: "0 0 32px",
        }}
      >
        Your account is ready
      </p>

      {/* Continue button */}
      <button
        type="button"
        onClick={handleContinue}
        style={{
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
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#006058")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#008C7C")}
      >
        Continue to dashboard
      </button>
    </div>
  );
}
