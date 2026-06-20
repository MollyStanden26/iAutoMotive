"use client";

/**
 * CrmTopbar — the single, shared top bar for every /admin/crm screen.
 *
 * Before this existed each CRM page hand-rolled its own bar with a different
 * tab list ("Pipeline" vs "Overview", "Calls" vs "Calls log", Assignment
 * missing on sub-pages, inconsistent ordering and active-state logic). This is
 * the one source of truth: same tabs, same order, same styling everywhere, with
 * the active tab derived from the current path.
 *
 * Pages customise only the breadcrumb leaf (`title`), optional `badges` shown
 * next to the Live pill, and an optional right-aligned `actions` slot.
 */

import { usePathname, useRouter } from "next/navigation";

const T = {
  bgSidebar: "#070D18", bgCard: "#0D1525", bgRow: "#111D30", bgHover: "#0C1428",
  border: "#1E2D4A", textPrimary: "#F1F5F9", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7", green: "#34D399",
};

/** Canonical CRM tab set — order + labels are fixed across all pages. */
export const CRM_TABS = [
  { label: "Overview", href: "/admin/crm" },
  { label: "Dialler", href: "/admin/crm/dialler" },
  { label: "Assignment", href: "/admin/crm/assign" },
  { label: "Calls log", href: "/admin/crm/calls" },
  { label: "Performance", href: "/admin/crm/performance" },
  { label: "Scripts", href: "/admin/crm/scripts" },
] as const;

export interface CrmTopbarProps {
  /** Breadcrumb leaf, e.g. "Dialler". */
  title: string;
  /** Right-aligned content (page-specific buttons / links). */
  actions?: React.ReactNode;
  /** Extra badges rendered just after the Live pill (e.g. overdue count). */
  badges?: React.ReactNode;
  /** Show the green "Live" pill. Default true. */
  showLive?: boolean;
}

export function CrmTopbar({ title, actions, badges, showLive = true }: CrmTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin/crm" ? pathname === "/admin/crm" : pathname.startsWith(href);

  return (
    <header
      className="flex flex-col gap-2 px-3 py-2.5 sm:px-4 lg:flex-row lg:items-center lg:gap-3 lg:h-[58px] lg:px-[22px] lg:py-0"
      style={{ background: T.bgSidebar, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}
    >
      {/*
        Top cluster: breadcrumb + Live + badges + page actions.
        `lg:contents` makes this wrapper dissolve on desktop so its children
        become direct flex-row items alongside the tab nav; on smaller screens
        it's its own row (breadcrumb left, actions right) with the tabs below.
      */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 lg:contents">
        {/* Breadcrumb — the "Admin / CRM" prefix is dropped on phones to save room */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="hidden sm:inline cursor-pointer font-body text-[13px]" style={{ color: T.textDim }}
            onClick={() => router.push("/admin")}>Admin</span>
          <span className="hidden sm:inline text-[13px]" style={{ color: T.textDim }}>/</span>
          <span className="hidden sm:inline cursor-pointer font-body text-[13px]" style={{ color: T.textDim }}
            onClick={() => router.push("/admin/crm")}>CRM</span>
          <span className="hidden sm:inline text-[13px]" style={{ color: T.textDim }}>/</span>
          <span className="font-heading font-[800] text-[15px] sm:text-[17px] truncate"
            style={{ color: T.textPrimary }}>{title}</span>
        </div>

        {/* Live pill — hidden on the narrowest screens */}
        {showLive && (
          <span className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-[11px] font-bold shrink-0"
            style={{ background: T.bgHover, color: T.teal200 }}>
            <span className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: T.green }} />
            Live
          </span>
        )}
        {badges}

        {/* Page actions — right-aligned on the mobile header row, trailing on desktop */}
        {actions && (
          <div className="flex items-center gap-2 ml-auto shrink-0 lg:order-last lg:ml-0">
            {actions}
          </div>
        )}
      </div>

      {/* Tab nav — identical on every CRM page. Scrolls horizontally on narrow
          screens so all six tabs stay reachable; centred on desktop. */}
      <nav className="flex-1 flex justify-start lg:justify-center overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex rounded-[10px] p-[3px] shrink-0" style={{ background: T.bgRow }}>
          {CRM_TABS.map(tab => {
            const active = isActive(tab.href);
            return (
              <button
                key={tab.href}
                onClick={() => !active && router.push(tab.href)}
                className="px-2.5 lg:px-3 py-1.5 rounded-[8px] font-body text-[11px] lg:text-[12px] font-semibold whitespace-nowrap transition-colors duration-150"
                style={{
                  background: active ? T.bgCard : "transparent",
                  color: active ? T.textPrimary : T.textMuted,
                  border: "none", cursor: active ? "default" : "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
