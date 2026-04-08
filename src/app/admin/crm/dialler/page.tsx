"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Phone, PhoneOff, PhoneOutgoing, SkipForward, Mic, MicOff,
  Pause, Play, Grid3x3, Circle, ChevronRight, ChevronDown,
  ArrowLeft, Zap, CheckCircle2, Clock, XCircle, Voicemail,
  HelpCircle, Star, PhoneForwarded, FileText, StickyNote,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  DIALLER_QUEUE,
  DIALLER_SESSION,
  scriptSections,
} from "@/lib/admin/dialler-mock-data";
import type { DiallerLead } from "@/lib/admin/dialler-mock-data";

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
/*  CRM TOPBAR (dialler variant)                                       */
/* ================================================================== */
const crmTabs = [
  { label: "Pipeline",    href: "/admin/crm" },
  { label: "Dialler",     href: "/admin/crm/dialler" },
  { label: "Calls",       href: "/admin/crm/calls" },
  { label: "Scripts",     href: "/admin/crm/scripts" },
  { label: "Performance", href: "/admin/crm/performance" },
];

function DiallerTopbar() {
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
        <span className="font-heading font-[800] text-[17px]" style={{ color: T.textPrimary }}>Dialler</span>
      </div>

      {/* Live badge */}
      <span
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-[11px] font-bold"
        style={{ background: T.bgHover, color: T.teal200 }}
      >
        <span className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: T.green }} />
        Live
      </span>

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
/*  SESSION HEADER                                                     */
/* ================================================================== */
function SessionHeader({
  sessionElapsed, sessionPaused, stats, onPause, onEnd,
}: {
  sessionElapsed: number;
  sessionPaused: boolean;
  stats: { dialled: number; contacted: number; signed: number };
  onPause: () => void;
  onEnd: () => void;
}) {
  return (
    <div
      className="flex items-center px-[22px]"
      style={{
        height: 52, background: T.bgCard, borderBottom: `1px solid ${T.border}`, flexShrink: 0,
        display: "flex", justifyContent: "space-between",
      }}
    >
      {/* Left: Session info */}
      <div className="flex items-center gap-3">
        <span
          className="w-[8px] h-[8px] rounded-full animate-pulse"
          style={{ background: sessionPaused ? T.amber : T.green }}
        />
        <span className="font-body text-[12px] font-semibold" style={{ color: sessionPaused ? T.amber : T.green }}>
          {sessionPaused ? "Paused" : "Session active"}
        </span>
        <span className="font-heading text-[14px] font-bold" style={{ color: T.textPrimary }}>
          {DIALLER_SESSION.repName}
        </span>
        <span className="font-mono text-[12px]" style={{ color: T.textMuted }}>
          {DIALLER_SESSION.repPhone}
        </span>
      </div>

      {/* Center: Timer */}
      <div className="font-mono text-[16px] font-bold" style={{ color: T.teal200 }}>
        {formatTime(sessionElapsed)}
      </div>

      {/* Right: Stats + controls */}
      <div className="flex items-center gap-3">
        {/* Stat pills */}
        <div className="flex items-center gap-2">
          <span className="font-body text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: T.bgRow, color: T.textSecondary }}>
            {stats.dialled}/14 dialled
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
          className="flex items-center gap-1.5 font-body text-[11px] font-bold rounded-full px-3 py-1.5 transition-colors"
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
          className="flex items-center gap-1.5 font-body text-[11px] font-bold rounded-full px-3 py-1.5"
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
      <div style={{ padding: "16px 18px" }}>
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
    <div style={{ padding: "20px 18px" }}>
      <div className="font-heading text-[20px] font-bold" style={{ color: T.textPrimary }}>
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
    <div className="flex flex-col" style={{ height: "100%" }}>
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
      <div className="flex flex-col items-center justify-center" style={{ height: "100%", gap: 16 }}>
        <button
          onClick={onCall}
          className="flex items-center gap-3 font-heading text-[16px] font-bold transition-transform hover:scale-[1.03]"
          style={{
            background: T.green, color: "#fff",
            borderRadius: 100, padding: "14px 48px",
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
      <div className="flex flex-col items-center justify-center" style={{ height: "100%", gap: 16 }}>
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
      <div className="flex flex-col items-center justify-center relative" style={{ height: "100%", gap: 12 }}>
        {/* Connected status */}
        <div className="flex items-center gap-2">
          <span className="w-[8px] h-[8px] rounded-full" style={{ background: T.green }} />
          <span className="font-body text-[13px] font-semibold" style={{ color: T.green }}>Connected</span>
        </div>

        {/* Timer */}
        <div className="font-mono text-[36px] font-bold" style={{ color: T.teal200 }}>
          {formatTime(callElapsed)}
        </div>

        {/* Keypad overlay */}
        {showKeypad && (
          <div
            style={{
              display: "grid", gridTemplateColumns: "repeat(3, 56px)", gap: 6,
              padding: 12, background: T.bgCard, borderRadius: 14,
              border: `1px solid ${T.border}`, marginTop: 4, marginBottom: 4,
            }}
          >
            {DTMF_KEYS.map(key => (
              <button
                key={key}
                className="font-mono text-[16px] font-bold flex items-center justify-center"
                style={{
                  width: 56, height: 44, borderRadius: 8,
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
        <div className="flex items-center gap-3" style={{ marginTop: showKeypad ? 4 : 16 }}>
          {controlBtns.map(btn => {
            const Icon = btn.active && btn.iconOff ? btn.icon : (btn.iconOff || btn.icon);
            return (
              <div key={btn.label} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={btn.toggle}
                  className="flex items-center justify-center transition-colors"
                  style={{
                    width: 56, height: 56, borderRadius: 999,
                    background: btn.isEnd ? T.red : btn.active ? btn.activeBg : T.bgRow,
                    color: btn.isEnd ? "#fff" : btn.active ? btn.activeColor : T.textSecondary,
                    border: btn.active && !btn.isEnd ? `1px solid ${btn.activeColor}44` : `1px solid ${T.border}`,
                    cursor: "pointer",
                    position: "relative",
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
          className="font-body text-[12px]"
          style={{
            width: "80%", maxWidth: 400, height: 60,
            background: T.bgRow, color: T.textPrimary,
            border: `1px solid ${T.border}`, borderRadius: 8,
            padding: "8px 12px", resize: "none", outline: "none",
            marginTop: 8,
          }}
        />
      </div>
    );
  }

  /* ---- DISPOSITION ---- */
  if (phase === "disposition") {
    return (
      <div className="flex flex-col items-center" style={{ height: "100%", padding: "24px 20px", overflowY: "auto" }}>
        {/* Header */}
        <div className="font-body text-[14px] font-semibold mb-4" style={{ color: T.textSecondary }}>
          Call ended &middot; Duration {formatTime(lastCallDuration)}
        </div>

        {/* Outcome grid */}
        <div
          style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8, width: "100%", maxWidth: 320,
          }}
        >
          {OUTCOME_CONFIG.map(o => {
            const Icon = o.icon;
            const selected = selectedOutcome === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setSelectedOutcome(o.key)}
                className="flex items-center gap-2 font-body text-[12px] font-semibold transition-all"
                style={{
                  height: 44, borderRadius: 10, padding: "0 14px",
                  background: o.bg, color: o.color,
                  border: selected ? `2px solid ${o.color}` : `1px solid ${o.color}22`,
                  cursor: "pointer",
                  boxShadow: selected ? `0 0 12px ${o.color}22` : "none",
                }}
              >
                <Icon size={14} />
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Callback date/time */}
        {selectedOutcome === "callback" && (
          <div className="flex gap-2 mt-4 w-full" style={{ maxWidth: 320 }}>
            <input
              type="date"
              value={callbackDate}
              onChange={e => setCallbackDate(e.target.value)}
              className="font-body text-[12px] flex-1"
              style={{
                background: T.bgRow, color: T.textPrimary,
                border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "8px 10px", outline: "none",
                colorScheme: "dark",
              }}
            />
            <input
              type="time"
              value={callbackTime}
              onChange={e => setCallbackTime(e.target.value)}
              className="font-body text-[12px]"
              style={{
                width: 120, background: T.bgRow, color: T.textPrimary,
                border: `1px solid ${T.border}`, borderRadius: 8,
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
          className="font-body text-[12px] mt-4"
          style={{
            width: "100%", maxWidth: 320, height: 80,
            background: T.bgRow, color: T.textPrimary,
            border: `1px solid ${T.border}`, borderRadius: 8,
            padding: "10px 12px", resize: "vertical", outline: "none",
          }}
        />

        {/* Actions */}
        <div className="flex gap-3 mt-4">
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
function QueueBar({ currentIdx, stats }: { currentIdx: number; stats: { dialled: number; contacted: number } }) {
  const nextLead = currentIdx + 1 < DIALLER_QUEUE.length ? DIALLER_QUEUE[currentIdx + 1] : null;

  return (
    <div
      className="flex items-center px-[22px]"
      style={{
        height: 48, background: T.bgCard, borderTop: `1px solid ${T.border}`, flexShrink: 0,
        display: "flex", justifyContent: "space-between",
      }}
    >
      {/* Position */}
      <span
        className="font-body text-[12px] font-bold px-2.5 py-1 rounded-full"
        style={{ background: T.teal, color: "#fff" }}
      >
        {currentIdx + 1} of {DIALLER_QUEUE.length}
      </span>

      {/* Next preview */}
      <span className="font-body text-[12px]" style={{ color: T.textSecondary }}>
        {nextLead ? (
          <>
            Next: {nextLead.sellerName} &middot; {nextLead.vehicleYear} {nextLead.vehicleMake} {nextLead.vehicleModel} &middot; Score {nextLead.scoutScore}
          </>
        ) : (
          "Last lead in queue"
        )}
      </span>

      {/* Mini stats */}
      <div className="flex items-center gap-2">
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
    <div className="flex flex-col items-center justify-center" style={{ flex: 1, gap: 24, padding: 40 }}>
      <div className="flex items-center gap-2">
        <CheckCircle2 size={28} style={{ color: T.green }} />
        <span className="font-heading text-[24px] font-bold" style={{ color: T.textPrimary }}>
          Session Complete
        </span>
      </div>
      <div className="font-body text-[13px]" style={{ color: T.textSecondary }}>
        Total session time: {formatTime(sessionElapsed)}
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12, width: "100%", maxWidth: 560,
        }}
      >
        {statCards.map(s => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center py-4"
            style={{
              background: T.bgCard, borderRadius: 14,
              border: `1px solid ${T.border}`,
            }}
          >
            <div className="font-heading text-[28px] font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="font-body text-[11px] mt-1" style={{ color: T.textMuted }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
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

  /* ---- State ---- */
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
  const currentLead = DIALLER_QUEUE[currentIdx];

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
    setPhase("ringing");
    setCallElapsed(0);
    setSessionStats(s => ({ ...s, dialled: s.dialled + 1 }));
    const delay = 2000 + Math.random() * 2000;
    ringingTimeoutRef.current = setTimeout(() => {
      setPhase("connected");
      setCallElapsed(0);
      setSessionStats(s => ({ ...s, contacted: s.contacted + 1 }));
    }, delay);
  }, []);

  const handleEndCall = useCallback(() => {
    if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    setLastCallDuration(callElapsed);
    setPhase("disposition");
  }, [callElapsed]);

  const handleSkip = useCallback(() => {
    resetCallState();
    if (currentIdx + 1 >= DIALLER_QUEUE.length) {
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
    if (currentIdx + 1 >= DIALLER_QUEUE.length) {
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
    if (currentIdx + 1 >= DIALLER_QUEUE.length) {
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

      <div className="flex" style={{ minHeight: "100vh", background: T.bgPage }}>
        {/* Sidebar */}
        <IconSidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1" style={{ minHeight: "100vh" }}>
          {/* Topbar */}
          <DiallerTopbar />

          {/* Session header */}
          {phase !== "session-complete" && (
            <SessionHeader
              sessionElapsed={sessionElapsed}
              sessionPaused={sessionPaused}
              stats={sessionStats}
              onPause={() => setSessionPaused(p => !p)}
              onEnd={handleEndSession}
            />
          )}

          {/* Main area */}
          {phase === "session-complete" ? (
            <SessionCompletePanel
              stats={sessionStats}
              sessionElapsed={sessionElapsed}
              onBack={() => router.push("/admin/crm")}
              onNewSession={handleNewSession}
            />
          ) : (
            <>
              {/* 3-column layout */}
              <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* Left: Lead info */}
                <div
                  style={{
                    width: 320, minWidth: 320, borderRight: `1px solid ${T.border}`,
                    background: T.bgCard, overflowY: "auto",
                  }}
                >
                  {currentLead && <LeadInfoPanel lead={currentLead} phase={phase} />}
                </div>

                {/* Center: Call controls */}
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
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

                {/* Right: Script / Notes */}
                <div
                  style={{
                    width: 300, minWidth: 300, borderLeft: `1px solid ${T.border}`,
                    background: T.bgCard, overflowY: "auto",
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
              <QueueBar currentIdx={currentIdx} stats={sessionStats} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
