import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";
import type { LeadPipelineStage } from "@prisma/client";

const VALID_PIPELINE_STAGES: readonly LeadPipelineStage[] = [
  "new_lead", "contacted", "call_back", "contract_sent", "handover_scheduled", "collected",
];

/**
 * PATCH /api/admin/leads/[id] — update a lead's Kanban pipeline stage.
 *
 * Used by the CRM board's drag-and-drop. Sales reps may only move leads that
 * are assigned to them; admins/managers may move any lead.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  let body: { pipelineStage?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const stage = body.pipelineStage;
  if (!stage || !VALID_PIPELINE_STAGES.includes(stage as LeadPipelineStage)) {
    return NextResponse.json({ error: "Invalid pipelineStage" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    select: { id: true, assignedTo: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Reps can only move their own leads.
  if (guard.user.role === "sales" && lead.assignedTo !== guard.user.id) {
    return NextResponse.json({ error: "Not your lead" }, { status: 403 });
  }

  await prisma.lead.update({
    where: { id: params.id },
    data: { pipelineStage: stage as LeadPipelineStage },
  });

  return NextResponse.json({ ok: true, pipelineStage: stage });
}
