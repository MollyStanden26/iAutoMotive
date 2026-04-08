import type { UserRole } from "@/types/user";
import type { UserRole as PrismaUserRole } from "@prisma/client";

/** Prisma DB enum (underscored) → frontend role (hyphenated) */
export function dbRoleToAppRole(dbRole: PrismaUserRole): UserRole {
  return dbRole.replace(/_/g, "-") as UserRole;
}

/** Frontend role (hyphenated) → Prisma DB enum (underscored) */
export function appRoleToDbRole(appRole: UserRole): PrismaUserRole {
  return appRole.replace(/-/g, "_") as PrismaUserRole;
}
