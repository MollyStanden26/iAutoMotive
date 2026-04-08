"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Layers, Monitor, Link2, Bell, Smile, Trash2,
} from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import {
  DEFAULT_PLATFORM_CONFIG, DEFAULT_LOT_CONFIG, DEFAULT_INTEGRATIONS,
  DEFAULT_NOTIFICATION_RULES, DEFAULT_BRANDING_CONFIG,
} from "@/lib/admin/settings-defaults";
import type {
  PlatformConfig, LotConfig, Integration, NotificationRule, BrandingConfig,
  AiPricingMode, ListingTemplate,
} from "@/lib/admin/settings-defaults";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const T = {
  bgPage: "#0B111E", bgCard: "#0D1525", bgSidebar: "#070D18",
  bgRow: "#111D30", bgHover: "#0C1428", border: "#1E2D4A", border2: "#0F1828",
  textPrimary: "#F1F5F9", textSecondary: "#8492A8", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7",
  green: "#34D399", greenBg: "#0B2B1A",
  amber: "#FCD34D", amberBg: "#2B1A00",
  red: "#F87171", redBg: "#2B0F0F",
  indigo: "#0A1A2E", indigoBorder: "#1E3A5F",
};

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
function Topbar() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between flex-shrink-0"
      style={{ height: 58, padding: "0 20px", background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim, cursor: "pointer" }}
          onClick={() => router.push("/admin")}>Admin</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }}>/</span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Settings</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          style={{ background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: T.textSecondary, cursor: "pointer" }}
          onClick={() => console.log("view audit log")}>
          View audit log
        </button>
        <div className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: T.greenBg, border: `1px solid ${T.green}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: T.green }}>
          MA
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SETTINGS NAV (left 200px)                                          */
/* ================================================================== */
const NAV_ITEMS = [
  { id: "platform",      label: "Platform config", icon: Layers },
  { id: "lots",          label: "Lot configuration", icon: Monitor },
  { id: "integrations",  label: "Integrations", icon: Link2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { sep: true },
  { id: "branding",      label: "Branding", icon: Smile },
  { sep: true },
  { id: "danger",        label: "Danger zone", icon: Trash2 },
];

function SettingsNav({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  return (
    <div
      className="flex flex-col gap-[2px] flex-shrink-0"
      style={{
        width: 200, background: T.bgSidebar, borderRight: `1px solid ${T.border}`,
        padding: "14px 0", overflowY: "auto",
      }}
    >
      {NAV_ITEMS.map((item, i) => {
        if ("sep" in item && item.sep) {
          return <div key={`sep${i}`} style={{ height: 1, background: T.border, margin: "6px 14px" }} />;
        }
        const isDanger = item.id === "danger";
        const isActive = active === item.id;
        const Icon = item.icon!;
        return (
          <div
            key={item.id}
            className="flex items-center gap-2 cursor-pointer"
            style={{
              padding: "7px 14px",
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
              color: isDanger ? T.red : isActive ? T.teal200 : T.textMuted,
              background: isActive ? T.indigo : "transparent",
              borderLeft: `2px solid ${isActive ? (isDanger ? T.red : T.teal200) : "transparent"}`,
            }}
            onClick={() => onNav(item.id!)}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = T.bgCard;
                if (!isDanger) e.currentTarget.style.color = T.textSecondary;
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                if (!isDanger) e.currentTarget.style.color = T.textMuted;
              }
            }}
          >
            <Icon size={14} style={{ flexShrink: 0 }} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  SHARED: SECTION WRAPPER                                            */
/* ================================================================== */
function SectionWrapper({
  id, iconBg, iconColor, Icon, title, subtitle, onSave, dangerStyle, children,
}: {
  id: string; iconBg: string; iconColor: string; Icon: React.ElementType;
  title: string; subtitle: string; onSave?: () => void; dangerStyle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      style={{
        background: T.bgCard, borderRadius: 10, overflow: "hidden",
        border: `1px solid ${dangerStyle ? "#3A0000" : T.border}`,
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-[10px]"
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${dangerStyle ? "#3A0000" : T.border}`,
          background: dangerStyle ? "#110000" : undefined,
        }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 28, height: 28, borderRadius: 7, background: iconBg, color: iconColor }}
        >
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
            color: dangerStyle ? T.red : T.textPrimary,
          }}>{title}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{subtitle}</div>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            style={{
              background: "#0A2A26", border: "1px solid #1E3A34", borderRadius: 7,
              padding: "5px 12px", fontFamily: "var(--font-body)", fontWeight: 700,
              fontSize: 11, color: T.teal200, cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0D3530")}
            onMouseLeave={e => (e.currentTarget.style.background = "#0A2A26")}
          >
            Save changes
          </button>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SHARED: FIELD ROW                                                  */
/* ================================================================== */
function FieldRow({ label, subLabel, children }: { label: string; subLabel?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{label}</div>
        {subLabel && (
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 10, color: T.textMuted, marginTop: 2 }}>{subLabel}</div>
        )}
      </div>
      {children}
    </div>
  );
}

