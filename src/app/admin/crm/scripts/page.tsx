"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FileText, MessageSquare, Phone, ChevronDown, ChevronRight,
  Copy, Edit3, Check, X, Eye, Zap, Hash, Clock, Shield,
  ArrowLeft,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  callScripts,
  smsTemplates,
  SCRIPT_CATEGORY_LABELS,
  SCRIPT_CATEGORY_COLORS,
  SMS_CATEGORY_LABELS,
  SMS_CATEGORY_COLORS,
  VARIABLE_REFERENCE,
} from "@/lib/admin/scripts-mock-data";
import type { ScriptCategory, SmsCategory } from "@/lib/admin/scripts-mock-data";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const T = {
  bgPage:        "#0B111E",
  bgCard:        "#0D1525",
  bgSidebar:     "#070D18",
  bgRow:         "#111D30",
  bgHover:       "#0C1428",
  border:        "#1E2D4A",
  border2:       "#111D30",
  textPrimary:   "#F1F5F9",
  textSecondary: "#C5CDD8",
  textMuted:     "#94A3BB",
  textDim:       "#A0AEBF",
  teal:          "#008C7C",
  teal200:       "#4DD9C7",
  green:         "#34D399",
  greenBg:       "#0B2B1A",
  amber:         "#F5A623",
  amberBg:       "#2B1A00",
  red:           "#F87171",
  redBg:         "#2B0F0F",
  indigo:        "#A78BFA",
  indigoBg:      "#1A1040",
  navy:          "#0F1724",
};

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
const crmTabs = [
  { label: "Pipeline",    href: "/admin/crm" },
  { label: "Dialler",     href: "/admin/crm/dialler" },
  { label: "Calls",       href: "/admin/crm/calls" },
  { label: "Scripts",     href: "/admin/crm/scripts" },
  { label: "Performance", href: "/admin/crm/performance" },
];

function ScriptsTopbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-3 px-[22px]"
      style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mr-3">
        <span className="cursor-pointer font-body text-[13px]" style={{ color: T.textDim }} onClick={() => router.push("/admin")}>
          Admin
        </span>
        <span style={{ color: T.textDim }} className="text-[13px]">/</span>
        <span className="cursor-pointer font-body text-[13px]" style={{ color: T.textDim }} onClick={() => router.push("/admin/crm")}>
          CRM
        </span>
        <span style={{ color: T.textDim }} className="text-[13px]">/</span>
        <span className="font-heading font-[800] text-[17px]" style={{ color: T.textPrimary }}>Scripts</span>
      </div>

      {/* Tab nav */}
      <div className="flex-1 flex justify-center">
        <div className="flex rounded-[10px] p-[3px]" style={{ background: T.bgRow }}>
          {crmTabs.map(tab => {
            const active = pathname === tab.href || (tab.href !== "/admin/crm" && pathname.startsWith(tab.href));
            return (
              <button
                key={tab.label}
                onClick={() => router.push(tab.href)}
                className="px-3 py-1.5 rounded-[8px] font-body text-[12px] font-semibold transition-colors duration-150"
                style={{
                  background: active ? T.bgCard : "transparent",
                  color: active ? T.textPrimary : T.textMuted,
                  border: "none", cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/admin/crm"
        className="flex items-center gap-1.5 font-body text-[12px] font-semibold no-underline"
        style={{ color: T.textMuted }}
      >
        <ArrowLeft size={14} />
        Back to CRM
      </Link>
    </div>
  );
}

/* ================================================================== */
/*  KPI ROW                                                            */
/* ================================================================== */
function ScriptsKpiRow() {
  const activeScripts = callScripts.filter(s => s.isActive).length;
  const activeTemplates = smsTemplates.filter(t => t.isActive).length;
  const totalActive = activeScripts + activeTemplates;

  const stats = [
    { icon: <Phone size={13} />, label: `${callScripts.length} call scripts` },
    { icon: <MessageSquare size={13} />, label: `${smsTemplates.length} SMS templates` },
    { icon: <Zap size={13} />, label: `${totalActive} active` },
  ];

  return (
    <div className="flex items-center gap-4 px-[22px] py-[10px]" style={{ borderBottom: `1px solid ${T.border2}` }}>
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span style={{ color: T.teal200 }}>{s.icon}</span>
          <span className="font-body text-[12px] font-semibold" style={{ color: T.textSecondary }}>{s.label}</span>
          {i < stats.length - 1 && <span className="ml-3" style={{ color: T.border, fontSize: 11 }}>|</span>}
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */

/** Highlight [bracketed] variables in call script text */
function renderScriptText(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      return (
        <strong key={i} className="font-body font-semibold" style={{ color: T.teal200 }}>
          {part}
        </strong>
      );
    }
    return part;
  });
}

/** Highlight {{variables}} in SMS template text */
function renderSmsText(text: string) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      return (
        <strong key={i} className="font-mono font-semibold" style={{ color: T.teal200 }}>
          {part}
        </strong>
      );
    }
    return part;
  });
}

