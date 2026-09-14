// Generates branded SEO image assets for EKAM AI:
//   public/icon-512.png, public/icon-192.png   (manifest icons, ink bg + spectrum mark)
//   src/app/apple-icon.png                       (180px apple-touch-icon)
//   public/og-image.png                          (1200x630 branded OG image)
//
// Run with bun (or node) from the repo root:  bun scripts/gen-seo-assets.mjs
// No text-font dependency: SVG <text> render support is probed; if unavailable,
// a clean vector-only OG image is shipped instead.
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";

const ROOT = "/var/www/ekamai";

// The EKAM AI brand mark (hexagon + inner gem), drawn in a 32x32 box.
const MARK_INNER = (id) => `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#91e500"/><stop offset="0.33" stop-color="#12bcff"/><stop offset="0.66" stop-color="#2f44ff"/><stop offset="1" stop-color="#8200df"/>
    </linearGradient>
  </defs>
  <path d="M16 3 L27 9.5 V22.5 L16 29 L5 22.5 V9.5 Z" stroke="url(#${id})" stroke-width="2" fill="none" stroke-linejoin="round"/>
  <path d="M16 10 L21 13 V19 L16 22 L11 19 V13 Z" fill="url(#${id})"/>`;

function iconSvg(size) {
  const markW = Math.round(size * 0.58);
  const off = Math.round((size - markW) / 2);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#13121f"/>
  <svg x="${off}" y="${off}" width="${markW}" height="${markW}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${MARK_INNER("g" + size)}</svg>
</svg>`;
}

const FONT_STACK =
  "Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function ogSvg(withText) {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#fbfbfd"/>
  <defs>
    <linearGradient id="ogbar" x1="0" y1="0" x2="0" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#91e500"/><stop offset="0.25" stop-color="#12bcff"/><stop offset="0.5" stop-color="#2f44ff"/><stop offset="0.75" stop-color="#8200df"/><stop offset="1" stop-color="#df006c"/>
    </linearGradient>
    <linearGradient id="ogunder" x1="0" y1="0" x2="540" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#91e500"/><stop offset="0.33" stop-color="#12bcff"/><stop offset="0.66" stop-color="#2f44ff"/><stop offset="1" stop-color="#8200df"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="14" height="630" fill="url(#ogbar)"/>
  <svg x="860" y="170" width="280" height="280" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${MARK_INNER("ogm")}</svg>
  <rect x="120" y="392" width="380" height="8" fill="url(#ogunder)"/>
  ${
    withText
      ? `<text x="120" y="362" font-family="${FONT_STACK}" font-size="78" font-weight="700" fill="#13121f" letter-spacing="-2">EKAM AI</text>
  <text x="120" y="470" font-family="${FONT_STACK}" font-size="32" font-weight="400" fill="#3a3a3c">Build with AI. Scan before go-live.</text>`
      : ""
  }
</svg>`;
}

async function main() {
  await mkdir(`${ROOT}/public`, { recursive: true });
  await mkdir(`${ROOT}/src/app`, { recursive: true });

  await sharp(Buffer.from(iconSvg(512))).png().toFile(`${ROOT}/public/icon-512.png`);
  await sharp(Buffer.from(iconSvg(192))).png().toFile(`${ROOT}/public/icon-192.png`);
  await sharp(Buffer.from(iconSvg(180))).png().toFile(`${ROOT}/src/app/apple-icon.png`);

  // Probe whether <text> renders by comparing identical SVGs with/without text.
  const withText = await sharp(Buffer.from(ogSvg(true))).png().toBuffer();
  const noText = await sharp(Buffer.from(ogSvg(false))).png().toBuffer();
  const textRendered = Buffer.compare(withText, noText) !== 0;
  await writeFile(`${ROOT}/public/og-image.png`, textRendered ? withText : noText);

  console.log("SEO assets generated:");
  console.log("  public/icon-512.png");
  console.log("  public/icon-192.png");
  console.log("  src/app/apple-icon.png");
  console.log(`  public/og-image.png  (text rendered: ${textRendered})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