/* ================================================================== */
/*  SHARED: TOGGLE GROUP                                               */
/* ================================================================== */
function ToggleGroup<V extends string>({ options, value, onChange }: { options: { label: string; value: V }[]; value: V; onChange: (v: V) => void }) {
  return (
    <div className="flex" style={{ gap: 0 }}>
      {options.map((opt, i) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "5px 12px",
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11,
              cursor: "pointer",
              background: isActive ? T.indigo : T.bgRow,
              color: isActive ? T.teal200 : T.textMuted,
              border: `1px solid ${isActive ? "#172D4D" : T.border}`,
              borderRadius: i === 0 ? "7px 0 0 7px" : i === options.length - 1 ? "0 7px 7px 0" : 0,
              marginLeft: i > 0 ? -1 : 0,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  SHARED: TEXT INPUT                                                 */
/* ================================================================== */
const inputStyle = (width: number | string): React.CSSProperties => ({
  background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 7,
  padding: "5px 10px", fontFamily: "var(--font-body)", fontSize: 12, color: T.textPrimary,
  outline: "none", width: typeof width === "number" ? width : width,
});

const suffixStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, flexShrink: 0,
};

const dividerStyle: React.CSSProperties = { height: 1, background: T.bgRow, margin: 0 };

/* ================================================================== */
/*  SECTION 1: PLATFORM & BUSINESS RULES                               */
/* ================================================================== */
function PlatformConfigSection({ onSave }: { onSave: () => void }) {
  const [cfg, setCfg] = useState<PlatformConfig>({ ...DEFAULT_PLATFORM_CONFIG });
  const u = (key: keyof PlatformConfig, val: number | string) => setCfg(prev => ({ ...prev, [key]: val }));

  return (
    <SectionWrapper id="platform" iconBg="#0A1D1A" iconColor={T.teal200} Icon={Layers}
      title="Platform & business rules" subtitle="Core financial and operational rules governing every deal on the platform" onSave={onSave}>

      <FieldRow label="Platform fee" subLabel="No commission fee is currently charged">
        <input type="number" min={0} max={20} step={0.5} value={cfg.platformFeePct}
          onChange={e => u("platformFeePct", +e.target.value)}
          style={inputStyle(80)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>% of sale price</span>
      </FieldRow>

      <div style={dividerStyle} />

      <FieldRow label="Return window" subLabel="Consumer Rights Act 2015 — distance selling">
        <input type="number" min={7} max={30} value={cfg.returnWindowDays}
          onChange={e => u("returnWindowDays", +e.target.value)}
          style={inputStyle(80)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>days</span>
      </FieldRow>

      <div style={dividerStyle} />

      <FieldRow label="GPU target" subLabel="Minimum gross profit per unit">
        <span style={suffixStyle}>£</span>
        <input type="text" value={cfg.gpuTargetGbp.toLocaleString("en-GB")}
          onChange={e => { const n = parseInt(e.target.value.replace(/,/g, ""), 10); if (!isNaN(n)) u("gpuTargetGbp", n); }}
          style={inputStyle(120)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>per vehicle</span>
      </FieldRow>

      <div style={dividerStyle} />

      <FieldRow label="Price decay — day 1" subLabel="Auto-reduction at first threshold">
        <input type="number" value={cfg.priceDecay1Days} onChange={e => u("priceDecay1Days", +e.target.value)}
          style={inputStyle(80)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>days on lot →</span>
        <input type="number" value={cfg.priceDecay1Pct} onChange={e => u("priceDecay1Pct", +e.target.value)}
          style={inputStyle(80)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>% reduction</span>
      </FieldRow>

      <FieldRow label="Price decay — day 2">
        <input type="number" value={cfg.priceDecay2Days} onChange={e => u("priceDecay2Days", +e.target.value)}
          style={inputStyle(80)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>days on lot →</span>
        <input type="number" value={cfg.priceDecay2Pct} onChange={e => u("priceDecay2Pct", +e.target.value)}
          style={inputStyle(80)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>% reduction</span>
      </FieldRow>

      <div style={dividerStyle} />

      <FieldRow label="Response SLA" subLabel="Lead contact time target">
        <input type="number" value={cfg.responseSlaHours} onChange={e => u("responseSlaHours", +e.target.value)}
          style={inputStyle(80)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>hours</span>
      </FieldRow>

      <div style={dividerStyle} />

      <FieldRow label="Recon SLA" subLabel="Max time per recon stage">
        <input type="number" value={cfg.reconSlaHours} onChange={e => u("reconSlaHours", +e.target.value)}
          style={inputStyle(80)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={suffixStyle}>hours per stage</span>
      </FieldRow>

      <div style={dividerStyle} />

      <FieldRow label="AI pricing mode" subLabel="How the pricing agent applies changes">
        <ToggleGroup<AiPricingMode>
          options={[
            { label: "Auto-apply", value: "auto" },
            { label: "Suggest only", value: "suggest" },
            { label: "Off", value: "off" },
          ]}
          value={cfg.aiPricingMode}
          onChange={v => u("aiPricingMode", v)}
        />
      </FieldRow>
    </SectionWrapper>
  );
}

/* ================================================================== */
/*  SECTION 2: LOT CONFIGURATION                                       */
/* ================================================================== */
function LotConfigSection({ onSave }: { onSave: () => void }) {
  const [lots, setLots] = useState<LotConfig[]>(DEFAULT_LOT_CONFIG.map(l => ({ ...l })));

  return (
    <SectionWrapper id="lots" iconBg={T.indigo} iconColor={T.textMuted} Icon={Monitor}
      title="Lot configuration" subtitle="Capacity, address, and operating hours for each lot" onSave={onSave}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {lots.map((lot, li) => (
          <div key={lot.id} style={{ background: T.bgRow, borderRadius: 8, border: `1px solid ${T.border}`, padding: "10px 12px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: T.teal200, marginBottom: 8 }}>
              {lot.name} — {lot.city}
            </div>
            {/* Capacity */}
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, width: 72, flexShrink: 0 }}>Capacity</span>
              <input type="number" value={lot.capacity}
                onChange={e => { const next = [...lots]; next[li] = { ...lot, capacity: +e.target.value }; setLots(next); }}
                style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px", fontFamily: "var(--font-body)", fontSize: 11, color: T.textPrimary, width: 60, outline: "none" }}
                onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
            </div>
            {/* Address */}
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, width: 72, flexShrink: 0 }}>Address</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textPrimary }}>{lot.address}</span>
            </div>
            {/* Hours */}
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, width: 72, flexShrink: 0 }}>Hours</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textPrimary }}>{lot.hours}</span>
            </div>
            {/* Manager */}
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, width: 72, flexShrink: 0 }}>Manager</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: lot.manager ? T.teal200 : T.textDim }}>
                {lot.manager ?? "—"}
              </span>
            </div>
            {/* Status */}
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, width: 72, flexShrink: 0 }}>Status</span>
              <span style={{
                background: lot.active ? T.greenBg : T.redBg,
                color: lot.active ? T.green : T.red,
                borderRadius: 999, padding: "2px 7px",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9,
              }}>
                {lot.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ================================================================== */
/*  SECTION 3: INTEGRATIONS & API KEYS                                 */
/* ================================================================== */
function IntegrationsSection({ onSave }: { onSave: () => void }) {
  const [icoValue, setIcoValue] = useState("");
  const [icoSaved, setIcoSaved] = useState(false);

  const statusBadge = (status: string) => {
    if (status === "connected") return { bg: T.greenBg, color: T.green, text: "Connected" };
    if (status === "not-configured") return { bg: T.amberBg, color: T.amber, text: "Not configured" };
    if (icoSaved) return { bg: T.greenBg, color: T.green, text: "Registered" };
    return { bg: T.amberBg, color: T.amber, text: "TODO" };
  };

  return (
    <SectionWrapper id="integrations" iconBg="#0A1A2E" iconColor={T.teal200} Icon={Link2}
      title="Integrations & API keys" subtitle="Third-party services connected to the platform" onSave={onSave}>
      {DEFAULT_INTEGRATIONS.map((integ, i) => {
        const badge = statusBadge(integ.id === "ico" ? (icoSaved ? "registered" : integ.status) : integ.status);
        const isLast = i === DEFAULT_INTEGRATIONS.length - 1;
        return (
          <div key={integ.id} className="flex items-center gap-3"
            style={{ padding: "8px 0", borderBottom: isLast ? "none" : `1px solid ${T.bgRow}` }}>
            {/* Logo square */}
            <div className="flex items-center justify-center flex-shrink-0"
              style={{ width: 32, height: 32, borderRadius: 7, background: integ.logoBg, border: `1px solid ${T.border}`, fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 10, color: integ.logoColor }}>
              {integ.logoLabel}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>{integ.name}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{integ.sub}</div>
            </div>
            {/* Status badge */}
            <span className="flex-shrink-0" style={{
              background: badge.bg, color: badge.color, borderRadius: 999,
              padding: "2px 7px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9,
            }}>{badge.text}</span>
            {/* Masked key or inline input */}
            {integ.maskedKey && (
              <span className="flex-shrink-0" style={{
                fontFamily: "'Courier New', monospace", fontSize: 10, color: T.textMuted,
                background: T.bgSidebar, border: `1px solid ${T.border}`, borderRadius: 4,
                padding: "3px 8px", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{integ.maskedKey}</span>
            )}
            {integ.inlineInput && !icoSaved && (
              <input type="text" placeholder="e.g. ZA123456" value={icoValue}
                onChange={e => setIcoValue(e.target.value)}
                style={{ ...inputStyle(200), fontSize: 11, flexShrink: 0 }}
                onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
            )}
            {integ.inlineInput && icoSaved && (
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: T.textMuted,
                background: T.bgSidebar, border: `1px solid ${T.border}`, borderRadius: 4,
                padding: "3px 8px",
              }}>{icoValue}</span>
            )}
            {/* Action button */}
            <button className="flex-shrink-0"
              onClick={() => {
                if (integ.id === "ico" && icoValue.trim()) {
                  setIcoSaved(true);
                } else {
                  console.log("integration action", integ.id, integ.actionLabel);
                }
              }}
              style={{
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
                padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                background: integ.actionVariant === "teal" ? T.indigo : T.bgRow,
                border: `1px solid ${integ.actionVariant === "teal" ? "#172D4D" : T.border}`,
                color: integ.actionVariant === "teal" ? T.teal200 : T.textMuted,
              }}>
              {integ.actionLabel}
            </button>
          </div>
        );
      })}
    </SectionWrapper>
  );
}

/* ================================================================== */
/*  SECTION 4: NOTIFICATION & ALERT RULES                              */
/* ================================================================== */
function NotificationsSection({ onSave }: { onSave: () => void }) {
  const [rules, setRules] = useState<NotificationRule[]>(
    DEFAULT_NOTIFICATION_RULES.map(r => ({ ...r, channels: { ...r.channels } }))
  );

  const toggleChannel = (idx: number, ch: "email" | "sms" | "push") => {
    setRules(prev => prev.map((r, i) => i === idx ? { ...r, channels: { ...r.channels, [ch]: !r.channels[ch] } } : r));
  };

  const pillStyle = (active: boolean): React.CSSProperties => ({
    background: active ? T.indigo : T.bgRow,
    color: active ? T.teal200 : T.textDim,
    border: `1px solid ${active ? "#172D4D" : T.border}`,
    borderRadius: 999, padding: "2px 7px",
    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, cursor: "pointer",
  });

  return (
    <SectionWrapper id="notifications" iconBg={T.indigo} iconColor={T.textMuted} Icon={Bell}
      title="Notification & alert rules" subtitle="Configure who gets notified and through which channels" onSave={onSave}>
      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px", padding: "0 0 6px 0", borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Event</span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Channels</span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Recipient</span>
      </div>
      {/* Event rows */}
      {rules.map((rule, i) => {
        const isLast = i === rules.length - 1;
        return (
          <div key={rule.id} className="flex items-center gap-3"
            style={{ padding: "7px 0", borderBottom: isLast ? "none" : `1px solid ${T.bgRow}` }}>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textSecondary }}>{rule.event}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 1 }}>{rule.sub}</div>
            </div>
            <div className="flex items-center gap-[6px]" style={{ width: 120 }}>
              <span style={pillStyle(rule.channels.email)} onClick={() => toggleChannel(i, "email")}>Email</span>
              <span style={pillStyle(rule.channels.sms)} onClick={() => toggleChannel(i, "sms")}>SMS</span>
              <span style={pillStyle(rule.channels.push)} onClick={() => toggleChannel(i, "push")}>Push</span>
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, minWidth: 80, textAlign: "right", flexShrink: 0 }}>
              {rule.recipient}
            </div>
          </div>
        );
      })}
    </SectionWrapper>
  );
}

