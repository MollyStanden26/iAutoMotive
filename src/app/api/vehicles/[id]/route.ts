import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const labelize = (v: string | null | undefined) =>
  v ? v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const v = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        mediaFiles: { orderBy: { sortOrder: "asc" } },
        consignment: { include: { lot: { select: { name: true, city: true } } } },
      },
    });
    if (!v) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    return NextResponse.json({
      car: {
        id: v.id,
        slug: slugify(`${v.year}-${v.make}-${v.model}-${v.trim ?? ""}`),
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim ?? "",
        title: `${v.year} ${v.make} ${v.model}`,
        subtitle: [v.trim, `${v.mileageAtIntake.toLocaleString()} miles`].filter(Boolean).join(" · "),
        mileage: v.mileageAtIntake,
        price: v.listingPriceGbp ? Math.round(v.listingPriceGbp / 100) : 0,
        monthlyEstimate: v.listingPriceGbp ? Math.round((v.listingPriceGbp / 100) / 60) : 0,
        // Vehicle details for the spec table
        details: {
          fuelType: labelize(v.fuelType),
          transmission: labelize(v.transmission),
          bodyType: labelize(v.bodyType),
          exteriorColour: v.exteriorColour ?? "—",
          owners: v.ownersCountAtIntake ?? null,
          conditionGrade: labelize(v.conditionGrade),
          serviceHistory: labelize(v.serviceHistoryType),
          hpiClear: v.hasHpiClear,
          location: v.consignment?.lot
            ? `${v.consignment.lot.name} · ${v.consignment.lot.city ?? ""}`.trim()
            : null,
        },
        photos: v.mediaFiles.map(m => ({
          url: m.cdnUrl,
          isPrimary: m.isPrimary,
          category: m.category,
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/vehicles/[id]]", error);
    return NextResponse.json({ error: "Failed to load vehicle" }, { status: 500 });
  }
}
