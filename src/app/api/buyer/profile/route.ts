import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

const MILITARY = ["none", "active", "veteran"] as const;
const MARITAL  = ["married", "single", "widowed"] as const;
const OWNERSHIP = ["own", "rent"] as const;
const SUFFIXES = ["", "Jr.", "Sr.", "II", "III", "IV"] as const;

/**
 * GET /api/buyer/profile — current signed-in user's buyer profile + the
 * user-level fields we share with it (email, phone). Auto-creates an empty
 * BuyerProfile row the first time someone hits the page so the UI doesn't
 * have to special-case "no profile yet" everywhere.
 */
export async function GET(req: NextRequest) {
  const guard = await requireSession(req);
  if (!guard.ok) return guard.response;
  try {
    const user = await prisma.user.findUnique({
      where: { id: guard.user.id },
      include: { buyerProfile: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let profile = user.buyerProfile;
    if (!profile) {
      profile = await prisma.buyerProfile.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json({
      profile: {
        firstName:           profile.firstName,
        middleName:          profile.middleName,
        lastName:            profile.lastName,
        nameSuffix:          profile.nameSuffix,
        militaryStatus:      profile.militaryStatus,
        maritalStatus:       profile.maritalStatus,
        homeownershipStatus: profile.homeownershipStatus,
        phone:               user.phone,
        email:               user.email,
      },
    });
  } catch (error) {
    console.error("[GET /api/buyer/profile]", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

/**
 * PATCH /api/buyer/profile — sparse update of the buyer profile.
 *
 * Accepts firstName, middleName, lastName, nameSuffix, militaryStatus,
 * maritalStatus, homeownershipStatus, plus phone (which lives on the User).
 * Validates enums; ignores unknown keys.
 */
export async function PATCH(req: NextRequest) {
  const guard = await requireSession(req);
  if (!guard.ok) return guard.response;
  try {
    const body = await req.json().catch(() => ({}));

    const profilePatch: {
      firstName?: string | null; middleName?: string | null; lastName?: string | null;
      nameSuffix?: string | null; militaryStatus?: string | null; maritalStatus?: string | null;
      homeownershipStatus?: string | null;
    } = {};

    const setStr = (key: keyof typeof profilePatch) => {
      if (key in body) profilePatch[key] = (typeof body[key] === "string" ? body[key].trim() : null) || null;
    };
    setStr("firstName");
    setStr("middleName");
    setStr("lastName");

    if ("nameSuffix" in body) {
      const v = typeof body.nameSuffix === "string" ? body.nameSuffix.trim() : "";
      if (v && !(SUFFIXES as readonly string[]).includes(v)) {
        return NextResponse.json({ error: "Invalid suffix" }, { status: 400 });
      }
      profilePatch.nameSuffix = v || null;
    }
    if ("militaryStatus" in body) {
      const v = body.militaryStatus;
      if (v != null && !(MILITARY as readonly string[]).includes(v)) {
        return NextResponse.json({ error: "Invalid military status" }, { status: 400 });
      }
      profilePatch.militaryStatus = v ?? null;
    }
    if ("maritalStatus" in body) {
      const v = body.maritalStatus;
      if (v != null && !(MARITAL as readonly string[]).includes(v)) {
        return NextResponse.json({ error: "Invalid marital status" }, { status: 400 });
      }
      profilePatch.maritalStatus = v ?? null;
    }
    if ("homeownershipStatus" in body) {
      const v = body.homeownershipStatus;
      if (v != null && !(OWNERSHIP as readonly string[]).includes(v)) {
        return NextResponse.json({ error: "Invalid homeownership status" }, { status: 400 });
      }
      profilePatch.homeownershipStatus = v ?? null;
    }

    // Upsert BuyerProfile so this works for any signed-in user (a seller
    // browsing as a buyer also has a legitimate purchase flow).
    await prisma.buyerProfile.upsert({
      where: { userId: guard.user.id },
      create: { userId: guard.user.id, ...profilePatch },
      update: profilePatch,
    });

    // Phone lives on the User row, not the BuyerProfile.
    if ("phone" in body) {
      const phone = typeof body.phone === "string" ? body.phone.trim() : "";
      await prisma.user.update({
        where: { id: guard.user.id },
        data: { phone: phone || null },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/buyer/profile]", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