/* ================================================================== */
/*  SECTION 5: BRANDING & STOREFRONT                                   */
/* ================================================================== */
function BrandingSection({ onSave }: { onSave: () => void }) {
  const [brand, setBrand] = useState<BrandingConfig>({ ...DEFAULT_BRANDING_CONFIG });
  const domainDefault = DEFAULT_BRANDING_CONFIG.domain;

  // FCA-compliant broker referral language only — never direct finance promotion

  return (
    <SectionWrapper id="branding" iconBg="#0A1D1A" iconColor={T.teal200} Icon={Smile}
      title="Branding & storefront" subtitle="Public-facing name, colours, domain, and listing defaults" onSave={onSave}>

      {/* Platform name + live preview */}
      <FieldRow label="Platform name" subLabel="Shown on all buyer-facing pages">
        <input type="text" value={brand.platformName}
          onChange={e => setBrand(prev => ({ ...prev, platformName: e.target.value }))}
          style={inputStyle(200)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <div style={{
          background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 7,
          padding: "6px 14px", fontFamily: "var(--font-body)", fontWeight: 900, fontSize: 13, color: T.teal200,
        }}>
          {brand.platformName}
        </div>
      </FieldRow>

      <div style={dividerStyle} />

      {/* Custom domain + verified badge */}
      <FieldRow label="Custom domain" subLabel="Storefront URL">
        <input type="text" value={brand.domain}
          onChange={e => setBrand(prev => ({ ...prev, domain: e.target.value }))}
          style={inputStyle(280)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
        <span style={{
          background: brand.domain === domainDefault ? T.greenBg : T.amberBg,
          color: brand.domain === domainDefault ? T.green : T.amber,
          borderRadius: 999, padding: "2px 7px",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9,
        }}>
          {brand.domain === domainDefault ? "Verified" : "Unverified"}
        </span>
      </FieldRow>

      <div style={dividerStyle} />

      {/* Primary + accent colour */}
      <FieldRow label="Primary + accent colour" subLabel="Brand colours used across the storefront">
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${T.border}`, backgroundColor: brand.primaryColor }} />
          <input type="text" value={brand.primaryColor}
            onChange={e => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))}
            style={inputStyle(120)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
          {/* TODO: validate hex format before saving. */}
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${T.border}`, backgroundColor: brand.accentColor }} />
          <input type="text" value={brand.accentColor}
            onChange={e => setBrand(prev => ({ ...prev, accentColor: e.target.value }))}
            style={inputStyle(120)} onFocus={e => (e.target.style.borderColor = "#172D4D")} onBlur={e => (e.target.style.borderColor = T.border)} />
          <span style={suffixStyle}>accent</span>
        </div>
      </FieldRow>

      <div style={dividerStyle} />

      {/* Listing template */}
      <FieldRow label="Default listing template" subLabel="Applied to all new vehicle listings">
        <ToggleGroup<ListingTemplate>
          options={[
            { label: "Full detail", value: "full" },
            { label: "Compact", value: "compact" },
            { label: "Minimal", value: "minimal" },
          ]}
          value={brand.listingTemplate}
          onChange={v => setBrand(prev => ({ ...prev, listingTemplate: v }))}
        />
      </FieldRow>

      <div style={dividerStyle} />

      {/* Show finance options */}
      <FieldRow label="Show finance options" subLabel="Display FCA broker referral on VDP">
        <ToggleGroup<"enabled" | "disabled">
          options={[
            { label: "Enabled", value: "enabled" },
            { label: "Disabled", value: "disabled" },
          ]}
          value={brand.showFinanceOptions ? "enabled" : "disabled"}
          onChange={v => setBrand(prev => ({ ...prev, showFinanceOptions: v === "enabled" }))}
        />
      </FieldRow>
    </SectionWrapper>
  );
}

