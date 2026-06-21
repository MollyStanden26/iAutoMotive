import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { appRoleToDbRole } from "@/lib/auth/role-mapping";
import type { UserRole } from "@/types/user";

export const dynamic = "force-dynamic";

const STAFF_APP_ROLES: UserRole[] = [
  "site-manager", "finance", "sales", "recon-tech", "compliance", "read-only",
];

/**
 * PATCH /api/admin/staff/[id] — edit a staff member (managers only).
 * Updates identity/role/assignment on the User + StaffProfile. Email is not
 * changed here. An admin can't deactivate their own account.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole(request, ["super-admin", "site-manager"]);
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

  const toIntOrNull = (v: unknown): number | null | undefined => {
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const str = (v: unknown) => (v === undefined ? undefined : String(v).trim());

  // --- User-level updates (role, active) ---
  const userData: { role?: ReturnType<typeof appRoleToDbRole>; isActive?: boolean } = {};
  if (body.role !== undefined) {
    const role = String(body.role) as UserRole;
    if (!STAFF_APP_ROLES.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    userData.role = appRoleToDbRole(role);
  }
  if (body.isActive !== undefined) {
    const active = Boolean(body.isActive);
    if (!active && params.id === guard.user.id) {
      return NextResponse.json({ error: "You can't deactivate your own account" }, { status: 400 });
    }
    userData.isActive = active;
  }

  // --- Profile-level updates ---
  const profileData: Record<string, unknown> = {};
  if (body.firstName !== undefined) { const v = str(body.firstName); if (!v) return NextResponse.json({ error: "First name is required" }, { status: 400 }); profileData.firstName = v; }
  if (body.lastName !== undefined) { const v = str(body.lastName); if (!v) return NextResponse.json({ error: "Last name is required" }, { status: 400 }); profileData.lastName = v; }
  if (body.lotId !== undefined) profileData.lotId = body.lotId ? String(body.lotId) : null;
  if (body.isRemote !== undefined) profileData.isRemote = Boolean(body.isRemote);
  if (body.dailyCallTarget !== undefined) profileData.dailyCallTarget = toIntOrNull(body.dailyCallTarget);
  if (body.weeklyConversionTarget !== undefined) profileData.weeklyConversionTarget = toIntOrNull(body.weeklyConversionTarget);
  if (body.hireDate !== undefined) {
    if (!body.hireDate) profileData.hireDate = null;
    else { const d = new Date(String(body.hireDate)); profileData.hireDate = Number.isNaN(d.getTime()) ? null : d; }
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) await tx.user.update({ where: { id: params.id }, data: userData });
      if (Object.keys(profileData).length > 0) await tx.staffProfile.update({ where: { userId: params.id }, data: profileData });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/admin/staff/[id]]", error);
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
  }
}
