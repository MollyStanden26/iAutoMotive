"use client";

// Callback queue — scheduled callbacks by date/time

import { CrmTopbar } from "@/components/admin/crm-topbar";

export default function CrmCallbacksPage() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0B111E" }}>
      <CrmTopbar title="Callbacks" />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className="w-full max-w-md mx-auto rounded-[20px] px-6 py-8 sm:px-8 sm:py-10 text-center"
          style={{ background: "#0D1525", border: "1px solid #1E2D4A" }}
        >
          <div
            className="mx-auto mb-4 sm:mb-5 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "#111D30", border: "1px solid #1E2D4A" }}
          >
            <span style={{ color: "#6B7A90", fontSize: 22, fontFamily: "var(--font-body)" }}>⏰</span>
          </div>
          <h2
            className="font-heading font-[800] text-base sm:text-lg"
            style={{ color: "#F1F5F9" }}
          >
            No callbacks scheduled
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "#6B7A90", fontFamily: "var(--font-body)" }}
          >
            Scheduled callbacks will line up here by date and time, so the team
            knows exactly who to ring back and when. Nothing in the queue yet.
          </p>
        </div>
      </div>
    </div>
  );
}
