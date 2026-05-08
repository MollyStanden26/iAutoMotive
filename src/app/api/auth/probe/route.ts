import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/probe — does a user already exist for this email?
 *
 * Powers the two-step "Continue with email" flow on the marketing site:
 *   step 1 = enter email → probe → server says exists or not
 *   step 2 = sign in (if exists) OR register as buyer (if not)
 *
 * The same existence info is already leakable through /api/auth/register
 * (returns 409 on duplicate email), so this endpoint doesn't worsen the
 * privacy posture; it just makes the UX cleaner. No password / role / name
 * info is returned.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error("[POST /api/auth/probe]", error);
    return NextResponse.json({ error: "Probe failed" }, { status: 500 });
  }
}