/* ================================================================== */
/*  SECTION 6: DANGER ZONE                                             */
/* ================================================================== */
function DangerZoneSection() {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetVal, setResetVal] = useState("");
  const [deleteVal, setDeleteVal] = useState("");

  const dangerRow = (title: string, sub: string, btnText: string, btnColor: "amber" | "red", onClick: () => void, isLast?: boolean) => (
    <div className="flex items-center gap-3" style={{ padding: "10px 0", borderBottom: isLast ? "none" : `1px solid ${T.bgRow}` }}>
      <div className="flex-1">
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary }}>{title}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textMuted, marginTop: 2 }}>{sub}</div>
      </div>
      <button className="flex-shrink-0" onClick={onClick} style={{
        background: btnColor === "amber" ? "#1F1500" : T.redBg,
        border: `1px solid ${btnColor === "amber" ? "#3A2800" : "#3A0000"}`,
        borderRadius: 7, padding: "5px 12px", cursor: "pointer",
        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
        color: btnColor === "amber" ? T.amber : T.red,
      }}>{btnText}</button>
    </div>
  );

  const confirmModal = (
    prompt: string, matchWord: string, value: string,
    onChange: (v: string) => void, onConfirm: () => void, onCancel: () => void,
  ) => (
    <div style={{ background: "rgba(11,17,30,0.8)", borderRadius: 10, padding: 20, marginTop: 10 }}>
      <div style={{
        background: T.bgCard, border: "1px solid #3A0000", borderRadius: 10, padding: 20, maxWidth: 400,
      }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>{prompt}</div>
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder={matchWord}
          style={{ ...inputStyle("100%"), marginBottom: 12, border: "1px solid #3A0000" }}
          onFocus={e => (e.target.style.borderColor = T.red)} onBlur={e => (e.target.style.borderColor = "#3A0000")} />
        <div className="flex gap-2">
          <button onClick={onCancel} style={{
            background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 7,
            padding: "5px 12px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
            color: T.textMuted, cursor: "pointer",
          }}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={value !== matchWord}
            style={{
              background: T.redBg, border: "1px solid #3A0000", borderRadius: 7,
              padding: "5px 12px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
              color: T.red, cursor: value === matchWord ? "pointer" : "default",
              opacity: value === matchWord ? 1 : 0.4,
              pointerEvents: value === matchWord ? "auto" : "none",
            }}>
            Confirm {matchWord.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <SectionWrapper id="danger" iconBg={T.redBg} iconColor={T.red} Icon={Trash2}
      title="Danger zone" subtitle="Irreversible actions — proceed with caution" dangerStyle>

      {dangerRow(
        "Export all data",
        "Download full platform data as JSON — deals, sellers, buyers, staff, financials",
        "Export data", "amber",
        () => { if (window.confirm("Export all platform data? This will download all deals, sellers, buyers, staff, and financials as a JSON file.")) console.log("export data"); }
      )}

      {dangerRow(
        "Reset to sandbox data",
        "Replaces all live data with demo/test data — cannot be undone",
        "Reset sandbox", "red",
        () => { setShowResetModal(true); setResetVal(""); }
      )}

      {dangerRow(
        "Delete platform account",
        "Permanently deletes all data, staff accounts, and lot configuration. This action is irreversible.",
        "Delete account", "red",
        () => { setShowDeleteModal(true); setDeleteVal(""); },
        true
      )}

      {showResetModal && confirmModal(
        "Type RESET to confirm. This will replace all live data with demo data and cannot be undone.",
        "RESET", resetVal, setResetVal,
        () => { console.log("reset sandbox"); setShowResetModal(false); },
        () => setShowResetModal(false),
      )}

      {showDeleteModal && confirmModal(
        "Type DELETE to confirm. This will permanently destroy all platform data, staff accounts, and lot configuration.",
        "DELETE", deleteVal, setDeleteVal,
        () => { console.log("delete account"); setShowDeleteModal(false); },
        () => setShowDeleteModal(false),
      )}
    </SectionWrapper>
  );
}

/* ================================================================== */
/*  SAVE TOAST                                                         */
/* ================================================================== */
function SaveToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "sticky", bottom: 16, alignSelf: "flex-end",
      background: T.bgCard, border: `1px solid ${T.green}`, borderRadius: 8,
      padding: "10px 14px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
      color: T.green, zIndex: 50,
    }}>
      ✓ Saved
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("platform");
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSave = useCallback((sectionId: string) => {
    console.log("save settings section", sectionId);
    setSavedSection(sectionId);
    setTimeout(() => setSavedSection(null), 2000);
  }, []);

  const handleNav = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // IntersectionObserver for active nav state
  useEffect(() => {
    const sectionIds = ["platform", "lots", "integrations", "notifications", "branding", "danger"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3, rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div className="flex" style={{ background: T.bgPage, height: "100vh", overflow: "hidden" }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0" style={{ height: "100vh" }}>
        <Topbar />
        {/* Inner grid: settings nav + content */}
        <div className="flex-1 min-h-0" style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
          <SettingsNav active={activeSection} onNav={handleNav} />
          <div
            ref={contentRef}
            style={{ overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}
          >
            <PlatformConfigSection onSave={() => handleSave("platform")} />
            <LotConfigSection onSave={() => handleSave("lots")} />
            <IntegrationsSection onSave={() => handleSave("integrations")} />
            <NotificationsSection onSave={() => handleSave("notifications")} />
            <BrandingSection onSave={() => handleSave("branding")} />
            <DangerZoneSection />
            <SaveToast visible={savedSection !== null} />
          </div>
        </div>
      </div>
    </div>
  );
}
