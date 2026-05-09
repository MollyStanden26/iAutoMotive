/**
 * PhotoRoom segmentation — returns the input image with the background
 * removed and a soft contact shadow baked in. Used by the photo editor
 * as the *only* AI step in the pipeline; everything after this is a
 * deterministic sharp composite, so the car's pixels never get
 * re-rendered.
 *
 * Endpoint: POST https://image-api.photoroom.com/v2/edit
 *   background.color = transparent  → no backdrop, just the cutout
 *   shadow.mode      = ai.soft      → soft contact shadow under the wheels
 *   outputSize       = originalImage → preserve source dimensions, we
 *                                       resize ourselves later
 */

const ENDPOINT = "https://image-api.photoroom.com/v2/edit";

export interface SegmentResult {
  buffer: Buffer;
  /** Original car image dimensions, useful for downstream resize math. */
  width: number;
  height: number;
}

/**
 * Segments the subject from the input image and returns a transparent
 * PNG (RGBA) with a soft drop shadow under the subject.
 */
export async function segmentCarPhoto(input: { buffer?: Buffer; url?: string }): Promise<SegmentResult> {
  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) {
    throw new Error("PHOTOROOM_API_KEY is not set — segmentation needs PhotoRoom");
  }

  const form = new FormData();
  if (input.buffer) {
    form.append("imageFile", new Blob([new Uint8Array(input.buffer)], { type: "image/png" }), "car.png");
  } else if (input.url) {
    form.append("imageUrl", input.url);
  } else {
    throw new Error("segmentCarPhoto: pass buffer or url");
  }
  form.append("background.color", "transparent");
  form.append("shadow.mode", "ai.soft");
  form.append("outputSize", "originalImage");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "x-api-key": apiKey, Accept: "image/png" },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PhotoRoom segment ${res.status}: ${text.slice(0, 300) || res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  // Pull the cutout's pixel dimensions from the PNG IHDR chunk so the
  // caller knows the aspect ratio without spinning up sharp just for that.
  // PNG IHDR: bytes 16..19 = width, 20..23 = height (big-endian uint32).
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { buffer, width, height };
}
