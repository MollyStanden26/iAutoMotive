// Sign out — clears session, returns to homepage
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function SignOutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    async function performSignOut() {
      await signOut();
      router.push("/");
    }
    performSignOut();
  }, [signOut, router]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Spinner */}
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid #EAECEF",
          borderTopColor: "#008C7C",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: 20,
        }}
      />
      <p
        style={{
          fontFamily: "var(--ac-font-heading)",
          fontSize: 18,
          fontWeight: 600,
          color: "#0F1724",
          margin: 0,
        }}
      >
        Signing out...
      </p>

      {/* Keyframe for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
