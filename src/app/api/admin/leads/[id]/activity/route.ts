import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";
import type { ContactMethod, OutreachOutcome } from "@prisma/client";

const METHODS: readonly ContactMethod[] = ["phone_call", "sms", "email", "autotrader_form"];
const OUTCOMES: readonly OutreachOutcome[] = [
  "connected", "voicemail", "no_answer", "wrong_number", "callback_requested", "not_interested", "interested",
];

/**
 * POST /api/admin/leads/[id]/activity — log an outreach touch (call/SMS/email
 * disposition) against a lead. Writes a LeadOutreachLog so it appears in the
 * drawer's activity timeline. Sales reps may only log against their own leads.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  let body: { method?: string; outcome?: string; notes?: string; nextContactAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const method = (body.method ?? "phone_call") as ContactMethod;
  const outcome = body.outcome as OutreachOutcome;
  if (!METHODS.includes(method)) return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  if (!OUTCOMES.includes(outcome)) return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    select: { id: true, assignedTo: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (guard.user.role === "sales" && lead.assignedTo !== guard.user.id) {
    return NextResponse.json({ error: "Not your lead" }, { status: 403 });
  }

  let nextContactAt: Date | null = null;
  if (body.nextContactAt) {
    const d = new Date(body.nextContactAt);
    if (!Number.isNaN(d.getTime())) nextContactAt = d;
  }

  await prisma.leadOutreachLog.create({
    data: {
      leadId: params.id,
      staffId: guard.user.id,
      contactMethod: method,
      direction: "outbound",
      outcome,
      notes: body.notes?.trim() || null,
      nextContactAt,
    },
  });

  return NextResponse.json({ ok: true });
}
