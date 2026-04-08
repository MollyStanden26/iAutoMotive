"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

// Dealer/lot operator navbar -- mobile-first, logo, dashboard, intake, inventory, recon, photography

const dealerLinks = [
  { href: "/dealer", label: "Dashboard" },
  { href: "/dealer/intake", label: "Intake" },
  { href: "/dealer/inventory", label: "Inventory" },
  { href: "/dealer/recon", label: "Recon" },
  { href: "/dealer/photography", label: "Photography" },
];

export function DealerNavbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white font-[family-name:var(--font-body)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/dealer"
          className="text-base font-bold text-[#0F1724] font-[family-name:var(--font-heading)]"
        >
          iAutoSale
        </Link>

        {/* Nav links */}
        <ul className="hidden items-center gap-5 md:flex">
          {dealerLinks.map((link) => (
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
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008C7C] text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-[#0F1724] sm:inline">
                  {user.name}
                </span>
              </div>
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
