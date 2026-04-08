import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { createSessionToken, buildSessionCookie } from "@/lib/auth/jwt";
import { dbRoleToAppRole } from "@/lib/auth/role-mapping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        staffProfile: { select: { firstName: true, lastName: true } },
        sellerProfile: { select: { firstName: true, lastName: true } },
        buyerProfile: { select: { firstName: true, lastName: true } },
      },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Derive display name from profile
    const profile =
      user.staffProfile || user.sellerProfile || user.buyerProfile;
    const name = profile
      ? `${profile.firstName} ${profile.lastName}`
      : email.split("@")[0];

    const appRole = dbRoleToAppRole(user.role);

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name,
      role: appRole,
      emailVerified: !!user.emailVerifiedAt,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name,
        role: appRole,
        emailVerified: !!user.emailVerifiedAt,
        createdAt: user.createdAt.toISOString(),
      },
    });

    response.headers.set("Set-Cookie", buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
