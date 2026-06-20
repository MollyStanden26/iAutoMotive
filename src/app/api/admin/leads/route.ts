import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

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
  // Sales Kanban stage — resolved (legacy null rows → "new_lead").
  pipelineStage: PipelineStage;
}

type PipelineStage =
  | "new_lead" | "contacted" | "call_back"
  | "contract_sent" | "handover_scheduled" | "collected";

const VALID_PIPELINE_STAGES: readonly PipelineStage[] = [
  "new_lead", "contacted", "call_back", "contract_sent", "handover_scheduled", "collected",
];

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
    pipelineStage: (lead.pipelineStage ?? "new_lead") as PipelineStage,
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

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
  try {
    // Sales reps only ever see their own pipeline: leads an admin assigned to
    // them, or leads they added themselves (the +Add Lead flow auto-assigns to
    // the creating rep). Admins/managers see the whole board.
    const where = guard.user.role === "sales" ? { assignedTo: guard.user.id } : {};

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { importedAt: "desc" },
      take: guard.user.role === "sales" ? 200 : 50,
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
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
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

    // A rep adding a lead owns it immediately — auto-assign so it lands in
    // their Kanban. Admins can leave it unassigned to route later.
    const isSales = guard.user.role === "sales";

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
        status: isSales ? "assigned" : "new",
        pipelineStage: "new_lead",
        assignedTo: isSales ? guard.user.id : null,
      },
    });

    return NextResponse.json({ lead: toCrmRow(lead) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/leads]", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
