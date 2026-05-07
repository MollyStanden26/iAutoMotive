import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";

/**
 * List sellers for selection in admin drawers (Add vehicle, etc.).
 * Returns id + email + display name + source-lead vehicle data (so the
 * Add Vehicle drawer can pre-fill the form once a seller is picked).
 * Inactive users excluded.
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "seller", isActive: true },
      orderBy: { createdAt: "desc" },
      include: { sellerProfile: { select: { firstName: true, lastName: true } } },
    });

    // Lookup the source lead for each seller by email match. The lead carries
    // the vehicle info captured during acquisition.
    const emails = users.map(u => u.email);
    const sourceLeads = await prisma.lead.findMany({
      where: { sellerEmail: { in: emails } },
    });
    const leadByEmail = new Map<string, typeof sourceLeads[number]>();
    for (const l of sourceLeads) {
      const key = l.sellerEmail?.toLowerCase();
      if (!key) continue;
      // Prefer the most recent if multiple match
      const existing = leadByEmail.get(key);
      if (!existing || l.importedAt > existing.importedAt) leadByEmail.set(key, l);
    }

    const sellers = users.map(u => {
      const name = u.sellerProfile
        ? `${u.sellerProfile.firstName} ${u.sellerProfile.lastName}`.trim()
        : u.email.split("@")[0];
      const lead = leadByEmail.get(u.email.toLowerCase());
      const vehicle = lead ? {
        registration: lead.vehicleReg ?? "",
        year: lead.vehicleYear ?? null,
        make: lead.vehicleMake ?? "",
        model: lead.vehicleModel ?? "",
        trim: lead.vehicleTrim ?? "",
        mileage: lead.vehicleMileage ?? null,
        // schema stores in pence; expose as £ for the drawer
        askingPriceGbp: lead.askingPriceGbp != null ? Math.round(lead.askingPriceGbp / 100) : null,
        bodyType: lead.vehicleBodyType ?? "",
        fuelType: lead.vehicleFuelType ?? "",
        transmission: lead.vehicleTransmission ?? "",
        location: lead.locationPostcode ?? "",
      } : null;
      return { id: u.id, email: u.email, name, vehicle };
    });
    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("[GET /api/admin/sellers]", error);
    return NextResponse.json({ error: "Failed to load sellers" }, { status: 500 });
  }
}

/** 5MB cap on signed-agreement PDFs. */
const MAX_AGREEMENT_BYTES = 5 * 1024 * 1024;

/**
 * Convert a CRM lead into a Seller account.
 * Multipart-form payload:
 *   - JSON fields (leadId, firstName, lastName, email, phone, addressLine1, city,
 *     postcode, source, password, sendInviteEmail, requirePasswordChange)
 *   - `agreement`: signed consignment agreement PDF (required)
 *
 * Creates a User (role=seller, password hashed) + SellerProfile, persists the
 * uploaded agreement to public/uploads/contracts/, and marks the source Lead
 * as `accepted` so it drops out of the active acquisition pipeline.
 *
 * NOTE: filesystem persistence is dev-only — Vercel/serverless environments
 * lose writes between deployments. Swap to Cloudflare R2 / S3 for prod.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with 'agreement' file field" },
        { status: 415 }
      );
    }

    const formData = await request.formData();
    const get = (k: string) => {
      const v = formData.get(k);
      return typeof v === "string" ? v : "";
    };

    const leadId = get("leadId");
    const firstName = get("firstName");
    const lastName = get("lastName");
    const email = get("email").toLowerCase();
    const phone = get("phone");
    const addressLine1 = get("addressLine1");
    const city = get("city");
    const postcode = get("postcode");
    const source = get("source");
    const password = get("password");
    const agreement = formData.get("agreement");

    if (!leadId) return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    if (!firstName || !lastName) return NextResponse.json({ error: "First and last name are required" }, { status: 400 });
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    if (!(agreement instanceof File) || agreement.size === 0) {
      return NextResponse.json(
        { error: "Signed consignment agreement (PDF) is required" },
        { status: 400 }
      );
    }
    if (agreement.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Consignment agreement must be a PDF file" },
        { status: 400 }
      );
    }
    if (agreement.size > MAX_AGREEMENT_BYTES) {
      return NextResponse.json(
        { error: `PDF too large (max ${MAX_AGREEMENT_BYTES / 1024 / 1024}MB)` },
        { status: 413 }
      );
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ error: "Source lead not found" }, { status: 404 });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 }
      );
    }

    // Persist the PDF to public/uploads/contracts/<random>.pdf — served as
    // a static URL by Next.js. Replace with R2/S3 in prod.
    const fileToken = crypto.randomBytes(12).toString("hex");
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "contracts");
    await mkdir(uploadsDir, { recursive: true });
    const fileName = `${fileToken}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await agreement.arrayBuffer());
    await writeFile(filePath, buffer);
    const publicUrl = `/uploads/contracts/${fileName}`;

    const passwordHash = await bcrypt.hash(password, 10);

    const validSources = ["autotrader", "direct", "referral", "other"] as const;
    const sellerSource = (validSources as readonly string[]).includes(source)
      ? (source as typeof validSources[number])
      : "autotrader";

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        passwordHash,
        role: "seller",
        isActive: true,
        sellerProfile: {
          create: {
            firstName,
            lastName,
            addressLine1: addressLine1 || null,
            city: city || null,
            postcode: postcode || null,
            source: sellerSource,
            consignmentAgreementUrl: publicUrl,
            consignmentAgreementName: (agreement as File).name,
            consignmentAgreementUploadedAt: new Date(),
          },
        },
      },
      include: { sellerProfile: true },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "accepted" },
    });

    return NextResponse.json(
      {
        seller: {
          id: user.id,
          email: user.email,
          firstName: user.sellerProfile?.firstName,
          lastName: user.sellerProfile?.lastName,
          consignmentAgreementUrl: publicUrl,
          leadId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/sellers]", error);
    return NextResponse.json({ error: "Failed to create seller" }, { status: 500 });
  }
}
