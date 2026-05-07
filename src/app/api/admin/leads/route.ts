import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Shape returned to admin clients. The first six fields match the `Lead`
 * interface in src/lib/admin/crm-mock-data.ts so the CRM LeadQueue can render
 * it directly. The structured fields below the divider are consumed by the
 * AddSellerDrawer (lead → seller conversion).
 */
interface CrmLeadRow {
  id: string;
  seller: string;
  vehicle: string;
  score: number;
  status: "new" | "contacted" | "negotiating" | "offer_sent" | "signed";
  assignee: string | null;
  lastContact: string | null;
  // Structured fields for seller conversion
  firstName: string;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  location: string | null;
  askingPriceGbp: number | null;
  // Raw DB status (used by sellers-management filters which speak in
  // pipeline-stage terms, not CRM display terms)
  rawStatus: string;
  ageLabel: string;
}

const CRM_DISPLAY_STATUS: Record<string, CrmLeadRow["status"]> = {
  new:          "new",
  contacted:    "contacted",
  negotiating:  "negotiating",
  offer_sent:   "offer_sent",
  accepted:     "signed",
  responded:    "contacted",
  escalated:    "negotiating",
};

function toCrmRow(lead: any): CrmLeadRow {
  const seller = [lead.sellerFirstName, lead.sellerLastName].filter(Boolean).join(" ") || "Unknown seller";
  const vehicleParts = [
    lead.vehicleYear,
    lead.vehicleMake,
    lead.vehicleModel,
    lead.vehicleTrim,
  ].filter(Boolean).join(" ");
  const askingPounds = lead.askingPriceGbp ? Math.round(lead.askingPriceGbp / 100) : null;
  const askingGbp = askingPounds ? `£${askingPounds.toLocaleString()}` : null;
  const mileage = lead.vehicleMileage ? `${Math.round(lead.vehicleMileage / 1000)}k mi` : null;
  const vehicle = [vehicleParts, askingGbp, mileage].filter(Boolean).join(" · ") || "—";
  return {
    id: lead.id,
    seller,
    vehicle,
    score: lead.scoutScore ?? 0,
    status: CRM_DISPLAY_STATUS[lead.status] ?? "new",
    assignee: lead.assignedRep
      ? [lead.assignedRep.staffProfile?.firstName, lead.assignedRep.staffProfile?.lastName]
          .filter(Boolean).join(" ") || lead.assignedRep.email
      : null,
    lastContact: null,
    firstName: lead.sellerFirstName ?? "",
    lastName: lead.sellerLastName ?? null,
    phone: lead.sellerPhone ?? null,
    email: lead.sellerEmail ?? null,
    vehicleMake: lead.vehicleMake ?? null,
    vehicleModel: lead.vehicleModel ?? null,
    vehicleYear: lead.vehicleYear ?? null,
    location: lead.locationPostcode ?? null,
    askingPriceGbp: askingPounds,
    rawStatus: lead.status,
    ageLabel: ageLabelFor(lead.importedAt),
  };
}

function ageLabelFor(date: Date | null | undefined): string {
  if (!date) return "—";
  const ms = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { importedAt: "desc" },
      take: 50,
      include: {
        assignedRep: {
          include: { staffProfile: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    return NextResponse.json({ leads: leads.map(toCrmRow) });
  } catch (error) {
    console.error("[GET /api/admin/leads]", error);
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName, lastName, phone, email,
      vehicleReg, vehicleYear, vehicleMake, vehicleModel, vehicleTrim, vehicleMileage,
      askingPriceGbp, locationPostcode, listingUrl, notes,
      autotraderListingId,
    } = body ?? {};

    if (!firstName || !phone) {
      return NextResponse.json({ error: "First name and phone are required" }, { status: 400 });
    }

    const toInt = (v: unknown): number | undefined => {
      if (v === undefined || v === null || v === "") return undefined;
      const n = parseInt(String(v), 10);
      return Number.isFinite(n) ? n : undefined;
    };

    const askingPence = toInt(askingPriceGbp);

    const lead = await prisma.lead.create({
      data: {
        autotraderListingId: autotraderListingId || null,
        sellerFirstName: firstName,
        sellerLastName: lastName || null,
        sellerPhone: phone,
        sellerEmail: email || null,
        vehicleReg: vehicleReg ? vehicleReg.toUpperCase() : null,
        vehicleYear: toInt(vehicleYear) ?? null,
        vehicleMake: vehicleMake || null,
        vehicleModel: vehicleModel || null,
        vehicleTrim: vehicleTrim || null,
        vehicleMileage: toInt(vehicleMileage) ?? null,
        askingPriceGbp: askingPence !== undefined ? askingPence * 100 : null,
        locationPostcode: locationPostcode || null,
        listingUrl: listingUrl || null,
        listingDescription: notes || null,
        status: "new",
      },
    });

    return NextResponse.json({ lead: toCrmRow(lead) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/leads]", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
