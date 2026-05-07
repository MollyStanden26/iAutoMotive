"use client";

import { useRouter, usePathname } from "next/navigation";

const T = {
  bgSidebar:     "#070D18",
  bgCard:        "#0D1525",
  bgRow:         "#111D30",
  bgHover:       "#0C1428",
  border:        "#1E2D4A",
  textPrimary:   "#F1F5F9",
  textSecondary: "#8492A8",
  textMuted:     "#6B7A90",
  textDim:       "#4A556B",
  teal:          "#008C7C",
  teal200:       "#4DD9C7",
  green:         "#34D399",
  red:           "#F87171",
  redBg:         "#3B1820",
};

const TABS = [
  { label: "Overview",      href: "/support" },
  { label: "Tickets",       href: "/support/tickets" },
  { label: "Conversations", href: "/support/conversations" },
  { label: "Sellers",       href: "/support/sellers" },
  { label: "Knowledge base", href: "/support/kb" },
];

interface SupportTopbarProps {
  /** Optional right-aligned action (e.g. "+ New ticket"). */
  rightAction?: React.ReactNode;
  /** Optional badge after "Support" — e.g. "{N} open" */
  badge?: { label: string; tone?: "red" | "teal" };
}

export function SupportTopbar({ rightAction, badge }: SupportTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-3 px-[22px]"
      style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mr-3">
        <span
          className="cursor-pointer font-body text-[13px]"
          style={{ color: T.textDim }}
          onClick={() => router.push("/admin")}
        >
          Admin
        </span>
        <span style={{ color: T.textDim }} className="text-[13px]">/</span>
        <span className="font-heading font-[800] text-[17px]" style={{ color: T.textPrimary }}>Support</span>
      </div>

      {/* Live badge */}
      <span
        className="flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-body text-[11px] font-bold"
        style={{ background: T.bgHover, color: T.teal200 }}
      >
        <span className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: T.green }} />
        Live
      </span>

      {/* Optional contextual badge */}
      {badge && (
        <span
          className="rounded-pill px-2.5 py-1 font-body text-[11px] font-bold"
          style={{
            background: badge.tone === "red" ? T.redBg : T.bgHover,
            color: badge.tone === "red" ? T.red : T.teal200,
          }}
        >
          {badge.label}
        </span>
      )}

      {/* Tab nav */}
      <div className="flex-1 flex justify-center">
        <div className="flex rounded-[10px] p-[3px]" style={{ background: T.bgRow }}>
          {TABS.map(tab => {
            const active =
              tab.href === "/support"
                ? pathname === "/support"
                : pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <button
                key={tab.label}
                onClick={() => router.push(tab.href)}
                className="px-3 py-1.5 rounded-[8px] font-body text-[12px] font-semibold transition-colors duration-150"
                style={{
                  background: active ? T.bgCard : "transparent",
                  color: active ? T.textPrimary : T.textMuted,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {rightAction ?? <div style={{ width: 1 }} />}
    </div>
  );
}

/** Token palette exported for use in support page bodies. */
export const SUPPORT_TOKENS = T;
