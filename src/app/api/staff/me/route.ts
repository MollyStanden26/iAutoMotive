import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * Staff self-profile for the rep Settings ("My settings") view.
 *
 *   GET   — the signed-in staff member's own profile + read-only context
 *           (email/role/lot/targets/softphone). No secrets are exposed.
 *   PATCH — update ONLY firstName / lastName on the caller's own StaffProfile.
 *           Manager-owned fields (targets, lot, remote, telephony) are never
 *           writable here.
 */

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  try {
    const profile = await prisma.staffProfile.findUnique({
      where: { userId: guard.user.id },
      include: {
        user: { select: { email: true } },
        lot: { select: { name: true, city: true, addressLine1: true, addressLine2: true, postcode: true, phone: true } },
      },
    });

    const lot = profile?.lot
      ? {
          name: profile.lot.name,
          city: profile.lot.city ?? null,
          address: [profile.lot.addressLine1, profile.lot.addressLine2, profile.lot.postcode].filter(Boolean).join(", ") || null,
          phone: profile.lot.phone ?? null,
        }
      : null;

    return NextResponse.json({
      profile: {
        firstName: profile?.firstName ?? "",
        lastName: profile?.lastName ?? "",
        email: profile?.user?.email ?? guard.user.email,
        role: guard.user.role,
        hireDate: profile?.hireDate ? profile.hireDate.toISOString() : null,
        isRemote: profile?.isRemote ?? false,
        lot,
        dailyCallTarget: profile?.dailyCallTarget ?? null,
        weeklyConversionTarget: profile?.weeklyConversionTarget ?? null,
        softphone: {
          provisioned: Boolean(profile?.telnyxCredentialId),
          sipUsername: profile?.telnyxSipUsername ?? null,
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/staff/me]", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  let body: { firstName?: unknown; lastName?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: { firstName?: string; lastName?: string } = {};
  if (body.firstName !== undefined) {
    const v = String(body.firstName).trim();
    if (!v) return NextResponse.json({ error: "First name is required" }, { status: 400 });
    data.firstName = v.slice(0, 80);
  }
  if (body.lastName !== undefined) {
    const v = String(body.lastName).trim();
    if (!v) return NextResponse.json({ error: "Last name is required" }, { status: 400 });
    data.lastName = v.slice(0, 80);
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    // Self only — keyed on the caller's userId, so a rep can't touch anyone else.
    const updated = await prisma.staffProfile.update({
      where: { userId: guard.user.id },
      data,
      select: { firstName: true, lastName: true },
    });
    return NextResponse.json({ ok: true, ...updated });
  } catch (error) {
    console.error("[PATCH /api/staff/me]", error);
    return NextResponse.json({ error: "No staff profile to update" }, { status: 404 });
  }
}
