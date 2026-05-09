/**
 * Single-pass car compositor using OpenAI's gpt-image-1 multi-image edit
 * endpoint. Replaces the earlier PhotoRoom + GPT chain, which produced
 * noticeable seams (segmented car pasted onto backdrop, GPT then trying to
 * "fix" the join) — letting one model do segmentation, compositing, and
 * lighting in one shot gives more cohesive output.
 *
 * Endpoint: POST https://api.openai.com/v1/images/edits
 * Auth:     Authorization: Bearer $OPENAI_API_KEY
 * Docs:     https://platform.openai.com/docs/api-reference/images/createEdit
 *
 * Input: two image buffers (raw car photo + iAutoMotive Studio backdrop)
 * Output: a Buffer of the composited PNG, ready for saveUploadBuffer().
 */

const ENDPOINT = "https://api.openai.com/v1/images/edits";

/** OpenAI's image-edit model. Public copy sometimes calls it "ChatGPT
 *  image"; the API id is `gpt-image-1`. */
const MODEL = "gpt-image-1";

/** 3:2 landscape — best fit for vehicle hero shots and the closest of
 *  gpt-image-1's accepted output sizes (1024x1024, 1024x1536, 1536x1024)
 *  to a typical car photo aspect ratio. */
const OUTPUT_SIZE = "1536x1024";

/** Quality knob:
 *    low    → ~$0.011 / image, ~5–8s
 *    medium → ~$0.042 / image, ~10–15s
 *    high   → ~$0.167 / image, ~20–30s
 *  Marketplace listings are the buyer's first impression so we bias to
 *  `high`. Override with OPENAI_IMAGE_QUALITY in env. */
const QUALITY = (process.env.OPENAI_IMAGE_QUALITY ?? "high") as "low" | "medium" | "high" | "auto";

/** The instruction GPT follows. Sent on every call alongside two images:
 *  the raw car photo (image 1) and the iAutoMotive Studio backdrop
 *  (image 2). Stable across calls so output is consistent run-to-run.
 *
 *  The "preserve EXACTLY" block is the most important part — without
 *  it the model occasionally restyles the car body, recolours the
 *  paint, or rewrites the registration plate. */
const COMPOSITE_PROMPT = [
  // What the two inputs are
  "You are given two images. Image 1 is a photo of a car. Image 2 is the iAutoMotive Studio backdrop — a curated outdoor showroom showing a gravel driveway in the foreground, a low stone wall with mature trees behind, and an iAutoMotive Studio circular brand mark in the upper-right corner. The studio is lit by soft, slightly warm, diffuse natural daylight from above.",

  // Goal
  "Produce a single photorealistic image of the car from image 1 placed inside the iAutoMotive Studio from image 2.",

  // Specific corrections
  "1) The car must sit firmly on the floor of the studio. The tyres must be pressed into the gravel driveway with realistic contact — no gap, no levitation. Add a soft cast shadow on the gravel directly under and slightly behind the car, sized and softness-matched to the studio's diffuse daylight.",
  "2) The lighting on the car body must match the lighting of the studio: same direction, same warmth, same softness. The car should look like it was photographed in the studio scene, not pasted in. Reflections of the stone wall, trees, sky and surrounding gravel should be visible on the car's painted surfaces, glass and wheels where appropriate.",
  "3) Keep the iAutoMotive Studio brand mark visible in the upper-right corner of the output, exactly as it appears in image 2. Do not move, resize, recolour or remove it.",

  // Hard preservation list
  "Critical — preserve EXACTLY without alteration: the car's silhouette and proportions, body paint colour, panel lines, badges and grille, headlight and taillight design, wheel design and brake calipers, tyre brand markings, registration plate characters, side mirror shape, and any existing trim or decals from image 1. Do not restyle, recolour or reshape any part of the car. Match the camera angle of image 1 — keep the same view of the car (front three-quarter / side / rear / etc.) so the buyer sees the same angle they originally selected.",
].join(" ");

export interface CompositeResult {
  buffer: Buffer;
  mimeType: string;
}

/**
 * Hands gpt-image-1 the raw car shot + the studio backdrop and asks it to
 * place the car into the studio with matched lighting and floor contact.
 * Throws on missing key or non-2xx with the OpenAI body in the message so
 * the route handler can log it.
 */
export async function compositeCarOnBackdrop(
  carBuffer: Buffer,
  backdropBuffer: Buffer,
  backdropFilename = "backdrop.png",
): Promise<CompositeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set — add it in Vercel → project → Environment Variables (and your local .env)");
  }

  const form = new FormData();
  form.append("model", MODEL);
  // Multi-image input. gpt-image-1 accepts up to 16 images via repeated
  // `image[]` parts; the model treats them in the order given. We send car
  // first so the prompt's "image 1 / image 2" labels line up.
  form.append("image[]", new Blob([new Uint8Array(carBuffer)], { type: "image/png" }), "car.png");
  form.append("image[]", new Blob([new Uint8Array(backdropBuffer)], { type: "image/png" }), backdropFilename);
  form.append("prompt", COMPOSITE_PROMPT);
  form.append("size", OUTPUT_SIZE);
  form.append("quality", QUALITY);
  form.append("n", "1");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 400) || res.statusText}`);
  }

  // gpt-image-1 always returns base64 — there's no `response_format` knob
  // for this model. Decode and hand back as a Buffer to match the storage
  // helper's expected input.
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (typeof b64 !== "string" || b64.length === 0) {
    throw new Error("OpenAI response missing data[0].b64_json");
  }
  const buffer = Buffer.from(b64, "base64");
  return { buffer, mimeType: "image/png" };
}
