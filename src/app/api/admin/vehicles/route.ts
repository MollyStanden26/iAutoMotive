import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

/** 8MB cap on each file. */
const MAX_FILE_BYTES = 8 * 1024 * 1024;

const REQUIRED_PHOTO_SLOTS = ["front_34", "rear", "interior", "driver_side", "dashboard"] as const;
type PhotoSlotKey = typeof REQUIRED_PHOTO_SLOTS[number];

const SLOT_TO_CATEGORY: Record<PhotoSlotKey, string> = {
  front_34:    "exterior_front_34",
  rear:        "exterior_rear_34",
  interior:    "interior_driver_seat",
  driver_side: "exterior_driver_side",
  dashboard:   "dashboard",
};

const REQUIRED_DOCS = [
  { key: "hpiCertificate",  type: "hpi_certificate",       title: "HPI check certificate" },
  { key: "conditionReport", type: "condition_report",      title: "Condition report" },
  { key: "v5cLogbook",      type: "v5c_logbook",           title: "V5C logbook" },
] as const;

const FUEL_TYPES   = ["petrol", "diesel", "hybrid", "plugin_hybrid", "electric", "mild_hybrid"] as const;
const TRANSMISSIONS = ["manual", "automatic", "semi_automatic", "cvt"] as const;
const BODY_TYPES   = ["hatchback", "saloon", "estate", "suv", "coupe", "convertible", "mpv", "pickup", "van"] as const;
const CONDITIONS   = ["excellent", "good", "fair", "below_average"] as const;
const SERVICE      = ["full", "partial", "none"] as const;
const STAGES       = [
  "offer_accepted", "collected", "inspecting", "in_mechanical",
  "in_body_paint", "in_detail", "in_photography", "listing_ready", "live",
] as const;

const LOT_DEFINITIONS: Record<string, { name: string; city: string; capacity: number }> = {
  "Lot 1 Birmingham": { name: "Lot 1", city: "Birmingham", capacity: 60 },
  "Lot 2 Manchester": { name: "Lot 2", city: "Manchester", capacity: 60 },
  "Lot 3 Bristol":    { name: "Lot 3", city: "Bristol",    capacity: 60 },
};

async function getOrCreateLot(label: string) {
  const def = LOT_DEFINITIONS[label] ?? LOT_DEFINITIONS["Lot 1 Birmingham"];
  const existing = await prisma.lot.findFirst({ where: { name: def.name, city: def.city } });
  if (existing) return existing;
  return prisma.lot.create({
    data: { name: def.name, city: def.city, capacityVehicles: def.capacity },
  });
}

function isAllowed<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
  return (allowed as readonly string[]).includes(value);
}

function ageLabel(date: Date | null | undefined): number {
  if (!date) return 0;
  const ms = Date.now() - new Date(date).getTime();
  return Math.max(Math.floor(ms / (24 * 60 * 60 * 1000)), 0);
}

