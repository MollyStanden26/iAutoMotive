"use client";

import { useContext } from "react";
import { AuthContext, AuthContextValue } from "@/context/auth-context";
import type { UserRole } from "@/types/user";

// Re-export role routes so pages can import from one place
export { ROLE_HOME_ROUTE } from "@/lib/auth/role-routes";

/** Demo accounts used on the sign-in page — must match MOCK_USERS emails */
export const DEMO_ACCOUNTS: { label: string; email: string; role: UserRole }[] = [
  { label: "Super Admin", email: "james.thornton@iautosale.co.uk", role: "super-admin" },
  { label: "Site Manager", email: "sarah.whitfield@iautosale.co.uk", role: "site-manager" },
  { label: "Finance", email: "daniel.okoye@iautosale.co.uk", role: "finance" },
  { label: "Sales", email: "emma.richardson@iautosale.co.uk", role: "sales" },
  { label: "Seller", email: "charlotte.evans@iautosale.co.uk", role: "seller" },
  { label: "Buyer", email: "ryan.mcgregor@iautosale.co.uk", role: "buyer" },
  { label: "Dealer", email: "priya.sharma@iautosale.co.uk", role: "dealer" },
];

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
