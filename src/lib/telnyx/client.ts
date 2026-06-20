/**
 * Telnyx server-side client.
 *
 * We deliberately use the bare REST API over `fetch` rather than the heavy
 * `telnyx` Node SDK: the CRM dialler only needs a handful of endpoints
 * (create a per-rep telephony credential, mint a short-lived WebRTC JWT) plus
 * Ed25519 webhook verification, and the v6 SDK pulls a large surface (and a
 * broken optional `ws` import) we don't want in the Next bundle.
 *
 * Architecture (see src/lib/telnyx/README intent / settings page):
 *   • One WebRTC **SIP Credential Connection** (TELNYX_CONNECTION_ID) that all
 *     rep softphones register against. Outbound is routed/billed by the
 *     Outbound Voice Profile attached to that connection in the portal.
 *   • Each rep gets one **telephony credential** under that connection. Its
 *     SIP username is addressable for inbound, so a customer calling the rep's
 *     DID can be dialled straight to that rep's registered browser.
 *   • The browser authenticates with a **JWT** minted from the credential
 *     (24h max; we mint short and refresh client-side).
 */

const TELNYX_API_BASE = "https://api.telnyx.com/v2";

export interface TelnyxCredential {
  id: string;
  sip_username: string;
  sip_password: string;
  connection_id: string;
  name: string;
}

/** True when the integration is configured enough to mint tokens. */
export function isTelnyxConfigured(): boolean {
  return Boolean(process.env.TELNYX_API_KEY && process.env.TELNYX_CONNECTION_ID);
}

function apiKey(): string {
  const key = process.env.TELNYX_API_KEY;
  if (!key) throw new Error("TELNYX_API_KEY is not set");
  return key;
}

async function telnyxFetch<T>(
  path: string,
  init: RequestInit & { rawText?: boolean } = {}
): Promise<T> {
  const res = await fetch(`${TELNYX_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    // Telnyx provisioning calls must never be edge-cached.
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telnyx ${init.method ?? "GET"} ${path} → ${res.status}: ${body.slice(0, 300)}`);
  }

  if (init.rawText) return (await res.text()) as unknown as T;
  return (await res.json()) as T;
}

/**
 * Create a telephony credential under the WebRTC credential connection.
 * `name` should be stable per rep (e.g. `rep-<userId>`) so it's findable.
 */
export async function createTelephonyCredential(name: string): Promise<TelnyxCredential> {
  const connectionId = process.env.TELNYX_CONNECTION_ID;
  if (!connectionId) throw new Error("TELNYX_CONNECTION_ID is not set");

  const json = await telnyxFetch<{ data: TelnyxCredential }>("/telephony_credentials", {
    method: "POST",
    body: JSON.stringify({ connection_id: connectionId, name }),
  });
  return json.data;
}

/** Fetch a credential by id (used to recover the SIP username if missing). */
export async function getTelephonyCredential(id: string): Promise<TelnyxCredential> {
  const json = await telnyxFetch<{ data: TelnyxCredential }>(`/telephony_credentials/${id}`);
  return json.data;
}

/**
 * Mint a short-lived WebRTC access token (JWT) for a credential. Telnyx caps
 * these at 24h; the browser client refreshes well before expiry. The endpoint
 * returns the raw JWT as text/plain, not JSON.
 */
export async function createCredentialToken(credentialId: string): Promise<string> {
  const token = await telnyxFetch<string>(`/telephony_credentials/${credentialId}/token`, {
    method: "POST",
    rawText: true,
  });
  return token.trim();
}
