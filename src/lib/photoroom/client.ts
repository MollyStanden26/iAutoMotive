/**
 * Thin wrapper around the PhotoRoom v2 image-edit API. We use it to lift the
 * car off whatever raw studio / driveway / phone background the seller or
 * scraper captured and place it on the iAutoMotive showroom backdrop.
 *
 * Docs: https://docs.photoroom.com/image-editing-api/
 *
 * Auth: a single env var, PHOTOROOM_API_KEY. Throws clearly if it's missing
 * so the admin endpoint can surface a useful message instead of leaking the
 * raw 401 from PhotoRoom.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

const ENDPOINT = "https://image-api.photoroom.com/v2/edit";

/** Default brand backdrop image, served from Next.js's public/ tree. The
 *  bytes are read from disk and POSTed as a multipart `background.imageFile`
 *  so PhotoRoom doesn't need the URL to be publicly reachable — works the
 *  same in dev as it does in prod. */
const DEFAULT_BACKDROP_PATH = path.join(process.cwd(), "public", "images", "iautomotive-backdrop.jpg");

/** Fallback colour when no backdrop file is present on disk. Brand-dark navy
 *  so the photo doesn't look broken if someone forgets to drop the asset in. */
const FALLBACK_BACKDROP_COLOR = "#0D1525";

export interface ReplaceBackgroundOptions {
  /** The raw photo to process. Either a URL we fetch, or a Buffer we POST. */
  sourceUrl?: string;
  sourceBuffer?: Buffer;
  /** Override the default backdrop. Either a hex colour, a public URL, or a
   *  Buffer of the actual image bytes. If unset, falls back to the file at
   *  public/images/iautomotive-backdrop.jpg, then PHOTOROOM_BACKDROP_URL,
   *  then FALLBACK_BACKDROP_COLOR. */
  background?: { color?: string; url?: string; buffer?: Buffer };
}

export interface ReplaceBackgroundResult {
  buffer: Buffer;
  mimeType: string;
}

/**
 * POSTs to PhotoRoom and returns the processed image bytes. The returned
 * Buffer can be handed to `saveUploadBuffer()` to land on Vercel Blob.
 */
export async function replaceBackground(opts: ReplaceBackgroundOptions): Promise<ReplaceBackgroundResult> {
  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) {
    throw new Error("PHOTOROOM_API_KEY is not set — add it in Vercel → project → Environment Variables (and your local .env)");
  }

  const form = new FormData();

  // Source: prefer buffer if both supplied (avoids the network round-trip
  // PhotoRoom would otherwise do for sourceUrl).
  if (opts.sourceBuffer) {
    form.append("imageFile", new Blob([new Uint8Array(opts.sourceBuffer)]), "source.jpg");
  } else if (opts.sourceUrl) {
    form.append("imageUrl", opts.sourceUrl);
  } else {
    throw new Error("replaceBackground: pass sourceBuffer or sourceUrl");
  }

  // Background priority: explicit buffer > explicit URL > explicit colour
  // > default backdrop file > env URL > fallback colour. The default
  // backdrop file path lives in public/images so designers can swap it
  // without code changes.
  let backdropBuffer: Buffer | undefined = opts.background?.buffer;
  if (!backdropBuffer && !opts.background?.url && !opts.background?.color) {
    try {
      backdropBuffer = await readFile(DEFAULT_BACKDROP_PATH);
    } catch {
      // Asset missing; fall through to the env URL / colour fallback.
    }
  }

  if (backdropBuffer) {
    form.append("background.imageFile", new Blob([new Uint8Array(backdropBuffer)]), "backdrop.jpg");
  } else if (opts.background?.url ?? process.env.PHOTOROOM_BACKDROP_URL) {
    form.append("background.imageUrl", (opts.background?.url ?? process.env.PHOTOROOM_BACKDROP_URL)!);
  } else {
    form.append("background.color", opts.background?.color ?? FALLBACK_BACKDROP_COLOR);
  }

  // Lock output to the same aspect as the source so vehicle gallery thumbs
  // don't crop weirdly after the swap.
  form.append("outputSize", "originalImage");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "x-api-key": apiKey, Accept: "image/png" },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PhotoRoom ${res.status}: ${text.slice(0, 200) || res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type") || "image/png";
  return { buffer, mimeType };
}
