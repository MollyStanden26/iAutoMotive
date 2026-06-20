"use client";

/**
 * LeadPipeline — the CRM Overview Kanban board.
 *
 * Replaces the old lead-queue table. Six stages from first contact through to
 * collection; sales reps see only their own leads (the API scopes by
 * assignedTo). Cards drag between columns (native HTML5 DnD, desktop) and
 * persist via PATCH /api/admin/leads/[id]. Each card can place a call through
 * the softphone bridge (window.iaDial) or open the lead detail.
 *
 * No assign / bulk-assign controls — reps don't route leads; admins do that
 * elsewhere, and the +Add Lead flow auto-assigns to the creating rep.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, GripVertical } from "lucide-react";

const T = {
  bgCard: "#0D1525", bgRow: "#111D30", bgHover: "#0C1428", bgColumn: "#0A1120",
  border: "#1E2D4A", border2: "#111D30",
  textPrimary: "#F1F5F9", textSecondary: "#8492A8", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7", green: "#34D399", greenBg: "#0B2B1A",
  amber: "#F5A623", indigo: "#A78BFA", blue: "#60A5FA",
};

export type PipelineStage =
  | "new_lead" | "contacted" | "call_back"
  | "contract_sent" | "handover_scheduled" | "collected";

interface LeadCard {
  id: string;
  seller: string;
  vehicle: string;
  score: number;
  phone: string | null;
  pipelineStage: PipelineStage;
}

const STAGES: { key: PipelineStage; label: string; accent: string }[] = [
  { key: "new_lead",           label: "New Lead",           accent: T.teal200 },
  { key: "contacted",          label: "Contacted",          accent: T.amber },
  { key: "call_back",          label: "Call Back",          accent: T.indigo },
  { key: "contract_sent",      label: "Contract Sent",      accent: T.blue },
  { key: "handover_scheduled", label: "Handover Scheduled", accent: "#C084FC" },
  { key: "collected",          label: "Collected",          accent: T.green },
];

export function LeadPipeline({ refreshKey }: { refreshKey: number }) {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<PipelineStage | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/leads", { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setLeads(data.leads ?? []); })
      .catch(err => { if (!cancelled) console.error("[LeadPipeline] fetch failed:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const moveLead = useCallback(async (id: string, toStage: PipelineStage) => {
    const current = leads.find(l => l.id === id);
    if (!current || current.pipelineStage === toStage) return;
    const prevStage = current.pipelineStage;
    // Optimistic
    setLeads(prev => prev.map(l => l.id === id ? { ...l, pipelineStage: toStage } : l));
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: toStage }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error("[LeadPipeline] move failed, reverting:", err);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, pipelineStage: prevStage } : l));
    }
  }, [leads]);

  const call = useCallback((phone: string | null) => {
    if (!phone) return;
    const dial = (window as unknown as { iaDial?: (n: string) => void }).iaDial;
    if (dial) dial(phone);
  }, []);

  const total = leads.length;

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-[11px] sm:px-[15px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="font-body font-bold text-[13px] sm:text-sm flex-1 min-w-0" style={{ color: T.textPrimary }}>
          Pipeline
        </span>
        <span className="font-body text-[11px]" style={{ color: T.textMuted }}>
          {loading ? "Loading…" : `${total} ${total === 1 ? "lead" : "leads"}`}
        </span>
      </div>

      {/* Board — horizontal scroll of stage columns */}
      <div className="overflow-x-auto [scrollbar-width:thin] p-3 sm:p-4">
        <div className="flex gap-3" style={{ minWidth: "min-content" }}>
          {STAGES.map(stage => {
            const items = leads.filter(l => l.pipelineStage === stage.key);
            const isOver = dragOver === stage.key;
            return (
              <div
                key={stage.key}
                className="flex flex-col flex-shrink-0 rounded-[12px]"
                style={{
                  width: 264,
                  background: T.bgColumn,
                  border: `1px solid ${isOver ? stage.accent : T.border2}`,
                  transition: "border-color 120ms ease",
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(stage.key); }}
                onDragLeave={() => setDragOver(prev => prev === stage.key ? null : prev)}
                onDrop={e => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/leadId") || dragId;
                  setDragOver(null); setDragId(null);
                  if (id) moveLead(id, stage.key);
                }}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: `1px solid ${T.border2}` }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.accent }} />
                  <span className="font-body font-bold text-[12px] flex-1 min-w-0 truncate" style={{ color: T.textPrimary }}>
                    {stage.label}
                  </span>
                  <span
                    className="flex items-center justify-center font-body font-bold text-[10px] flex-shrink-0"
                    style={{ minWidth: 20, height: 18, borderRadius: 999, padding: "0 6px", background: T.bgRow, color: T.textMuted }}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  style={{ minHeight: 120, maxHeight: 460 }}>
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center text-center px-2"
                      style={{ minHeight: 88, color: T.textDim }}>
                      <span className="font-body text-[11px]">
                        {loading ? "…" : "Drop leads here"}
                      </span>
                    </div>
                  ) : (
                    items.map(lead => {
                      const scoreColor = lead.score >= 75 ? T.green : lead.score >= 60 ? T.amber : T.textMuted;
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.setData("text/leadId", lead.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDragId(lead.id);
                          }}
                          onDragEnd={() => { setDragId(null); setDragOver(null); }}
                          onClick={() => router.push(`/admin/crm/leads/${lead.id}`)}
                          className="group rounded-[10px] p-2.5 cursor-pointer"
                          style={{
                            background: T.bgCard,
                            border: `1px solid ${T.border}`,
                            opacity: dragId === lead.id ? 0.5 : 1,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = stage.accent)}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                        >
                          <div className="flex items-start gap-1.5">
                            <GripVertical size={13} className="flex-shrink-0 mt-0.5" style={{ color: T.textDim }} />
                            <div className="flex-1 min-w-0">
                              <div className="font-body font-semibold text-[12px] truncate" style={{ color: T.textPrimary }}>
                                {lead.seller}
                              </div>
                              <div className="font-body text-[11px] mt-0.5 line-clamp-2" style={{ color: T.textMuted }}>
                                {lead.vehicle}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center justify-center rounded-pill font-body font-bold text-[10px]"
                              style={{ minWidth: 28, height: 17, padding: "0 6px", background: T.bgRow, color: scoreColor }}>
                              {lead.score}
                            </span>
                            <span className="flex-1" />
                            {lead.phone && (
                              <button
                                aria-label="Call"
                                onClick={e => { e.stopPropagation(); call(lead.phone); }}
                                className="flex items-center justify-center flex-shrink-0"
                                style={{ width: 26, height: 26, borderRadius: 8, background: T.greenBg, border: `1px solid ${T.green}33` }}
                              >
                                <Phone size={13} style={{ color: T.green }} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty board hint */}
      {!loading && total === 0 && (
        <div className="text-center pb-5 px-4">
          <span className="font-body text-[12px]" style={{ color: T.textDim }}>
            No leads in your pipeline yet. Add one with “+ Add lead”, or wait for an admin to assign you leads.
          </span>
        </div>
      )}
    </div>
  );
}
