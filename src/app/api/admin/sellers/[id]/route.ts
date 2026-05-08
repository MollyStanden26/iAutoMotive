import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const VEHICLE_STAGES = [
  "offer_accepted", "collected", "inspecting", "in_mechanical",
  "in_body_paint", "in_detail", "in_photography", "listing_ready",
  "live", "sale_agreed", "sold", "returned", "withdrawn",
] as const;

const PAYOUT_METHODS = ["faster_payments", "bacs", "chaps"] as const;

/**
 * GET /api/admin/sellers/[id] — full record for the SellerEditDrawer.
 *
 * Returns the User (email, role, isActive) + SellerProfile + the seller's
 * latest Consignment (with the live Vehicle and the cost-breakdown fields the
 * admin can tweak). Photos are included as a flat array of CDN URLs so the
 * drawer can render thumbnails.
 *
 * `[id]` is the User id (matches what /api/admin/sellers GET returns).
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { sellerProfile: true },
    });
    if (!user || user.role !== "seller" || !user.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const consignment = await prisma.consignment.findFirst({
      where: { sellerId: user.sellerProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        lot: { select: { name: true, city: true } },
      },
    });

    let photos: string[] = [];
    if (consignment?.vehicle) {
      const media = await prisma.mediaFile.findMany({
        where: { entityType: "vehicle", entityId: consignment.vehicle.id },
        orderBy: { sortOrder: "asc" },
        select: { cdnUrl: true },
      });
      photos = media.map(m => m.cdnUrl);
    }

    return NextResponse.json({
      seller: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        firstName: user.sellerProfile.firstName,
        lastName: user.sellerProfile.lastName,
        addressLine1: user.sellerProfile.addressLine1,
        city: user.sellerProfile.city,
        postcode: user.sellerProfile.postcode,
        payoutMethod: user.sellerProfile.payoutMethod,
        consignmentAgreementUrl: user.sellerProfile.consignmentAgreementUrl,
      },
      consignment: consignment ? {
        id: consignment.id,
        status: consignment.status,
        agreedListingPriceGbp: consignment.agreedListingPriceGbp,
        platformFeeGbp:        consignment.platformFeeGbp ?? 0,
        reconMechanicalGbp:    consignment.reconMechanicalGbp ?? 0,
        reconDetailGbp:        consignment.reconDetailGbp ?? 0,
        transportGbp:          consignment.transportGbp ?? 0,
        lot: consignment.lot ? `${consignment.lot.name}, ${consignment.lot.city ?? ""}`.trim() : null,
      } : null,
      vehicle: consignment?.vehicle ? {
        id: consignment.vehicle.id,
        registration: consignment.vehicle.registration,
        year: consignment.vehicle.year,
        make: consignment.vehicle.make,
        model: consignment.vehicle.model,
        trim: consignment.vehicle.trim,
        currentStage: consignment.vehicle.currentStage,
        listingPriceGbp: consignment.vehicle.listingPriceGbp,
        mileageAtIntake: consignment.vehicle.mileageAtIntake,
        exteriorColour: consignment.vehicle.exteriorColour,
      } : null,
      photos,
    });
  } catch (error) {
    console.error("[GET /api/admin/sellers/:id]", error);
    return NextResponse.json({ error: "Failed to load seller" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/sellers/[id] — apply edits made in the drawer.
 *
 * Accepts a sparse JSON body — only fields present in the request are touched.
 * Splits into 3 update buckets: User (email/password/isActive), SellerProfile
 * (address/payoutMethod), Vehicle (stage/listingPriceGbp), Consignment (cost
 * breakdown). Each bucket is its own update so partial saves stay atomic per
 * domain.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { sellerProfile: true },
    });
    if (!user || user.role !== "seller" || !user.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // ── User updates (email / password / active) ─────────────────────────
    const userPatch: { email?: string; passwordHash?: string; isActive?: boolean } = {};
    if (typeof body.email === "string" && body.email.trim() && body.email.toLowerCase() !== user.email) {
      const dup = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
      if (dup && dup.id !== user.id) {
        return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
      }
      userPatch.email = body.email.toLowerCase().trim();
    }
    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      userPatch.passwordHash = await bcrypt.hash(body.password, 10);
    }
    if (typeof body.isActive === "boolean") userPatch.isActive = body.isActive;
    if (Object.keys(userPatch).length > 0) {
      await prisma.user.update({ where: { id: user.id }, data: userPatch });
    }

    // ── SellerProfile updates ────────────────────────────────────────────
    const profilePatch: { addressLine1?: string | null; city?: string | null; postcode?: string | null; payoutMethod?: typeof PAYOUT_METHODS[number] | null } = {};
    if ("addressLine1" in body) profilePatch.addressLine1 = body.addressLine1 || null;
    if ("city" in body) profilePatch.city = body.city || null;
    if ("postcode" in body) profilePatch.postcode = body.postcode || null;
    if ("payoutMethod" in body) {
      if (body.payoutMethod === null || body.payoutMethod === "") {
        profilePatch.payoutMethod = null;
      } else if ((PAYOUT_METHODS as readonly string[]).includes(body.payoutMethod)) {
        profilePatch.payoutMethod = body.payoutMethod;
      } else {
        return NextResponse.json({ error: "Invalid payout method" }, { status: 400 });
      }
    }
    if (Object.keys(profilePatch).length > 0) {
      await prisma.sellerProfile.update({ where: { id: user.sellerProfile.id }, data: profilePatch });
    }

    // ── Consignment updates (cost breakdown + status) ────────────────────
    const consignment = await prisma.consignment.findFirst({
      where: { sellerId: user.sellerProfile.id },
      orderBy: { createdAt: "desc" },
    });
    if (consignment) {
      const consPatch: Record<string, number> = {};
      for (const key of ["platformFeeGbp", "reconMechanicalGbp", "reconDetailGbp", "transportGbp"] as const) {
        if (key in body) {
          const v = Number(body[key]);
          if (!Number.isFinite(v) || v < 0) {
            return NextResponse.json({ error: `${key} must be a non-negative number (pence)` }, { status: 400 });
          }
          consPatch[key] = Math.round(v);
        }
      }
      if (Object.keys(consPatch).length > 0) {
        await prisma.consignment.update({ where: { id: consignment.id }, data: consPatch });
      }
    }

    // ── Vehicle updates (stage + listing price) ──────────────────────────
    if (consignment?.vehicleId) {
      const vehiclePatch: { currentStage?: typeof VEHICLE_STAGES[number]; listingPriceGbp?: number } = {};
      if (typeof body.currentStage === "string") {
        if (!(VEHICLE_STAGES as readonly string[]).includes(body.currentStage)) {
          return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
        }
        vehiclePatch.currentStage = body.currentStage as typeof VEHICLE_STAGES[number];
      }
      if ("listingPriceGbp" in body) {
        const v = Number(body.listingPriceGbp);
        if (!Number.isFinite(v) || v < 0) {
          return NextResponse.json({ error: "listingPriceGbp must be a non-negative number (pence)" }, { status: 400 });
        }
        vehiclePatch.listingPriceGbp = Math.round(v);
      }
      if (Object.keys(vehiclePatch).length > 0) {
        await prisma.vehicle.update({ where: { id: consignment.vehicleId }, data: vehiclePatch });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/admin/sellers/:id]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 });
  }
}
