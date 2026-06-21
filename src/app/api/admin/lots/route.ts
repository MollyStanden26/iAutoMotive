import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

/** GET /api/admin/lots — active lots (id + name) for selects, e.g. assigning a new staff member. */
export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
  try {
    const lots = await prisma.lot.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, city: true },
    });
    return NextResponse.json({ lots });
  } catch (error) {
    console.error("[GET /api/admin/lots]", error);
    return NextResponse.json({ error: "Failed to load lots" }, { status: 500 });
  }
}
