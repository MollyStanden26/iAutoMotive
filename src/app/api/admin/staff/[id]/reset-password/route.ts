import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/** Secure, unambiguous temporary password (no look-alike chars). */
function genTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

/**
 * POST /api/admin/staff/[id]/reset-password — issue a new temporary password
 * for a staff member (managers only). Returned once for the admin to hand over.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole(request, ["super-admin", "site-manager"]);
  if (!guard.ok) return guard.response;

  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, email: true } });
  if (!user) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

  const tempPassword = genTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  try {
    await prisma.user.update({ where: { id: params.id }, data: { passwordHash } });
    return NextResponse.json({ ok: true, email: user.email, tempPassword });
  } catch (error) {
    console.error("[POST /api/admin/staff/[id]/reset-password]", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
