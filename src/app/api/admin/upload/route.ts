import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-role";

/**
 * Direct-to-Blob upload token route.
 *
 * Why this exists: Vercel serverless functions cap inbound request bodies at
 * ~4.5 MB and that limit is not configurable. The vehicle intake form posts
 * 5 photos + 3 PDFs in a single multipart payload, which blows past that and
 * returns a bodyless 413 before /api/admin/vehicles ever runs.
 *
 * Pattern: the client calls `upload()` from `@vercel/blob/client`, which hits
 * this route to mint a short-lived token bound to a specific pathname, then
 * streams the file directly to Vercel Blob. The vehicles POST only ever sees
 * URLs + a small JSON payload, well under the 4.5 MB cap.
 *
 *   GET  /api/admin/upload  → { direct: boolean, maxBytesPerFile: number }
 *                            client uses this to decide whether to do direct
 *                            uploads (prod with Blob configured) or fall back
 *                            to the multipart path (local dev).
 *
 *   POST /api/admin/upload  → handleUpload() — mints a Blob client token.
 *                            Returns 503 when Blob isn't configured so the
 *                            client falls back rather than half-uploading.
 */

/**
 * Per-file ceiling. Matches MAX_FILE_BYTES in src/app/api/admin/vehicles/route.ts
 * and MAX_UPLOAD_BYTES in src/components/admin/add-vehicle-drawer.tsx.
 *
 * NOT exported — Next.js App Router only allows a fixed set of `route.ts`
 * exports (runtime/dynamic/maxDuration/HTTP-method handlers/etc.), and the
 * build fails with "MAX_UPLOAD_BYTES is not a valid Route export field"
 * otherwise. The three call sites duplicate this constant on purpose.
 */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

/** Restrict the namespaces a minted token can write to. Stops a staff member
 *  reusing a token from one feature to scribble into an unrelated path. */
const ALLOWED_PATH_PREFIXES = ["vehicles/", "contracts/"];

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;
  return NextResponse.json({
    direct: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    maxBytesPerFile: MAX_UPLOAD_BYTES,
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Direct uploads not configured (BLOB_READ_WRITE_TOKEN missing)" },
      { status: 503 }
    );
  }
  const guard = await requireStaff(request);
  if (!guard.ok) return guard.response;

  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!ALLOWED_PATH_PREFIXES.some(p => pathname.startsWith(p))) {
          throw new Error(
            `Pathname must start with one of: ${ALLOWED_PATH_PREFIXES.join(", ")}`
          );
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: false,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async () => {
        // No-op. The vehicles POST writes the DB row once the client confirms
        // every upload landed and submits the metadata payload.
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload token failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
