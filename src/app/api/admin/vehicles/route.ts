import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";
import { saveUpload } from "@/lib/storage/upload";

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
  "Lot 1 Beaumont House": { name: "Lot 1", city: "Beaumont House", capacity: 60 },
  "Lot 2 Manchester":     { name: "Lot 2", city: "Manchester",     capacity: 60 },
  "Lot 3 Bristol":        { name: "Lot 3", city: "Bristol",        capacity: 60 },
};

async function getOrCreateLot(label: string) {
  const def = LOT_DEFINITIONS[label] ?? LOT_DEFINITIONS["Lot 1 Beaumont House"];
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

// ────────────────────────────────────────────────────────────────────────────
// Intake normalisation
//
// Two request shapes converge into the same NormalizedIntake object so the
// DB-writing logic below has a single code path:
//
//   • application/json   — files were uploaded straight to Vercel Blob from
//                          the browser; the body carries the resulting URLs.
//                          This is what unblocks the 413 in prod (Vercel's
//                          serverless body cap is ~4.5 MB, can't be raised).
//
//   • multipart/form-data — files arrive in the request body. Used by local
//                          dev where there's no body-size limit.
// ────────────────────────────────────────────────────────────────────────────

class IntakeError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type IntakeMeta = { url: string; name: string; mime: string; size: number };

interface NormalizedIntake {
  get: (k: string) => string;
  photos: Record<PhotoSlotKey, IntakeMeta>;
  extras: IntakeMeta[];
  docs: Record<string, IntakeMeta>;
  hpiClear: boolean;
}

/** Match the URLs that Vercel Blob's `put()` and client `upload()` return. */
const BLOB_URL_RE = /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\/vehicles\//i;

async function parseIntake(request: NextRequest): Promise<NormalizedIntake> {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) return parseJsonIntake(request);
  if (ct.includes("multipart/form-data")) return parseMultipartIntake(request);
  throw new IntakeError(415, "Expected multipart/form-data or application/json");
}

async function parseMultipartIntake(request: NextRequest): Promise<NormalizedIntake> {
  const form = await request.formData();
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v.trim() : "";
  };

  const token = crypto.randomBytes(8).toString("hex");
  const saveFile = (file: File, subpath: string) =>
    saveUpload(file, `vehicles/${token}/${subpath}`);

  const photos: Record<PhotoSlotKey, IntakeMeta> = {} as Record<PhotoSlotKey, IntakeMeta>;
  for (const slot of REQUIRED_PHOTO_SLOTS) {
    const f = form.get(`photo_${slot}`);
    if (!(f instanceof File) || f.size === 0) {
      throw new IntakeError(400, `Photo for "${slot.replace(/_/g, " ")}" is required`);
    }
    if (!f.type.startsWith("image/")) {
      throw new IntakeError(400, `Photo for ${slot} must be an image file`);
    }
    if (f.size > MAX_FILE_BYTES) {
      throw new IntakeError(413, `Photo for ${slot} too large (max 8MB)`);
    }
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const url = await saveFile(f, `${slot}.${ext}`);
    photos[slot] = { url, name: f.name, mime: f.type, size: f.size };
  }

  const docs: Record<string, IntakeMeta> = {};
  for (const doc of REQUIRED_DOCS) {
    const f = form.get(doc.key);
    if (!(f instanceof File) || f.size === 0) {
      throw new IntakeError(400, `${doc.title} (PDF) is required`);
    }
    if (f.type !== "application/pdf") {
      throw new IntakeError(400, `${doc.title} must be a PDF`);
    }
    if (f.size > MAX_FILE_BYTES) {
      throw new IntakeError(413, `${doc.title} too large (max 8MB)`);
    }
    const url = await saveFile(f, `${doc.key}.pdf`);
    docs[doc.key] = { url, name: f.name, mime: f.type, size: f.size };
  }

  const extras: IntakeMeta[] = [];
  let i = 0;
  for (const v of form.getAll("photo_extra")) {
    if (!(v instanceof File) || v.size === 0 || !v.type.startsWith("image/")) continue;
    if (v.size > MAX_FILE_BYTES) {
      throw new IntakeError(413, `Extra photo "${v.name}" too large (max 8MB)`);
    }
    const ext = (v.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const url = await saveFile(v, `extra-${i}.${ext}`);
    extras.push({ url, name: v.name, mime: v.type, size: v.size });
    i++;
  }

  return { get, photos, extras, docs, hpiClear: form.get("hpiClear") === "true" };
}

