"use client";

import { useCallback, useEffect, useState } from "react";

const S = {
  bgPage: "#0A1226",
  bgCard: "#0D1525",
  bgRow: "#111D30",
  border: "#1A2640",
  border2: "#162238",
  teal: "#008C7C",
  teal200: "#4DD9C7",
  tealBg: "#0A2A26",
  textPrimary: "#F1F5F9",
  textSecondary: "#8492A8",
  textMuted: "#6B7A90",
  textDim: "#4A556B",
  amber: "#F5A623",
  amberBg: "#2B1A00",
  green: "#34D399",
  greenBg: "#0B2B1A",
};

type Status = "new" | "read" | "archived";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  status: Status;
  createdAt: string;
}

const FILTERS: { label: string; value: Status | "all" }[] = [
  { label: "New", value: "new" },
  { label: "Read", value: "read" },
  { label: "Archived", value: "archived" },
  { label: "All", value: "all" },
];

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.max(0, Math.floor((now - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function EnquiriesPage() {
  const [filter, setFilter] = useState<Status | "all">("new");
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (f: Status | "all") => {
    setLoading(true);
    try {
      const qs = f === "all" ? "" : `?status=${f}`;
      const res = await fetch(`/api/admin/support/enquiries${qs}`);
      const data = await res.json();
      setItems(res.ok ? (data.messages ?? []) : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const setStatus = async (id: string, status: Status) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/support/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        // Drop it from the current view if it no longer matches the filter.
        setItems(prev =>
          filter === "all" ? prev.map(m => (m.id === id ? { ...m, status } : m))
                           : prev.filter(m => m.id !== id)
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const mailtoHref = (e: Enquiry) => {
    const subject = encodeURIComponent(e.subject ? `Re: ${e.subject}` : "Re: your iAutoMotive enquiry");
    const intro = `Hi ${e.name.split(" ")[0] || e.name},\n\n`;
    const quoted = `\n\n---\nYou wrote:\n${e.body}`;
    return `mailto:${e.email}?subject=${subject}&body=${encodeURIComponent(intro + quoted)}`;
  };

  return (
    <div style={{ background: S.bgPage, minHeight: "100vh", padding: "28px 32px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22, color: S.textPrimary, margin: 0 }}>
          Contact enquiries
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: S.textMuted, margin: "6px 0 20px" }}>
          Messages left via the website &ldquo;Leave us a message&rdquo; form. Reply by email; mark read once handled.
        </p>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {FILTERS.map(f => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                  background: active ? S.tealBg : S.bgRow,
                  border: `1px solid ${active ? S.teal : S.border}`,
                  color: active ? S.teal200 : S.textSecondary,
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: S.textMuted }}>Loading…</p>
        ) : items.length === 0 ? (
          <div style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: S.textSecondary, margin: 0 }}>
              No {filter === "all" ? "" : filter} enquiries.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map(e => (
              <div key={e.id} style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: S.textPrimary }}>{e.name}</span>
                  <a href={`mailto:${e.email}`} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: S.teal200, textDecoration: "none" }}>{e.email}</a>
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-body)", fontSize: 12, color: S.textDim }}>{timeAgo(e.createdAt)}</span>
                  {e.status === "new" && (
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, color: S.amber, background: S.amberBg, borderRadius: 6, padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>New</span>
                  )}
                </div>
                {e.subject && (
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: S.textSecondary, margin: "10px 0 4px" }}>{e.subject}</p>
                )}
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: S.textPrimary, margin: "8px 0 0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{e.body}</p>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <a
                    href={mailtoHref(e)}
                    style={{ padding: "7px 14px", borderRadius: 8, background: S.tealBg, border: `1px solid ${S.teal}`, color: S.teal200, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}
                  >
                    Reply by email
                  </a>
                  {e.status !== "read" && (
                    <button disabled={busyId === e.id} onClick={() => setStatus(e.id, "read")}
                      style={{ padding: "7px 14px", borderRadius: 8, background: S.bgRow, border: `1px solid ${S.border}`, color: S.textSecondary, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: busyId === e.id ? 0.5 : 1 }}>
                      Mark read
                    </button>
                  )}
                  {e.status !== "archived" && (
                    <button disabled={busyId === e.id} onClick={() => setStatus(e.id, "archived")}
                      style={{ padding: "7px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${S.border2}`, color: S.textDim, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: busyId === e.id ? 0.5 : 1 }}>
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
