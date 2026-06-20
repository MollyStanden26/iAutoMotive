import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { isTelnyxConfigured, createCredentialToken } from "@/lib/telnyx/client";
import { ensureRepCredential, getRepCallerNumber } from "@/lib/telnyx/rep";

export const dynamic = "force-dynamic";

/**
 * GET /api/voice/token — mint a short-lived Telnyx WebRTC JWT for the signed-in
 * rep's softphone, plus the caller ID it should present.
 *
 * The browser calls this on connect and again to refresh before the JWT
 * expires. The API key and SIP password never leave the server.
 */
export async function GET(req: NextRequest) {
  // Only staff who actually dial. Super-admin/site-manager included for testing.
  const guard = await requireRole(req, ["super-admin", "site-manager", "sales"]);
  if (!guard.ok) return guard.response;

  if (!isTelnyxConfigured()) {
    return NextResponse.json(
      { error: "Voice is not configured", configured: false },
      { status: 503 }
    );
  }

  try {
    const { credentialId, sipUsername } = await ensureRepCredential(guard.user.id);
    const [token, callerNumber] = await Promise.all([
      createCredentialToken(credentialId),
      getRepCallerNumber(guard.user.id),
    ]);

    return NextResponse.json({
      configured: true,
      login_token: token,
      sipUsername,
      callerNumber,
      // Telnyx caps credential tokens at 24h; surface a conservative refresh
      // hint so the client re-mints well before expiry.
      refreshAfterSeconds: 12 * 60 * 60,
    });
  } catch (err) {
    console.error("[voice/token]", err);
    return NextResponse.json({ error: "Could not mint voice token" }, { status: 502 });
  }
}
