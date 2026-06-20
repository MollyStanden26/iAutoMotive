import { NextRequest } from "next/server";
import { findRepSipForDid } from "@/lib/telnyx/rep";

export const dynamic = "force-dynamic";

/**
 * POST /api/voice/texml/inbound — TeXML for inbound calls to a rep's DID.
 *
 * This is the per-agent callback routing: a customer ringing a rep's assigned
 * number is dialled straight to that rep's registered WebRTC softphone via the
 * SIP username on their telephony credential. If the number isn't assigned to a
 * reachable rep, we fall back to a spoken message (swap for voicemail / a hunt
 * group once that's specced).
 *
 * Assign the rep DIDs to a TeXML Application whose Voice URL points here.
 * Telnyx POSTs form-encoded call params (To, From, CallSid, …).
 */

function texml(body: string): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, c =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string)
  );
}

export async function POST(req: NextRequest) {
  let to = "";
  let from = "";
  try {
    const form = await req.formData();
    to = String(form.get("To") ?? "");
    from = String(form.get("From") ?? "");
  } catch {
    // Some Telnyx configs send JSON; tolerate either.
    try {
      const json = await req.json();
      to = json?.To ?? json?.data?.payload?.to ?? "";
      from = json?.From ?? json?.data?.payload?.from ?? "";
    } catch {
      /* fall through to no-rep branch */
    }
  }

  const rep = to ? await findRepSipForDid(to) : null;

  if (!rep) {
    return texml(
      `<Say voice="Polly.Amy">Sorry, we can't connect your call right now. Please try again later.</Say><Hangup/>`
    );
  }

  // Dial the rep's WebRTC client. callerId preserves the customer's number so
  // it shows on the rep's softphone; timeout falls through to the message if
  // the rep isn't registered / doesn't answer.
  const callerId = from ? ` callerId="${escapeXml(from)}"` : "";
  return texml(
    `<Dial timeout="25"${callerId}>` +
      `<Sip>sip:${escapeXml(rep.sipUsername)}@sip.telnyx.com</Sip>` +
      `</Dial>` +
      `<Say voice="Polly.Amy">The person you are calling is unavailable. Please try again later.</Say>`
  );
}
