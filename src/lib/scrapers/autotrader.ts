import { chromium, type Browser } from "playwright-core";

/**
 * Server-side AutoTrader listing scraper.
 *
 * AutoTrader serves a JS-only SPA — the static HTML returned from `fetch()`
 * has no listing data, just the navigation shell. To extract the live data
 * we drive a real Chrome via Playwright and read the rendered DOM.
 *
 * Dev-only by design. Vercel serverless can't run a desktop Chrome binary;
 * for production this would move to a background worker (e.g. Browserless,
 * a self-hosted Playwright service, or a queued Lambda with chrome-aws-lambda).
 */

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  process.env.CHROME_BIN ?? "",
].filter(Boolean);

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface ScrapedListing {
  atListingId: string;
  url: string;
  title: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  priceGbp: number | null;     // £ pounds (not pence)
  mileage: number | null;
  bodyType: string | null;     // raw label, e.g. "SUV"
  fuelType: string | null;     // raw label, e.g. "Petrol Plug-in Hybrid"
  transmission: string | null; // "Automatic" / "Manual"
  exteriorColour: string | null;
  doors: number | null;
  dealer: string | null;
  dealerLocation: string | null;
  description: string | null;
  photos: string[];             // CDN URLs, w1280 variant
}

/** Reuse a single browser across a batch of scrapes. */
let cached: Browser | null = null;
async function getBrowser(): Promise<Browser> {
  if (cached) return cached;
  let lastErr: unknown = null;
  for (const exe of CHROME_PATHS) {
    try {
      cached = await chromium.launch({ executablePath: exe, headless: true });
      return cached;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `No usable Chrome found. Tried: ${CHROME_PATHS.join(", ")} — ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`
  );
}

export async function closeScraperBrowser() {
  if (cached) {
    await cached.close().catch(() => {});
    cached = null;
  }
}

function extractListingId(url: string): string | null {
  const m = url.match(/car-details\/(\d{10,})/);
  return m ? m[1] : null;
}

export async function scrapeAutotraderListing(url: string): Promise<ScrapedListing> {
  const atListingId = extractListingId(url);
  if (!atListingId) throw new Error(`Not an AutoTrader car-details URL: ${url}`);

  const browser = await getBrowser();
  const ctx = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 900 },
    locale: "en-GB",
  });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Wait for the price element. AT injects the gallery + spec table
    // around the same time the price renders.
    await page.waitForFunction(
      () => /£[\d,]{4,}/.test(document.body.innerText),
      undefined,
      { timeout: 20_000 }
    );

    // Trigger lazy-loaded gallery thumbnails
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const data = await page.evaluate(() => {
      const text = document.body.innerText || "";

      const h1 = document.querySelector("h1")?.textContent?.trim() ?? null;

      // Title block above the model is shaped: "<year> <make> <model>" then on the
      // next line the trim/derivative.
      // h1 example: "2023 Audi Q3"
      // The line after h1 has the trim ("1.5 TFSI ...")
      let trim: string | null = null;
      if (h1) {
        const idx = text.indexOf(h1);
        if (idx >= 0) {
          const after = text.slice(idx + h1.length).split("\n").map(s => s.trim()).filter(Boolean);
          // First non-empty line after h1 is typically the trim
          trim = after[0] ?? null;
        }
      }

      const priceMatch = text.match(/£([\d,]{4,})/);
      const priceGbp = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : null;

      const mileageMatch = text.match(/([\d,]+)\s*miles/i);
      const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, ""), 10) : null;

      // Spec table is rendered as label/value pairs — match by label text.
      const labelValue = (label: string): string | null => {
        const re = new RegExp(`${label}\\s*\\n\\s*([^\\n]+)`, "i");
        const m = text.match(re);
        return m ? m[1].trim() : null;
      };

      const fuelType = labelValue("Fuel type");
      const bodyType = labelValue("Body type");
      const transmission = labelValue("Gearbox");
      const exteriorColour = labelValue("Body colour");
      const doorsRaw = labelValue("Doors");
      const doors = doorsRaw ? parseInt(doorsRaw, 10) : null;

      // Year: prefer h1 leading 4-digit. Fall back to "Registration" line.
      let year: number | null = null;
      if (h1) {
        const ym = h1.match(/^(\d{4})\s+/);
        if (ym) year = parseInt(ym[1], 10);
      }
      if (!year) {
        const reg = labelValue("Registration");
        const ym2 = reg?.match(/(\d{4})/);
        year = ym2 ? parseInt(ym2[1], 10) : null;
      }

      // Make + model from h1: "<year> <make> <model>"
      let make: string | null = null;
      let model: string | null = null;
      if (h1) {
        const parts = h1.split(/\s+/);
        if (parts.length >= 3 && /^\d{4}$/.test(parts[0])) {
          // Make can be one or two words ("Land Rover", "Mercedes-Benz", "Range Rover")
          const TWO_WORD_MAKES = new Set(["Land", "Range", "Aston", "Alfa", "Great"]);
          if (TWO_WORD_MAKES.has(parts[1])) {
            make = `${parts[1]} ${parts[2]}`;
            model = parts.slice(3).join(" ") || null;
          } else {
            make = parts[1];
            model = parts.slice(2).join(" ") || null;
          }
        }
      }

      // Dealer block sits in a "From <Dealer>" snippet, with the city on the next line.
      let dealer: string | null = null;
      let dealerLocation: string | null = null;
      const fromIdx = text.indexOf("From ");
      if (fromIdx >= 0) {
        const tail = text.slice(fromIdx + 5, fromIdx + 200).split("\n").map(s => s.trim()).filter(Boolean);
        dealer = tail[0] ?? null;
        dealerLocation = tail[1] && !tail[1].toLowerCase().includes("more seller") ? tail[1] : null;
      }

      // Description: the block under "Description" heading, up to ~600 chars.
      let description: string | null = null;
      const descIdx = text.indexOf("\nDescription\n");
      if (descIdx >= 0) {
        description = text.slice(descIdx + 13, descIdx + 13 + 600).trim();
      }

      // Photos: every <img> from m.atcdn.co.uk's media path. Upgrade w<N> to
      // w1280 for the highest-quality variant.
      const candidates = Array.from(document.querySelectorAll("img"))
        .map(i => (i as HTMLImageElement).src)
        .filter(s => /m\.atcdn\.co\.uk\/a\/media\/w\d+\/[a-f0-9]+\.jpe?g/i.test(s));
      const photos = Array.from(new Set(candidates.map(u => u.replace(/\/w\d+\//, "/w1280/"))));

      return {
        h1, trim, priceGbp, mileage, fuelType, bodyType, transmission,
        exteriorColour, doors, year, make, model, dealer, dealerLocation,
        description, photos,
      };
    });

    return {
      atListingId,
      url,
      title: data.h1,
      year: data.year,
      make: data.make,
      model: data.model,
      trim: data.trim,
      priceGbp: data.priceGbp,
      mileage: data.mileage,
      bodyType: data.bodyType,
      fuelType: data.fuelType,
      transmission: data.transmission,
      exteriorColour: data.exteriorColour,
      doors: data.doors,
      dealer: data.dealer,
      dealerLocation: data.dealerLocation,
      description: data.description,
      photos: data.photos,
    };
  } finally {
    await ctx.close().catch(() => {});
  }
}
