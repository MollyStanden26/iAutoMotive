import { UserRole } from "@/types/user";

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  "super-admin": "/admin",
  "site-manager": "/admin",
  finance: "/admin",
  sales: "/admin",
  "recon-tech": "/admin",
  compliance: "/admin",
  "read-only": "/admin",
  seller: "/seller/overview",
  buyer: "/account",
  dealer: "/dealer",
};

export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  "super-admin": ["/admin", "/portal", "/dealer", "/account", "/checkout"],
  "site-manager": ["/admin", "/checkout"],
  finance: ["/admin", "/checkout"],
  sales: ["/admin", "/checkout"],
  "recon-tech": ["/admin"],
  compliance: ["/admin"],
  "read-only": ["/admin"],
  seller: ["/seller", "/portal", "/checkout"],
  buyer: ["/account", "/checkout"],
  dealer: ["/dealer", "/checkout"],
};

/** Staff roles that can access /admin */
export const STAFF_ROLES: UserRole[] = [
  "super-admin",
  "site-manager",
  "finance",
  "sales",
  "recon-tech",
  "compliance",
  "read-only",
];
