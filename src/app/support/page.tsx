"use client";

import { useRouter } from "next/navigation";
import { SupportTopbar, SUPPORT_TOKENS as T } from "@/components/support/topbar";
import {
  SUPPORT_TICKETS, CONVERSATIONS, SUPPORT_KPIS, TOPIC_LABELS,
} from "@/lib/support/mock-data";

const KPI_COLORS: Record<string, string> = {
  "Open tickets":       T.textPrimary,
  "Awaiting seller":    "#F59E0B",
  "Escalated":          T.red,
  "Resolved today":     T.green,
  "Median first reply": T.teal200,
};

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
  resolved:        { color: T.green, bg: "#0B2A22", label: "Resolved" },
};

export default function SupportOverviewPage() {
  const router = useRouter();
  const openCount = SUPPORT_TICKETS.filter(t => t.status === "open" || t.status === "escalated").length;

  // Priority sort, then most-recently-active first
  const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
  const sortedTickets = [...SUPPORT_TICKETS]
    .filter(t => t.status !== "resolved")
    .sort((a, b) => (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) || (a.lastActivityHours - b.lastActivityHours))
    .slice(0, 6);

  const recentConvos = CONVERSATIONS.slice(0, 5);

  return (
    <>
      <SupportTopbar badge={{ label: `${openCount} open`, tone: openCount > 0 ? "red" : "teal" }} />

      <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto overflow-x-hidden">
        {/* KPI strip */}
        <div className="grid grid-cols-5 gap-2">
          {SUPPORT_KPIS.map(kpi => (
            <div
              key={kpi.label}
              className="rounded-[14px] px-[15px] py-[13px]"
              style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
            >
              <div
                className="font-body font-bold text-[10px] uppercase tracking-widest mb-[7px]"
                style={{ color: T.textDim }}
              >
                {kpi.label}
              </div>
              <div
                className="font-heading font-black text-[30px] leading-none tracking-tight"
                style={{ color: KPI_COLORS[kpi.label] || T.textPrimary }}
              >
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Two-up row: priority queue + recent conversations */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 380px" }}>
          {/* Priority queue */}
          <div
            className="rounded-[14px] overflow-hidden min-w-0"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            <div
              className="flex items-center justify-between px-[15px] py-[11px]"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <span className="font-body font-bold text-[13px]" style={{ color: T.textPrimary }}>
                Priority queue
              </span>
              <button
                onClick={() => router.push("/support/tickets")}
                className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer"
                style={{ color: T.teal200 }}
              >
                View all →
              </button>
            </div>
            <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "32%" }} />
                <col style={{ width: "26%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Seller / vehicle", "Subject", "Priority", "Status", "Age"].map((h, i) => (
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
                {sortedTickets.map((t, i) => {
                  const pTone = PRIORITY_TONE[t.priority];
                  const sTone = STATUS_TONE[t.status];
                  return (
                    <tr
                      key={t.id}
                      style={{ borderBottom: i < sortedTickets.length - 1 ? `1px solid ${T.border}` : "none" }}
                    >
                      <td className="py-[9px] px-[10px] pl-[14px]">
                        <div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>
                          {t.sellerName}
                        </div>
                        <div className="font-body text-[11px]" style={{ color: T.textMuted }}>
                          {t.vehicle}
                        </div>
                      </td>
                      <td className="py-[9px] px-[10px]">
                        <div
                          className="font-body text-[12px]"
                          style={{
                            color: T.textPrimary,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}
                        >
                          {t.subject}
                        </div>
                        <div className="font-body text-[10px]" style={{ color: T.textDim }}>
                          {TOPIC_LABELS[t.topic]} · {t.id}
                        </div>
                      </td>
                      <td className="py-[9px] px-[10px]">
                        <span
                          className="inline-block rounded-pill px-2 py-0.5 font-body font-semibold text-[11px] capitalize"
                          style={{ background: pTone.bg, color: pTone.color }}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-[9px] px-[10px]">
                        <span
                          className="inline-block rounded-pill px-2 py-0.5 font-body font-semibold text-[11px]"
                          style={{ background: sTone.bg, color: sTone.color }}
                        >
                          {sTone.label}
                        </span>
                      </td>
                      <td className="py-[9px] px-[10px]">
                        <span className="font-body text-[11px]" style={{ color: T.textDim }}>
                          {t.ageHours < 24 ? `${t.ageHours}h` : `${Math.floor(t.ageHours / 24)}d`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent conversations */}
          <div
            className="rounded-[14px] overflow-hidden min-w-0"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            <div
              className="flex items-center justify-between px-[15px] py-[11px]"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <span className="font-body font-bold text-[13px]" style={{ color: T.textPrimary }}>
                Recent conversations
              </span>
              <button
                onClick={() => router.push("/support/conversations")}
                className="font-body font-semibold text-[11px] bg-transparent border-none cursor-pointer"
                style={{ color: T.teal200 }}
              >
                Inbox →
              </button>
            </div>
            <div className="flex flex-col">
              {recentConvos.map((c, i) => (
                <div
                  key={c.id}
                  className="px-[15px] py-[10px] flex items-start gap-2"
                  style={{ borderBottom: i < recentConvos.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <span
                    className="rounded-pill px-2 py-0.5 font-body font-bold text-[10px] uppercase mt-[2px]"
                    style={{ background: T.bgRow, color: T.textSecondary }}
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
                    <div className="font-body text-[10px]" style={{ color: T.textDim, marginTop: 3 }}>
                      {c.ageMinutes < 60 ? `${c.ageMinutes}m ago` : `${Math.round(c.ageMinutes / 60)}h ago`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
