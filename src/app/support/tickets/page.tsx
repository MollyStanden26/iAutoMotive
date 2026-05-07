"use client";

import { useState } from "react";
import { SupportTopbar, SUPPORT_TOKENS as T } from "@/components/support/topbar";
import { SUPPORT_TICKETS, TOPIC_LABELS, type TicketStatus } from "@/lib/support/mock-data";

const STATUS_TABS: { key: TicketStatus | "all"; label: string }[] = [
  { key: "all",            label: "All" },
  { key: "open",           label: "Open" },
  { key: "escalated",      label: "Escalated" },
  { key: "pending_seller", label: "Awaiting seller" },
  { key: "resolved",       label: "Resolved" },
];

const PRIORITY_TONE: Record<string, { color: string; bg: string }> = {
  urgent: { color: T.red,     bg: "#3B1820" },
  high:   { color: "#F59E0B", bg: "#3A2510" },
  normal: { color: T.teal200, bg: "#0A2A26" },
  low:    { color: T.textMuted, bg: T.bgRow },
};

const STATUS_TONE: Record<string, { color: string; bg: string; label: string }> = {
  open:            { color: T.teal200, bg: "#0A2A26", label: "Open" },
  pending_seller:  { color: "#F59E0B", bg: "#3A2510", label: "Awaiting seller" },
  escalated:       { color: T.red, bg: "#3B1820", label: "Escalated" },
  resolved:        { color: "#34D399", bg: "#0B2A22", label: "Resolved" },
};

export default function SupportTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = SUPPORT_TICKETS.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (q && !`${t.sellerName} ${t.vehicle} ${t.subject} ${t.id}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      <SupportTopbar
        rightAction={
          <button
            className="px-[14px] py-[6px] rounded-[8px] transition-colors hover:opacity-80"
            style={{ background: "#0A2A26", color: T.teal200, border: "1px solid #0A1A2E", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }}
          >
            + New ticket
          </button>
        }
      />

      <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto overflow-x-hidden">
        {/* Filter row */}
        <div
          className="flex items-center gap-2 rounded-[14px] px-[15px] py-[11px]"
          style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        >
          <div className="flex rounded-[10px] p-[3px]" style={{ background: T.bgRow }}>
            {STATUS_TABS.map(tab => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className="px-3 py-1.5 rounded-[8px] font-body text-[12px] font-semibold transition-colors"
                  style={{
                    background: active ? T.bgCard : "transparent",
                    color: active ? T.textPrimary : T.textMuted,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ticket ID, seller, subject…"
            className="font-body text-[12px]"
            style={{
              width: 280, height: 32, padding: "0 12px",
              background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.textPrimary, outline: "none",
            }}
          />
        </div>

        {/* Ticket table */}
        <div
          className="rounded-[14px] overflow-hidden"
          style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ tableLayout: "fixed", minWidth: 900 }}>
              <colgroup>
                <col style={{ width: "9%" }} />
                <col style={{ width: "23%" }} />
                <col style={{ width: "26%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "7%" }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["ID", "Seller / vehicle", "Subject", "Priority", "Status", "Assignee", "Age"].map((h, i) => (
                    <th
                      key={h}
                      className="font-body font-bold text-[10px] uppercase tracking-widest text-left pb-2 pt-2 px-[10px]"
                      style={{ color: T.textDim, paddingLeft: i === 0 ? 14 : undefined }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <span className="font-body text-[13px]" style={{ color: T.textDim }}>
                        No tickets match this filter.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, i) => {
                    const pTone = PRIORITY_TONE[t.priority];
                    const sTone = STATUS_TONE[t.status];
                    return (
                      <tr
                        key={t.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = T.bgHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="py-[10px] px-[10px] pl-[14px] font-body text-[12px] font-semibold" style={{ color: T.teal200 }}>
                          {t.id}
                          {t.unreadCount > 0 && (
                            <span
                              className="ml-1.5 rounded-pill px-1.5 py-[1px] font-body font-bold text-[9px]"
                              style={{ background: T.red, color: "#fff" }}
                            >
                              {t.unreadCount}
                            </span>
                          )}
                        </td>
                        <td className="py-[10px] px-[10px]">
                          <div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>
                            {t.sellerName}
                          </div>
                          <div className="font-body text-[11px]" style={{ color: T.textMuted }}>
                            {t.vehicle}
                          </div>
                        </td>
                        <td className="py-[10px] px-[10px]">
                          <div
                            className="font-body text-[12px]"
                            style={{ color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            {t.subject}
                          </div>
                          <div className="font-body text-[10px]" style={{ color: T.textDim }}>
                            {TOPIC_LABELS[t.topic]} · via {t.channel}
                          </div>
                        </td>
                        <td className="py-[10px] px-[10px]">
                          <span
                            className="inline-block rounded-pill px-2 py-0.5 font-body font-semibold text-[11px] capitalize"
                            style={{ background: pTone.bg, color: pTone.color }}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-[10px] px-[10px]">
                          <span
                            className="inline-block rounded-pill px-2 py-0.5 font-body font-semibold text-[11px]"
                            style={{ background: sTone.bg, color: sTone.color }}
                          >
                            {sTone.label}
                          </span>
                        </td>
                        <td className="py-[10px] px-[10px] font-body text-[12px]" style={{ color: t.assignee ? T.textMuted : T.textDim }}>
                          {t.assignee ?? "Unassigned"}
                        </td>
                        <td className="py-[10px] px-[10px] font-body text-[11px]" style={{ color: T.textDim }}>
                          {t.ageHours < 24 ? `${t.ageHours}h` : `${Math.floor(t.ageHours / 24)}d`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
