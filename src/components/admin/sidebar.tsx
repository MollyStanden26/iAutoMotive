"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

// Admin sidebar -- 220px, Slate 900 bg, section labels, active item highlight
// Sections: Command Centre, CRM, Sellers Management, Inventory, Deals, Payouts, Compliance, Finance, Settings

const sections = [
  { label: "Command Centre", href: "/admin" },
  { label: "CRM", href: "/admin/crm" },
  { label: "Sellers Management", href: "/admin/sellers-management" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Deals", href: "/admin/deals" },
  { label: "Payouts", href: "/admin/payouts" },
  { label: "Compliance", href: "/admin/compliance" },
  { label: "Finance", href: "/admin/finance" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="flex w-[220px] flex-col bg-[#0F1724] font-[family-name:var(--font-body)]">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link
          href="/admin"
          className="text-base font-bold text-white font-[family-name:var(--font-heading)]"
        >
          iAutoMotive
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-0.5">
          {sections.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info + sign out */}
      {user && (
        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008C7C] text-xs font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>
              <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-gray-500 transition-colors hover:text-red-400"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
