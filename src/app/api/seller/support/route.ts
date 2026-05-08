import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const MAX_BODY_LEN = 4000;

async function resolveSeller(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload || payload.role !== "seller") return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub as string },
    include: { sellerProfile: true },
  });
  if (!user || user.role !== "seller") return null;
  return user;
}

/** Looks up (or lazily creates) the seller's single support conversation. */
async function getOrCreateConversation(sellerId: string) {
  const existing = await prisma.supportConversation.findUnique({
    where: { sellerId },
  });
  if (existing) return existing;
  return prisma.supportConversation.create({ data: { sellerId } });
}

function shape(messages: { id: string; author: string; authorName: string; body: string; createdAt: Date }[]) {
  return messages.map(m => ({
    id: m.id,
    author: m.author,
    authorName: m.authorName,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));
}

/**
 * GET — fetches messages for the current seller. Pass `?since=<iso>` to only
 * return messages strictly newer than the timestamp (used by polling clients
 * to avoid downloading the full history every tick).
 *
 * Side effect: bumps `sellerLastSeenAt` so the support-side unread count drops.
 */
export async function GET(request: NextRequest) {
  try {
    const seller = await resolveSeller(request);
    if (!seller) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const conv = await getOrCreateConversation(seller.id);
    const url = new URL(request.url);
    const since = url.searchParams.get("since");

    const where: { conversationId: string; createdAt?: { gt: Date } } = { conversationId: conv.id };
    if (since) {
      const sinceDate = new Date(since);
      if (!Number.isNaN(sinceDate.getTime())) where.createdAt = { gt: sinceDate };
    }

    const messages = await prisma.supportMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    // Mark the seller as caught up.
    await prisma.supportConversation.update({
      where: { id: conv.id },
      data: { sellerLastSeenAt: new Date() },
    });

    return NextResponse.json({
      conversationId: conv.id,
      messages: shape(messages),
    });
  } catch (error) {
    console.error("[GET /api/seller/support]", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

/** POST — sends a message from the current seller. Body: `{ body: string }`. */
export async function POST(request: NextRequest) {
  try {
    const seller = await resolveSeller(request);
    if (!seller) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const json = await request.json().catch(() => ({}));
    const body = typeof json.body === "string" ? json.body.trim() : "";
    if (!body) return NextResponse.json({ error: "Body is required" }, { status: 400 });
    if (body.length > MAX_BODY_LEN) {
      return NextResponse.json({ error: `Message too long (max ${MAX_BODY_LEN} chars)` }, { status: 413 });
    }

    const conv = await getOrCreateConversation(seller.id);
    const profile = seller.sellerProfile;
    const authorName = profile
      ? `${profile.firstName} ${profile.lastName}`.trim() || seller.email
      : seller.email;

    const message = await prisma.supportMessage.create({
      data: {
        conversationId: conv.id,
        author: "seller",
        authorName,
        body,
      },
    });

    // Bumping updatedAt makes the support-side conversations list re-sort
    // with this thread at the top. Also bumps sellerLastSeenAt so the seller
    // immediately sees their own message as "read".
    await prisma.supportConversation.update({
      where: { id: conv.id },
      data: { sellerLastSeenAt: new Date(), updatedAt: new Date() },
    });

    return NextResponse.json({ message: shape([message])[0] }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/seller/support]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
