/**
 * Second-pass refinement of a PhotoRoom-processed car photo using OpenAI's
 * gpt-image-1 image-edit endpoint. PhotoRoom does the heavy lifting
 * (segmentation + backdrop composite + soft shadow), but the result still
 * tends to look pasted-on — wheels not quite touching the ground, light on
 * the car body not matching the warm afternoon tones in the iAutoMotive
 * Studio backdrop. GPT cleans both up.
 *
 * Endpoint: POST https://api.openai.com/v1/images/edits
 * Auth:     Authorization: Bearer $OPENAI_API_KEY
 * Docs:     https://platform.openai.com/docs/api-reference/images/createEdit
 *
 * Returns a Buffer of the refined PNG; caller hands it to saveUploadBuffer().
 */

const ENDPOINT = "https://api.openai.com/v1/images/edits";

/** Latest released image-edit model. OpenAI sometimes refers to it as
 *  "ChatGPT image" in product copy; the API model id is `gpt-image-1`. */
const MODEL = "gpt-image-1";

/** Output size for the refined image. gpt-image-1 only accepts a fixed
 *  set of sizes — 1536×1024 (3:2 landscape) is closest to PhotoRoom's
 *  1920×1440 4:3 output and works well as a marketplace hero shot. */
const OUTPUT_SIZE = "1536x1024";

/** Quality knob:
 *    low    → ~$0.011 / image, ~5–8s
 *    medium → ~$0.042 / image, ~10–15s
 *    high   → ~$0.167 / image, ~20–30s
 *  Marketplace listings are the buyer's first impression so we bias to
 *  `high`. Tunable via env if cost becomes a concern. */
const QUALITY = (process.env.OPENAI_IMAGE_QUALITY ?? "high") as "low" | "medium" | "high" | "auto";

/** The instruction GPT follows on every refinement. Kept stable across
 *  calls so output is consistent run-to-run.
 *
 *  Structure: (1) name the scene so GPT has a frame of reference,
 *  (2) two specific corrections — floor contact + lighting match,
 *  (3) hard preservation list so the model doesn't re-render the car.
 *  The "preserve EXACTLY" block is the most important part — without
 *  it the model sometimes restyles the body or recolours badges. */
const REFINE_PROMPT = [
  // Scene framing
  "This image is for The iAutoMotive Studio — a curated outdoor showroom. The backdrop shows a gravel driveway in the foreground, a low stone wall and mature trees behind, and an iAutoMotive Studio circular brand mark in the upper-right corner. The lighting in the studio is soft, slightly warm, diffuse natural daylight from above.",

  // Correction #1 — grounding
  "1) Place the car firmly on the floor of the studio. The tyres must be pressed into the gravel driveway with realistic contact — no gap, no floating, no levitation. Add a soft cast shadow on the gravel directly under and slightly behind the car, sized and softness-matched to the studio's diffuse daylight.",

  // Correction #2 — lighting match
  "2) Match the lighting on the car body to the lighting of the studio. The car should look like it was photographed in the same scene as the backdrop: same direction of light, same warmth, same softness. Reflections of the stone wall, trees, sky and surrounding gravel should be visible on the car's painted surfaces, glass and wheels where appropriate.",

  // Hard preservation list
  "Critical — preserve EXACTLY without alteration: the car's silhouette and proportions, body paint colour, panel lines, badges and grille, headlight and taillight design, wheel design and brake calipers, tyre brand markings, registration plate characters, side mirror shape, and any existing trim or decals. Do not restyle, recolour or reshape any part of the car. Only correct the floor contact and the lighting-match between the car and the studio backdrop.",
].join(" ");

export interface RefineResult {
  buffer: Buffer;
  mimeType: string;
}

/**
 * Sends `inputBuffer` (PNG bytes from PhotoRoom) to gpt-image-1 with the
 * fixed refinement prompt. Throws on missing key or non-2xx responses with
 * the OpenAI body text in the message so the route handler can log it.
 */
export async function refineCarPhoto(inputBuffer: Buffer): Promise<RefineResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set — add it in Vercel → project → Environment Variables (and your local .env)");
  }

  const form = new FormData();
  form.append("model", MODEL);
  // images/edits expects PNG/JPG/WebP under 25MB. PhotoRoom returns PNG so
  // no conversion needed. Filename matters less than the MIME — use ".png"
  // so OpenAI's content-sniffing is happy.
  form.append("image", new Blob([new Uint8Array(inputBuffer)], { type: "image/png" }), "photoroom-out.png");
  form.append("prompt", REFINE_PROMPT);
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
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 300) || res.statusText}`);
  }

  // gpt-image-1 always returns base64 — there's no `response_format` knob
  // for this model. Decode and hand back as a Buffer to match the
  // PhotoRoom client's contract.
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (typeof b64 !== "string" || b64.length === 0) {
    throw new Error("OpenAI response missing data[0].b64_json");
  }
  const buffer = Buffer.from(b64, "base64");
  return { buffer, mimeType: "image/png" };
}
