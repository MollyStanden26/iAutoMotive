/**
 * Thin wrapper around the PhotoRoom v2 image-edit API. We use it to lift the
 * car off whatever raw studio / driveway / phone background the seller or
 * scraper captured and place it on the iAutoMotive showroom backdrop.
 *
 * Docs: https://docs.photoroom.com/image-editing-api/
 *
 * Auth: a single env var, PHOTOROOM_API_KEY. Throws clearly if it's missing
 * so the admin endpoint can surface a 503 with a useful message instead of
 * leaking the raw 401 from PhotoRoom.
 */

const ENDPOINT = "https://image-api.photoroom.com/v2/edit";

/** Brand backdrop. iAutoMotive teal — overridden via env if/when we host a
 *  bitmap showroom asset on Vercel Blob and want PhotoRoom to composite onto
 *  that instead. The leading "#" is required by PhotoRoom's `background.color`. */
const DEFAULT_BACKDROP_COLOR = "#0D1525";

export interface ReplaceBackgroundOptions {
  /** The raw photo to process. Either a URL we fetch, or a Buffer we POST. */
  sourceUrl?: string;
  sourceBuffer?: Buffer;
  /** Optional: hex colour like "#0D1525" or a public URL pointing at a
   *  background image. Defaults to env PHOTOROOM_BACKDROP_URL or the brand
   *  colour above. */
  background?: { color?: string; url?: string };
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
    throw new Error("PHOTOROOM_API_KEY is not set — add it in Vercel → project → Environment Variables");
  }

  const form = new FormData();

  // Source: prefer buffer if both supplied (avoids the network round-trip
  // PhotoRoom would otherwise do for sourceUrl).
  if (opts.sourceBuffer) {
    form.append("imageFile", new Blob([new Uint8Array(opts.sourceBuffer)]), "source.jpg");
  } else if (opts.sourceUrl) {
    // PhotoRoom v2 accepts `imageUrl` in lieu of `imageFile`.
    form.append("imageUrl", opts.sourceUrl);
  } else {
    throw new Error("replaceBackground: pass sourceBuffer or sourceUrl");
  }

  // Background: image takes precedence over colour when both set.
  const bgUrl = opts.background?.url ?? process.env.PHOTOROOM_BACKDROP_URL;
  const bgColor = opts.background?.color ?? DEFAULT_BACKDROP_COLOR;
  if (bgUrl) {
    form.append("background.imageUrl", bgUrl);
  } else {
    form.append("background.color", bgColor);
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
