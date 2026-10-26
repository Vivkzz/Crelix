"use client";

import { useMemo } from "react";

/**
 * Generative cover art for posts: bundles of fine strands that pass through
 * one focal point, the same motif as the homepage threads. Deterministic per
 * `seed`, so every post keeps its own cover; hues follow the category.
 */

const W = 800;
const H = 500;

/* hue families as CSS variables so covers follow light/dark */
const FAMILIES: Record<string, string[]> = {
  product: ["var(--ek-a2)", "var(--ek-a3)", "var(--ek-a4)", "var(--ek-a1)"],
  guide: ["var(--ek-a5)", "var(--ek-a4)", "var(--ek-a6)", "var(--ek-a3)"],
  compare: ["var(--ek-a1)", "var(--ek-a2)", "var(--ek-a3)", "var(--ek-a5)"],
  company: ["var(--ek-a6)", "var(--ek-a1)", "var(--ek-a2)", "var(--ek-a4)"],
};

export function categoryHue(category: string) {
  return (FAMILIES[category] ?? FAMILIES.product)[0];
}

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function ThreadCover({
  seed,
  category,
  className = "",
}: {
  seed: string;
  category: string;
  className?: string;
}) {
  const hues = FAMILIES[category] ?? FAMILIES.product;
  const art = useMemo(() => {
    const r = rng(seed);
    const fx = W * (0.32 + r() * 0.36);
    const fy = H * (0.38 + r() * 0.24);
    const half = Math.max(fx, W - fx);
    const freq = 1.6 + r() * 1.8;
    const phase = r() * Math.PI * 2;
    const bundles = hues.map((hue, b) => {
      const spread = (b - (hues.length - 1) / 2) * (H * (0.13 + r() * 0.08));
      const strands: string[] = [];
      for (let s = 0; s < 7; s++) {
        let d = "";
        for (let i = 0; i <= 56; i++) {
          const x = -10 + (i / 56) * (W + 20);
          const u = (x - fx) / half;
          const side = u < 0 ? -1 : 1;
          const env = Math.pow(Math.min(Math.abs(u), 1.1), 1.25);
          const twist = 0.55 + 0.45 * Math.sin(u * 3 + b + phase);
          const y =
            fy +
            env *
              (spread * side +
                (s - 3) * 3.2 * twist +
                H * 0.1 * Math.sin(u * freq + b * 0.9 + phase));
          d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        strands.push(d);
      }
      return { hue, strands };
    });
    return { fx, fy, bundles };
  }, [seed, hues]);

  return (
    <svg
      className={`ek-cover ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden="true"
    >
      <g className="ek-cover-threads">
        {art.bundles.map((bundle, b) => (
          <g key={b} stroke={bundle.hue} fill="none" strokeLinecap="round">
            {bundle.strands.map((d, s) => (
              <path key={s} d={d} strokeWidth={s === 3 ? 1.6 : 0.9} opacity={s === 3 ? 0.9 : 0.42} />
            ))}
          </g>
        ))}
      </g>
      <circle cx={art.fx} cy={art.fy} r="22" className="ek-cover-glow" />
      <circle cx={art.fx} cy={art.fy} r="4.5" className="ek-cover-point" />
    </svg>
  );
}
