import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { createSessionToken, buildSessionCookie } from "@/lib/auth/jwt";
import { appRoleToDbRole } from "@/lib/auth/role-mapping";
import type { UserRole } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    if (role !== "seller" && role !== "buyer") {
      return NextResponse.json(
        { error: "Registration is only available for seller and buyer roles" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    const dbRole = appRoleToDbRole(role as UserRole);

    // Create user + profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          phone: phone || null,
          passwordHash,
          role: dbRole,
          isActive: true,
          emailVerifiedAt: new Date(),
        },
      });

      if (role === "seller") {
        await tx.sellerProfile.create({
          data: { userId: newUser.id, firstName, lastName },
        });
      } else {
        await tx.buyerProfile.create({
          data: { userId: newUser.id, firstName, lastName },
        });
      }

      return newUser;
    });

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name,
      role,
      emailVerified: true,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name,
        role,
        emailVerified: true,
        createdAt: user.createdAt.toISOString(),
      },
    });

    response.headers.set("Set-Cookie", buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
