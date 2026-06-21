import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { appRoleToDbRole } from "@/lib/auth/role-mapping";
import type { UserRole } from "@/types/user";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/staff — create a new staff member with a portal login.
 *
 * Only super-admins / site-managers may create staff. Creates the User (login
 * identity + role) and StaffProfile (name, lot, targets, etc.) in one
 * transaction, generates a one-time temporary password (returned once so the
 * admin can hand it over), and marks the account active. The new rep signs in
 * at /auth/signin and is routed to their portal by role.
 */

const STAFF_APP_ROLES: UserRole[] = [
  "site-manager", "finance", "sales", "recon-tech", "compliance", "read-only",
];

/** Secure, unambiguous temporary password (no look-alike chars). */
function genTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export async function POST(request: NextRequest) {
  const guard = await requireRole(request, ["super-admin", "site-manager"]);
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "sales") as UserRole;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name are required" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!STAFF_APP_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
  }

  const toIntOrNull = (v: unknown): number | null => {
    if (v === undefined || v === null || v === "") return null;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const lotId = body.lotId ? String(body.lotId) : null;
  const dailyCallTarget = toIntOrNull(body.dailyCallTarget);
  const weeklyConversionTarget = toIntOrNull(body.weeklyConversionTarget);
  const isRemote = Boolean(body.isRemote);
  let hireDate: Date | null = null;
  if (body.hireDate) {
    const d = new Date(String(body.hireDate));
    if (!Number.isNaN(d.getTime())) hireDate = d;
  }

  const tempPassword = genTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const dbRole = appRoleToDbRole(role);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email, passwordHash, role: dbRole, isActive: true, emailVerifiedAt: new Date() },
      });
      await tx.staffProfile.create({
        data: { userId: u.id, firstName, lastName, lotId, dailyCallTarget, weeklyConversionTarget, isRemote, hireDate },
      });
      return u;
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email, name: `${firstName} ${lastName}`, role },
      tempPassword,
    });
  } catch (error) {
    console.error("[POST /api/admin/staff]", error);
    return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 });
  }
}
