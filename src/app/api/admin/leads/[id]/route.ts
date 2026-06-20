import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";
import type { LeadPipelineStage, Prisma } from "@prisma/client";

const VALID_PIPELINE_STAGES: readonly LeadPipelineStage[] = [
  "new_lead", "contacted", "call_back", "contract_sent", "handover_scheduled", "collected",
];

type Tone = "good" | "warn" | "bad" | "neutral";
interface TimelineEntry {
  id: string;
  kind: "call" | "sms" | "outreach" | "offer";
  at: string;
  title: string;
  detail: string | null;
  tone: Tone;
}

const CALL_OUTCOME: Record<string, { label: string; tone: Tone }> = {
  connected_positive: { label: "connected — positive", tone: "good" },
  connected_neutral: { label: "connected", tone: "neutral" },
  connected_not_interested: { label: "not interested", tone: "bad" },
  voicemail_left: { label: "voicemail left", tone: "warn" },
  voicemail_not_left: { label: "no voicemail", tone: "warn" },
  no_answer: { label: "no answer", tone: "warn" },
  busy: { label: "busy", tone: "warn" },
  wrong_number: { label: "wrong number", tone: "bad" },
  callback_requested: { label: "callback requested", tone: "good" },
  converted: { label: "converted", tone: "good" },
};
const OUTREACH_OUTCOME: Record<string, Tone> = {
  connected: "good", interested: "good", callback_requested: "good",
  voicemail: "warn", no_answer: "warn",
  not_interested: "bad", wrong_number: "bad",
};
const OFFER_STATUS_TONE: Record<string, Tone> = {
  accepted: "good", pending: "neutral", countered: "warn", rejected: "bad", expired: "bad",
};

