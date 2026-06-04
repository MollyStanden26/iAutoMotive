import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * Public "leave us a message" endpoint for the marketing contact page.
 *
 *   POST /api/contact  { name, email, message, subject?, company? }
 *
 * Anonymous — no auth. Stores a ContactMessage that staff read + action from
 * /support/enquiries. This is the honest async alternative to a fake "live
 * agent": the message genuinely lands in a queue a real person works.
 *
 * Abuse hardening here is deliberately lightweight (honeypot + length caps +
 * email shape check). Anonymous public writes still want a real bot defence
 * (Cloudflare Turnstile / hCaptcha) before this sees heavy traffic — that's a
 * follow-up, noted in the PR.
 */

const MAX = { name: 120, email: 200, subject: 160, body: 4000 };

function isEmail(s: string): boolean {
  // Intentionally loose — just enough to reject obvious junk.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields humans never see. If "company" has a
  // value, silently accept (200) so the bot thinks it worked, but store nothing.
  if (typeof payload.company === "string" && payload.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
  const body = typeof payload.message === "string" ? payload.message.trim()
             : typeof payload.body === "string" ? payload.body.trim() : "";

  if (!name) return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  if (!email || !isEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!body) return NextResponse.json({ error: "Please enter a message." }, { status: 400 });

  if (name.length > MAX.name || email.length > MAX.email || subject.length > MAX.subject || body.length > MAX.body) {
    return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        body,
        source: "contact_page",
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
