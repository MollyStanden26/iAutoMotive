"use client";

import { useState } from "react";
import { SupportTopbar, SUPPORT_TOKENS as T } from "@/components/support/topbar";
import { CONVERSATIONS, type ConversationChannel } from "@/lib/support/mock-data";

const CHANNEL_FILTERS: { key: ConversationChannel | "all"; label: string }[] = [
  { key: "all",   label: "All channels" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "sms",   label: "SMS" },
  { key: "chat",  label: "Chat" },
];

const CHANNEL_TONE: Record<ConversationChannel, { color: string; bg: string }> = {
  email: { color: T.teal200, bg: "#0A2A26" },
  phone: { color: "#F59E0B", bg: "#3A2510" },
  sms:   { color: T.green,   bg: "#0B2A22" },
  chat:  { color: "#A78BFA", bg: "#231836" },
};

export default function SupportConversationsPage() {
  const [filter, setFilter] = useState<ConversationChannel | "all">("all");
  const [activeId, setActiveId] = useState(CONVERSATIONS[0]?.id ?? null);

  const filtered = CONVERSATIONS.filter(c => filter === "all" || c.channel === filter);
  const active = CONVERSATIONS.find(c => c.id === activeId) ?? filtered[0] ?? null;

  return (
    <>
      <SupportTopbar />

      <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto overflow-x-hidden">
        <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: "380px 1fr" }}>
          {/* Inbox list */}
          <div
            className="rounded-[14px] overflow-hidden flex flex-col min-h-0"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            <div
              className="flex items-center px-[15px] py-[11px] gap-2"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
                Inbox
              </span>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as ConversationChannel | "all")}
                className="font-body text-[12px]"
                style={{
                  background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: "4px 8px", color: T.textSecondary, outline: "none",
                }}
              >
                {CHANNEL_FILTERS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((c, i) => {
                const tone = CHANNEL_TONE[c.channel];
                const isActive = active?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className="w-full text-left px-[15px] py-[10px] flex items-start gap-2 transition-colors"
                    style={{
                      borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                      background: isActive ? T.bgHover : "transparent",
                      border: "none", borderBottomColor: T.border, cursor: "pointer",
                    }}
                  >
                    <span
                      className="rounded-pill px-2 py-0.5 font-body font-bold text-[10px] uppercase mt-[2px] flex-shrink-0"
                      style={{ background: tone.bg, color: tone.color }}
                    >
                      {c.channel}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-body font-semibold text-[12px]"
                          style={{ color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {c.sellerName}
                        </span>
                        {c.unread && (
                          <span style={{ width: 6, height: 6, borderRadius: 999, background: T.red, flexShrink: 0 }} />
                        )}
                      </div>
                      <div
                        className="font-body text-[11px]"
                        style={{
                          color: c.unread ? T.textSecondary : T.textMuted,
                          marginTop: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }}
                      >
                        {c.preview}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-body text-[10px]" style={{ color: T.textDim }}>
                          {c.vehicle}
                        </span>
                        <span className="font-body text-[10px]" style={{ color: T.textDim }}>
                          {c.ageMinutes < 60 ? `${c.ageMinutes}m` : `${Math.round(c.ageMinutes / 60)}h`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation panel */}
          <div
            className="rounded-[14px] overflow-hidden flex flex-col min-h-0"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            {!active ? (
              <div className="flex-1 flex items-center justify-center font-body text-[13px]" style={{ color: T.textDim }}>
                Select a conversation to view the thread.
              </div>
            ) : (
              <>
                <div
                  className="px-[18px] py-[12px] flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <div>
                    <div className="font-body font-bold text-[14px]" style={{ color: T.textPrimary }}>
                      {active.sellerName}
                    </div>
                    <div className="font-body text-[11px]" style={{ color: T.textMuted }}>
                      {active.vehicle} · via {active.channel}
                      {active.ticketId && (
                        <>
                          {" · "}
                          <span style={{ color: T.teal200 }}>{active.ticketId}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-[8px] font-body text-[11px] font-semibold"
                      style={{ background: T.bgRow, border: `1px solid ${T.border}`, color: T.textSecondary, cursor: "pointer" }}
                    >
                      View seller
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-[8px] font-body text-[11px] font-semibold"
                      style={{ background: "#0A2A26", border: "1px solid #0A1A2E", color: T.teal200, cursor: "pointer" }}
                    >
                      Open ticket
                    </button>
                  </div>
                </div>

                <div className="flex-1 px-[18px] py-[16px] overflow-y-auto" style={{ background: "#070D18" }}>
                  {/* Latest message */}
                  <div
                    className="max-w-[85%] rounded-[12px] px-[14px] py-[10px] mb-2"
                    style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
                  >
                    <div className="font-body text-[12px]" style={{ color: T.textSecondary }}>
                      {active.preview}
                    </div>
                    <div className="font-body text-[10px]" style={{ color: T.textDim, marginTop: 4 }}>
                      {active.sellerName} · {active.ageMinutes < 60 ? `${active.ageMinutes}m ago` : `${Math.round(active.ageMinutes / 60)}h ago`}
                    </div>
                  </div>
                  <div className="font-body text-[11px] text-center my-3" style={{ color: T.textDim }}>
                    Earlier messages · open the ticket to view full history
                  </div>
                </div>

                <div
                  className="px-[18px] py-[12px]"
                  style={{ borderTop: `1px solid ${T.border}` }}
                >
                  <textarea
                    placeholder="Reply to this conversation… (use canned responses from the Knowledge base)"
                    rows={3}
                    className="w-full font-body text-[12px]"
                    style={{
                      background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 8,
                      padding: "8px 10px", color: T.textPrimary, outline: "none", resize: "vertical",
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-body text-[11px]" style={{ color: T.textDim }}>
                      Canned: <span style={{ color: T.teal200, cursor: "pointer" }}>Driver delay</span>{" · "}
                      <span style={{ color: T.teal200, cursor: "pointer" }}>Net payout breakdown</span>
                    </span>
                    <button
                      className="px-4 py-1.5 rounded-[8px] font-body font-bold text-[12px]"
                      style={{ background: T.teal, color: "#fff", border: "none", cursor: "pointer" }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
