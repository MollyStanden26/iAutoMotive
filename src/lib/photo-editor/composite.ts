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

/** Final canvas size — same as the backdrop file's native size. We resize
 *  the backdrop to this in case a designer drops a higher-res asset later. */
const CANVAS_WIDTH = 1536;
const CANVAS_HEIGHT = 1024;

/** Fraction of canvas WIDTH the car cutout should occupy. 0.78 reads well
 *  for hero shots — fills the frame without crowding the brand mark in
 *  the upper-right. */
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
 * Returns a PNG buffer at CANVAS_WIDTH × CANVAS_HEIGHT.
 */
export async function compositeOnBackdrop(
  cutoutBuffer: Buffer,
  backdropBuffer: Buffer,
): Promise<CompositeResult> {
  // Normalise the backdrop to our canvas size. `cover` fills the frame
  // and crops if the source aspect doesn't match — designers should drop
  // 3:2 assets to avoid surprises.
  const backdrop = await sharp(backdropBuffer)
    .resize(CANVAS_WIDTH, CANVAS_HEIGHT, { fit: "cover", position: "center" })
    .toBuffer();

  // Resize the car cutout proportionally to occupy CAR_WIDTH_RATIO of the
  // canvas width. sharp preserves the aspect ratio when only `width` is
  // given.
  const targetCarWidth = Math.round(CANVAS_WIDTH * CAR_WIDTH_RATIO);
  const car = await sharp(cutoutBuffer)
    .resize({ width: targetCarWidth })
    .toBuffer();

  // Read the resized cutout's height so we can pin the bottom edge to
  // the floor of the canvas.
  const carMeta = await sharp(car).metadata();
  const carWidth = carMeta.width ?? targetCarWidth;
  const carHeight = carMeta.height ?? targetCarWidth;

  // Centre the car horizontally; pin to bottom with BOTTOM_MARGIN_RATIO
  // of the canvas height of breathing room so the soft shadow PhotoRoom
  // baked into the cutout has somewhere to land.
  const left = Math.max(0, Math.round((CANVAS_WIDTH - carWidth) / 2));
  const bottomMargin = Math.round(CANVAS_HEIGHT * BOTTOM_MARGIN_RATIO);
  const top = Math.max(0, CANVAS_HEIGHT - carHeight - bottomMargin);

  const finalPng = await sharp(backdrop)
    .composite([{ input: car, top, left }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { buffer: finalPng, mimeType: "image/png" };
}
