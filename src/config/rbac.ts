// Role-based access control configuration
// Maps UserRole to permitted admin sections
export const RBAC_MATRIX = {
  "super-admin": ["*"],
  "site-manager": ["command-centre", "inventory"],
  finance: ["command-centre", "deals", "payouts", "finance-reports"],
  sales: ["command-centre", "crm", "acquisition"],
  "recon-tech": ["inventory"],
  compliance: ["command-centre", "deals", "compliance"],
  "read-only": [
    "command-centre",
    "acquisition",
    "inventory",
    "deals",
    "compliance",
  ],
} as const;
