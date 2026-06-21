/**
 * Aircall (Public API) client — our call provider.
 *
 * Aircall is a cloud phone system: the actual call audio happens in the rep's
 * Aircall app (desktop / web / mobile). We drive it through the Public API for:
 *   • click-to-dial — trigger an outbound call from the CRM. Aircall rings the
 *     rep's own Aircall phone first, then dials the lead.        → startOutboundCall
 *   • call logging  — a webhook posts call-lifecycle events.     → /api/voice/aircall/webhook
 *
 * Auth is HTTP Basic: the API ID is the username, the API token the password.
 * Credentials live in AIRCALL_API_ID / AIRCALL_API_TOKEN and are never committed.
 */

const BASE = "https://api.aircall.io/v1";

export class AircallError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AircallError";
    this.status = status;
  }
}

export function aircallConfigured(): boolean {
  return Boolean(process.env.AIRCALL_API_ID && process.env.AIRCALL_API_TOKEN);
}

function authHeader(): string {
  const id = process.env.AIRCALL_API_ID ?? "";
  const token = process.env.AIRCALL_API_TOKEN ?? "";
  return "Basic " + Buffer.from(`${id}:${token}`).toString("base64");
}

async function aircallFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!aircallConfigured()) throw new AircallError(503, "Aircall is not configured");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AircallError(res.status, body || res.statusText);
  }
  // 204 No Content (e.g. "start an outbound call") carries no body.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface AircallNumber { id: number; name: string; digits: string }
export interface AircallUser { id: number; name: string; email: string; available: boolean }

export async function pingAircall(): Promise<boolean> {
  try {
    const r = await aircallFetch<{ ping?: string }>("/ping");
    return r?.ping === "pong";
  } catch {
    return false;
  }
}

export async function listAircallNumbers(): Promise<AircallNumber[]> {
  const r = await aircallFetch<{ numbers?: AircallNumber[] }>("/numbers");
  return r.numbers ?? [];
}

export async function listAircallUsers(): Promise<AircallUser[]> {
  const r = await aircallFetch<{ users?: AircallUser[] }>("/users");
  return r.users ?? [];
}

/** Match a signed-in rep to their Aircall seat by email (case-insensitive). */
export async function findAircallUserByEmail(email: string): Promise<AircallUser | null> {
  const users = await listAircallUsers();
  return users.find(u => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

/** The Aircall number to present as caller ID (env override → first number). */
export async function resolveCallerNumberId(): Promise<number | null> {
  const envId = process.env.AIRCALL_NUMBER_ID;
  if (envId && Number.isFinite(Number(envId))) return Number(envId);
  const numbers = await listAircallNumbers();
  return numbers[0]?.id ?? null;
}

/**
 * Trigger an outbound call. Aircall rings the user's Aircall phone first, then
 * dials `to`. The user must be available on a connected Aircall phone, else
 * Aircall returns an error. Succeeds with 204 No Content.
 */
export async function startOutboundCall(opts: { userId: number; numberId: number; to: string }): Promise<void> {
  await aircallFetch<void>(`/users/${opts.userId}/calls`, {
    method: "POST",
    body: JSON.stringify({ number_id: opts.numberId, to: opts.to }),
  });
}

/** Best-effort E.164 normalisation (assumes UK for national-format numbers). */
export function toE164(raw: string): string {
  const s = raw.replace(/[^\d+]/g, "");
  if (s.startsWith("+")) return s;
  if (s.startsWith("00")) return "+" + s.slice(2);
  if (s.startsWith("0")) return "+44" + s.slice(1);
  if (s.startsWith("44")) return "+" + s;
  return "+" + s;
}
