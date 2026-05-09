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
 *  calls so output is consistent run-to-run. The first half tells GPT
 *  what to fix; the second half is the (more important) "don't touch"
 *  list — without it the model sometimes re-renders the car body in a
 *  slightly different shape or recolours badges. */
const REFINE_PROMPT = [
  "Polish this car photo for an online marketplace listing.",
  "Ensure the car's tyres sit flush on the driveway floor with no gap or floating effect — the rubber should visibly contact the ground with a soft realistic contact shadow underneath.",
  "Adjust the lighting and shadows on the car body so they match the natural daylight direction, warmth and softness visible on the stone wall, gravel and trees behind the car. The light source feel should be consistent across the subject and background.",
  "Critical — preserve EXACTLY: the car's shape and proportions, body colour, panel lines, badges and grille design, headlight and taillight detail, wheel design and brake calipers, registration plate text, and any visible reflections of the car's surroundings on its bodywork. Only correct the ground contact and the ambient lighting match.",
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
