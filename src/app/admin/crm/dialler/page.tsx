"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Phone, PhoneOff, PhoneOutgoing, SkipForward, Mic, MicOff,
  Pause, Play, Grid3x3, Circle, ChevronRight, ChevronDown,
  ArrowLeft, Zap, CheckCircle2, XCircle, Voicemail,
  HelpCircle, Star, PhoneForwarded, FileText, StickyNote,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import { CrmTopbar } from "@/components/admin/crm-topbar";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { scriptSections } from "@/lib/admin/dialler-mock-data";
import type { DiallerLead } from "@/lib/admin/dialler-mock-data";

/* ── Pipeline → dialler queue mapping ── */
// Order leads so the freshest/actionable ones are dialled first; "collected"
// (closed) leads are excluded from the calling queue.
const STAGE_ORDER: Record<string, number> = {
  new_lead: 0, call_back: 1, contacted: 2, contract_sent: 3, handover_scheduled: 4, collected: 5,
};
const STAGE_OUTCOME_LABEL: Record<string, string> = {
  new_lead: "New", call_back: "Callback", contacted: "Contacted",
  contract_sent: "Contract sent", handover_scheduled: "Handover", collected: "Collected",
};

interface ApiLeadRow {
  id: string; seller: string; phone: string | null; score: number;
  vehicleYear: number | null; vehicleMake: string | null; vehicleModel: string | null;
  vehicleTrim: string | null; vehicleMileage: number | null;
  askingPriceGbp: number | null; lastContact: string | null; pipelineStage: string;
}

function toDiallerLead(r: ApiLeadRow): DiallerLead {
  return {
    id: r.id,
    sellerName: r.seller || "Unknown seller",
    sellerPhone: r.phone ?? "",
    vehicleYear: r.vehicleYear ?? 0,
    vehicleMake: r.vehicleMake ?? "",
    vehicleModel: r.vehicleModel ?? "",
    vehicleTrim: r.vehicleTrim ?? "",
    askingPrice: r.askingPriceGbp ? `£${Number(r.askingPriceGbp).toLocaleString()}` : "—",
    mileage: r.vehicleMileage ? `${Math.round(r.vehicleMileage / 1000)}k mi` : "—",
    scoutScore: r.score ?? 0,
    priorContacts: 0,
    lastContactDate: r.lastContact ?? "—",
    lastOutcome: STAGE_OUTCOME_LABEL[r.pipelineStage] ?? "New",
  };
}

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
/*  TYPES                                                              */
/* ================================================================== */
type CallPhase = "pre-call" | "ringing" | "connected" | "disposition" | "session-complete";
type CallOutcome = "interested" | "callback" | "declined" | "voicemail" | "no-answer" | "wrong-number" | "converted";

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */
function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

const OUTCOME_CONFIG: { key: CallOutcome; label: string; color: string; bg: string; icon: React.ElementType }[] = [
  { key: "interested",    label: "Interested",    color: T.green,       bg: T.greenBg,  icon: Star },
  { key: "callback",      label: "Callback",      color: T.amber,       bg: T.amberBg,  icon: PhoneForwarded },
  { key: "declined",      label: "Declined",      color: T.red,         bg: T.redBg,    icon: XCircle },
  { key: "voicemail",     label: "Voicemail",     color: T.indigo,      bg: T.indigoBg, icon: Voicemail },
  { key: "no-answer",     label: "No Answer",     color: T.textMuted,   bg: T.bgRow,    icon: PhoneOff },
  { key: "wrong-number",  label: "Wrong Number",  color: T.textMuted,   bg: T.bgRow,    icon: HelpCircle },
  { key: "converted",     label: "Converted",     color: T.teal,        bg: T.greenBg,  icon: CheckCircle2 },
];

const DTMF_KEYS = ["1","2","3","4","5","6","7","8","9","*","0","#"];

