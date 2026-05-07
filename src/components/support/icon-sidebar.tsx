"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Headphones, MessageSquare, Inbox, BookOpen, Users, Settings, ArrowLeftRight,
} from "lucide-react";
import { SUPPORT_TICKETS } from "@/lib/support/mock-data";

/**
 * Same look & feel as the admin IconSidebar — different navigation set focused
 * on support workflows. Icon-only collapsed (56px), label-revealing on hover.
 */

const S = {
  bgSidebar: "#070D18", border: "#1A2640",
  teal: "#008C7C", teal200: "#4DD9C7",
  textSecondary: "#8492A8", textDim: "#4A556B",
  red: "#F87171", green: "#34D399", greenBg: "#0B2B1A",
  activeBg: "#172D4D", hoverBg: "#111D30",
  indigo: "#0A1A2E",
};

function getBadgeCount(href: string): number {
  switch (href) {
    case "/support/tickets":
      // Open + escalated tickets that need a human
      return SUPPORT_TICKETS.filter(t => t.status === "open" || t.status === "escalated").length;
    case "/support/conversations":
      // Threads with at least one unread message
      return SUPPORT_TICKETS.filter(t => t.unreadCount > 0).length;
    default:
      return 0;
  }
}

const SIDEBAR_ITEMS = [
  { type: "item" as const, icon: Headphones,    label: "Overview",      href: "/support", exact: true },
  { type: "divider" as const },
  { type: "item" as const, icon: MessageSquare, label: "Tickets",       href: "/support/tickets" },
  { type: "item" as const, icon: Inbox,         label: "Conversations", href: "/support/conversations" },
  { type: "item" as const, icon: Users,         label: "Sellers",       href: "/support/sellers" },
  { type: "item" as const, icon: BookOpen,      label: "Knowledge base", href: "/support/kb" },
  { type: "divider" as const },
  // Quick switch back to admin so an operator who toggles between roles can
  // jump there without going through the URL bar.
  { type: "item" as const, icon: ArrowLeftRight, label: "Switch to Admin", href: "/admin" },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SupportIconSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const collapsedW = 56;
  const expandedW = 210;

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="flex flex-col flex-shrink-0 py-4 gap-1"
      style={{
        width: expanded ? expandedW : collapsedW,
        minWidth: expanded ? expandedW : collapsedW,
        height: "100vh",
        position: "sticky" as const,
        top: 0,
        overflowX: "hidden",
        overflowY: "auto",
        background: S.bgSidebar,
        borderRight: `1px solid ${S.border}`,
        transition: "width 200ms ease, min-width 200ms ease",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer mb-3"
        style={{ padding: "0 8px", minHeight: 36 }}
        onClick={() => router.push("/support")}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 36, height: 36, borderRadius: 10, background: S.teal }}
        >
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, color: "#fff" }}>SP</span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, color: S.teal200,
            whiteSpace: "nowrap", opacity: expanded ? 1 : 0, transition: "opacity 150ms ease",
          }}
        >
          Support
        </span>
      </div>

      {/* Nav items */}
      {SIDEBAR_ITEMS.map((item, i) => {
        if (item.type === "divider") {
          return <div key={`d${i}`} style={{ height: 1, background: S.border, margin: "4px 12px" }} />;
        }
        const Icon = item.icon!;
        const active = isActive(pathname, item.href!, item.exact);
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href!)}
            className="relative flex items-center gap-2.5 transition-colors"
            style={{
              padding: "0 8px", height: 40, borderRadius: 10,
              margin: "0 4px",
              background: active ? S.activeBg : "transparent",
              cursor: "pointer", border: "none", outline: "none",
              textAlign: "left",
            }}
            title={!expanded ? item.label : undefined}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = S.hoverBg; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40 }}>
              <Icon size={18} style={{ color: active ? S.teal200 : S.textSecondary }} />
            </div>
            <span
              style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
                color: active ? S.teal200 : S.textSecondary,
                whiteSpace: "nowrap", overflow: "hidden",
                opacity: expanded ? 1 : 0, transition: "opacity 150ms ease",
              }}
            >
              {item.label}
            </span>
            {(() => {
              const badgeCount = getBadgeCount(item.href!);
              if (badgeCount === 0) return null;
              return !expanded ? (
                <span
                  className="absolute"
                  style={{ top: 8, right: 8, width: 6, height: 6, borderRadius: 999, background: S.red }}
                />
              ) : (
                <span
                  className="ml-auto flex-shrink-0 flex items-center justify-center"
                  style={{
                    minWidth: 18, height: 18, borderRadius: 999, padding: "0 5px",
                    background: S.red, fontFamily: "var(--font-body)", fontWeight: 700,
                    fontSize: 9, color: "#fff",
                  }}
                >
                  {badgeCount}
                </span>
              );
            })()}
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Settings */}
      <button
        onClick={() => router.push("/admin/settings")}
        className="flex items-center gap-2.5 transition-colors"
        style={{
          padding: "0 8px", height: 40, borderRadius: 10, margin: "0 4px",
          background: "transparent",
          cursor: "pointer", border: "none", outline: "none", textAlign: "left",
        }}
        title={!expanded ? "Settings" : undefined}
        onMouseEnter={e => { e.currentTarget.style.background = S.hoverBg; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40 }}>
          <Settings size={18} style={{ color: S.textSecondary }} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
            color: S.textSecondary,
            whiteSpace: "nowrap", opacity: expanded ? 1 : 0, transition: "opacity 150ms ease",
          }}
        >
          Settings
        </span>
      </button>

      <div className="flex items-center gap-2.5" style={{ padding: "0 8px", marginTop: 8 }}>
        <Link
          href="/support"
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: S.greenBg, border: `1px solid ${S.green}`,
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: S.green,
          }}
        >
          ST
        </Link>
        <div
          style={{
            whiteSpace: "nowrap", overflow: "hidden",
            opacity: expanded ? 1 : 0, transition: "opacity 150ms ease",
          }}
        >
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: S.teal200 }}>Support team</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: S.textDim }}>Agent</div>
        </div>
      </div>
    </aside>
  );
}
