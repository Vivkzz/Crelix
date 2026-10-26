// Generates the Crelix AI brand image assets:
//   public/logo.svg                            (mark, ink on light)
//   src/app/icon.svg                           (favicon, follows OS dark mode)
//   public/icon-512.png, public/icon-192.png   (manifest icons, white mark on blue)
//   src/app/apple-icon.png                     (180px apple-touch-icon)
//   public/og-image.png                        (1200x630 social card)
//
// Run from the repo root:  bun scripts/gen-seo-assets.mjs   (or node)
// The social card sets its text in Inter; install Inter on the machine
// running this (fontconfig) or the text falls back to the system sans.
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const INK = "#1d1d1f";
const BLUE = "#0071E3";
const BLUE_DARK = "#2997FF";

/* The mark: a "c" with a full-stop dot, drawn in a 64x64 box.
   Same stroke and dot as the logo component in src/components/site/logo.tsx. */
const C_PATH = "M44.4 18.6A19 19 0 1 0 44.4 45.4";
const DOT = { cx: 51.5, cy: 52.5, r: 4.8 };

const markSvg = ({ stroke, dot, width = 6.5 }) =>
  `<path d="${C_PATH}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>` +
  `<circle cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}" fill="${dot}"/>`;

const logoSvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${markSvg({ stroke: INK, dot: BLUE })}
</svg>
`;

const faviconSvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .st { stroke: ${INK}; }
    .dt { fill: ${BLUE}; }
    @media (prefers-color-scheme: dark) {
      .st { stroke: #f5f5f7; }
      .dt { fill: ${BLUE_DARK}; }
    }
  </style>
  <path class="st" d="${C_PATH}" fill="none" stroke-width="8" stroke-linecap="round"/>
  <circle class="dt" cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}"/>
</svg>
`;

function iconSvg(size) {
  /* the mark sits optically centred: the dot hangs low-right, so nudge up-left */
  const m = size * 0.62;
  const off = (size - m) / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BLUE}"/>
  <svg x="${off - size * 0.02}" y="${off - size * 0.03}" width="${m}" height="${m}" viewBox="0 0 64 64">
    ${markSvg({ stroke: "#fff", dot: "#fff", width: 7 })}
  </svg>
</svg>`;
}

/* six agent hues, warm to cool: Planner, Designer, Engineer, Tester, Security, Deployer */
const HUES = ["#FF9F1C", "#FF4D7E", "#7A5CFF", "#1C8CFF", "#0FB5AE", "#2FBF5B"];

/* bundles of fine strands that pass through one focal point (the site's hero motif) */
function threads(W, H, fx, fy) {
  let out = "";
  HUES.forEach((hue, b) => {
    for (let s = 0; s < 7; s++) {
      let d = "";
      for (let i = 0; i <= 90; i++) {
        const x = -10 + (i / 90) * (W + 20);
        /* each side normalised to its own width so both fan out fully */
        const u = x < fx ? (x - fx) / fx : (x - fx) / (W - fx);
        const side = u < 0 ? -1 : 1;
        const env = Math.pow(Math.min(Math.abs(u), 1.15), 1.3);
        const twist = 0.55 + 0.45 * Math.sin(u * 3.1 + b * 1.3);
        const y =
          fy +
          env *
            ((b - 2.5) * 46 * side +
              (s - 3) * 3.6 * twist +
              H * 0.09 * Math.sin(u * 2.3 + b * 0.85) +
              H * 0.03 * Math.sin(u * 5.2 + b * 1.9));
        d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      const centre = s === 3;
      out += `<path d="${d}" fill="none" stroke="${hue}" stroke-width="${centre ? 1.8 : 1}" stroke-opacity="${centre ? 0.85 : 0.38}" stroke-linecap="round"/>`;
    }
  });
  return out;
}

const FONT = "Inter, 'Inter Display', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function ogSvg() {
  const W = 1200;
  const H = 630;
  const fx = 1010;
  const fy = 330;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fadeL" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.92"/>
      <stop offset="0.72" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#fff"/><stop offset="0.25" stop-color="#7A5CFF" stop-opacity="0.35"/><stop offset="1" stop-color="#7A5CFF" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#fff"/>
  ${threads(W, H, fx, fy)}
  <rect width="${W}" height="${H}" fill="url(#fadeL)"/>
  <circle cx="${fx}" cy="${fy}" r="34" fill="url(#glow)"/>
  <circle cx="${fx}" cy="${fy}" r="5" fill="${INK}"/>
  <svg x="88" y="92" width="56" height="56" viewBox="0 0 64 64">${markSvg({ stroke: INK, dot: BLUE })}</svg>
  <text x="152" y="134" font-family="${FONT}" font-size="40" font-weight="600" letter-spacing="-1.6" fill="${INK}">crelix</text>
  <text x="88" y="300" font-family="${FONT}" font-size="84" font-weight="600" letter-spacing="-3" fill="${INK}">Many agents.</text>
  <text x="88" y="392" font-family="${FONT}" font-size="84" font-weight="600" letter-spacing="-3" fill="${INK}">One launch<tspan fill="${BLUE}">.</tspan></text>
  <text x="90" y="458" font-family="${FONT}" font-size="28" font-weight="500" fill="#6E6E73">Six specialists build it. Twelve more secure it.</text>
  <text x="90" y="560" font-family="${FONT}" font-size="22" font-weight="500" fill="#86868B">crelixai.com</text>
</svg>`;
}

async function main() {
  await mkdir(path.join(ROOT, "public"), { recursive: true });
  await mkdir(path.join(ROOT, "src/app"), { recursive: true });

  await writeFile(path.join(ROOT, "public/logo.svg"), logoSvg);
  await writeFile(path.join(ROOT, "src/app/icon.svg"), faviconSvg);
  await sharp(Buffer.from(iconSvg(512))).png().toFile(path.join(ROOT, "public/icon-512.png"));
  await sharp(Buffer.from(iconSvg(192))).png().toFile(path.join(ROOT, "public/icon-192.png"));
  await sharp(Buffer.from(iconSvg(180))).png().toFile(path.join(ROOT, "src/app/apple-icon.png"));
  await sharp(Buffer.from(ogSvg())).png().toFile(path.join(ROOT, "public/og-image.png"));

  console.log("Brand assets written: public/logo.svg, src/app/icon.svg, public/icon-{192,512}.png, src/app/apple-icon.png, public/og-image.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