/* ================================================================== */
/*  SESSION HEADER                                                     */
/* ================================================================== */
function SessionHeader({
  sessionElapsed, sessionPaused, stats, onPause, onEnd, repName, queueLength,
}: {
  sessionElapsed: number;
  sessionPaused: boolean;
  stats: { dialled: number; contacted: number; signed: number };
  onPause: () => void;
  onEnd: () => void;
  repName: string;
  queueLength: number;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:px-4 lg:px-[22px] lg:py-0 lg:min-h-[52px]"
      style={{
        background: T.bgCard, borderBottom: `1px solid ${T.border}`, flexShrink: 0,
      }}
    >
      {/* Left: Session info */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span
          className="w-[8px] h-[8px] rounded-full animate-pulse shrink-0"
          style={{ background: sessionPaused ? T.amber : T.green }}
        />
        <span className="font-body text-[11px] sm:text-[12px] font-semibold shrink-0" style={{ color: sessionPaused ? T.amber : T.green }}>
          {sessionPaused ? "Paused" : "Session active"}
        </span>
        <span className="font-heading text-[13px] sm:text-[14px] font-bold truncate" style={{ color: T.textPrimary }}>
          {repName}
        </span>
      </div>

      {/* Center: Timer */}
      <div className="order-last w-full text-center font-mono text-[14px] sm:text-[16px] font-bold lg:order-none lg:w-auto" style={{ color: T.teal200 }}>
        {formatTime(sessionElapsed)}
      </div>

      {/* Right: Stats + controls */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        {/* Stat pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-body text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: T.bgRow, color: T.textSecondary }}>
            {stats.dialled}/{queueLength} dialled
          </span>
          <span className="font-body text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: T.bgRow, color: T.green }}>
            {stats.contacted} contacted
          </span>
          <span className="font-body text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: T.bgRow, color: T.teal200 }}>
            {stats.signed} signed
          </span>
        </div>

        {/* Pause / Resume */}
        <button
          onClick={onPause}
          className="flex items-center gap-1.5 font-body text-[11px] font-bold rounded-full px-2.5 py-1.5 sm:px-3 transition-colors"
          style={{
            background: sessionPaused ? T.greenBg : T.bgRow,
            color: sessionPaused ? T.green : T.textSecondary,
            border: `1px solid ${sessionPaused ? T.green : T.border}`,
            cursor: "pointer",
          }}
        >
          {sessionPaused ? <Play size={12} /> : <Pause size={12} />}
          {sessionPaused ? "Resume" : "Pause"}
        </button>

        {/* End session */}
        <button
          onClick={onEnd}
          className="flex items-center gap-1.5 font-body text-[11px] font-bold rounded-full px-2.5 py-1.5 sm:px-3"
          style={{ background: T.redBg, color: T.red, border: `1px solid ${T.red}33`, cursor: "pointer" }}
        >
          End Session
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LEAD INFO PANEL (left)                                             */
/* ================================================================== */
function LeadInfoPanel({ lead, phase }: { lead: DiallerLead; phase: CallPhase }) {
  const compact = phase === "connected" || phase === "disposition";

  if (compact) {
    return (
      <div className="p-4 lg:p-[18px]">
        <div className="font-heading text-[15px] font-bold" style={{ color: T.textPrimary }}>
          {lead.sellerName}
        </div>
        <div className="font-body text-[12px] mt-0.5" style={{ color: T.textSecondary }}>
          {lead.vehicleYear} {lead.vehicleMake} {lead.vehicleModel} {lead.vehicleTrim}
        </div>
        <div className="font-mono text-[14px] mt-2" style={{ color: T.teal200 }}>
          {lead.sellerPhone}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="font-body text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: T.greenBg, color: T.green }}>
            Score {lead.scoutScore}
          </span>
          <span className="font-body text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: T.amberBg, color: T.amber }}>
            {lead.askingPrice}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 lg:p-[18px] lg:pt-5">
      <div className="font-heading text-[18px] sm:text-[20px] font-bold" style={{ color: T.textPrimary }}>
        {lead.sellerName}
      </div>
      <div className="font-body text-[13px] mt-1" style={{ color: T.textSecondary }}>
        {lead.vehicleYear} {lead.vehicleMake} {lead.vehicleModel} {lead.vehicleTrim}
      </div>

      {/* Pills */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="font-body text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: T.greenBg, color: T.green }}>
          Score {lead.scoutScore}
        </span>
        <span className="font-body text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: T.amberBg, color: T.amber }}>
          {lead.askingPrice}
        </span>
        <span className="font-body text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: T.bgRow, color: T.textMuted }}>
          {lead.mileage}
        </span>
      </div>

      {/* Phone */}
      <div className="font-mono text-[18px] mt-4" style={{ color: T.teal200 }}>
        {lead.sellerPhone}
      </div>

      {/* Contact history */}
      <div className="font-body text-[12px] mt-3" style={{ color: T.textMuted }}>
        {lead.priorContacts} prior contact{lead.priorContacts !== 1 ? "s" : ""}
        {lead.lastContactDate !== "—" && <> &middot; Last: {lead.lastContactDate}</>}
      </div>

      {/* Last outcome badge */}
      <div className="mt-2">
        <span className="font-body text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: lead.lastOutcome === "New" ? T.indigoBg
              : lead.lastOutcome === "Interested" ? T.greenBg
              : lead.lastOutcome === "Callback" ? T.amberBg
              : lead.lastOutcome === "Voicemail" ? T.indigoBg
              : lead.lastOutcome === "Declined" ? T.redBg
              : T.bgRow,
            color: lead.lastOutcome === "New" ? T.indigo
              : lead.lastOutcome === "Interested" ? T.green
              : lead.lastOutcome === "Callback" ? T.amber
              : lead.lastOutcome === "Voicemail" ? T.indigo
              : lead.lastOutcome === "Declined" ? T.red
              : T.textMuted,
          }}
        >
          {lead.lastOutcome}
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SCRIPT PANEL (right)                                               */
/* ================================================================== */
function ScriptPanel({
  rightTab, setRightTab, openScriptIdx, setOpenScriptIdx, callNotes, setCallNotes,
}: {
  rightTab: "script" | "notes";
  setRightTab: (t: "script" | "notes") => void;
  openScriptIdx: number;
  setOpenScriptIdx: (i: number) => void;
  callNotes: string;
  setCallNotes: (v: string) => void;
}) {
  // Highlight [bracketed] words in teal
  function highlightBrackets(text: string) {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) =>
      part.startsWith("[") ? (
        <span key={i} style={{ color: T.teal200, fontWeight: 600 }}>{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[260px] lg:min-h-0">
      {/* Tabs */}
      <div className="flex gap-1 p-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        {(["script", "notes"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setRightTab(tab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-body text-[12px] font-semibold"
            style={{
              background: rightTab === tab ? T.bgRow : "transparent",
              color: rightTab === tab ? T.textPrimary : T.textMuted,
              border: "none", cursor: "pointer",
            }}
          >
            {tab === "script" ? <FileText size={13} /> : <StickyNote size={13} />}
            {tab === "script" ? "Script" : "Notes"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 0" }}>
        {rightTab === "script" ? (
          scriptSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: "32px 16px", gap: 6 }}>
              <FileText size={22} style={{ color: T.textMuted }} />
              <span className="font-body text-[12px]" style={{ color: T.textMuted }}>
                No script sections yet
              </span>
            </div>
          ) : (
          <div>
            {scriptSections.map((section, idx) => {
              const isOpen = openScriptIdx === idx;
              return (
                <div key={idx} style={{ borderBottom: `1px solid ${T.border2}` }}>
                  <button
                    onClick={() => setOpenScriptIdx(isOpen ? -1 : idx)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2.5"
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                    }}
                  >
                    {isOpen ? (
                      <ChevronDown size={14} style={{ color: T.teal200, flexShrink: 0 }} />
                    ) : (
                      <ChevronRight size={14} style={{ color: T.textMuted, flexShrink: 0 }} />
                    )}
                    <span className="font-body text-[12px] font-semibold"
                      style={{ color: isOpen ? T.teal200 : T.textSecondary }}>
                      {section.label}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3" style={{ paddingLeft: 30 }}>
                      <p className="font-body text-[12px] leading-[1.6]" style={{ color: T.textSecondary, margin: 0 }}>
                        {highlightBrackets(section.text)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )
        ) : (
          <div style={{ padding: "8px 12px", height: "100%" }}>
            <textarea
              value={callNotes}
              onChange={e => setCallNotes(e.target.value)}
              placeholder="Call notes..."
              className="font-body text-[12px]"
              style={{
                width: "100%", height: "100%", minHeight: 200,
                background: T.bgRow, color: T.textPrimary,
                border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "10px 12px", resize: "vertical",
                outline: "none",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CALL CONTROL AREA (center)                                         */
/* ================================================================== */
function CallControlArea({
  phase, callElapsed, lead,
  isMuted, setIsMuted, isHeld, setIsHeld, isRecording, setIsRecording,
  showKeypad, setShowKeypad,
  selectedOutcome, setSelectedOutcome,
  callbackDate, setCallbackDate, callbackTime, setCallbackTime,
  callNotes, setCallNotes, lastCallDuration,
  onCall, onEndCall, onSkip, onSaveNext, onSavePause,
}: {
  phase: CallPhase;
  callElapsed: number;
  lead: DiallerLead;
  isMuted: boolean; setIsMuted: (v: boolean) => void;
  isHeld: boolean; setIsHeld: (v: boolean) => void;
  isRecording: boolean; setIsRecording: (v: boolean) => void;
  showKeypad: boolean; setShowKeypad: (v: boolean) => void;
  selectedOutcome: CallOutcome | null; setSelectedOutcome: (v: CallOutcome | null) => void;
  callbackDate: string; setCallbackDate: (v: string) => void;
  callbackTime: string; setCallbackTime: (v: string) => void;
  callNotes: string; setCallNotes: (v: string) => void;
  lastCallDuration: number;
  onCall: () => void;
  onEndCall: () => void;
  onSkip: () => void;
  onSaveNext: () => void;
  onSavePause: () => void;
}) {
  /* ---- PRE-CALL ---- */
  if (phase === "pre-call") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 p-4">
        <button
          onClick={onCall}
          className="flex items-center gap-3 font-heading text-[15px] sm:text-[16px] font-bold transition-transform hover:scale-[1.03] rounded-full px-10 py-3.5 sm:px-12"
          style={{
            background: T.green, color: "#fff",
            border: "none", cursor: "pointer",
            boxShadow: `0 0 24px ${T.green}33`,
          }}
        >
          <Phone size={20} />
          Call Now
        </button>
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 font-body text-[13px] font-semibold"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: T.textMuted }}
        >
          <SkipForward size={14} />
          Skip
        </button>
      </div>
    );
  }

  /* ---- RINGING ---- */
  if (phase === "ringing") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 p-4">
        <div style={{ animation: "pulse-ring 1.5s ease-in-out infinite" }}>
          <PhoneOutgoing size={40} style={{ color: T.green }} />
        </div>
        <div className="font-heading text-[18px] font-bold" style={{ color: T.textPrimary }}>
          Calling...
        </div>
        <div className="font-mono text-[14px]" style={{ color: T.textMuted }}>
          {formatTime(callElapsed)}
        </div>
        <button
          onClick={onEndCall}
          className="flex items-center gap-2 font-heading text-[13px] font-bold mt-2"
          style={{
            background: T.red, color: "#fff",
            borderRadius: 100, padding: "10px 32px",
            border: "none", cursor: "pointer",
          }}
        >
          <PhoneOff size={16} />
          End Call
        </button>
      </div>
    );
  }

  /* ---- CONNECTED ---- */
  if (phase === "connected") {
    const controlBtns: {
      icon: React.ElementType; iconOff?: React.ElementType; label: string;
      active: boolean; toggle: () => void;
      activeBg: string; activeColor: string; isEnd?: boolean;
    }[] = [
      { icon: MicOff, iconOff: Mic, label: "Mute", active: isMuted, toggle: () => setIsMuted(!isMuted), activeBg: T.redBg, activeColor: T.red },
      { icon: Pause, iconOff: Play, label: "Hold", active: isHeld, toggle: () => setIsHeld(!isHeld), activeBg: T.indigoBg, activeColor: T.indigo },
      { icon: Grid3x3, label: "Keypad", active: showKeypad, toggle: () => setShowKeypad(!showKeypad), activeBg: T.bgRow, activeColor: T.textPrimary },
      { icon: Circle, label: "Record", active: isRecording, toggle: () => setIsRecording(!isRecording), activeBg: T.redBg, activeColor: T.red },
      { icon: PhoneOff, label: "End", active: false, toggle: onEndCall, activeBg: T.red, activeColor: "#fff", isEnd: true },
    ];

    return (
      <div className="flex flex-col items-center justify-center relative h-full gap-3 p-4">
        {/* Connected status */}
        <div className="flex items-center gap-2">
          <span className="w-[8px] h-[8px] rounded-full" style={{ background: T.green }} />
          <span className="font-body text-[13px] font-semibold" style={{ color: T.green }}>Connected</span>
        </div>

        {/* Timer */}
        <div className="font-mono text-[28px] sm:text-[36px] font-bold" style={{ color: T.teal200 }}>
          {formatTime(callElapsed)}
        </div>

        {/* Keypad overlay */}
        {showKeypad && (
          <div
            className="grid grid-cols-3 gap-1.5 sm:gap-1.5 my-1 rounded-[14px] p-2.5 sm:p-3"
            style={{
              background: T.bgCard,
              border: `1px solid ${T.border}`,
            }}
          >
            {DTMF_KEYS.map(key => (
              <button
                key={key}
                className="font-mono text-[15px] sm:text-[16px] font-bold flex items-center justify-center h-10 w-12 sm:h-11 sm:w-14 rounded-[8px]"
                style={{
                  background: T.bgRow, color: T.textPrimary,
                  border: `1px solid ${T.border}`, cursor: "pointer",
                }}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {/* Control buttons */}
        <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${showKeypad ? "mt-1" : "mt-3 sm:mt-4"}`}>
          {controlBtns.map(btn => {
            const Icon = btn.active && btn.iconOff ? btn.icon : (btn.iconOff || btn.icon);
            return (
              <div key={btn.label} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={btn.toggle}
                  className="flex items-center justify-center transition-colors h-12 w-12 sm:h-14 sm:w-14 rounded-full relative"
                  style={{
                    background: btn.isEnd ? T.red : btn.active ? btn.activeBg : T.bgRow,
                    color: btn.isEnd ? "#fff" : btn.active ? btn.activeColor : T.textSecondary,
                    border: btn.active && !btn.isEnd ? `1px solid ${btn.activeColor}44` : `1px solid ${T.border}`,
                    cursor: "pointer",
                  }}
                >
                  <Icon size={20} />
                  {btn.label === "Record" && btn.active && (
                    <span className="absolute top-1 right-1 w-[8px] h-[8px] rounded-full animate-pulse"
                      style={{ background: T.red }} />
                  )}
                </button>
                <span className="font-body text-[10px]" style={{ color: T.textMuted }}>{btn.label}</span>
              </div>
            );
          })}
        </div>

        {/* In-call notes */}
        <textarea
          value={callNotes}
          onChange={e => setCallNotes(e.target.value)}
          placeholder="In-call notes..."
          className="font-body text-[12px] w-full max-w-[400px] h-[60px] mt-2 rounded-[8px]"
          style={{
            background: T.bgRow, color: T.textPrimary,
            border: `1px solid ${T.border}`,
            padding: "8px 12px", resize: "none", outline: "none",
          }}
        />
      </div>
    );
  }

  /* ---- DISPOSITION ---- */
  if (phase === "disposition") {
    return (
      <div className="flex flex-col items-center h-full overflow-y-auto p-4 sm:p-5 lg:py-6 lg:px-5">
        {/* Header */}
        <div className="font-body text-[13px] sm:text-[14px] font-semibold mb-4 text-center" style={{ color: T.textSecondary }}>
          Call ended &middot; Duration {formatTime(lastCallDuration)}
        </div>

        {/* Outcome grid */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
          {OUTCOME_CONFIG.map(o => {
            const Icon = o.icon;
            const selected = selectedOutcome === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setSelectedOutcome(o.key)}
                className="flex items-center gap-2 font-body text-[12px] font-semibold transition-all h-11 rounded-[10px] px-3 sm:px-3.5 min-w-0"
                style={{
                  background: o.bg, color: o.color,
                  border: selected ? `2px solid ${o.color}` : `1px solid ${o.color}22`,
                  cursor: "pointer",
                  boxShadow: selected ? `0 0 12px ${o.color}22` : "none",
                }}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{o.label}</span>
              </button>
            );
          })}
        </div>

        {/* Callback date/time */}
        {selectedOutcome === "callback" && (
          <div className="flex flex-wrap gap-2 mt-4 w-full max-w-[320px]">
            <input
              type="date"
              value={callbackDate}
              onChange={e => setCallbackDate(e.target.value)}
              className="font-body text-[12px] flex-1 min-w-0 rounded-[8px]"
              style={{
                background: T.bgRow, color: T.textPrimary,
                border: `1px solid ${T.border}`,
                padding: "8px 10px", outline: "none",
                colorScheme: "dark",
              }}
            />
            <input
              type="time"
              value={callbackTime}
              onChange={e => setCallbackTime(e.target.value)}
              className="font-body text-[12px] w-[110px] rounded-[8px]"
              style={{
                background: T.bgRow, color: T.textPrimary,
                border: `1px solid ${T.border}`,
                padding: "8px 10px", outline: "none",
                colorScheme: "dark",
              }}
            />
          </div>
        )}

        {/* Notes */}
        <textarea
          value={callNotes}
          onChange={e => setCallNotes(e.target.value)}
          placeholder="Disposition notes..."
          className="font-body text-[12px] mt-4 w-full max-w-[320px] h-20 rounded-[8px]"
          style={{
            background: T.bgRow, color: T.textPrimary,
            border: `1px solid ${T.border}`,
            padding: "10px 12px", resize: "vertical", outline: "none",
          }}
        />

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full max-w-[320px]">
          <button
            onClick={onSaveNext}
            disabled={!selectedOutcome}
            className="flex items-center gap-2 font-heading text-[13px] font-bold"
            style={{
              background: selectedOutcome ? T.teal : T.bgRow,
              color: selectedOutcome ? "#fff" : T.textMuted,
              borderRadius: 100, padding: "10px 28px",
              border: "none", cursor: selectedOutcome ? "pointer" : "not-allowed",
              opacity: selectedOutcome ? 1 : 0.6,
            }}
          >
            Save & Next
            <SkipForward size={14} />
          </button>
          <button
            onClick={onSavePause}
            disabled={!selectedOutcome}
            className="font-heading text-[13px] font-bold"
            style={{
              background: "transparent",
              color: selectedOutcome ? T.textSecondary : T.textMuted,
              borderRadius: 100, padding: "10px 20px",
              border: `1px solid ${T.border}`,
              cursor: selectedOutcome ? "pointer" : "not-allowed",
              opacity: selectedOutcome ? 1 : 0.6,
            }}
          >
            Save & Pause
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/* ================================================================== */
/*  QUEUE BAR (bottom)                                                 */
/* ================================================================== */
function QueueBar({ currentIdx, queue, stats }: { currentIdx: number; queue: DiallerLead[]; stats: { dialled: number; contacted: number } }) {
  const nextLead = currentIdx + 1 < queue.length ? queue[currentIdx + 1] : null;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 sm:px-4 lg:px-[22px] lg:py-0 lg:min-h-[48px]"
      style={{
        background: T.bgCard, borderTop: `1px solid ${T.border}`, flexShrink: 0,
        justifyContent: "space-between",
      }}
    >
      {/* Position */}
      <span
        className="font-body text-[11px] sm:text-[12px] font-bold px-2.5 py-1 rounded-full shrink-0"
        style={{ background: T.teal, color: "#fff" }}
      >
        {currentIdx + 1} of {queue.length}
      </span>

      {/* Next preview */}
      <span className="hidden md:block font-body text-[12px] truncate min-w-0" style={{ color: T.textSecondary }}>
        {nextLead ? (
          <>
            Next: {nextLead.sellerName} &middot; {nextLead.vehicleYear} {nextLead.vehicleMake} {nextLead.vehicleModel} &middot; Score {nextLead.scoutScore}
          </>
        ) : (
          "Last lead in queue"
        )}
      </span>

      {/* Mini stats */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-body text-[11px]" style={{ color: T.textMuted }}>
          {stats.dialled} dialled
        </span>
        <span style={{ color: T.border }}>|</span>
        <span className="font-body text-[11px]" style={{ color: T.textMuted }}>
          {stats.contacted} contacted
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  QUEUE EMPTY                                                        */
/* ================================================================== */
function QueueEmptyPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 sm:p-10">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 64, height: 64, background: T.bgCard, border: `1px solid ${T.border}` }}
      >
        <PhoneOff size={28} style={{ color: T.textMuted }} />
      </div>
      <div className="font-heading text-[18px] sm:text-[20px] font-bold" style={{ color: T.textPrimary }}>
        Queue empty
      </div>
      <div className="font-body text-[13px] text-center w-full max-w-[360px]" style={{ color: T.textMuted }}>
        No leads in the dialler queue yet. Assign leads from the CRM to start a calling session.
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-heading text-[13px] font-bold mt-2"
        style={{
          background: "transparent", color: T.textSecondary,
          borderRadius: 100, padding: "12px 28px",
          border: `1px solid ${T.border}`, cursor: "pointer",
        }}
      >
        <ArrowLeft size={14} />
        Back to CRM
      </button>
    </div>
  );
}

/* ================================================================== */
/*  SESSION COMPLETE                                                   */
/* ================================================================== */
function SessionCompletePanel({
  stats, sessionElapsed, onBack, onNewSession,
}: {
  stats: { dialled: number; contacted: number; signed: number };
  sessionElapsed: number;
  onBack: () => void;
  onNewSession: () => void;
}) {
  const avgDuration = stats.dialled > 0 ? Math.round(sessionElapsed / stats.dialled) : 0;

  const statCards = [
    { label: "Total Dials", value: stats.dialled, color: T.textPrimary },
    { label: "Contacts Made", value: stats.contacted, color: T.green },
    { label: "Conversions", value: stats.signed, color: T.teal200 },
    { label: "Avg Duration", value: formatTime(avgDuration), color: T.amber },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 sm:gap-6 p-6 sm:p-10">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={28} style={{ color: T.green }} />
        <span className="font-heading text-[20px] sm:text-[24px] font-bold" style={{ color: T.textPrimary }}>
          Session Complete
        </span>
      </div>
      <div className="font-body text-[13px]" style={{ color: T.textSecondary }}>
        Total session time: {formatTime(sessionElapsed)}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-[560px]">
        {statCards.map(s => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center py-4"
            style={{
              background: T.bgCard, borderRadius: 14,
              border: `1px solid ${T.border}`,
            }}
          >
            <div className="font-heading text-2xl sm:text-[28px] font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="font-body text-[11px] mt-1" style={{ color: T.textMuted }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2 sm:mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-heading text-[13px] font-bold"
          style={{
            background: "transparent", color: T.textSecondary,
            borderRadius: 100, padding: "12px 28px",
            border: `1px solid ${T.border}`, cursor: "pointer",
          }}
        >
          <ArrowLeft size={14} />
          Back to CRM
        </button>
        <button
          onClick={onNewSession}
          className="flex items-center gap-2 font-heading text-[13px] font-bold"
          style={{
            background: T.teal, color: "#fff",
            borderRadius: 100, padding: "12px 28px",
            border: "none", cursor: "pointer",
          }}
        >
          <Zap size={14} />
          New Session
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function CrmDiallerPage() {
  const router = useRouter();
  const { user } = useCurrentUser();

  /* ---- State ---- */
  const [queue, setQueue] = useState<DiallerLead[]>([]);
  const [phase, setPhase] = useState<CallPhase>("pre-call");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [callElapsed, setCallElapsed] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [rightTab, setRightTab] = useState<"script" | "notes">("script");
  const [openScriptIdx, setOpenScriptIdx] = useState(0);
  const [sessionStats, setSessionStats] = useState({ dialled: 0, contacted: 0, signed: 0 });
  const [lastCallDuration, setLastCallDuration] = useState(0);

  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentLead = queue[currentIdx];
  const queueEmpty = queue.length === 0;

  /* ---- Load the rep's leads into the calling queue ---- */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/leads", { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data: { leads?: ApiLeadRow[] }) => {
        if (cancelled) return;
        const mapped = (data.leads ?? [])
          .filter(l => l.pipelineStage !== "collected") // closed deals aren't dialled
          .sort((a, b) => (STAGE_ORDER[a.pipelineStage] ?? 9) - (STAGE_ORDER[b.pipelineStage] ?? 9))
          .map(toDiallerLead);
        setQueue(mapped);
      })
      .catch(err => { if (!cancelled) console.error("[Dialler] queue fetch failed:", err); });
    return () => { cancelled = true; };
  }, []);

  /* ---- Session timer ---- */
  useEffect(() => {
    if (sessionPaused || phase === "session-complete") return;
    const iv = setInterval(() => setSessionElapsed(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [sessionPaused, phase]);

  /* ---- Call timer ---- */
  useEffect(() => {
    if (phase !== "connected" && phase !== "ringing") return;
    const iv = setInterval(() => setCallElapsed(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  /* ---- Handlers ---- */
  const resetCallState = useCallback(() => {
    setCallElapsed(0);
    setIsMuted(false);
    setIsHeld(false);
    setIsRecording(false);
    setShowKeypad(false);
    setSelectedOutcome(null);
    setCallbackDate("");
    setCallbackTime("");
    setCallNotes("");
    setOpenScriptIdx(0);
    setRightTab("script");
    if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
  }, []);

  const handleCall = useCallback(() => {
    // Place the real call through the softphone (mounted by the CRM layout).
    // When voice isn't configured / the rep is offline, iaDial stages the
    // number in the softphone instead, and the session flow below still runs.
    const dial = (window as unknown as { iaDial?: (n: string) => void }).iaDial;
    if (dial && currentLead?.sellerPhone) dial(currentLead.sellerPhone);

    setPhase("ringing");
    setCallElapsed(0);
    setSessionStats(s => ({ ...s, dialled: s.dialled + 1 }));
    const delay = 2000 + Math.random() * 2000;
    ringingTimeoutRef.current = setTimeout(() => {
      setPhase("connected");
      setCallElapsed(0);
      setSessionStats(s => ({ ...s, contacted: s.contacted + 1 }));
    }, delay);
  }, [currentLead]);

  const handleEndCall = useCallback(() => {
    if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    setLastCallDuration(callElapsed);
    setPhase("disposition");
  }, [callElapsed]);

  const handleSkip = useCallback(() => {
    resetCallState();
    if (currentIdx + 1 >= queue.length) {
      setPhase("session-complete");
    } else {
      setCurrentIdx(i => i + 1);
      setPhase("pre-call");
    }
  }, [currentIdx, resetCallState]);

  const handleSaveNext = useCallback(() => {
    if (selectedOutcome === "converted") {
      setSessionStats(s => ({ ...s, signed: s.signed + 1 }));
    }
    resetCallState();
    if (currentIdx + 1 >= queue.length) {
      setPhase("session-complete");
    } else {
      setCurrentIdx(i => i + 1);
      setPhase("pre-call");
    }
  }, [selectedOutcome, currentIdx, resetCallState]);

  const handleSavePause = useCallback(() => {
    if (selectedOutcome === "converted") {
      setSessionStats(s => ({ ...s, signed: s.signed + 1 }));
    }
    resetCallState();
    setSessionPaused(true);
    if (currentIdx + 1 >= queue.length) {
      setPhase("session-complete");
    } else {
      setCurrentIdx(i => i + 1);
      setPhase("pre-call");
    }
  }, [selectedOutcome, currentIdx, resetCallState]);

  const handleEndSession = useCallback(() => {
    if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    setPhase("session-complete");
  }, []);

  const handleNewSession = useCallback(() => {
    setCurrentIdx(0);
    setSessionElapsed(0);
    setSessionPaused(false);
    setSessionStats({ dialled: 0, contacted: 0, signed: 0 });
    resetCallState();
    setPhase("pre-call");
  }, [resetCallState]);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    };
  }, []);

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */
  return (
    <>
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
      `}</style>

      <div className="flex flex-col lg:flex-row" style={{ minHeight: "100vh", background: T.bgPage }}>
        {/* Sidebar */}
        <IconSidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1" style={{ minHeight: "100vh" }}>
          {/* Topbar */}
          <CrmTopbar
            title="Dialler"
            actions={
              <button
                onClick={() => router.push("/admin/crm")}
                className="flex items-center gap-1.5 font-body text-[12px] font-semibold"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: T.textMuted }}
              >
                <ArrowLeft size={14} />
                Back to CRM
              </button>
            }
          />

          {/* Session header */}
          {queueEmpty ? null : phase !== "session-complete" && (
            <SessionHeader
              sessionElapsed={sessionElapsed}
              sessionPaused={sessionPaused}
              stats={sessionStats}
              onPause={() => setSessionPaused(p => !p)}
              onEnd={handleEndSession}
              repName={user?.name ?? "Your session"}
              queueLength={queue.length}
            />
          )}

          {/* Main area */}
          {queueEmpty ? (
            <QueueEmptyPanel onBack={() => router.push("/admin/crm")} />
          ) : phase === "session-complete" ? (
            <SessionCompletePanel
              stats={sessionStats}
              sessionElapsed={sessionElapsed}
              onBack={() => router.push("/admin/crm")}
              onNewSession={handleNewSession}
            />
          ) : (
            <>
              {/* Layout: stacks on mobile/tablet, full 3-column row at lg+ */}
              <div className="flex flex-1 min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
                {/* Left: Lead info */}
                <div
                  className="w-full lg:w-[300px] lg:shrink-0 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r"
                  style={{
                    borderColor: T.border,
                    background: T.bgCard,
                  }}
                >
                  {currentLead && <LeadInfoPanel lead={currentLead} phase={phase} />}
                </div>

                {/* Center: Call controls */}
                <div className="relative min-h-[340px] flex-1 lg:overflow-hidden">
                  {currentLead && (
                    <CallControlArea
                      phase={phase}
                      callElapsed={callElapsed}
                      lead={currentLead}
                      isMuted={isMuted} setIsMuted={setIsMuted}
                      isHeld={isHeld} setIsHeld={setIsHeld}
                      isRecording={isRecording} setIsRecording={setIsRecording}
                      showKeypad={showKeypad} setShowKeypad={setShowKeypad}
                      selectedOutcome={selectedOutcome} setSelectedOutcome={setSelectedOutcome}
                      callbackDate={callbackDate} setCallbackDate={setCallbackDate}
                      callbackTime={callbackTime} setCallbackTime={setCallbackTime}
                      callNotes={callNotes} setCallNotes={setCallNotes}
                      lastCallDuration={lastCallDuration}
                      onCall={handleCall}
                      onEndCall={handleEndCall}
                      onSkip={handleSkip}
                      onSaveNext={handleSaveNext}
                      onSavePause={handleSavePause}
                    />
                  )}
                </div>

                {/* Right: Script / Notes — drops below the call area on small/medium screens */}
                <div
                  className="w-full lg:w-[300px] lg:shrink-0 lg:overflow-y-auto border-t lg:border-t-0 lg:border-l"
                  style={{
                    borderColor: T.border,
                    background: T.bgCard,
                  }}
                >
                  <ScriptPanel
                    rightTab={rightTab} setRightTab={setRightTab}
                    openScriptIdx={openScriptIdx} setOpenScriptIdx={setOpenScriptIdx}
                    callNotes={callNotes} setCallNotes={setCallNotes}
                  />
                </div>
              </div>

              {/* Queue bar */}
              <QueueBar currentIdx={currentIdx} queue={queue} stats={sessionStats} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
