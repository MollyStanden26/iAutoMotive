/**
 * Deterministic backdrop compositor. Takes a PhotoRoom-segmented car
 * cutout (transparent PNG with soft shadow baked in) plus the
 * iAutoMotive Studio backdrop, and pastes the cutout onto the backdrop
 * at a fixed position and scale.
 *
 * Why this approach over a single AI call:
 *   • The car's pixels are NEVER re-rendered by an AI model — paint
 *     colour, panel lines, badges, plate text are byte-for-byte the
 *     same as what PhotoRoom output.
 *   • The backdrop is the literal file from public/images, untouched.
 *   • Output is identical run-to-run for the same inputs (no model
 *     temperature, no prompt drift).
 *
 * Tuning knobs are constants below — easy to adjust without changing
 * caller code.
 */

import sharp from "sharp";

/** Target output WIDTH for the composited hero. Height is derived from the
 *  backdrop's native aspect ratio so the brand mark and floor stay in the
 *  exact positions the designer placed them. Most marketplace heroes
 *  display ~1200–1600px wide so 1600 is a safe fixed cap that avoids
 *  upscaling tiny backdrops past their useful resolution. */
const TARGET_WIDTH = 1600;

/** Fraction of canvas WIDTH the car cutout should occupy. 0.78 reads well
 *  for hero shots — fills the frame without crowding the brand mark. */
const CAR_WIDTH_RATIO = 0.78;

/** Fraction of canvas HEIGHT separating the car's lowest opaque pixel
 *  from the bottom edge of the canvas. 0.04 keeps the tyres pressed
 *  into the gravel without cropping the bottom of the wheels. */
const BOTTOM_MARGIN_RATIO = 0.04;

export interface CompositeResult {
  buffer: Buffer;
  mimeType: string;
}

/**
 * Pastes `cutoutBuffer` onto `backdropBuffer` at fixed position + scale.
 * Output canvas matches the backdrop's NATIVE aspect ratio — no cropping
 * on either dimension — so the brand mark always lands where the
 * designer placed it. The page just needs to render with `object-contain`
 * (or a matching aspect-ratio container) and nothing is ever clipped.
 */
export async function compositeOnBackdrop(
  cutoutBuffer: Buffer,
  backdropBuffer: Buffer,
): Promise<CompositeResult> {
  // Read backdrop dimensions so the canvas tracks its native aspect.
  const bdMeta = await sharp(backdropBuffer).metadata();
  const bdWidth = bdMeta.width ?? TARGET_WIDTH;
  const bdHeight = bdMeta.height ?? Math.round(TARGET_WIDTH * 0.625);
  const aspect = bdWidth / bdHeight;

  // Scale to TARGET_WIDTH unless the backdrop is already wider, in which
  // case keep its native width to avoid pointless upscaling.
  const canvasWidth = Math.min(bdWidth, TARGET_WIDTH);
  const canvasHeight = Math.round(canvasWidth / aspect);

  // Resize the backdrop preserving aspect — `fit: fill` would distort,
  // and we just computed the matching height so this maps 1:1.
  const backdrop = await sharp(backdropBuffer)
    .resize(canvasWidth, canvasHeight, { fit: "fill" })
    .toBuffer();

  // Resize the car cutout proportionally to occupy CAR_WIDTH_RATIO of
  // the canvas width. sharp preserves aspect when only `width` is given.
  const targetCarWidth = Math.round(canvasWidth * CAR_WIDTH_RATIO);
  const car = await sharp(cutoutBuffer)
    .resize({ width: targetCarWidth })
    .toBuffer();

  const carMeta = await sharp(car).metadata();
  const carWidth = carMeta.width ?? targetCarWidth;
  const carHeight = carMeta.height ?? targetCarWidth;

  // Centre horizontally; pin to bottom with breathing room for the
  // soft shadow PhotoRoom baked into the cutout.
  const left = Math.max(0, Math.round((canvasWidth - carWidth) / 2));
  const bottomMargin = Math.round(canvasHeight * BOTTOM_MARGIN_RATIO);
  const top = Math.max(0, canvasHeight - carHeight - bottomMargin);

  const finalPng = await sharp(backdrop)
    .composite([{ input: car, top, left }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { buffer: finalPng, mimeType: "image/png" };
}