function fmtDuration(s: number | null | undefined): string {
  if (!s) return "";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function gbp(pence: number): string {
  return `£${Math.round(pence / 100).toLocaleString()}`;
}
function titleCase(s: string): string {
  return s.replace(/_/g, " ");
}

/**
 * GET /api/admin/leads/[id] — full lead detail + a merged, chronological
 * activity timeline (calls, SMS, logged outreach, offers). Built entirely from
 * records we already store. Sales reps can only read their own leads.
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(_request);
  if (!guard.ok) return guard.response;

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedRep: { include: { staffProfile: { select: { firstName: true, lastName: true } } } },
      callSessions: { orderBy: { initiatedAt: "desc" }, take: 25 },
      outreachLogs: { orderBy: { contactedAt: "desc" }, take: 25 },
      offers: { orderBy: { offeredAt: "desc" }, take: 10 },
      smsThreads: { include: { messages: { orderBy: { createdAt: "desc" }, take: 25 } } },
    },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (guard.user.role === "sales" && lead.assignedTo !== guard.user.id) {
    return NextResponse.json({ error: "Not your lead" }, { status: 403 });
  }

  const timeline: TimelineEntry[] = [];

  for (const c of lead.callSessions) {
    const oc = c.outcome ? CALL_OUTCOME[c.outcome] : null;
    const dir = c.direction === "inbound" ? "Call in" : "Call out";
    timeline.push({
      id: c.id, kind: "call",
      at: (c.initiatedAt ?? c.createdAt).toISOString(),
      title: `${dir}${oc ? ` · ${oc.label}` : ` · ${c.status}`}`,
      detail: [fmtDuration(c.durationSeconds), c.outcomeNotes, c.recordingAvailable ? "recording" : null].filter(Boolean).join(" · ") || null,
      tone: oc?.tone ?? "neutral",
    });
  }

  // Logged outreach not already represented by a call/SMS record (manual touches,
  // emails, and entries created via the Log-activity action).
  for (const o of lead.outreachLogs) {
    if (o.callSessionId || o.smsMessageId) continue;
    timeline.push({
      id: o.id, kind: "outreach",
      at: o.contactedAt.toISOString(),
      title: `${titleCase(o.contactMethod)} · ${titleCase(o.outcome)}`,
      detail: [o.notes, o.nextContactAt ? `callback ${o.nextContactAt.toISOString().slice(0, 10)}` : null].filter(Boolean).join(" · ") || null,
      tone: OUTREACH_OUTCOME[o.outcome] ?? "neutral",
    });
  }

  for (const t of lead.smsThreads) {
    for (const m of t.messages) {
      timeline.push({
        id: m.id, kind: "sms",
        at: (m.sentAt ?? m.createdAt).toISOString(),
        title: `SMS ${m.direction === "inbound" ? "received" : "sent"}`,
        detail: m.body?.slice(0, 120) ?? null,
        tone: "neutral",
      });
    }
  }

  for (const offer of lead.offers) {
    timeline.push({
      id: offer.id, kind: "offer",
      at: offer.offeredAt.toISOString(),
      title: `Offer ${titleCase(offer.offerType)} · ${gbp(offer.offeredPriceGbp)}`,
      detail: [titleCase(offer.status), offer.notes].filter(Boolean).join(" · ") || null,
      tone: OFFER_STATUS_TONE[offer.status] ?? "neutral",
    });
  }

  timeline.sort((a, b) => (a.at < b.at ? 1 : -1));

  const isAutoTrader = Boolean(lead.autotraderListingId) || /autotrader/i.test(lead.listingUrl ?? "");
  const repName = lead.assignedRep?.staffProfile
    ? `${lead.assignedRep.staffProfile.firstName} ${lead.assignedRep.staffProfile.lastName}`
    : lead.assignedRep?.email ?? null;

  return NextResponse.json({
    detail: {
      scoutScore: lead.scoutScore ?? 0,
      scoutTier: lead.scoutTier ?? null,
      status: lead.status,
      doNotCall: lead.doNotCall,
      doNotSms: lead.doNotSms,
      source: isAutoTrader ? "AutoTrader" : "Manual",
      listingUrl: lead.listingUrl ?? null,
      photos: Array.isArray(lead.scrapedImageUrls) ? (lead.scrapedImageUrls as string[]).slice(0, 8) : [],
      daysListedAtImport: lead.daysListedAtImport ?? null,
      importedAt: lead.importedAt.toISOString(),
      ownerName: repName,
      callCount: lead.callSessions.length,
      outreachCount: lead.outreachLogs.length,
    },
    timeline: timeline.slice(0, 30),
  });
}

/**
 * PATCH /api/admin/leads/[id] — update a lead.
 * Drag-drop sends { pipelineStage }; the drawer's edit form sends field updates.
 * Only the fields present in the body are written. Sales reps may only edit
 * leads assigned to them.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    select: { id: true, assignedTo: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  if (guard.user.role === "sales" && lead.assignedTo !== guard.user.id) {
    return NextResponse.json({ error: "Not your lead" }, { status: 403 });
  }

  const data: Prisma.LeadUpdateInput = {};

  if (body.pipelineStage !== undefined) {
    if (!VALID_PIPELINE_STAGES.includes(body.pipelineStage as LeadPipelineStage)) {
      return NextResponse.json({ error: "Invalid pipelineStage" }, { status: 400 });
    }
    data.pipelineStage = body.pipelineStage as LeadPipelineStage;
  }

  const str = (v: unknown) => (v === undefined ? undefined : (String(v).trim() || null));
  const toInt = (v: unknown): number | null | undefined => {
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  };

  if (body.firstName !== undefined) data.sellerFirstName = str(body.firstName);
  if (body.lastName !== undefined) data.sellerLastName = str(body.lastName);
  if (body.phone !== undefined) data.sellerPhone = str(body.phone);
  if (body.email !== undefined) data.sellerEmail = str(body.email);
  if (body.locationPostcode !== undefined) data.locationPostcode = str(body.locationPostcode);
  if (body.vehicleReg !== undefined) {
    const reg = str(body.vehicleReg);
    data.vehicleReg = reg ? reg.toUpperCase() : null;
  }
  if (body.vehicleMake !== undefined) data.vehicleMake = str(body.vehicleMake);
  if (body.vehicleModel !== undefined) data.vehicleModel = str(body.vehicleModel);
  if (body.vehicleTrim !== undefined) data.vehicleTrim = str(body.vehicleTrim);
  if (body.notes !== undefined) data.listingDescription = str(body.notes);
  if (body.vehicleYear !== undefined) data.vehicleYear = toInt(body.vehicleYear);
  if (body.vehicleMileage !== undefined) data.vehicleMileage = toInt(body.vehicleMileage);
  if (body.askingPriceGbp !== undefined) {
    const pounds = toInt(body.askingPriceGbp);
    data.askingPriceGbp = pounds === null || pounds === undefined ? null : pounds * 100;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await prisma.lead.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}
