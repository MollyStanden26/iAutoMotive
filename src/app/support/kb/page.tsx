"use client";

import { useMemo, useState } from "react";
import { SupportTopbar, SUPPORT_TOKENS as T } from "@/components/support/topbar";
import { CANNED_RESPONSES } from "@/lib/support/mock-data";

export default function SupportKnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(CANNED_RESPONSES[0]?.id ?? null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? CANNED_RESPONSES.filter(r => `${r.title} ${r.body} ${r.category}`.toLowerCase().includes(q))
      : CANNED_RESPONSES;
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof CANNED_RESPONSES>();
    for (const r of filtered) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const active = CANNED_RESPONSES.find(r => r.id === activeId) ?? filtered[0] ?? null;

  const handleCopy = () => {
    if (!active) return;
    navigator.clipboard?.writeText(active.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <>
      <SupportTopbar
        rightAction={
          <button
            className="px-[14px] py-[6px] rounded-[8px] transition-colors hover:opacity-80"
            style={{ background: "#0A2A26", color: T.teal200, border: "1px solid #0A1A2E", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }}
          >
            + New snippet
          </button>
        }
      />

      <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto overflow-x-hidden">
        <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: "320px 1fr" }}>
          {/* Snippet list */}
          <div
            className="rounded-[14px] overflow-hidden flex flex-col min-h-0"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            <div
              className="px-[15px] py-[11px] flex items-center"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search snippets…"
                className="w-full font-body text-[12px]"
                style={{
                  height: 32, padding: "0 10px",
                  background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 8,
                  color: T.textPrimary, outline: "none",
                }}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {grouped.length === 0 && (
                <div className="px-[15px] py-[15px] font-body text-[12px]" style={{ color: T.textDim }}>
                  No snippets match.
                </div>
              )}
              {grouped.map(([category, items]) => (
                <div key={category}>
                  <div
                    className="px-[15px] py-[8px] font-body font-bold text-[10px] uppercase tracking-widest"
                    style={{ color: T.textDim, background: "#0B1424" }}
                  >
                    {category}
                  </div>
                  {items.map(r => {
                    const isActive = active?.id === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setActiveId(r.id)}
                        className="w-full text-left px-[15px] py-[10px] flex items-start gap-2 transition-colors"
                        style={{
                          borderBottom: `1px solid ${T.border}`,
                          background: isActive ? T.bgHover : "transparent",
                          border: "none", borderBottomColor: T.border, cursor: "pointer",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-body font-semibold text-[12px]" style={{ color: T.textPrimary }}>
                            {r.title}
                          </div>
                          <div
                            className="font-body text-[10px]"
                            style={{
                              color: T.textMuted, marginTop: 2,
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical" as const,
                              overflow: "hidden",
                            }}
                          >
                            {r.body.split("\n")[0]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Detail / preview */}
          <div
            className="rounded-[14px] overflow-hidden flex flex-col min-h-0"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            {!active ? (
              <div className="flex-1 flex items-center justify-center font-body text-[13px]" style={{ color: T.textDim }}>
                Select a snippet to preview.
              </div>
            ) : (
              <>
                <div
                  className="px-[18px] py-[12px] flex items-start justify-between"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <div>
                    <div className="font-body font-bold text-[14px]" style={{ color: T.textPrimary }}>
                      {active.title}
                    </div>
                    <div className="font-body text-[11px] mt-1" style={{ color: T.textMuted }}>
                      {active.category} · {active.id}
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-[8px] font-body font-semibold text-[11px]"
                    style={{
                      background: copied ? "#0B2A22" : "#0A2A26",
                      border: `1px solid ${copied ? "#34D399" : "#0A1A2E"}`,
                      color: copied ? "#34D399" : T.teal200, cursor: "pointer",
                    }}
                  >
                    {copied ? "✓ Copied" : "Copy to clipboard"}
                  </button>
                </div>
                <div className="flex-1 px-[18px] py-[16px] overflow-y-auto">
                  <pre
                    className="font-body text-[12px]"
                    style={{
                      color: T.textPrimary,
                      background: "#070D18",
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      padding: 16,
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {active.body}
                  </pre>
                  <div className="font-body text-[11px] mt-3" style={{ color: T.textDim }}>
                    Placeholders ({"{first_name}"}, {"{net_payout}"}, {"{agent_name}"}, …) are auto-filled from
                    the active conversation when inserted from the Conversations panel.
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
