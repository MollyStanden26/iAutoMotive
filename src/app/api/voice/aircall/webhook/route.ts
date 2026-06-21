import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { CallStatus, CallDirection, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/voice/aircall/webhook — Aircall call-event sink.
 *
 * Logs inbound + outbound calls to CallSession (with a CallEvent audit trail).
 * Aircall calls are keyed by `aircall:<id>` stored in the provider-call-id
 * column (telnyx_call_control_id, reused provider-agnostically).
 *
 * Configure in Aircall → Integrations & API → Webhooks: point the URL here and
 * subscribe to the `call.*` events. Set a token there and mirror it in
 * AIRCALL_WEBHOOK_TOKEN so we can authenticate the traffic.
 */

interface AircallCall {
  id?: number;
  direction?: string;       // "inbound" | "outbound"
  status?: string;          // "initial" | "answered" | "done"
  started_at?: number;      // unix seconds
  answered_at?: number;
  ended_at?: number;
  duration?: number;        // seconds
  raw_digits?: string;      // the external party's number
  number?: { id?: number; digits?: string };
  user?: { id?: number; email?: string; name?: string };
}
interface AircallEvent { resource?: string; event?: string; token?: string; data?: AircallCall }

const STATUS_BY_EVENT: Record<string, CallStatus> = {
  "call.created": "initiated",
  "call.ringing_on_agent": "ringing",
  "call.agent_declined": "ringing",
  "call.answered": "answered",
  "call.ended": "completed",
  "call.hungup": "completed",
};

const tsToDate = (t?: number): Date | null => (t ? new Date(t * 1000) : null);
const onlyDigits = (s?: string): string => (s ?? "").replace(/\D/g, "");

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let event: AircallEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  // Authenticate: when a token is configured, the payload must carry it.
  // Unset → accept (unconfigured dev); documented to set it in production.
  const expected = process.env.AIRCALL_WEBHOOK_TOKEN;
  if (expected && event.token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const call = event.data;
  if (event.resource !== "call" || !call?.id) {
    return NextResponse.json({ ok: true }); // ack non-call events; don't retry
  }

  const providerId = `aircall:${call.id}`;
  const direction: CallDirection = call.direction === "inbound" ? "inbound" : "outbound";
  const external = call.raw_digits ?? "";
  const ours = call.number?.digits ?? "";
  const fromNumber = direction === "inbound" ? external : ours;
  const toNumber = direction === "inbound" ? ours : external;
  const status = STATUS_BY_EVENT[event.event ?? ""];

  try {
    // Resolve the rep (Aircall user email → our User) and the lead (external
    // number → Lead.sellerPhone, matched on the last 9 digits).
    const last9 = onlyDigits(external).slice(-9);
    const [rep, lead] = await Promise.all([
      call.user?.email
        ? prisma.user.findFirst({ where: { email: call.user.email }, select: { id: true } })
        : Promise.resolve(null),
      last9.length >= 7
        ? prisma.lead.findFirst({ where: { sellerPhone: { endsWith: last9 } }, select: { id: true } })
        : Promise.resolve(null),
    ]);

    const session = await prisma.callSession.upsert({
      where: { telnyxCallControlId: providerId },
      create: {
        telnyxCallControlId: providerId,
        direction,
        fromNumber,
        toNumber,
        status: status ?? "initiated",
        repId: rep?.id ?? null,
        entityType: lead ? "lead" : null,
        entityId: lead?.id ?? null,
        leadId: lead?.id ?? null,
        initiatedAt: tsToDate(call.started_at) ?? new Date(),
        answeredAt: tsToDate(call.answered_at),
        endedAt: tsToDate(call.ended_at),
        durationSeconds: call.duration ?? null,
      },
      update: {
        ...(status ? { status } : {}),
        ...(call.answered_at ? { answeredAt: tsToDate(call.answered_at) } : {}),
        ...(call.ended_at ? { endedAt: tsToDate(call.ended_at) } : {}),
        ...(call.duration != null ? { durationSeconds: call.duration } : {}),
        ...(rep?.id ? { repId: rep.id } : {}),
        ...(lead?.id ? { leadId: lead.id, entityType: "lead", entityId: lead.id } : {}),
      },
    });

    await prisma.callEvent.create({
      data: {
        callSessionId: session.id,
        telnyxEventType: event.event ?? "unknown",
        eventPayload: call as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    // Never 500 to Aircall for a logging hiccup — it would trigger retries.
    console.error("[aircall/webhook]", event.event, err);
  }

  return NextResponse.json({ ok: true });
}
