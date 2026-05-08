import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const MAX_BODY_LEN = 4000;
const SUPPORT_NAME = "Support";

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
 * GET — fetches one conversation's messages. `?since=<iso>` returns only
 * messages newer than the timestamp (for poll loops). Marks the support side
 * as caught up on every read.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conv = await prisma.supportConversation.findUnique({ where: { id: params.id } });
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

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

    await prisma.supportConversation.update({
      where: { id: conv.id },
      data: { supportLastSeenAt: new Date() },
    });

    return NextResponse.json({
      conversationId: conv.id,
      messages: shape(messages),
    });
  } catch (error) {
    console.error("[GET /api/admin/support/conversations/:id]", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

/** POST — sends a support agent reply. Body: `{ body, authorName? }`. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conv = await prisma.supportConversation.findUnique({ where: { id: params.id } });
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const json = await request.json().catch(() => ({}));
    const body = typeof json.body === "string" ? json.body.trim() : "";
    if (!body) return NextResponse.json({ error: "Body is required" }, { status: 400 });
    if (body.length > MAX_BODY_LEN) {
      return NextResponse.json({ error: `Message too long (max ${MAX_BODY_LEN} chars)` }, { status: 413 });
    }

    const authorName = typeof json.authorName === "string" && json.authorName.trim()
      ? json.authorName.trim().slice(0, 80)
      : SUPPORT_NAME;

    const message = await prisma.supportMessage.create({
      data: {
        conversationId: conv.id,
        author: "support",
        authorName,
        body,
      },
    });

    await prisma.supportConversation.update({
      where: { id: conv.id },
      data: { supportLastSeenAt: new Date(), updatedAt: new Date() },
    });

    return NextResponse.json({ message: shape([message])[0] }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/support/conversations/:id]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
