import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/**
 * GET — list public contact-page enquiries for staff, newest first.
 * Optional `?status=new|read|archived` filter. Also returns the count of
 * unread ("new") enquiries for the sidebar badge.
 */
export async function GET(req: NextRequest) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const valid = ["new", "read", "archived"] as const;
    const where = valid.includes(status as (typeof valid)[number])
      ? { status: status as (typeof valid)[number] }
      : {};

    const [messages, newCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.contactMessage.count({ where: { status: "new" } }),
    ]);

    return NextResponse.json({
      newCount,
      messages: messages.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        body: m.body,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/support/enquiries]", error);
    return NextResponse.json({ error: "Failed to load enquiries" }, { status: 500 });
  }
}
