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
 *  same in dev as it does in prod.
 *
 *  Designers can drop the asset as any of these extensions; we try them in
 *  order and use the first one that exists. PNG keeps transparency edges
 *  clean if the backdrop has them, JPG is half the size for opaque shots,
 *  WebP if they're feeling modern. */
const DEFAULT_BACKDROP_CANDIDATES = ["png", "jpg", "jpeg", "webp"].map(ext =>
  path.join(process.cwd(), "public", "images", `iautomotive-backdrop.${ext}`)
);

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
  let backdropFilename = "backdrop.png";
  if (!backdropBuffer && !opts.background?.url && !opts.background?.color) {
    for (const candidate of DEFAULT_BACKDROP_CANDIDATES) {
      try {
        backdropBuffer = await readFile(candidate);
        backdropFilename = path.basename(candidate);
        break;
      } catch {
        // try the next extension
      }
    }
  }

  if (backdropBuffer) {
    form.append("background.imageFile", new Blob([new Uint8Array(backdropBuffer)]), backdropFilename);
  } else if (opts.background?.url ?? process.env.PHOTOROOM_BACKDROP_URL) {
    form.append("background.imageUrl", (opts.background?.url ?? process.env.PHOTOROOM_BACKDROP_URL)!);
  } else {
    form.append("background.color", opts.background?.color ?? FALLBACK_BACKDROP_COLOR);
  }

  // Compositing realism — fixes the "floating car" look from earlier passes.
  //
  //   shadow.mode = ai.soft   → contact shadow under the wheels so the car
  //                              reads as sitting on the driveway, not pasted
  //   lighting.mode = ai.auto → re-lights the car to match the backdrop's
  //                              warmth + direction
  //   position = bottomCenter → anchors every car to the floor of the frame
  //                              instead of free-floating mid-canvas
  //
  // Directional padding — the floor strip in the iAutoMotive Studio
  // backdrop is shallow, so a uniform padding either floated the car onto
  // the wall or kept it large enough that its rear wheels clipped the
  // wall's horizon. PhotoRoom v2 doesn't accept margin.{top,left,...} as
  // separate params — it uses CSS-shorthand on `padding` with comma-
  // separated TOP, RIGHT, BOTTOM, LEFT values. 15/15/0/15 squeezes the
  // subject down on three sides while leaving the bottom flush so the
  // front tyre stays planted on the floor edge.
  form.append("shadow.mode", "ai.soft");
  form.append("lighting.mode", "ai.auto");
  form.append("position", "bottomCenter");
  form.append("padding", "15%, 15%, 0%, 15%");

  // Fixed 4:3 canvas across every processed shot so vehicle gallery grids
  // line up cleanly without per-photo crop logic on the front end.
  form.append("outputSize", "1920x1440");

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
