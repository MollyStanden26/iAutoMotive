import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { scrapeAutotraderListing, type ScrapedListing } from "@/lib/scrapers/autotrader";
import { requireStaff } from "@/lib/auth/require-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// AutoTrader pages can take 10–25s each to render in headless Chrome — bump
// the request timeout well above Next's default.
export const maxDuration = 300;

const PLACEHOLDER_PDF = Buffer.from(
  "%PDF-1.1\n%\xa5\xb1\xeb\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000105 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n158\n%%EOF\n",
  "binary"
);

const SLOT_ORDER = ["front_34", "rear", "interior", "driver_side", "dashboard"] as const;
const SLOT_TO_CATEGORY: Record<typeof SLOT_ORDER[number], string> = {
  front_34: "exterior_front_34",
  rear: "exterior_rear_34",
  interior: "interior_driver_seat",
  driver_side: "exterior_driver_side",
  dashboard: "dashboard",
};

const FUEL_MAP: Record<string, string> = {
  "petrol": "petrol",
  "diesel": "diesel",
  "electric": "electric",
  "hybrid": "hybrid",
  "petrol hybrid": "mild_hybrid",
  "diesel hybrid": "mild_hybrid",
  "petrol plug-in hybrid": "plugin_hybrid",
  "plug-in hybrid": "plugin_hybrid",
};
const BODY_MAP: Record<string, string> = {
  hatchback: "hatchback",
  saloon: "saloon",
  estate: "estate",
  suv: "suv",
  coupe: "coupe",
  convertible: "convertible",
  mpv: "mpv",
};

