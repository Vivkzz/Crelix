"use client";

import { useId } from "react";

/**
 * ProfileAvatar — an offline, deterministic flat-portrait avatar.
 *
 * A real "profile picture" of a person (head, hair, shoulders) drawn from a
 * small palette of natural skin / hair / clothing tones — NOT the brand
 * spectrum gradient. Every seed produces a stable, distinct portrait with no
 * network requests (no external avatar service).
 */

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Natural, professional palettes — deliberately NOT the brand spectrum.
const SKIN = ["#f5d4b1", "#e8b889", "#d49b6e", "#b07d56", "#8d5a3c", "#6b4226"];
const HAIR = ["#211a14", "#3b2a1a", "#6b4f2a", "#9a7b4a", "#b9a87f", "#c9c3ba", "#5a4a3a"];
const SHIRT = ["#1f3a5f", "#2d4a3e", "#5a2a2a", "#33373d", "#43465a", "#5a4a2a", "#2a4650"];
const BG = ["#eef1f5", "#f2efec", "#eef0f2", "#f4f0ef", "#eff1ee", "#f1eef4", "#eef2f3"];
const STYLES = ["short", "side", "long", "bun", "bald", "curly"] as const;

export function ProfileAvatar({
  seed,
  size = 48,
  className,
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const rawId = useId();
  const clipId = "pa" + rawId.replace(/[:]/g, "");

  const rnd = mulberry32(hashStr(seed));
  const skin = SKIN[Math.floor(rnd() * SKIN.length)];
  const hair = HAIR[Math.floor(rnd() * HAIR.length)];
  const shirt = SHIRT[Math.floor(rnd() * SHIRT.length)];
  const bg = BG[Math.floor(rnd() * BG.length)];
  const style = STYLES[Math.floor(rnd() * STYLES.length)];
  const glasses = rnd() > 0.72;

  const hairEl = (() => {
    switch (style) {
      case "short":
        return (
          <path d="M34,43 Q34,26 50,26 Q66,26 66,43 Q50,39 34,43 Z" fill={hair} />
        );
      case "side":
        return (
          <path d="M34,43 Q34,26 50,26 Q66,26 66,43 Q60,38 50,40 Q40,42 34,43 Z" fill={hair} />
        );
      case "long":
        return (
          <>
            <path d="M34,43 Q34,26 50,26 Q66,26 66,43 Q50,39 34,43 Z" fill={hair} />
            <path d="M34,43 L31,76 Q34,80 39,77 L39,46 Z" fill={hair} />
            <path d="M66,43 L69,76 Q66,80 61,77 L61,46 Z" fill={hair} />
          </>
        );
      case "bun":
        return (
          <>
            <circle cx="50" cy="22" r="6" fill={hair} />
            <path d="M34,44 Q34,28 50,28 Q66,28 66,44 Q50,40 34,44 Z" fill={hair} />
          </>
        );
      case "curly":
        return (
          <path
            d="M33,44 Q35,39 38,42 Q40,37 43,42 Q45,37 48,42 Q50,37 53,42 Q55,37 58,42 Q60,39 63,42 Q65,39 67,44 C67,33 59,27 50,27 C41,27 33,33 33,44 Z"
            fill={hair}
          />
        );
      case "bald":
        return null;
      default:
        return null;
    }
  })();

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Profile avatar for ${seed}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="100" height="100" fill={bg} />
        {/* shoulders / shirt */}
        <path d="M8,100 Q8,70 50,70 Q92,70 92,100 Z" fill={shirt} />
        {/* collar */}
        <path d="M42,72 Q50,80 58,72 L58,84 L42,84 Z" fill={shirt} />
        {/* neck */}
        <rect x="45" y="59" width="10" height="14" rx="5" fill={skin} />
        {/* head */}
        <circle cx="50" cy="43" r="16" fill={skin} />
        {hairEl}
        {/* eyes */}
        <circle cx="45" cy="46" r="1.1" fill="#2b2b2b" />
        <circle cx="55" cy="46" r="1.1" fill="#2b2b2b" />
        {glasses && (
          <g stroke="#2b2b2b" strokeWidth="1.3" fill="none" strokeLinecap="round">
            <circle cx="45" cy="46" r="4" />
            <circle cx="55" cy="46" r="4" />
            <line x1="49" y1="46" x2="51" y2="46" />
          </g>
        )}
      </g>
    </svg>
  );
}
