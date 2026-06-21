import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-role";
import {
  aircallConfigured, findAircallUserByEmail, listAircallUsers,
  resolveCallerNumberId, startOutboundCall, toE164, AircallError,
} from "@/lib/voice/aircall";

export const dynamic = "force-dynamic";

/**
 * POST /api/voice/aircall/dial  { to: string }
 *
 * Click-to-dial via Aircall. Rings the signed-in rep's Aircall app, which then
 * dials `to`. The call audio happens in the Aircall app; the CRM just triggers
 * it. Logging arrives separately via /api/voice/aircall/webhook.
 */
export async function POST(req: NextRequest) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;

  if (!aircallConfigured()) {
    return NextResponse.json({ error: "Aircall is not configured" }, { status: 503 });
  }

  let body: { to?: string };
  try { body = await req.json(); } catch { body = {}; }
  const rawTo = (body.to ?? "").trim();
  if (!rawTo) return NextResponse.json({ error: "Missing number" }, { status: 400 });
  const to = toE164(rawTo);

  try {
    // Resolve the agent: match the signed-in rep to their Aircall seat by email.
    // Until every rep has their own seat, fall back to the first Aircall user.
    let user = await findAircallUserByEmail(guard.user.email);
    if (!user) {
      const all = await listAircallUsers();
      user = all[0] ?? null;
    }
    if (!user) return NextResponse.json({ error: "No Aircall user available" }, { status: 502 });

    const numberId = await resolveCallerNumberId();
    if (!numberId) return NextResponse.json({ error: "No Aircall number available" }, { status: 502 });

    await startOutboundCall({ userId: user.id, numberId, to });
    return NextResponse.json({ ok: true, to, agent: user.name });
  } catch (err) {
    if (err instanceof AircallError) {
      // e.g. the rep's Aircall phone isn't connected, or they're unavailable.
      console.error("[aircall/dial]", err.status, err.message);
      return NextResponse.json(
        {
          error: "Aircall couldn’t place the call. Open your Aircall app and make sure you’re available.",
          detail: err.message,
        },
        { status: 502 },
      );
    }
    console.error("[aircall/dial]", err);
    return NextResponse.json({ error: "Failed to start call" }, { status: 500 });
  }
}
