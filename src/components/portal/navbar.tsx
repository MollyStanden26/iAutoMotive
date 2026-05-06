"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

// Seller portal navbar -- logo, dashboard, vehicles, documents, messages, settings

const portalLinks = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/vehicles", label: "Vehicles" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/settings", label: "Settings" },
];

export function PortalNavbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white font-[family-name:var(--font-body)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/portal"
          className="text-base font-bold text-[#0F1724] font-[family-name:var(--font-heading)]"
        >
          iAutoMotive
        </Link>

        {/* Nav links */}
        <ul className="hidden items-center gap-5 md:flex">
          {portalLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#008C7C]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* User area */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link
                href="/seller/overview"
                className="flex items-center gap-2"
                title={user.name}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008C7C] text-[13px] font-bold text-white font-[family-name:var(--font-body)]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-[#0F1724] sm:inline">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={signOut}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-red-600"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
