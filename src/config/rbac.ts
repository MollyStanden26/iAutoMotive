// Role-based access control configuration
// Maps each appRole to the admin/support sections it can see in the navigation.
// "*" is a wildcard meaning "all sections".
//
// Keys correspond to the `permission` strings on each sidebar item — see
// src/components/admin/icon-sidebar.tsx.
import type { AppRole } from "@/lib/auth/use-current-user";

export type Permission =
  | "command-centre"
  | "analytics"
  | "crm"
  | "sellers-management"
  | "inventory"
  | "photo-editor"
  | "deals"
  | "support"
  | "payouts"
  | "compliance"
  | "finance-reports"
  | "staff"
  | "settings";

export const RBAC_MATRIX: Record<NonNullable<AppRole>, readonly (Permission | "*")[]> = {
  "super-admin":  ["*"],
  "site-manager": ["command-centre", "inventory", "photo-editor", "support", "settings"],
  finance:        ["command-centre", "analytics", "deals", "payouts", "finance-reports", "settings"],
  sales:          ["command-centre", "crm", "sellers-management", "deals", "support", "settings"],
  "recon-tech":   ["inventory", "photo-editor", "settings"],
  compliance:     ["command-centre", "deals", "compliance", "settings"],
  "read-only":    ["command-centre", "sellers-management", "inventory", "deals", "compliance", "settings"],
  // Sellers/buyers never see the admin shell — kept empty as a guard.
  seller:         [],
  buyer:          [],
};

/** Returns true if the given role is allowed to access a permission. */
export function hasPermission(role: AppRole, perm: Permission): boolean {
  if (!role) return false;
  const allowed = RBAC_MATRIX[role] ?? [];
  return allowed.includes("*") || allowed.includes(perm);
}