/** SMS segment count */
function segmentCount(chars: number): number {
  if (chars <= 160) return 1;
  return Math.ceil(chars / 153);
}

/** Format date to relative or short string */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-04-08T12:00:00Z");
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/* ================================================================== */
/*  CATEGORY FILTER TABS                                               */
/* ================================================================== */
const scriptFilterTabs: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Cold Call", value: "cold_call" },
  { label: "Follow-Up", value: "follow_up" },
  { label: "Objection", value: "objection" },
  { label: "Close", value: "close" },
  { label: "Inbound", value: "inbound" },
  { label: "Callback", value: "callback" },
];

/* ================================================================== */
/*  CALL SCRIPT CARD                                                   */
/* ================================================================== */
function CallScriptCard({
  script,
  isExpanded,
  expandedSection,
  onToggle,
  onToggleSection,
  isEditing,
  editData,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditChange,
}: {
  script: typeof callScripts[0];
  isExpanded: boolean;
  expandedSection: number;
  onToggle: () => void;
  onToggleSection: (i: number) => void;
  isEditing: boolean;
  editData: { name: string; sections: { label: string; text: string }[] } | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (data: { name: string; sections: { label: string; text: string }[] }) => void;
}) {
  const cat = SCRIPT_CATEGORY_COLORS[script.category];

  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderLeft: script.isActive ? `3px solid ${T.teal}` : `1px solid ${T.border}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-[14px] py-[11px] cursor-pointer"
        style={{ borderBottom: isExpanded ? `1px solid ${T.border}` : "none" }}
        onClick={onToggle}
      >
        <span style={{ color: T.textMuted }}>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {isEditing && editData ? (
          <input
            className="font-body font-bold text-[13px] flex-1 rounded px-1"
            style={{ color: T.textPrimary, background: T.bgRow, border: `1px solid ${T.teal}`, outline: "none" }}
            value={editData.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onEditChange({ ...editData, name: e.target.value })}
          />
        ) : (
          <span className="font-body font-bold text-[13px] flex-1" style={{ color: T.textPrimary }}>
            {script.name}
          </span>
        )}
        {/* Category badge */}
        <span
          className="rounded-full px-2 py-0.5 font-body text-[10px] font-bold"
          style={{ background: cat.bg, color: cat.text }}
        >
          {SCRIPT_CATEGORY_LABELS[script.category]}
        </span>
        {/* Usage */}
        <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: T.textMuted }}>
          <Hash size={10} />
          {script.usageCount} uses
        </span>
        {/* Active indicator */}
        <span
          className="w-[8px] h-[8px] rounded-full"
          style={{ background: script.isActive ? T.green : T.textMuted }}
          title={script.isActive ? "Active" : "Inactive"}
        />
      </div>

      {/* Expanded sections */}
      {isExpanded && (
        <div className="p-[12px]">
          {script.sections.map((section, i) => (
            <div
              key={i}
              className="rounded-[9px] overflow-hidden"
              style={{ background: T.bgRow, marginBottom: i < script.sections.length - 1 ? 7 : 0 }}
            >
              <div
                className="flex items-center gap-2 px-[12px] py-[8px] cursor-pointer"
                onClick={() => onToggleSection(i)}
              >
                <span style={{ color: T.textDim }}>
                  {expandedSection === i ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </span>
                <span className="font-body font-bold text-[10px] uppercase tracking-widest" style={{ color: T.textDim }}>
                  {section.label}
                </span>
              </div>
              {expandedSection === i && (
                <div className="px-[12px] pb-[10px]">
                  {isEditing && editData ? (
                    <textarea
                      className="font-body font-normal text-[12px] leading-relaxed w-full rounded-[6px] p-2 resize-y"
                      style={{
                        color: "#C8CDD6", background: T.bgCard, border: `1px solid ${T.teal}`,
                        outline: "none", minHeight: 80,
                      }}
                      value={editData.sections[i]?.text ?? ""}
                      onChange={(e) => {
                        const updated = { ...editData, sections: editData.sections.map((s, idx) =>
                          idx === i ? { ...s, text: e.target.value } : s
                        )};
                        onEditChange(updated);
                      }}
                    />
                  ) : (
                    <div className="font-body font-normal text-[12px] leading-relaxed" style={{ color: "#C8CDD6" }}>
                      {renderScriptText(section.text)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Variables row */}
          <div className="flex flex-wrap gap-1.5 mt-3 mb-1">
            {script.variables.map((v, i) => (
              <span
                key={i}
                className="rounded-full px-2 py-0.5 font-mono text-[9px]"
                style={{ background: T.bgRow, color: T.teal200, border: `1px solid ${T.border2}` }}
              >
                [{v}]
              </span>
            ))}
          </div>

          {/* Footer: meta + actions */}
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${T.border2}` }}>
            <span className="font-body text-[10px]" style={{ color: T.textDim }}>
              <Clock size={10} className="inline mr-1" style={{ verticalAlign: "middle" }} />
              Edited {formatDate(script.lastEdited)} by {script.createdBy}
            </span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSaveEdit(); }}
                    className="flex items-center gap-1 rounded-[8px] px-3 py-1.5 font-body text-[10px] font-bold cursor-pointer"
                    style={{ background: T.teal, color: "#FFFFFF", border: "none" }}
                  >
                    <Check size={10} /> Save
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}
                    className="flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 font-body text-[10px] font-semibold cursor-pointer"
                    style={{ background: T.bgRow, color: T.textMuted, border: `1px solid ${T.border2}` }}
                  >
                    <X size={10} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
                    className="flex items-center gap-1 rounded-[8px] px-2.5 py-1 font-body text-[10px] font-semibold cursor-pointer"
                    style={{ background: T.bgRow, color: T.textSecondary, border: `1px solid ${T.border2}` }}
                  >
                    <Edit3 size={10} /> Edit
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-[8px] px-2.5 py-1 font-body text-[10px] font-semibold cursor-pointer"
                    style={{ background: T.bgRow, color: T.textSecondary, border: `1px solid ${T.border2}` }}
                  >
                    <Copy size={10} /> Duplicate
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  SMS TEMPLATE CARD                                                  */
/* ================================================================== */
function SmsTemplateCard({
  template,
  isExpanded,
  onToggle,
  isEditing,
  editBody,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditChange,
}: {
  template: typeof smsTemplates[0];
  isExpanded: boolean;
  onToggle: () => void;
  isEditing: boolean;
  editBody: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (body: string) => void;
}) {
  const cat = SMS_CATEGORY_COLORS[template.category];
  const segments = segmentCount(template.characterCount);

  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderLeft: template.isActive ? `3px solid ${T.teal}` : `1px solid ${T.border}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-[14px] py-[10px] cursor-pointer"
        style={{ borderBottom: isExpanded ? `1px solid ${T.border}` : "none" }}
        onClick={onToggle}
      >
        <span style={{ color: T.textMuted }}>
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
        <span className="font-body font-bold text-[12px] flex-1" style={{ color: T.textPrimary }}>
          {template.name}
        </span>
        {/* Category badge */}
        <span
          className="rounded-full px-2 py-0.5 font-body text-[9px] font-bold"
          style={{ background: cat.bg, color: cat.text }}
        >
          {SMS_CATEGORY_LABELS[template.category]}
        </span>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div className="px-[14px] pb-[12px]">
          {/* SMS body */}
          <div
            className="rounded-[9px] px-[12px] py-[10px] mb-2"
            style={{ background: T.bgRow }}
          >
            {isEditing && editBody !== null ? (
              <textarea
                className="font-body font-normal text-[12px] leading-relaxed w-full rounded-[6px] p-2 resize-y"
                style={{
                  color: "#C8CDD6", background: T.bgCard, border: `1px solid ${T.teal}`,
                  outline: "none", minHeight: 80,
                }}
                value={editBody}
                onChange={(e) => onEditChange(e.target.value)}
              />
            ) : (
              <div className="font-body font-normal text-[12px] leading-relaxed" style={{ color: "#C8CDD6" }}>
                {renderSmsText(template.body)}
              </div>
            )}
          </div>

          {/* Char count + segment */}
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: T.textMuted }}>
              <Hash size={10} />
              {template.characterCount} chars
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold"
              style={{
                background: segments === 1 ? T.greenBg : T.amberBg,
                color: segments === 1 ? T.green : T.amber,
              }}
            >
              {segments} segment{segments > 1 ? "s" : ""}
            </span>
            {/* Active indicator */}
            <span className="flex items-center gap-1 font-body text-[10px]" style={{ color: template.isActive ? T.green : T.textDim }}>
              <span
                className="w-[7px] h-[7px] rounded-full"
                style={{ background: template.isActive ? T.green : T.textMuted }}
              />
              {template.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Approval status */}
          <div className="flex items-center gap-2 mb-2">
            {template.approvedBy ? (
              <span className="flex items-center gap-1 font-body text-[10px]" style={{ color: T.green }}>
                <Shield size={10} />
                Approved by {template.approvedBy}
              </span>
            ) : (
              <span className="flex items-center gap-1 font-body text-[10px]" style={{ color: T.amber }}>
                <Clock size={10} />
                Pending approval
              </span>
            )}
          </div>

          {/* Variables */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {template.variables.map((v, i) => (
              <span
                key={i}
                className="rounded-full px-2 py-0.5 font-mono text-[9px]"
                style={{ background: T.bgRow, color: T.teal200, border: `1px solid ${T.border2}` }}
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${T.border2}` }}>
            <span className="font-body text-[10px]" style={{ color: T.textDim }}>
              By {template.createdBy}
            </span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSaveEdit(); }}
                    className="flex items-center gap-1 rounded-[8px] px-3 py-1.5 font-body text-[10px] font-bold cursor-pointer"
                    style={{ background: T.teal, color: "#FFFFFF", border: "none" }}
                  >
                    <Check size={10} /> Save
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}
                    className="flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 font-body text-[10px] font-semibold cursor-pointer"
                    style={{ background: T.bgRow, color: T.textMuted, border: `1px solid ${T.border2}` }}
                  >
                    <X size={10} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
                    className="flex items-center gap-1 rounded-[8px] px-2.5 py-1 font-body text-[10px] font-semibold cursor-pointer"
                    style={{ background: T.bgRow, color: T.textSecondary, border: `1px solid ${T.border2}` }}
                  >
                    <Edit3 size={10} /> Edit
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-[8px] px-2.5 py-1 font-body text-[10px] font-semibold cursor-pointer"
                    style={{ background: T.bgRow, color: T.textSecondary, border: `1px solid ${T.border2}` }}
                  >
                    <Eye size={10} /> Preview
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  VARIABLE REFERENCE PANEL                                           */
/* ================================================================== */
function VariableReferencePanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
    >
      <div
        className="flex items-center gap-2 px-[14px] py-[10px] cursor-pointer"
        onClick={onToggle}
      >
        <span style={{ color: T.textMuted }}>
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
        <Zap size={13} style={{ color: T.teal200 }} />
        <span className="font-body font-bold text-[12px]" style={{ color: T.textPrimary }}>
          Variable Reference
        </span>
        <span className="font-mono text-[10px] ml-auto" style={{ color: T.textDim }}>
          {VARIABLE_REFERENCE.length} variables
        </span>
      </div>
      {isOpen && (
        <div className="px-[14px] pb-[12px]" style={{ borderTop: `1px solid ${T.border}` }}>
          <div
            className="grid gap-y-1 mt-2"
            style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "4px 12px" }}
          >
            {VARIABLE_REFERENCE.map((v, i) => (
              <React.Fragment key={i}>
                <span className="font-mono text-[10px] font-semibold" style={{ color: T.teal200 }}>
                  {`{{${v.key}}}`}
                </span>
                <span className="font-body text-[10px]" style={{ color: T.textMuted }}>
                  {v.description}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function CrmScriptsPage() {
  /* State */
  const [scriptFilter, setScriptFilter] = useState("all");
  const [smsFilter, setSmsFilter] = useState("all");
  const [expandedScript, setExpandedScript] = useState<string | null>(callScripts[0].id);
  const [expandedSection, setExpandedSection] = useState(0);
  const [expandedSms, setExpandedSms] = useState<string | null>(smsTemplates[0].id);
  const [showVarRef, setShowVarRef] = useState(false);

  /* Editable script data — mutable copies */
  const [scriptsData, setScriptsData] = useState(callScripts);
  const [smsData, setSmsData] = useState(smsTemplates);

  /* Edit state — call scripts */
  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);
  const [editScriptDraft, setEditScriptDraft] = useState<{ name: string; sections: { label: string; text: string }[] } | null>(null);

  /* Edit state — SMS templates */
  const [editingSmsId, setEditingSmsId] = useState<string | null>(null);
  const [editSmsDraft, setEditSmsDraft] = useState<string | null>(null);

  /* Script edit handlers */
  const handleStartEditScript = useCallback((script: typeof callScripts[0]) => {
    setEditingScriptId(script.id);
    setEditScriptDraft({ name: script.name, sections: script.sections.map(s => ({ ...s })) });
    setExpandedScript(script.id);
  }, []);

  const handleCancelEditScript = useCallback(() => {
    setEditingScriptId(null);
    setEditScriptDraft(null);
  }, []);

  const handleSaveEditScript = useCallback(() => {
    if (!editingScriptId || !editScriptDraft) return;
    setScriptsData(prev => prev.map(s =>
      s.id === editingScriptId ? { ...s, name: editScriptDraft.name, sections: editScriptDraft.sections, lastEdited: new Date().toISOString() } : s
    ));
    setEditingScriptId(null);
    setEditScriptDraft(null);
  }, [editingScriptId, editScriptDraft]);

  /* SMS edit handlers */
  const handleStartEditSms = useCallback((template: typeof smsTemplates[0]) => {
    setEditingSmsId(template.id);
    setEditSmsDraft(template.body);
    setExpandedSms(template.id);
  }, []);

  const handleCancelEditSms = useCallback(() => {
    setEditingSmsId(null);
    setEditSmsDraft(null);
  }, []);

  const handleSaveEditSms = useCallback(() => {
    if (!editingSmsId || editSmsDraft === null) return;
    setSmsData(prev => prev.map(t =>
      t.id === editingSmsId ? { ...t, body: editSmsDraft, characterCount: editSmsDraft.length } : t
    ));
    setEditingSmsId(null);
    setEditSmsDraft(null);
  }, [editingSmsId, editSmsDraft]);

  /* Filtered data */
  const filteredScripts = useMemo(
    () => scriptFilter === "all" ? scriptsData : scriptsData.filter(s => s.category === scriptFilter),
    [scriptFilter, scriptsData]
  );

  const filteredSms = useMemo(
    () => smsFilter === "all" ? smsData : smsData.filter(t => t.category === smsFilter),
    [smsFilter, smsData]
  );

  /* SMS category options */
  const smsCategoryOptions = useMemo(() => {
    const cats = Array.from(new Set(smsTemplates.map(t => t.category)));
    return [{ value: "all", label: "All Categories" }, ...cats.map(c => ({ value: c, label: SMS_CATEGORY_LABELS[c] }))];
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: T.bgPage }}>
      <IconSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ScriptsTopbar />
        <ScriptsKpiRow />

        {/* Main content */}
        <div className="flex-1 overflow-auto p-[22px]">
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>

            {/* ======== LEFT: Call Script Library ======== */}
            <div className="flex flex-col gap-3">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-1">
                <FileText size={15} style={{ color: T.teal200 }} />
                <span className="font-heading font-bold text-[15px]" style={{ color: T.textPrimary }}>
                  Call Script Library
                </span>
              </div>

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-1.5 mb-1">
                {scriptFilterTabs.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setScriptFilter(tab.value)}
                    className="rounded-full px-2.5 py-1 font-body text-[11px] font-semibold cursor-pointer transition-colors duration-150"
                    style={{
                      background: scriptFilter === tab.value ? T.teal : T.bgRow,
                      color: scriptFilter === tab.value ? "#FFFFFF" : T.textMuted,
                      border: `1px solid ${scriptFilter === tab.value ? T.teal : T.border2}`,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Script cards */}
              {filteredScripts.map(script => (
                <CallScriptCard
                  key={script.id}
                  script={script}
                  isExpanded={expandedScript === script.id}
                  expandedSection={expandedScript === script.id ? expandedSection : -1}
                  onToggle={() => {
                    if (expandedScript === script.id) {
                      setExpandedScript(null);
                    } else {
                      setExpandedScript(script.id);
                      setExpandedSection(0);
                    }
                  }}
                  onToggleSection={(i) => setExpandedSection(expandedSection === i ? -1 : i)}
                  isEditing={editingScriptId === script.id}
                  editData={editingScriptId === script.id ? editScriptDraft : null}
                  onStartEdit={() => handleStartEditScript(script)}
                  onCancelEdit={handleCancelEditScript}
                  onSaveEdit={handleSaveEditScript}
                  onEditChange={setEditScriptDraft}
                />
              ))}

              {filteredScripts.length === 0 && (
                <div
                  className="rounded-[14px] px-[14px] py-[20px] text-center font-body text-[12px]"
                  style={{ background: T.bgCard, border: `1px solid ${T.border}`, color: T.textMuted }}
                >
                  No scripts in this category
                </div>
              )}

              {/* Variable reference panel */}
              <VariableReferencePanel isOpen={showVarRef} onToggle={() => setShowVarRef(!showVarRef)} />
            </div>

            {/* ======== RIGHT: SMS Template Library ======== */}
            <div className="flex flex-col gap-3">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={15} style={{ color: T.teal200 }} />
                <span className="font-heading font-bold text-[15px]" style={{ color: T.textPrimary }}>
                  SMS Template Library
                </span>
              </div>

              {/* Category filter dropdown */}
              <div className="mb-1">
                <select
                  value={smsFilter}
                  onChange={e => setSmsFilter(e.target.value)}
                  className="rounded-[8px] px-2.5 py-1.5 font-body text-[11px] font-semibold cursor-pointer appearance-none"
                  style={{
                    background: T.bgRow,
                    color: T.textSecondary,
                    border: `1px solid ${T.border2}`,
                    outline: "none",
                    minWidth: 160,
                  }}
                >
                  {smsCategoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* SMS template cards */}
              {filteredSms.map(template => (
                <SmsTemplateCard
                  key={template.id}
                  template={template}
                  isExpanded={expandedSms === template.id}
                  onToggle={() => setExpandedSms(expandedSms === template.id ? null : template.id)}
                  isEditing={editingSmsId === template.id}
                  editBody={editingSmsId === template.id ? editSmsDraft : null}
                  onStartEdit={() => handleStartEditSms(template)}
                  onCancelEdit={handleCancelEditSms}
                  onSaveEdit={handleSaveEditSms}
                  onEditChange={setEditSmsDraft}
                />
              ))}

              {filteredSms.length === 0 && (
                <div
                  className="rounded-[14px] px-[14px] py-[20px] text-center font-body text-[12px]"
                  style={{ background: T.bgCard, border: `1px solid ${T.border}`, color: T.textMuted }}
                >
                  No templates in this category
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
