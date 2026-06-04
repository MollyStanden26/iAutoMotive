import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["new", "read", "archived"] as const;
type Status = (typeof VALID_STATUS)[number];

/** PATCH — update an enquiry's status (mark read / archived / back to new). */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  try {
    const body = await req.json().catch(() => ({}));
    const status = body?.status;
    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUS.join(", ")}` },
        { status: 400 }
      );
    }
    const existing = await prisma.contactMessage.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status: status as Status },
    });
    return NextResponse.json({ ok: true, id: updated.id, status: updated.status });
  } catch (error) {
    console.error("[PATCH /api/admin/support/enquiries/[id]]", error);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}
