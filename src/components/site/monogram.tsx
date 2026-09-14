"use client";

import { useId } from "react";

/**
 * Brand-data-driven monogram avatar. Renders an inline SVG (no network) with a
 * five-stop spectrum gradient background — using the same brand tokens as the
 * rest of the site (--color-1 … --color-5) — and the entity's initials centered.
 *
 * Deterministic per `seed`: the gradient angle and stop order are derived from
 * a hash of the seed, so each person/project gets a stable but distinct look
 * while staying on-brand. Replaces the previous third-party dicebear image
 * calls for testimonial avatars and portfolio project logos.
 */

const SPECTRUM = ["#91e500", "#12bcff", "#2f44ff", "#8200df", "#df006c"];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Monogram({
  seed,
  text,
  size = 48,
  radius = 22,
  className,
}: {
  seed: string;
  /** Override the auto-derived initials (e.g. explicit "AP"). */
  text?: string;
  size?: number;
  /** Corner radius in viewBox units (0-100). 22 ≈ softly rounded; use 50 for a circle. */
  radius?: number;
  className?: string;
}) {
  const label = (text || initialsOf(seed)).slice(0, 2);
  const h = hash(seed || label);
  const angle = ([0, 45, 90, 135] as const)[h % 4];

  // Hydration-safe unique id; strip the ":" chars React emits (invalid as SVG ids).
  const gid = "mg" + useId().replace(/[:]/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={seed}
    >
      <defs>
        <linearGradient
          id={gid}
          x1={0}
          y1={0}
          x2={1}
          y2={1}
          gradientUnits="objectBoundingBox"
          gradientTransform={`rotate(${angle} 0.5 0.5)`}
        >
          <stop offset="0%" stopColor={SPECTRUM[0]} />
          <stop offset="25%" stopColor={SPECTRUM[1]} />
          <stop offset="50%" stopColor={SPECTRUM[2]} />
          <stop offset="75%" stopColor={SPECTRUM[3]} />
          <stop offset="100%" stopColor={SPECTRUM[4]} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx={radius} ry={radius} fill={`url(#${gid})`} />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontWeight={700}
        fontSize={38}
        letterSpacing="0.5"
        fill="#ffffff"
        stroke="#13121f"
        strokeWidth={2.4}
        paintOrder="stroke fill"
      >
        {label}
      </text>
    </svg>
  );
}
