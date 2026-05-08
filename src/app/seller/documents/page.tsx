"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MOCK_DOCUMENTS,
  MOCK_LOT_MANAGER,
} from "@/lib/seller/seller-mock-data";

const POLL_INTERVAL_MS = 2_000;
const MAX_BODY_LEN = 4000;

interface ChatMessage {
  id: string;
  author: "seller" | "support";
  authorName: string;
  body: string;
  createdAt: string;
}

export default function SellerDocumentsPage() {
  const availableDocs = MOCK_DOCUMENTS.filter((d) => !d.pending);
  const pendingDocs = MOCK_DOCUMENTS.filter((d) => d.pending);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  // Tracks the latest message timestamp so the poll only asks for "new since X".
  const sinceRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const url = sinceRef.current
        ? `/api/seller/support?since=${encodeURIComponent(sinceRef.current)}`
        : "/api/seller/support";
      const res = await fetch(url, { cache: "no-store" });
      if (res.status === 401) {
        setAuthError("Sign in to your seller account to chat with support.");
        return;
      }
      if (!res.ok) return;
      const data: { messages: ChatMessage[] } = await res.json();
      if (data.messages.length === 0) return;
      setMessages(prev => {
        // De-dup by id — server can return overlapping rows on the first call.
        const seen = new Set(prev.map(m => m.id));
        const merged = [...prev];
        for (const m of data.messages) if (!seen.has(m.id)) merged.push(m);
        return merged;
      });
      sinceRef.current = data.messages[data.messages.length - 1].createdAt;
      setAuthError(null);
    } catch (err) {
      // Network blip — next tick will retry; don't surface intermittent errors.
      console.error("[seller chat poll]", err);
    }
  }, []);

  // Initial fetch + 2s polling.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    (async () => {
      await fetchMessages();
      if (cancelled) return;
      timer = setInterval(fetchMessages, POLL_INTERVAL_MS);
    })();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [fetchMessages]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    const body = inputValue.trim();
    if (!body || sending) return;
    if (body.length > MAX_BODY_LEN) return;
    setSending(true);
    try {
      const res = await fetch("/api/seller/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.status === 401) {
        setAuthError("Sign in to your seller account to chat with support.");
        return;
      }
      if (!res.ok) return;
      const data: { message: ChatMessage } = await res.json();
      setMessages(prev => [...prev, data.message]);
      sinceRef.current = data.message.createdAt;
      setInputValue("");
    } catch (err) {
      console.error("[seller chat send]", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* ── Section 1: Available Documents ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "11px",
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "12px",
          }}
        >
          YOUR DOCUMENTS
        </div>

        {availableDocs.map((doc, i) => (
          <div
            key={doc.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 0",
              borderBottom:
                i < availableDocs.length - 1
                  ? "1px solid #F7F8F9"
                  : "none",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "13px",
                background: doc.iconBg,
                color: doc.iconColor,
                flexShrink: 0,
              }}
            >
              {doc.iconText}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#1E293B",
                  marginBottom: "2px",
                }}
              >
                {doc.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "12px",
                  color: "#94A3B8",
                }}
              >
                {doc.meta}
              </div>
            </div>

            {/* Download / On sale button */}
            {doc.available ? (
              <button
                onClick={() => console.log("download", doc.id)}
                style={{
                  background: "#F7F8F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "9999px",
                  padding: "6px 14px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                Download
              </button>
            ) : (
              <button
                disabled
                style={{
                  background: "#F7F8F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "9999px",
                  padding: "6px 14px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#64748B",
                  cursor: "pointer",
                  opacity: 0.5,
                  pointerEvents: "none",
                }}
              >
                On sale
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Section 2: Pending Documents ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          padding: "20px",
          marginBottom: "16px",
          opacity: 0.6,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "11px",
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "12px",
          }}
        >
          AFTER YOUR CAR SELLS
        </div>

        {pendingDocs.map((doc, i) => (
          <div
            key={doc.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 0",
              borderBottom:
                i < pendingDocs.length - 1
                  ? "1px solid #F7F8F9"
                  : "none",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "13px",
                background: doc.iconBg,
                color: doc.iconColor,
                flexShrink: 0,
              }}
            >
              {doc.iconText}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#1E293B",
                  marginBottom: "2px",
                }}
              >
                {doc.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "12px",
                  color: "#94A3B8",
                }}
              >
                {doc.meta}
              </div>
            </div>

            {/* Pending badge */}
            <span
              style={{
                background: "#E2E8F0",
                color: "#94A3B8",
                borderRadius: "9999px",
                padding: "4px 12px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "11px",
              }}
            >
              Pending
            </span>
          </div>
        ))}
      </div>

      {/* ── Section 3: Messaging Panel ── */}
      <div
        id="messaging"
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#008C7C",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "14px",
                color: "#FFFFFF",
              }}
            >
              Your iAutoMotive contact
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "11px",
                color: "#FFFFFF",
                opacity: 0.75,
              }}
            >
              {MOCK_LOT_MANAGER.name} — {MOCK_LOT_MANAGER.role},{" "}
              {MOCK_LOT_MANAGER.location}
            </div>
          </div>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: "9999px",
              padding: "2px 8px",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "10px",
              color: "#FFFFFF",
            }}
          >
            {MOCK_LOT_MANAGER.responseTime}
          </span>
        </div>

        {/* Message body */}
        <div
          ref={messagesRef}
          style={{
            padding: "16px",
            maxHeight: "220px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {authError && messages.length === 0 && (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "#94A3B8",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              {authError}
            </div>
          )}
          {!authError && messages.length === 0 && (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "#94A3B8",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              Send a message and our support team will reply here in real-time.
            </div>
          )}
          {messages.map((msg, i) => {
            const showLabel = msg.author !== messages[i - 1]?.author;
            const isMe = msg.author === "seller";

            return (
              <div key={msg.id}>
                {showLabel && (
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "11px",
                      color: "#94A3B8",
                      marginBottom: "4px",
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {isMe ? "You" : msg.authorName || "Support"}
                  </div>
                )}
                <div
                  style={{
                    background: isMe ? "#E0FAF5" : "#F7F8F9",
                    color: isMe ? "#006058" : "#1E293B",
                    borderRadius: isMe
                      ? "12px 12px 4px 12px"
                      : "12px 12px 12px 4px",
                    padding: "10px 14px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "13px",
                    lineHeight: "1.625",
                    maxWidth: "85%",
                    marginLeft: isMe ? "auto" : undefined,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.body}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input row */}
        <div
          style={{
            borderTop: "1px solid #E2E8F0",
            padding: "12px",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="text"
            placeholder="Message Tom..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            style={{
              flex: 1,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "9999px",
              padding: "8px 16px",
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "13px",
              color: "#1E293B",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#008C7C";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !inputValue.trim()}
            style={{
              background: "#008C7C",
              color: "#FFFFFF",
              borderRadius: "9999px",
              padding: "8px 16px",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "12px",
              cursor: sending || !inputValue.trim() ? "not-allowed" : "pointer",
              border: "none",
              opacity: sending || !inputValue.trim() ? 0.55 : 1,
            }}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