function mapFuel(label: string | null | undefined): string {
  if (!label) return "petrol";
  const lower = label.toLowerCase();
  // Sort longer keys first so "petrol plug-in hybrid" beats "petrol".
  for (const k of Object.keys(FUEL_MAP).sort((a, b) => b.length - a.length)) {
    if (lower.includes(k)) return FUEL_MAP[k];
  }
  return "petrol";
}
function mapBody(label: string | null | undefined): string {
  if (!label) return "suv";
  const lower = label.toLowerCase();
  for (const k of Object.keys(BODY_MAP)) if (lower.includes(k)) return BODY_MAP[k];
  return "suv";
}
function mapTransmission(label: string | null | undefined): string {
  if (!label) return "automatic";
  return /manual/i.test(label) ? "manual" : "automatic";
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Fake-but-stable UK reg derived from the AT listing ID. The dealer would
 *  supply the real registration when the car is collected. */
function regFromAtId(atId: string): string {
  const hex = crypto.createHash("md5").update(atId).digest("hex").toUpperCase();
  const L = (s: string) => (s.match(/[A-Z]/) ?? ["X"])[0];
  const D = (s: string) => (s.match(/[0-9]/) ?? ["0"])[0];
  return `${L(hex)}${L(hex.slice(2))}${D(hex.slice(4))}${D(hex.slice(6))}${L(hex.slice(8))}${L(hex.slice(10))}${L(hex.slice(12))}`;
}

async function getOrCreateLot() {
  const existing = await prisma.lot.findFirst({ where: { name: "Lot 1", city: "Birmingham" } });
  if (existing) return existing;
  return prisma.lot.create({ data: { name: "Lot 1", city: "Birmingham", capacityVehicles: 60 } });
}

async function downloadPhoto(url: string, dest: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://www.autotrader.co.uk/",
    },
  });
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function persistListing(scraped: ScrapedListing) {
  // Idempotency: if this AT listing was already imported and converted to a
  // vehicle, return the existing record instead of duplicating everything.
  const priorLead = await prisma.lead.findFirst({
    where: { autotraderListingId: scraped.atListingId, convertedToVehicleId: { not: null } },
    select: { id: true, convertedToVehicleId: true },
  });
  if (priorLead?.convertedToVehicleId) {
    const priorConsignment = await prisma.consignment.findUnique({
      where: { vehicleId: priorLead.convertedToVehicleId },
      select: { sellerId: true },
    });
    return {
      leadId: priorLead.id,
      sellerId: priorConsignment?.sellerId ?? undefined,
      vehicleId: priorLead.convertedToVehicleId,
      duplicate: true,
      title: `${scraped.year} ${scraped.make} ${scraped.model}`,
      photoCount: scraped.photos.length,
    };
  }

  const lot = await getOrCreateLot();

  const dealerName = scraped.dealer ?? "AutoTrader Dealer";
  const dealerSlug = slug(dealerName).slice(0, 40) || "dealer";
  const sellerEmail = `${dealerSlug}-${scraped.atListingId}@dealers.iautomotive.local`;

  // 1. Lead — denormalised vehicle + seller fields, status "accepted" so it
  //    drops out of the CRM lead queue immediately (it's already converted).
  const lead = await prisma.lead.create({
    data: {
      autotraderListingId: scraped.atListingId,
      listingUrl: scraped.url,
      sellerFirstName: dealerName,
      sellerLastName: null,
      sellerPhone: `+44${(parseInt(scraped.atListingId.slice(-9), 10) || 0).toString().padStart(9, "0").slice(0, 9)}`,
      sellerEmail,
      vehicleYear: scraped.year,
      vehicleMake: scraped.make,
      vehicleModel: scraped.model,
      vehicleTrim: scraped.trim,
      vehicleMileage: scraped.mileage,
      vehicleBodyType: scraped.bodyType,
      vehicleFuelType: scraped.fuelType,
      vehicleTransmission: scraped.transmission,
      askingPriceGbp: scraped.priceGbp ? scraped.priceGbp * 100 : null,
      locationPostcode: scraped.dealerLocation,
      listingDescription: scraped.description,
      status: "accepted",
    },
  });

  // 2. Seller (User + SellerProfile + placeholder consignment PDF).
  //    Reuse existing user if email collides (e.g. operator imports the same URL twice).
  const existingUser = await prisma.user.findUnique({ where: { email: sellerEmail } });
  let user = existingUser;
  if (!user) {
    const fileToken = crypto.randomBytes(12).toString("hex");
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "contracts");
    await mkdir(uploadsDir, { recursive: true });
    const fileName = `${fileToken}.pdf`;
    await writeFile(path.join(uploadsDir, fileName), PLACEHOLDER_PDF);
    const publicUrl = `/uploads/contracts/${fileName}`;

    const passwordHash = await bcrypt.hash("Welcome123!", 10);
    user = await prisma.user.create({
      data: {
        email: sellerEmail,
        phone: lead.sellerPhone,
        passwordHash,
        role: "seller",
        isActive: true,
        sellerProfile: {
          create: {
            firstName: dealerName,
            lastName: "Account",
            postcode: scraped.dealerLocation,
            source: "autotrader",
            consignmentAgreementUrl: publicUrl,
            consignmentAgreementName: "consignment-agreement-placeholder.pdf",
            consignmentAgreementUploadedAt: new Date(),
          },
        },
      },
    });
  }
  const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!sellerProfile) throw new Error("Seller profile creation failed");

  // 3. Vehicle: download photos to public/uploads, then create Vehicle + MediaFile + Consignment.
  if (scraped.photos.length < 5) {
    throw new Error(`Only ${scraped.photos.length} photos found — need 5 minimum`);
  }
  const reg = regFromAtId(scraped.atListingId);

  // If a vehicle with this reg already exists (re-import), bail.
  const existingVehicle = await prisma.vehicle.findUnique({ where: { registration: reg } });
  if (existingVehicle) {
    return {
      leadId: lead.id,
      sellerId: user.id,
      vehicleId: existingVehicle.id,
      duplicate: true,
      title: `${scraped.year} ${scraped.make} ${scraped.model}`,
      photoCount: scraped.photos.length,
    };
  }

  const token = crypto.randomBytes(8).toString("hex");
  const baseDir = path.join(process.cwd(), "public", "uploads", "vehicles", token);
  await mkdir(baseDir, { recursive: true });

  const slotPaths: Record<string, string> = {};
  for (let i = 0; i < SLOT_ORDER.length; i++) {
    const slot = SLOT_ORDER[i];
    const dest = path.join(baseDir, `${slot}.jpg`);
    await downloadPhoto(scraped.photos[i], dest);
    slotPaths[slot] = `/uploads/vehicles/${token}/${slot}.jpg`;
  }
  const extraPaths: string[] = [];
  for (let i = SLOT_ORDER.length; i < scraped.photos.length; i++) {
    const dest = path.join(baseDir, `extra-${i - SLOT_ORDER.length}.jpg`);
    await downloadPhoto(scraped.photos[i], dest);
    extraPaths.push(`/uploads/vehicles/${token}/extra-${i - SLOT_ORDER.length}.jpg`);
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      registration: reg,
      make: scraped.make ?? "Unknown",
      model: scraped.model ?? "Unknown",
      trim: scraped.trim,
      year: scraped.year ?? new Date().getFullYear(),
      mileageAtIntake: scraped.mileage ?? 0,
      fuelType: mapFuel(scraped.fuelType) as any,
      transmission: mapTransmission(scraped.transmission) as any,
      bodyType: mapBody(scraped.bodyType) as any,
      exteriorColour: scraped.exteriorColour,
      ownersCountAtIntake: 1,
      conditionGrade: "good",
      serviceHistoryType: "full",
      currentStage: "live",
      lotId: lot.id,
      listingPriceGbp: scraped.priceGbp ? scraped.priceGbp * 100 : 0,
      hasHpiClear: true,
      listedAt: new Date(),
    },
  });

  for (let i = 0; i < SLOT_ORDER.length; i++) {
    const slot = SLOT_ORDER[i];
    await prisma.mediaFile.create({
      data: {
        entityType: "vehicle",
        entityId: vehicle.id,
        category: SLOT_TO_CATEGORY[slot] as any,
        cdnUrl: slotPaths[slot],
        storageKey: slotPaths[slot],
        mimeType: "image/jpeg",
        isPrimary: slot === "front_34",
        sortOrder: i,
      },
    });
  }
  for (let i = 0; i < extraPaths.length; i++) {
    await prisma.mediaFile.create({
      data: {
        entityType: "vehicle",
        entityId: vehicle.id,
        category: "exterior_front_34" as any,
        cdnUrl: extraPaths[i],
        storageKey: extraPaths[i],
        mimeType: "image/jpeg",
        isPrimary: false,
        sortOrder: SLOT_ORDER.length + i,
      },
    });
  }

  await prisma.consignment.create({
    data: {
      leadId: lead.id,
      vehicleId: vehicle.id,
      sellerId: sellerProfile.id,
      lotId: lot.id,
      agreedListingPriceGbp: scraped.priceGbp ? scraped.priceGbp * 100 : 0,
      status: "listed",
      listedAt: new Date(),
    },
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { convertedToVehicleId: vehicle.id },
  });

  return {
    leadId: lead.id,
    sellerId: user.id,
    vehicleId: vehicle.id,
    duplicate: false,
    title: `${scraped.year} ${scraped.make} ${scraped.model}`,
    photoCount: scraped.photos.length,
  };
}

