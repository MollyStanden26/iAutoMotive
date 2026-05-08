"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SupportTopbar, SUPPORT_TOKENS as T } from "@/components/support/topbar";

/**
 * Live seller↔support inbox. Replaces the previous mock data — every thread
 * here is a real {@link SupportConversation} backed by MongoDB. The panel polls
 * every {@link POLL_INTERVAL_MS} so the agent sees new seller messages without
 * needing a real WebSocket.
 */

const POLL_INTERVAL_MS = 2_000;
const MAX_BODY_LEN = 4000;
const SUPPORT_NAME = "Support";

interface ConversationRow {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  vehicle: string | null;
  lastMessage: { author: "seller" | "support"; body: string; createdAt: string } | null;
  unread: number;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  author: "seller" | "support";
  authorName: string;
  body: string;
  createdAt: string;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SupportConversationsPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  // Tracks the latest message timestamp for the active thread so the poll
  // only requests deltas instead of the entire history each tick.
  const sinceRef = useRef<string | null>(null);

  /** Fetches the conversation list. Called on mount and on every poll tick. */
  const refreshList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/support/conversations", { cache: "no-store" });
      if (!res.ok) return;
      const data: { conversations: ConversationRow[] } = await res.json();
      setConversations(data.conversations);
      // First-time auto-select: pick the most-recent thread.
      setActiveId(prev => prev ?? data.conversations[0]?.id ?? null);
    } catch (err) {
      console.error("[support inbox refreshList]", err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  /** Fetches new messages for the active thread (since last seen timestamp). */
  const fetchActiveMessages = useCallback(async (id: string, fullReload: boolean) => {
    try {
      const url = fullReload || !sinceRef.current
        ? `/api/admin/support/conversations/${id}`
        : `/api/admin/support/conversations/${id}?since=${encodeURIComponent(sinceRef.current)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data: { messages: ChatMessage[] } = await res.json();
      if (data.messages.length === 0) return;
      setMessages(prev => {
        const seen = new Set(prev.map(m => m.id));
        const next = fullReload ? [] : [...prev];
        for (const m of data.messages) if (!seen.has(m.id)) next.push(m);
        return next;
      });
      sinceRef.current = data.messages[data.messages.length - 1].createdAt;
    } catch (err) {
      console.error("[support inbox fetchActiveMessages]", err);
    }
  }, []);

  // Mount: load the conversation list, then start polling both list and active thread.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    (async () => {
      await refreshList();
      if (cancelled) return;
      timer = setInterval(() => {
        refreshList();
        if (activeId) fetchActiveMessages(activeId, false);
      }, POLL_INTERVAL_MS);
    })();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
    // We intentionally exclude `activeId` from deps — selecting a new thread
    // is handled by the effect below, which resets `sinceRef` and re-fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshList, fetchActiveMessages]);

  // When the operator switches threads, fully reload its messages.
  useEffect(() => {
    if (!activeId) return;
    sinceRef.current = null;
    setMessages([]);
    fetchActiveMessages(activeId, true);
  }, [activeId, fetchActiveMessages]);

  // Auto-scroll to the bottom whenever messages change.
  useEffect(() => {
    messagesScrollRef.current?.scrollTo({
      top: messagesScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const active = conversations.find(c => c.id === activeId) ?? null;

  const handleSend = async () => {
    if (!activeId) return;
    const body = reply.trim();
    if (!body || sending) return;
    if (body.length > MAX_BODY_LEN) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/conversations/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, authorName: SUPPORT_NAME }),
      });
      if (!res.ok) return;
      const data: { message: ChatMessage } = await res.json();
      setMessages(prev => [...prev, data.message]);
      sinceRef.current = data.message.createdAt;
      setReply("");
      // Refresh the list so this thread bumps to the top with the new preview.
      refreshList();
    } catch (err) {
      console.error("[support inbox handleSend]", err);
    } finally {
      setSending(false);
    }
  };

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
              <span className="font-body text-[11px]" style={{ color: T.textMuted }}>
                {conversations.length} thread{conversations.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingList && (
                <div className="px-[15px] py-[14px] font-body text-[12px]" style={{ color: T.textMuted }}>
                  Loading conversations…
                </div>
              )}
              {!loadingList && conversations.length === 0 && (
                <div className="px-[15px] py-[14px] font-body text-[12px]" style={{ color: T.textMuted }}>
                  No conversations yet. When a seller sends a message it lands here.
                </div>
              )}
              {conversations.map((c, i) => {
                const isActive = activeId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className="w-full text-left px-[15px] py-[10px] flex items-start gap-2 transition-colors"
                    style={{
                      borderBottom: i < conversations.length - 1 ? `1px solid ${T.border}` : "none",
                      background: isActive ? T.bgHover : "transparent",
                      border: "none", borderBottomColor: T.border, cursor: "pointer",
                    }}
                  >
                    <span
                      className="rounded-pill px-2 py-0.5 font-body font-bold text-[10px] uppercase mt-[2px] flex-shrink-0"
                      style={{ background: "#231836", color: "#A78BFA" }}
                    >
                      Chat
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-body font-semibold text-[12px]"
                          style={{ color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {c.sellerName}
                        </span>
                        {c.unread > 0 && (
                          <span
                            className="rounded-pill px-1.5 py-[1px] font-body font-bold text-[9px] flex-shrink-0"
                            style={{ background: T.red, color: "#fff" }}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <div
                        className="font-body text-[11px]"
                        style={{
                          color: c.unread > 0 ? T.textSecondary : T.textMuted,
                          marginTop: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }}
                      >
                        {c.lastMessage
                          ? `${c.lastMessage.author === "seller" ? "" : "You: "}${c.lastMessage.body}`
                          : <em>No messages yet</em>}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-body text-[10px]" style={{ color: T.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.vehicle ?? c.sellerEmail}
                        </span>
                        <span className="font-body text-[10px]" style={{ color: T.textDim, flexShrink: 0, marginLeft: 6 }}>
                          {formatRelative(c.lastMessage?.createdAt ?? c.updatedAt)}
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
                {loadingList ? "Loading…" : "Select a conversation to view the thread."}
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
                      {active.vehicle ? `${active.vehicle} · ` : ""}
                      <span style={{ color: T.textDim }}>{active.sellerEmail}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-pill px-2.5 py-1 font-body text-[11px] font-bold"
                      style={{ background: "#0A2A26", color: T.teal200 }}
                    >
                      <span
                        className="inline-block w-[6px] h-[6px] rounded-full animate-pulse mr-1.5 align-middle"
                        style={{ background: "#34D399" }}
                      />
                      Live
                    </span>
                  </div>
                </div>

                <div
                  ref={messagesScrollRef}
                  className="flex-1 px-[18px] py-[16px] overflow-y-auto"
                  style={{ background: "#070D18", display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {messages.length === 0 && (
                    <div className="font-body text-[12px] text-center" style={{ color: T.textDim, padding: "24px 0" }}>
                      No messages yet — the seller hasn't sent anything to this thread.
                    </div>
                  )}
                  {messages.map((m, i) => {
                    const isSupport = m.author === "support";
                    const showLabel = m.author !== messages[i - 1]?.author;
                    return (
                      <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isSupport ? "flex-end" : "flex-start" }}>
                        {showLabel && (
                          <div
                            className="font-body text-[10px]"
                            style={{ color: T.textDim, marginBottom: 3, padding: "0 4px" }}
                          >
                            {isSupport ? `${m.authorName} (you)` : m.authorName}
                          </div>
                        )}
                        <div
                          className="rounded-[12px] px-[14px] py-[10px]"
                          style={{
                            background: isSupport ? "#0A2A26" : T.bgRow,
                            border: `1px solid ${isSupport ? T.teal : T.border}`,
                            color: isSupport ? T.teal200 : T.textPrimary,
                            fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.55,
                            maxWidth: "85%",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {m.body}
                        </div>
                        <div
                          className="font-body text-[10px]"
                          style={{ color: T.textDim, marginTop: 3, padding: "0 4px" }}
                        >
                          {formatRelative(m.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="px-[18px] py-[12px]"
                  style={{ borderTop: `1px solid ${T.border}` }}
                >
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Reply to this seller… (⌘/Ctrl+Enter to send)"
                    rows={3}
                    className="w-full font-body text-[12px]"
                    style={{
                      background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 8,
                      padding: "8px 10px", color: T.textPrimary, outline: "none", resize: "vertical",
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-body text-[11px]" style={{ color: T.textDim }}>
                      Polling every 2s — seller sees replies in real-time
                    </span>
                    <button
                      onClick={handleSend}
                      disabled={sending || !reply.trim()}
                      className="px-4 py-1.5 rounded-[8px] font-body font-bold text-[12px]"
                      style={{
                        background: T.teal, color: "#fff", border: "none",
                        cursor: sending || !reply.trim() ? "not-allowed" : "pointer",
                        opacity: sending || !reply.trim() ? 0.55 : 1,
                      }}
                    >
                      {sending ? "Sending…" : "Send"}
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
