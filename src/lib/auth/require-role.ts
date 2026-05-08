import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken, type SessionPayload } from "./jwt";
import type { AppRole } from "./use-current-user";
import { dbRoleToAppRole } from "./role-mapping";
import type { UserRole as PrismaUserRole } from "@prisma/client";

/** All staff-side roles — anything that can use the /admin shell. */
export const STAFF_ROLES: NonNullable<AppRole>[] = [
  "super-admin", "site-manager", "finance", "sales",
  "recon-tech", "compliance", "read-only",
];

/**
 * Authenticated user from the session cookie. The role here is the *app*
 * role (hyphenated), so callers can compare against `STAFF_ROLES` etc.
 * without re-mapping.
 */
export interface AuthedUser {
  id: string;
  email: string;
  name: string;
  role: NonNullable<AppRole>;
  emailVerified: boolean;
}

type Guard =
  | { ok: true; user: AuthedUser }
  | { ok: false; response: NextResponse };

/**
 * Read the session cookie + verify the JWT. Returns the user (with the
 * role re-mapped to its app form) or a 401 response.
 */
export async function requireSession(req: NextRequest): Promise<Guard> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  const payload = await verifySessionToken(token);
  if (!payload) {
    return { ok: false, response: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  return { ok: true, user: sessionToAuthedUser(payload) };
}

/**
 * Require any staff role. Use this on admin/support API routes that should
 * not be reachable by sellers/buyers — even when authenticated.
 */
export async function requireStaff(req: NextRequest): Promise<Guard> {
  const guard = await requireSession(req);
  if (!guard.ok) return guard;
  if (!STAFF_ROLES.includes(guard.user.role)) {
    return { ok: false, response: NextResponse.json({ error: "Staff access required" }, { status: 403 }) };
  }
  return guard;
}

/**
 * Require one of the listed app roles. Use for endpoints that need finer
 * control than "any staff" — e.g. only super-admin + sales for seller
 * mutations.
 */
export async function requireRole(req: NextRequest, allowed: NonNullable<AppRole>[]): Promise<Guard> {
  const guard = await requireSession(req);
  if (!guard.ok) return guard;
  if (!allowed.includes(guard.user.role)) {
    return { ok: false, response: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }
  return guard;
}

/** Require a signed-in seller. */
export async function requireSeller(req: NextRequest): Promise<Guard> {
  return requireRole(req, ["seller"]);
}

function sessionToAuthedUser(payload: SessionPayload): AuthedUser {
  // The DB-side enum can leak through into the cookie if the role wasn't
  // normalised at sign-in. Re-map defensively so downstream code only ever
  // sees the hyphenated app form.
  const dbLooking = payload.role && payload.role.includes("_");
  const role = (dbLooking
    ? dbRoleToAppRole(payload.role as PrismaUserRole)
    : payload.role) as NonNullable<AppRole>;
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role,
    emailVerified: payload.emailVerified,
  };
}
