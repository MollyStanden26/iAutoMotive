"use client";

import { useEffect, useState } from "react";

/**
 * App-level role keys (the "appRole" produced by `dbRoleToAppRole`). The
 * RBAC matrix is keyed on these strings.
 */
export type AppRole =
  | "super-admin"
  | "site-manager"
  | "finance"
  | "sales"
  | "recon-tech"
  | "compliance"
  | "read-only"
  | "seller"
  | "buyer"
  | null;

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  emailVerified: boolean;
}

/**
 * Polls /api/auth/me once on mount. Returns `null` while loading and `null`
 * (with `loading: false`) when there is no signed-in user.
 *
 * Components needing the current user's name/role/initials in the shell
 * should consume this hook instead of importing mock data.
 */
export function useCurrentUser(): { user: CurrentUser | null; loading: boolean } {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(r => r.ok ? r.json() : { user: null })
      .then((data: { user: CurrentUser | null }) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { user, loading };
}

/** Extracts up-to-two uppercase initials from a display name. */
export function initialsFromName(name: string | null | undefined, fallback = "??"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Friendly display label for a role. */
export function roleLabel(role: AppRole): string {
  switch (role) {
    case "super-admin":  return "Super Admin";
    case "site-manager": return "Site Manager";
    case "finance":      return "Finance";
    case "sales":        return "Sales";
    case "recon-tech":   return "Recon Tech";
    case "compliance":   return "Compliance";
    case "read-only":    return "Read-only";
    case "seller":       return "Seller";
    case "buyer":        return "Buyer";
    default:             return "Guest";
  }
}
