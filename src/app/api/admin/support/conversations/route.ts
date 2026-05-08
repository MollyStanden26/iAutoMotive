import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * GET — list every active support conversation, freshest first.
 *
 * For each row we attach the last message preview + the support-side unread
 * count so the inbox can render the "X unread" dot without a second fetch.
 */
export async function GET(req: NextRequest) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  try {
    const conversations = await prisma.supportConversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        seller: {
          include: {
            sellerProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (conversations.length === 0) return NextResponse.json({ conversations: [] });

    const ids = conversations.map(c => c.id);
    const lastMessages = await prisma.supportMessage.findMany({
      where: { conversationId: { in: ids } },
      orderBy: { createdAt: "desc" },
      // Up to 1 message per conversation; we de-dupe below.
    });
    const lastByConv = new Map<string, typeof lastMessages[number]>();
    for (const m of lastMessages) if (!lastByConv.has(m.conversationId)) lastByConv.set(m.conversationId, m);

    // Unread = seller messages newer than supportLastSeenAt
    const unreadCounts = new Map<string, number>();
    for (const conv of conversations) {
      const cutoff = conv.supportLastSeenAt ?? new Date(0);
      const count = await prisma.supportMessage.count({
        where: {
          conversationId: conv.id,
          author: "seller",
          createdAt: { gt: cutoff },
        },
      });
      unreadCounts.set(conv.id, count);
    }

    // Consignment.sellerId references SellerProfile.id (not User.id), so we
    // build a userId → sellerProfileId map then look up consignments by that.
    const profiles = await prisma.sellerProfile.findMany({
      where: { userId: { in: conversations.map(c => c.sellerId) } },
      select: { id: true, userId: true },
    });
    const profileIdByUserId = new Map(profiles.map(p => [p.userId, p.id]));

    const consignments = await prisma.consignment.findMany({
      where: { sellerId: { in: profiles.map(p => p.id) } },
      orderBy: { createdAt: "desc" },
      include: { vehicle: { select: { year: true, make: true, model: true } } },
    });
    const vehicleByProfileId = new Map<string, string>();
    for (const c of consignments) {
      if (!c.vehicle) continue;
      if (!vehicleByProfileId.has(c.sellerId)) {
        vehicleByProfileId.set(c.sellerId, `${c.vehicle.year} ${c.vehicle.make} ${c.vehicle.model}`);
      }
    }
    const vehicleBySeller = new Map<string, string>();
    for (const [userId, profileId] of profileIdByUserId) {
      const v = vehicleByProfileId.get(profileId);
      if (v) vehicleBySeller.set(userId, v);
    }

    const out = conversations.map(c => {
      const lm = lastByConv.get(c.id);
      const profile = c.seller.sellerProfile;
      const sellerName = profile
        ? `${profile.firstName} ${profile.lastName}`.trim() || c.seller.email
        : c.seller.email;
      return {
        id: c.id,
        sellerId: c.sellerId,
        sellerName,
        sellerEmail: c.seller.email,
        vehicle: vehicleBySeller.get(c.sellerId) ?? null,
        lastMessage: lm ? {
          author: lm.author,
          body: lm.body,
          createdAt: lm.createdAt.toISOString(),
        } : null,
        unread: unreadCounts.get(c.id) ?? 0,
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ conversations: out });
  } catch (error) {
    console.error("[GET /api/admin/support/conversations]", error);
    return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
  }
}