const STAGE_TO_DISPLAY: Record<string, "live" | "recon" | "arrived" | "mech" | "photo" | "ready"> = {
  live: "live",
  listing_ready: "ready",
  in_photography: "photo",
  in_mechanical: "mech",
  in_body_paint: "recon",
  in_detail: "recon",
  inspecting: "recon",
  collected: "arrived",
  offer_accepted: "arrived",
  sale_agreed: "live",
  sold: "live",
};

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { lot: { select: { name: true, city: true } } },
    });

    const rows = vehicles.map(v => {
      const days = ageLabel(v.createdAt);
      const lotLabel = v.lot ? `${v.lot.name} ${v.lot.city}` : "Unassigned";
      return {
        id: v.id,
        vin: v.vin || v.registration,
        year: v.year,
        make: v.make,
        model: [v.model, v.trim].filter(Boolean).join(" "),
        days,
        stage: STAGE_TO_DISPLAY[v.currentStage] ?? "arrived",
        listPrice: v.listingPriceGbp ? Math.round(v.listingPriceGbp / 100) : 0,
        aiRecPrice: v.listingPriceGbp ? Math.round(v.listingPriceGbp / 100) : 0,
        aiAction: "—",
        aiActionClass: "ok",
        lot: v.lot ? v.lot.name : "—",
        risk: "low",
      };
    });
    return NextResponse.json({ vehicles: rows });
  } catch (error) {
    console.error("[GET /api/admin/vehicles]", error);
    return NextResponse.json({ error: "Failed to load vehicles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 415 }
      );
    }

    const form = await request.formData();
    const get = (k: string) => {
      const v = form.get(k);
      return typeof v === "string" ? v.trim() : "";
    };

    // Required scalars
    const sellerId        = get("sellerId");
    const registration    = get("registration").toUpperCase();
    const year            = parseInt(get("year"), 10);
    const make            = get("make");
    const model           = get("model");
    const mileage         = parseInt(get("mileage"), 10);
    const fuelType        = get("fuelType");
    const transmission    = get("transmission");
    const bodyType        = get("bodyType");
    const listingPricePounds = parseInt(get("listingPriceGbp"), 10);
    const lot             = get("lot");
    const stage           = get("stage");

    if (!sellerId)              return NextResponse.json({ error: "Seller is required" }, { status: 400 });
    if (!registration)          return NextResponse.json({ error: "Registration is required" }, { status: 400 });
    if (!Number.isFinite(year)) return NextResponse.json({ error: "Year is required" }, { status: 400 });
    if (!make || !model)        return NextResponse.json({ error: "Make and model are required" }, { status: 400 });
    if (!Number.isFinite(mileage)) return NextResponse.json({ error: "Mileage is required" }, { status: 400 });
    if (!Number.isFinite(listingPricePounds)) return NextResponse.json({ error: "Listing price is required" }, { status: 400 });
    if (!isAllowed(fuelType, FUEL_TYPES))         return NextResponse.json({ error: "Invalid fuel type" }, { status: 400 });
    if (!isAllowed(transmission, TRANSMISSIONS))  return NextResponse.json({ error: "Invalid gearbox" }, { status: 400 });
    if (!isAllowed(bodyType, BODY_TYPES))         return NextResponse.json({ error: "Invalid body type" }, { status: 400 });

    // Required photos: all 5 named slots
    const photoFiles: Record<PhotoSlotKey, File> = {} as Record<PhotoSlotKey, File>;
    for (const slot of REQUIRED_PHOTO_SLOTS) {
      const f = form.get(`photo_${slot}`);
      if (!(f instanceof File) || f.size === 0) {
        return NextResponse.json(
          { error: `Photo for "${slot.replace(/_/g, " ")}" is required` },
          { status: 400 }
        );
      }
      if (!f.type.startsWith("image/")) {
        return NextResponse.json({ error: `Photo for ${slot} must be an image file` }, { status: 400 });
      }
      if (f.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: `Photo for ${slot} too large (max 8MB)` }, { status: 413 });
      }
      photoFiles[slot] = f;
    }

    // Required documents
    const docFiles: Record<string, File> = {};
    for (const doc of REQUIRED_DOCS) {
      const f = form.get(doc.key);
      if (!(f instanceof File) || f.size === 0) {
        return NextResponse.json({ error: `${doc.title} (PDF) is required` }, { status: 400 });
      }
      if (f.type !== "application/pdf") {
        return NextResponse.json({ error: `${doc.title} must be a PDF` }, { status: 400 });
      }
      if (f.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: `${doc.title} too large (max 8MB)` }, { status: 413 });
      }
      docFiles[doc.key] = f;
    }

    // Optional extras
    const extraPhotos: File[] = [];
    for (const v of form.getAll("photo_extra")) {
      if (v instanceof File && v.size > 0 && v.type.startsWith("image/")) extraPhotos.push(v);
    }

    // Resolve seller
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: { sellerProfile: true },
    });
    if (!seller || seller.role !== "seller" || !seller.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Reject duplicate registration
    const existing = await prisma.vehicle.findUnique({ where: { registration } });
    if (existing) {
      return NextResponse.json(
        { error: `A vehicle with registration ${registration} already exists` },
        { status: 409 }
      );
    }

    const lotRecord = await getOrCreateLot(lot);

    // Persist files. In dev these go to public/uploads — swap to S3/R2 for prod.
    const token = crypto.randomBytes(8).toString("hex");
    const baseDir = path.join(process.cwd(), "public", "uploads", "vehicles", token);
    await mkdir(baseDir, { recursive: true });

    async function saveFile(file: File, subpath: string): Promise<string> {
      const fullPath = path.join(baseDir, subpath);
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));
      return `/uploads/vehicles/${token}/${subpath}`;
    }

    const slotUrls: Record<PhotoSlotKey, string> = {} as Record<PhotoSlotKey, string>;
    for (const slot of REQUIRED_PHOTO_SLOTS) {
      const file = photoFiles[slot];
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      slotUrls[slot] = await saveFile(file, `${slot}.${ext}`);
    }

    const extraUrls: { url: string; name: string; mime: string; size: number }[] = [];
    for (let i = 0; i < extraPhotos.length; i++) {
      const file = extraPhotos[i];
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      extraUrls.push({
        url: await saveFile(file, `extra-${i}.${ext}`),
        name: file.name,
        mime: file.type,
        size: file.size,
      });
    }

    const docUrls: Record<string, { url: string; size: number; mime: string; name: string }> = {};
    for (const doc of REQUIRED_DOCS) {
      const f = docFiles[doc.key];
      const url = await saveFile(f, `${doc.key}.pdf`);
      docUrls[doc.key] = { url, size: f.size, mime: f.type, name: f.name };
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registration,
        make,
        model: model,
        trim: get("trim") || null,
        year,
        mileageAtIntake: mileage,
        fuelType: fuelType as typeof FUEL_TYPES[number],
        transmission: transmission as typeof TRANSMISSIONS[number],
        bodyType: bodyType as typeof BODY_TYPES[number],
        exteriorColour: get("exteriorColour") || null,
        ownersCountAtIntake: parseInt(get("owners"), 10) || null,
        conditionGrade: isAllowed(get("conditionGrade"), CONDITIONS)
          ? (get("conditionGrade") as typeof CONDITIONS[number])
          : "good",
        serviceHistoryType: isAllowed(get("serviceHistory"), SERVICE)
          ? (get("serviceHistory") as typeof SERVICE[number])
          : "full",
        currentStage: isAllowed(stage, STAGES)
          ? (stage as typeof STAGES[number])
          : "offer_accepted",
        lotId: lotRecord.id,
        listingPriceGbp: listingPricePounds * 100, // pence
        floorPriceGbp: parseInt(get("floorPriceGbp"), 10) ? parseInt(get("floorPriceGbp"), 10) * 100 : null,
        hasHpiClear: form.get("hpiClear") === "true",
      },
    });

    // Photos
    for (const slot of REQUIRED_PHOTO_SLOTS) {
      const file = photoFiles[slot];
      await prisma.mediaFile.create({
        data: {
          entityType: "vehicle",
          entityId: vehicle.id,
          category: SLOT_TO_CATEGORY[slot] as any,
          cdnUrl: slotUrls[slot],
          storageKey: slotUrls[slot],
          mimeType: file.type,
          fileSizeBytes: file.size,
          isPrimary: slot === "front_34",
          sortOrder: REQUIRED_PHOTO_SLOTS.indexOf(slot),
        },
      });
    }
    for (let i = 0; i < extraUrls.length; i++) {
      const e = extraUrls[i];
      await prisma.mediaFile.create({
        data: {
          entityType: "vehicle",
          entityId: vehicle.id,
          category: "exterior_front_34",
          cdnUrl: e.url,
          storageKey: e.url,
          mimeType: e.mime,
          fileSizeBytes: e.size,
          isPrimary: false,
          sortOrder: REQUIRED_PHOTO_SLOTS.length + i,
        },
      });
    }

    // Documents (HPI / Condition / V5C)
    for (const doc of REQUIRED_DOCS) {
      const meta = docUrls[doc.key];
      await prisma.document.create({
        data: {
          entityType: "vehicle",
          entityId: vehicle.id,
          documentType: doc.type as any,
          title: doc.title,
          cdnUrl: meta.url,
          storageKey: meta.url,
          fileSizeBytes: meta.size,
        },
      });
    }

    // Consignment links seller ↔ vehicle ↔ lot
    await prisma.consignment.create({
      data: {
        vehicleId: vehicle.id,
        sellerId: seller.sellerProfile.id,
        lotId: lotRecord.id,
        agreedListingPriceGbp: listingPricePounds * 100,
        agreedFloorPriceGbp: parseInt(get("floorPriceGbp"), 10) ? parseInt(get("floorPriceGbp"), 10) * 100 : null,
        status: "pending_collection",
      },
    });

    return NextResponse.json({ vehicle: { id: vehicle.id, registration: vehicle.registration } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/vehicles]", error);
    const message = error instanceof Error ? error.message : "Failed to create vehicle";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