async function parseJsonIntake(request: NextRequest): Promise<NormalizedIntake> {
  const body = await request.json() as {
    fields?: Record<string, string | undefined>;
    photos?: Partial<Record<PhotoSlotKey, IntakeMeta>>;
    extraPhotos?: IntakeMeta[];
    docs?: Record<string, IntakeMeta>;
  };
  const fields = body.fields ?? {};
  const get = (k: string) => {
    const v = fields[k];
    return typeof v === "string" ? v.trim() : "";
  };

  const isValidBlobUrl = (u: unknown): u is string =>
    typeof u === "string" && BLOB_URL_RE.test(u);

  const validateMeta = (
    m: IntakeMeta | undefined,
    label: string,
    mimeCheck: (mime: string) => boolean,
    mimeExpected: string
  ): IntakeMeta => {
    if (!m) throw new IntakeError(400, `${label} is required`);
    if (!isValidBlobUrl(m.url)) throw new IntakeError(400, `${label} URL is not a recognised Blob URL`);
    if (typeof m.size !== "number" || m.size <= 0) throw new IntakeError(400, `${label} size is invalid`);
    if (m.size > MAX_FILE_BYTES) throw new IntakeError(413, `${label} too large (max 8MB)`);
    if (typeof m.mime !== "string" || !mimeCheck(m.mime)) throw new IntakeError(400, `${label} must be ${mimeExpected}`);
    return { url: m.url, name: String(m.name ?? ""), mime: m.mime, size: m.size };
  };

  const photos: Record<PhotoSlotKey, IntakeMeta> = {} as Record<PhotoSlotKey, IntakeMeta>;
  for (const slot of REQUIRED_PHOTO_SLOTS) {
    photos[slot] = validateMeta(
      body.photos?.[slot],
      `Photo for "${slot.replace(/_/g, " ")}"`,
      (mime) => mime.startsWith("image/"),
      "an image"
    );
  }

  const docs: Record<string, IntakeMeta> = {};
  for (const doc of REQUIRED_DOCS) {
    docs[doc.key] = validateMeta(
      body.docs?.[doc.key],
      doc.title,
      (mime) => mime === "application/pdf",
      "a PDF"
    );
  }

  const extras: IntakeMeta[] = [];
  for (const e of body.extraPhotos ?? []) {
    if (!e || !isValidBlobUrl(e.url) || typeof e.size !== "number" || e.size <= 0) continue;
    if (typeof e.mime !== "string" || !e.mime.startsWith("image/")) continue;
    if (e.size > MAX_FILE_BYTES) {
      throw new IntakeError(413, `Extra photo "${e.name ?? ""}" too large (max 8MB)`);
    }
    extras.push({ url: e.url, name: String(e.name ?? "extra"), mime: e.mime, size: e.size });
  }

  return { get, photos, extras, docs, hpiClear: get("hpiClear") === "true" };
}

export async function POST(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
  try {
    const intake = await parseIntake(request);
    const { get, photos, extras, docs, hpiClear } = intake;

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
        hasHpiClear: hpiClear,
      },
    });

    // Photos
    for (const slot of REQUIRED_PHOTO_SLOTS) {
      const meta = photos[slot];
      await prisma.mediaFile.create({
        data: {
          entityType: "vehicle",
          entityId: vehicle.id,
          category: SLOT_TO_CATEGORY[slot] as any,
          cdnUrl: meta.url,
          storageKey: meta.url,
          mimeType: meta.mime,
          fileSizeBytes: meta.size,
          isPrimary: slot === "front_34",
          sortOrder: REQUIRED_PHOTO_SLOTS.indexOf(slot),
        },
      });
    }
    for (let i = 0; i < extras.length; i++) {
      const e = extras[i];
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
      const meta = docs[doc.key];
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
    if (error instanceof IntakeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/admin/vehicles]", error);
    const message = error instanceof Error ? error.message : "Failed to create vehicle";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
