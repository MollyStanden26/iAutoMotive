import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const FUEL_TYPES   = ["petrol", "diesel", "hybrid", "plugin_hybrid", "electric", "mild_hybrid"] as const;
const TRANSMISSIONS = ["manual", "automatic", "semi_automatic", "cvt"] as const;
const BODY_TYPES   = ["hatchback", "saloon", "estate", "suv", "coupe", "convertible", "mpv", "pickup", "van"] as const;
const CONDITIONS   = ["excellent", "good", "fair", "below_average"] as const;
const SERVICE      = ["full", "partial", "none"] as const;
const STAGES       = [
  "offer_accepted", "collected", "inspecting", "in_mechanical",
  "in_body_paint", "in_detail", "in_photography", "listing_ready", "live",
  "sale_agreed", "sold", "returned", "withdrawn",
] as const;

function isAllowed<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const v = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        lot: { select: { id: true, name: true, city: true } },
        consignment: { include: { seller: { include: { user: { select: { email: true } } } } } },
        mediaFiles: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!v) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    return NextResponse.json({
      vehicle: {
        id: v.id,
        registration: v.registration,
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim,
        mileageAtIntake: v.mileageAtIntake,
        fuelType: v.fuelType,
        transmission: v.transmission,
        bodyType: v.bodyType,
        exteriorColour: v.exteriorColour,
        ownersCountAtIntake: v.ownersCountAtIntake,
        conditionGrade: v.conditionGrade,
        serviceHistoryType: v.serviceHistoryType,
        currentStage: v.currentStage,
        listingPriceGbp: v.listingPriceGbp ? Math.round(v.listingPriceGbp / 100) : null,
        floorPriceGbp: v.floorPriceGbp ? Math.round(v.floorPriceGbp / 100) : null,
        hasHpiClear: v.hasHpiClear,
        lot: v.lot ? `${v.lot.name} ${v.lot.city ?? ""}`.trim() : null,
        seller: v.consignment?.seller
          ? {
              firstName: v.consignment.seller.firstName,
              lastName: v.consignment.seller.lastName,
              email: v.consignment.seller.user?.email,
            }
          : null,
        photos: v.mediaFiles.map(m => ({
          url: m.cdnUrl,
          category: m.category,
          isPrimary: m.isPrimary,
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/vehicles/[id]]", error);
    return NextResponse.json({ error: "Failed to load vehicle" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.vehicle.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.registration === "string" && body.registration.trim()) {
      data.registration = body.registration.toUpperCase().trim();
    }
    if (typeof body.year === "number") data.year = body.year;
    if (typeof body.make === "string") data.make = body.make.trim();
    if (typeof body.model === "string") data.model = body.model.trim();
    if (typeof body.trim === "string") data.trim = body.trim || null;
    if (typeof body.mileageAtIntake === "number") data.mileageAtIntake = body.mileageAtIntake;
    if (typeof body.exteriorColour === "string") data.exteriorColour = body.exteriorColour || null;
    if (typeof body.ownersCountAtIntake === "number") data.ownersCountAtIntake = body.ownersCountAtIntake;
    if (typeof body.hasHpiClear === "boolean") data.hasHpiClear = body.hasHpiClear;
    if (isAllowed(body.fuelType, FUEL_TYPES)) data.fuelType = body.fuelType;
    if (isAllowed(body.transmission, TRANSMISSIONS)) data.transmission = body.transmission;
    if (isAllowed(body.bodyType, BODY_TYPES)) data.bodyType = body.bodyType;
    if (isAllowed(body.conditionGrade, CONDITIONS)) data.conditionGrade = body.conditionGrade;
    if (isAllowed(body.serviceHistoryType, SERVICE)) data.serviceHistoryType = body.serviceHistoryType;
    if (isAllowed(body.currentStage, STAGES)) data.currentStage = body.currentStage;
    if (typeof body.listingPriceGbp === "number") data.listingPriceGbp = body.listingPriceGbp * 100;
    if (typeof body.floorPriceGbp === "number") data.floorPriceGbp = body.floorPriceGbp * 100;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
    }

    // Reject duplicate registration on rename
    if (data.registration && data.registration !== existing.registration) {
      const clash = await prisma.vehicle.findUnique({ where: { registration: data.registration as string } });
      if (clash) {
        return NextResponse.json(
          { error: `A vehicle with registration ${data.registration} already exists` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.vehicle.update({ where: { id: params.id }, data });
    return NextResponse.json({
      vehicle: {
        id: updated.id,
        registration: updated.registration,
        listingPriceGbp: updated.listingPriceGbp ? Math.round(updated.listingPriceGbp / 100) : null,
        currentStage: updated.currentStage,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/admin/vehicles/[id]]", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}
