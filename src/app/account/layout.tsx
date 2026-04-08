"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

// Account layout with sidebar nav

const accountLinks = [
  { href: "/account/saved", label: "Saved Cars" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/finance", label: "Finance Documents" },
  { href: "/account/settings", label: "Settings" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-8 px-4 py-8 font-[family-name:var(--font-body)] sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 md:block">
        {/* User info */}
        {user && (
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008C7C] text-sm font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0F1724]">
                {user.name}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav>
          <ul className="flex flex-col gap-0.5">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#008C7C]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sign out */}
        {user && (
          <div className="mt-8 border-t border-gray-100 pt-4">
            <button
              onClick={signOut}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
