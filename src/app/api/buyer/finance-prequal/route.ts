import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

const EMPLOYMENT = ["employed", "self_employed", "retired", "student", "unemployed", "other"] as const;

/**
 * GET /api/buyer/finance-prequal?vehicleId=<id> — load the buyer's draft
 * finance pre-qualification for the given vehicle. Auto-creates a draft
 * row keyed to (userId, vehicleId) on first hit so the form has somewhere
 * to write back to immediately.
 */
export async function GET(req: NextRequest) {
  const guard = await requireSession(req);
  if (!guard.ok) return guard.response;
  try {
    const vehicleId = req.nextUrl.searchParams.get("vehicleId");
    if (!vehicleId) {
      return NextResponse.json({ error: "vehicleId query param required" }, { status: 400 });
    }
    const existing = await prisma.financePreQual.findUnique({
      where: { userId_vehicleId: { userId: guard.user.id, vehicleId } },
    });
    if (existing) {
      return NextResponse.json({ prequal: existing });
    }
    const created = await prisma.financePreQual.create({
      data: { userId: guard.user.id, vehicleId },
    });
    return NextResponse.json({ prequal: created });
  } catch (error) {
    console.error("[GET /api/buyer/finance-prequal]", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

/**
 * PATCH /api/buyer/finance-prequal — sparse update + upsert keyed to
 * (userId, vehicleId). All monetary fields are in pence; UI converts.
 *
 * If body.submit === true, also sets status=submitted and stamps
 * submittedAt; that's the buyer pressing "Submit application" rather
 * than just saving progress.
 */
export async function PATCH(req: NextRequest) {
  const guard = await requireSession(req);
  if (!guard.ok) return guard.response;
  try {
    const body = await req.json().catch(() => ({}));
    const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId : null;
    if (!vehicleId) return NextResponse.json({ error: "vehicleId required" }, { status: 400 });

    const data: Record<string, unknown> = {};
    const setStr = (k: string) => {
      if (k in body) data[k] = (typeof body[k] === "string" ? body[k].trim() : null) || null;
    };
    const setInt = (k: string) => {
      if (k in body) {
        const v = Number(body[k]);
        if (!Number.isFinite(v) || v < 0) {
          throw new Error(`${k} must be a non-negative number`);
        }
        data[k] = Math.round(v);
      }
    };
    const setBool = (k: string) => {
      if (k in body && typeof body[k] === "boolean") data[k] = body[k];
    };

    // Identity
    setStr("dateOfBirth");
    setInt("dependantsCount");

    // Address
    setStr("addressLine1");
    setStr("addressLine2");
    setStr("city");
    setStr("postcode");
    setInt("yearsAtAddress");
    if ("previousAddress" in body && body.previousAddress && typeof body.previousAddress === "object") {
      data.previousAddress = body.previousAddress;
    }

    // Employment
    if ("employmentStatus" in body) {
      const v = body.employmentStatus;
      if (v != null && !(EMPLOYMENT as readonly string[]).includes(v)) {
        return NextResponse.json({ error: "Invalid employment status" }, { status: 400 });
      }
      data.employmentStatus = v ?? null;
    }
    setStr("employerName");
    setStr("occupation");
    setInt("yearsAtEmployer");
    setInt("monthsAtEmployer");
    setInt("annualIncomeGbp");
    setInt("monthlyHousingGbp");
    setInt("monthlyDebtsGbp");

    // Loan
    setInt("depositGbp");
    setInt("termMonths");

    // Bank
    setStr("bankSortCode");
    setStr("bankAccountLast4");

    // Consents
    setBool("marketingConsent");
    setBool("hardCheckConsent");

    if (body.submit === true) {
      data.status = "submitted";
      data.submittedAt = new Date();
    }

    const upserted = await prisma.financePreQual.upsert({
      where: { userId_vehicleId: { userId: guard.user.id, vehicleId } },
      create: { userId: guard.user.id, vehicleId, ...data },
      update: data,
    });

    return NextResponse.json({ ok: true, prequal: upserted });
  } catch (error) {
    console.error("[PATCH /api/buyer/finance-prequal]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 }
    );
  }
}
