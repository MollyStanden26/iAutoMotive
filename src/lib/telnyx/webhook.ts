/**
 * Telnyx webhook signature verification.
 *
 * Telnyx signs every webhook with Ed25519. Each request carries:
 *   • `telnyx-signature-ed25519` — base64 signature
 *   • `telnyx-timestamp`          — unix seconds
 * The signed message is `${timestamp}|${rawBody}`. The verifying key is the
 * account's Ed25519 public key (Mission Control → Account → Public Key),
 * supplied as base64 in TELNYX_PUBLIC_KEY.
 *
 * We verify with Node's built-in crypto (no extra deps): the 32-byte raw key
 * is wrapped in the standard Ed25519 SPKI prefix to build a KeyObject.
 */

import crypto from "node:crypto";

// DER prefix for an Ed25519 SubjectPublicKeyInfo wrapping a 32-byte raw key.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

// Reject webhooks older than this to blunt replay attacks.
const MAX_SKEW_SECONDS = 5 * 60;

function publicKeyObject(): crypto.KeyObject | null {
  const b64 = process.env.TELNYX_PUBLIC_KEY;
  if (!b64) return null;
  try {
    const raw = Buffer.from(b64, "base64");
    if (raw.length !== 32) return null;
    const spki = Buffer.concat([ED25519_SPKI_PREFIX, raw]);
    return crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  } catch {
    return null;
  }
}

/**
 * Verify a raw webhook body against its signature headers.
 *
 * Returns false on any problem (missing key, bad signature, stale timestamp).
 * When TELNYX_PUBLIC_KEY is unset we fail closed — callers should treat that
 * as "not configured" rather than silently trusting unsigned traffic.
 */
export function verifyTelnyxSignature(
  rawBody: string,
  signatureB64: string | null,
  timestamp: string | null
): boolean {
  if (!signatureB64 || !timestamp) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - ts);
  if (ageSeconds > MAX_SKEW_SECONDS) return false;

  const key = publicKeyObject();
  if (!key) return false;

  try {
    const signed = Buffer.from(`${timestamp}|${rawBody}`, "utf8");
    const signature = Buffer.from(signatureB64, "base64");
    return crypto.verify(null, signed, key, signature);
  } catch {
    return false;
  }
}

/** Whether webhook verification is configured at all. */
export function isWebhookVerificationConfigured(): boolean {
  return publicKeyObject() !== null;
}
