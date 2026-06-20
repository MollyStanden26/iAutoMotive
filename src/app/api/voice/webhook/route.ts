import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyTelnyxSignature, isWebhookVerificationConfigured } from "@/lib/telnyx/webhook";
import type { CallStatus, CallDirection, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/voice/webhook — Telnyx call-event sink.
 *
 * Verifies the Ed25519 signature, appends the raw event to CallEvent (full
 * audit trail), and upserts the CallSession keyed by Telnyx's call_control_id.
 * Status + timestamps are advanced as the call progresses.
 *
 * Point the credential connection's and TeXML app's webhook URL here.
 */

// Telnyx event_type → our CallStatus. Events we don't map (e.g. dtmf, fork)
// are still logged to CallEvent but don't move the session state.
const STATUS_BY_EVENT: Record<string, CallStatus> = {
  "call.initiated": "initiated",
  "call.ringing": "ringing",
  "call.answered": "answered",
  "call.bridged": "answered",
  "call.hangup": "completed",
};

interface TelnyxEvent {
  data?: {
    event_type?: string;
    payload?: {
      call_control_id?: string;
      call_leg_id?: string;
      direction?: string;
      from?: string;
      to?: string;
      start_time?: string;
      hangup_cause?: string;
    };
  };
}

function toDirection(raw: string | undefined): CallDirection {
  // Telnyx reports direction from its own POV: "incoming" = inbound to us.
  return raw === "incoming" || raw === "inbound" ? "inbound" : "outbound";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Fail closed when verification is configured; in unconfigured dev we accept
  // (there's no public key to check against yet).
  if (isWebhookVerificationConfigured()) {
    const ok = verifyTelnyxSignature(
      rawBody,
      req.headers.get("telnyx-signature-ed25519"),
      req.headers.get("telnyx-timestamp")
    );
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: TelnyxEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const eventType = event.data?.event_type;
  const p = event.data?.payload;
  if (!eventType || !p?.call_control_id) {
    // Ack non-call events so Telnyx doesn't retry.
    return NextResponse.json({ ok: true });
  }

  try {
    // Ensure the CallSession exists, then log the event against it.
    const session = await prisma.callSession.upsert({
      where: { telnyxCallControlId: p.call_control_id },
      create: {
        telnyxCallControlId: p.call_control_id,
        telnyxCallLegId: p.call_leg_id ?? null,
        direction: toDirection(p.direction),
        fromNumber: p.from ?? "",
        toNumber: p.to ?? "",
        status: STATUS_BY_EVENT[eventType] ?? "initiated",
        initiatedAt: new Date(),
      },
      update: buildStatusUpdate(eventType),
    });

    await prisma.callEvent.create({
      data: {
        callSessionId: session.id,
        telnyxEventType: eventType,
        eventPayload: (p ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    // Never 500 to Telnyx for a logging hiccup — it would trigger retries.
    console.error("[voice/webhook]", eventType, err);
  }

  return NextResponse.json({ ok: true });
}

function buildStatusUpdate(eventType: string): Prisma.CallSessionUpdateInput {
  const now = new Date();
  switch (eventType) {
    case "call.ringing":
      return { status: "ringing", ringingAt: now };
    case "call.answered":
    case "call.bridged":
      return { status: "answered", answeredAt: now };
    case "call.hangup":
      return { status: "completed", endedAt: now };
    default:
      return {};
  }
}