interface PerUrlResult {
  url: string;
  status: "created" | "duplicate" | "failed";
  error?: string;
  title?: string;
  vehicleId?: string;
  sellerId?: string;
  leadId?: string;
  photoCount?: number;
}

export async function POST(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
  try {
    const body = await request.json();
    const urls: unknown = body?.urls;
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "urls must be a non-empty array" }, { status: 400 });
    }
    const cleanUrls = urls
      .map(u => (typeof u === "string" ? u.trim() : ""))
      .filter(u => /^https:\/\/(www\.)?autotrader\.co\.uk\/car-details\/\d+/.test(u));

    if (cleanUrls.length === 0) {
      return NextResponse.json({ error: "No valid AutoTrader car-details URLs found" }, { status: 400 });
    }
    if (cleanUrls.length > 10) {
      return NextResponse.json({ error: "Maximum 10 URLs per batch" }, { status: 400 });
    }

    // Process sequentially — keeps load on AT light and avoids the "headless
    // Chrome stalls under parallelism" failure mode we'd otherwise hit.
    const results: PerUrlResult[] = [];
    for (const url of cleanUrls) {
      try {
        const scraped = await scrapeAutotraderListing(url);
        const persisted = await persistListing(scraped);
        results.push({
          url,
          status: persisted.duplicate ? "duplicate" : "created",
          title: persisted.title,
          vehicleId: persisted.vehicleId,
          sellerId: persisted.sellerId,
          leadId: persisted.leadId,
          photoCount: persisted.photoCount,
        });
      } catch (err) {
        results.push({
          url,
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[POST /api/admin/scraper/autotrader]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scraper failed" },
      { status: 500 }
    );
  }
}
