import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/me — everything the seller portal needs to render.
 *
 * Returns the signed-in seller's profile, their latest Consignment with the
 * cost-breakdown fields admin/support can edit, the live Vehicle (including
 * the `currentStage` that drives the "Where your car is right now" stepper),
 * and the photos to render in the gallery + financial estimator.
 *
 * 401 if there's no session, 403 if the session isn't a seller.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    const payload = await verifySessionToken(token);
    if (!payload) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (payload.role !== "seller") {
      return NextResponse.json({ error: "Seller account required" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      include: { sellerProfile: true },
    });
    if (!user || !user.sellerProfile) {
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

    let photos: { url: string; isPrimary: boolean }[] = [];
    if (consignment?.vehicle) {
      const media = await prisma.mediaFile.findMany({
        where: { entityType: "vehicle", entityId: consignment.vehicle.id },
        orderBy: { sortOrder: "asc" },
        select: { cdnUrl: true, isPrimary: true },
      });
      photos = media.map(m => ({ url: m.cdnUrl, isPrimary: m.isPrimary }));
    }

    return NextResponse.json({
      seller: {
        id: user.id,
        email: user.email,
        firstName: user.sellerProfile.firstName,
        lastName: user.sellerProfile.lastName,
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
        listedAt: consignment.listedAt?.toISOString() ?? null,
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
        fuelType: consignment.vehicle.fuelType,
        transmission: consignment.vehicle.transmission,
      } : null,
      photos,
    });
  } catch (error) {
    console.error("[GET /api/seller/me]", error);
    return NextResponse.json({ error: "Failed to load seller data" }, { status: 500 });
  }
}
