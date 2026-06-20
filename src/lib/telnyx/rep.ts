/**
 * Per-rep Telnyx wiring: maps a signed-in staff user to their WebRTC
 * telephony credential and their outbound caller ID (their assigned DID).
 *
 * Per-agent CLI is the modelled design: each `TelnyxPhoneNumber` row carries
 * `assignedTo → User`, so a rep's outbound calls present their own number and
 * inbound callbacks to that number can be routed back to them.
 */

import { prisma } from "@/lib/db/prisma";
import {
  createTelephonyCredential,
  getTelephonyCredential,
} from "./client";

export interface RepVoiceIdentity {
  credentialId: string;
  sipUsername: string;
  /** E.164 outbound caller ID — the rep's assigned DID, or the fallback. */
  callerNumber: string | null;
}

/**
 * Ensure the rep has a Telnyx telephony credential, creating + persisting one
 * on first use. Idempotent: re-uses the stored credential on subsequent calls.
 */
export async function ensureRepCredential(userId: string): Promise<{ credentialId: string; sipUsername: string }> {
  const staff = await prisma.staffProfile.findUnique({
    where: { userId },
    select: { id: true, telnyxCredentialId: true, telnyxSipUsername: true },
  });
  if (!staff) throw new Error("No staff profile for user");

  // Already provisioned.
  if (staff.telnyxCredentialId && staff.telnyxSipUsername) {
    return { credentialId: staff.telnyxCredentialId, sipUsername: staff.telnyxSipUsername };
  }

  // Credential exists but we lost the SIP username — recover it.
  if (staff.telnyxCredentialId && !staff.telnyxSipUsername) {
    const cred = await getTelephonyCredential(staff.telnyxCredentialId);
    await prisma.staffProfile.update({
      where: { id: staff.id },
      data: { telnyxSipUsername: cred.sip_username },
    });
    return { credentialId: cred.id, sipUsername: cred.sip_username };
  }

  // First time — create and persist.
  const cred = await createTelephonyCredential(`rep-${userId}`);
  await prisma.staffProfile.update({
    where: { id: staff.id },
    data: { telnyxCredentialId: cred.id, telnyxSipUsername: cred.sip_username },
  });
  return { credentialId: cred.id, sipUsername: cred.sip_username };
}

/**
 * The rep's outbound caller ID. Prefers their assigned voice-capable DID;
 * falls back to TELNYX_DEFAULT_CALLER_ID when none is assigned yet.
 */
export async function getRepCallerNumber(userId: string): Promise<string | null> {
  const own = await prisma.telnyxPhoneNumber.findFirst({
    where: { assignedTo: userId, isActive: true },
    select: { phoneNumber: true },
    orderBy: { createdAt: "asc" },
  });
  return own?.phoneNumber ?? process.env.TELNYX_DEFAULT_CALLER_ID ?? null;
}

/**
 * Reverse lookup for inbound routing: which rep owns a dialled DID.
 * Returns the rep's SIP username (to dial their softphone) or null.
 */
export async function findRepSipForDid(did: string): Promise<{ userId: string; sipUsername: string } | null> {
  const number = await prisma.telnyxPhoneNumber.findUnique({
    where: { phoneNumber: did },
    select: { assignedTo: true },
  });
  if (!number?.assignedTo) return null;

  const staff = await prisma.staffProfile.findUnique({
    where: { userId: number.assignedTo },
    select: { userId: true, telnyxSipUsername: true },
  });
  if (!staff?.telnyxSipUsername) return null;
  return { userId: staff.userId, sipUsername: staff.telnyxSipUsername };
}
