import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-role";
import { deleteVehicleCascade } from "@/lib/admin/delete-vehicle";

/**
 * Bulk vehicle delete.
 *
 *   POST /api/admin/vehicles/bulk-delete   { ids: string[] }
 *   → { deleted: {id, registration}[], notFound: string[], failed: {id, error}[] }
 *
 * Each id runs through the same deleteVehicleCascade() helper as the per-id
 * route. Deletes run sequentially (not Promise.all) so a 50-vehicle bulk op
 * doesn't open 50× the DB + Blob connections at once — inventory bulk ops
 * are infrequent and correctness/back-pressure matters more than shaving a
 * few hundred ms. One failure doesn't abort the rest; it's reported per-id.
 */

/** Hard cap so a malformed/hostile payload can't enqueue unbounded work. */
const MAX_BULK = 200;

export async function POST(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawIds = (body as { ids?: unknown })?.ids;
  if (!Array.isArray(rawIds)) {
    return NextResponse.json({ error: "Body must be { ids: string[] }" }, { status: 400 });
  }

  // De-dupe + drop non-strings/empties.
  const ids = [...new Set(rawIds.filter((x): x is string => typeof x === "string" && x.length > 0))];
  if (ids.length === 0) {
    return NextResponse.json({ error: "No valid ids provided" }, { status: 400 });
  }
  if (ids.length > MAX_BULK) {
    return NextResponse.json(
      { error: `Too many ids (${ids.length}); max ${MAX_BULK} per request` },
      { status: 400 }
    );
  }

  const deleted: { id: string; registration: string }[] = [];
  const notFound: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const id of ids) {
    try {
      const result = await deleteVehicleCascade(id);
      if (result) deleted.push(result);
      else notFound.push(id);
    } catch (error) {
      console.error(`[POST /api/admin/vehicles/bulk-delete] id=${id}`, error);
      failed.push({ id, error: error instanceof Error ? error.message : "delete failed" });
    }
  }

  // 207-ish semantics: if nothing succeeded and something failed, surface 500
  // so the client treats it as an error; otherwise 200 with the breakdown.
  const status = deleted.length === 0 && failed.length > 0 ? 500 : 200;
  return NextResponse.json(
    { deleted, notFound, failed, deletedCount: deleted.length },
    { status }
  );
}
