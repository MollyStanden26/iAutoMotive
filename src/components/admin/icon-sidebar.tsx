"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid, BarChart3, Phone, Clock, CalendarCheck, Home,
  CreditCard, Shield, FileText, Users, Settings, Headphones,
} from "lucide-react";
import { crmDashboardData } from "@/lib/admin/crm-mock-data";
import { PAYOUT_QUEUE } from "@/lib/admin/payouts-mock-data";
import { ACTIVE_FLAGS } from "@/lib/admin/compliance-mock-data";
import { useCurrentUser, initialsFromName, roleLabel } from "@/lib/auth/use-current-user";
import { hasPermission, type Permission } from "@/config/rbac";

/**
 * Computes the badge count for a given admin route from live data.
 * Returns 0 (no badge) when nothing in that section needs attention.
 */
function getBadgeCount(href: string): number {
  switch (href) {
    case "/admin/crm":
      return crmDashboardData.callbacks.filter(c => c.status === "overdue").length;
    case "/admin/payouts":
      return PAYOUT_QUEUE.filter(p => p.status === "overdue").length;
    case "/admin/compliance":
      return ACTIVE_FLAGS.length;
    default:
      return 0;
  }
}

/* ── Tokens ── */
const S = {
  bgSidebar: "#070D18", border: "#1A2640",
  teal: "#008C7C", teal200: "#4DD9C7",
  textSecondary: "#8492A8", textDim: "#4A556B",
  red: "#F87171", green: "#34D399", greenBg: "#0B2B1A",
  activeBg: "#172D4D", hoverBg: "#111D30",
  indigo: "#0A1A2E",
};

type SidebarItem =
  | { type: "item"; icon: typeof LayoutGrid; label: string; href: string; exact?: boolean; permission: Permission }
  | { type: "divider" };

const SIDEBAR_ITEMS: SidebarItem[] = [
  { type: "item", icon: LayoutGrid,    label: "Command centre", href: "/admin", exact: true, permission: "command-centre" },
  { type: "item", icon: BarChart3,     label: "Analytics",      href: "/admin/analytics",          permission: "analytics" },
  { type: "divider" },
  { type: "item", icon: Phone,         label: "CRM",            href: "/admin/crm",                permission: "crm" },
  { type: "item", icon: Clock,         label: "Sellers Mgmt",   href: "/admin/sellers-management", permission: "sellers-management" },
  { type: "item", icon: CalendarCheck, label: "Inventory",      href: "/admin/inventory",          permission: "inventory" },
  { type: "item", icon: Home,          label: "Deals",          href: "/admin/deals",              permission: "deals" },
  { type: "item", icon: Headphones,    label: "Support",        href: "/support",                  permission: "support" },
  { type: "divider" },
  { type: "item", icon: CreditCard,    label: "Payouts",        href: "/admin/payouts",            permission: "payouts" },
  { type: "item", icon: Shield,        label: "Compliance",     href: "/admin/compliance",         permission: "compliance" },
  { type: "item", icon: FileText,      label: "Finance",        href: "/admin/finance",            permission: "finance-reports" },
  { type: "divider" },
  { type: "item", icon: Users,         label: "Staff",          href: "/admin/staff",              permission: "staff" },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function IconSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const { user } = useCurrentUser();
  const settingsActive = pathname.startsWith("/admin/settings");
  const collapsedW = 56;
  const expandedW = 210;

  // Hide nav entries the current role isn't allowed to see. Dividers are
  // pruned alongside their cluster so the sidebar doesn't end up with two
  // dividers in a row.
  const visibleItems = (() => {
    if (!user) return SIDEBAR_ITEMS; // before auth resolves, show full list to avoid layout flicker
    const filtered: SidebarItem[] = [];
    for (const item of SIDEBAR_ITEMS) {
      if (item.type === "divider") {
        if (filtered.length > 0 && filtered[filtered.length - 1].type !== "divider") {
          filtered.push(item);
        }
        continue;
      }
      if (hasPermission(user.role, item.permission)) filtered.push(item);
    }
    while (filtered.length > 0 && filtered[filtered.length - 1].type === "divider") filtered.pop();
    return filtered;
  })();

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
        onClick={() => router.push("/admin")}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 36, height: 36, borderRadius: 10, background: S.teal }}
        >
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, color: "#fff" }}>AC</span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, color: S.teal200,
            whiteSpace: "nowrap", opacity: expanded ? 1 : 0, transition: "opacity 150ms ease",
          }}
        >
          iAutoMotive
        </span>
      </div>

      {/* Nav items */}
      {visibleItems.map((item, i) => {
        if (item.type === "divider") {
          return (
            <div key={`d${i}`} style={{ height: 1, background: S.border, margin: "4px 12px" }} />
          );
        }
        const Icon = item.icon;
        const active = isActive(pathname, item.href, item.exact);
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
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
            {/* Badge dot (collapsed) / Badge count (expanded). Computed live —
                only renders when the page actually has overdue/flagged items. */}
            {(() => {
              const badgeCount = getBadgeCount(item.href);
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <button
        onClick={() => router.push("/admin/settings")}
        className="flex items-center gap-2.5 transition-colors"
        style={{
          padding: "0 8px", height: 40, borderRadius: 10, margin: "0 4px",
          background: settingsActive ? S.indigo : "transparent",
          cursor: "pointer", border: "none", outline: "none", textAlign: "left",
        }}
        title={!expanded ? "Settings" : undefined}
        onMouseEnter={e => { if (!settingsActive) e.currentTarget.style.background = S.hoverBg; }}
        onMouseLeave={e => { if (!settingsActive) e.currentTarget.style.background = settingsActive ? S.indigo : "transparent"; }}
      >
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40 }}>
          <Settings size={18} style={{ color: settingsActive ? S.teal200 : S.textSecondary }} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
            color: settingsActive ? S.teal200 : S.textSecondary,
            whiteSpace: "nowrap", opacity: expanded ? 1 : 0, transition: "opacity 150ms ease",
          }}
        >
          Settings
        </span>
      </button>

      {/* Avatar — pulled live from /api/auth/me */}
      <div className="flex items-center gap-2.5" style={{ padding: "0 8px", marginTop: 8 }}>
        <Link
          href="/admin"
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: S.greenBg, border: `1px solid ${S.green}`,
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: S.green,
          }}
          title={user?.name ?? undefined}
        >
          {user ? initialsFromName(user.name) : "··"}
        </Link>
        <div
          style={{
            whiteSpace: "nowrap", overflow: "hidden",
            opacity: expanded ? 1 : 0, transition: "opacity 150ms ease",
          }}
        >
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: S.teal200 }}>
            {user?.name ?? "Not signed in"}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: S.textDim }}>
            {roleLabel(user?.role ?? null)}
          </div>
        </div>
      </div>
    </aside>
  );
}
