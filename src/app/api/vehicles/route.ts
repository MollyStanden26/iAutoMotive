import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Force a DB read on every request. Without this Vercel edge-caches the
// response indefinitely (we just hit a 92-minute-old payload), so admin
// changes to inventory or freshly-composited photos don't surface to
// buyers until a deploy or cache purge.
export const dynamic = "force-dynamic";

/**
 * Public buyer-facing vehicle listing. Hides only terminal stages
 * (sold / returned / withdrawn) — every other vehicle shows up so the
 * public catalogue stays in sync with admin inventory.
 */
const HIDDEN_STAGES = ["sold", "returned", "withdrawn"] as const;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { currentStage: { notIn: HIDDEN_STAGES as unknown as string[] as any } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        mediaFiles: {
          where: { isPrimary: true },
          take: 1,
          select: { cdnUrl: true },
        },
      },
    });

    const cars = vehicles.map(v => {
      const titleSlug = slugify(`${v.year}-${v.make}-${v.model}-${v.trim ?? ""}`);
      return {
        id: v.id,
        slug: titleSlug,
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim ?? "",
        mileage: `${Math.round(v.mileageAtIntake / 1000)}k`,
        // Filter-friendly numeric variant. Card UI keeps the "13k" string above.
        mileageNumeric: v.mileageAtIntake,
        price: v.listingPriceGbp ? Math.round(v.listingPriceGbp / 100) : 0,
        monthlyEstimate: v.listingPriceGbp ? Math.round((v.listingPriceGbp / 100) / 60) : 0,
        imageUrl: v.mediaFiles[0]?.cdnUrl,
        bodyType: v.bodyType,             // schema enum: hatchback/saloon/suv/...
        fuelType: v.fuelType,             // petrol/diesel/electric/hybrid/...
        transmission: v.transmission,     // automatic/manual/...
        exteriorColour: v.exteriorColour, // free-text — capitalised at display
      };
    });

    return NextResponse.json({ cars });
  } catch (error) {
    console.error("[GET /api/vehicles]", error);
    return NextResponse.json({ error: "Failed to load vehicles" }, { status: 500 });
  }
}
