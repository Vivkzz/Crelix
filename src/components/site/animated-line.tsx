"use client";

/**
 * Kalit-style animated SVG line.
 *
 * Behaviour:
 *  - Base path starts hidden (dashoffset = full length), then draws in ONCE
 *    on mount via a CSS transition. After the draw, it STAYS visible — no loop.
 *  - A subtle "lights" overlay (a tiny dash) travels along the path infinitely,
 *    giving the line a living glow without redrawing the whole stroke.
 *  - Each variant has its own default stroke width (bold for hero, thin for arch).
 */

import { useEffect, useState } from "react";

export type LineVariant = "hero1" | "hero2" | "arch" | "join1" | "join2";

const PATHS: Record<
  LineVariant,
  {
    d: string;
    viewBox: string;
    gradientId: string;
    x1: string;
    y1: string;
    x2: string;
    y2: string;
    defaultStroke: number;
  }
> = {
  hero1: {
    d: "M 529.607 350.5 H 397.607 C 375.516 350.5 357.607 332.591 357.607 310.5 V 276.5 C 357.607 254.409 339.699 236.5 317.607 236.5 H 193.107 C 180.681 236.5 170.607 246.574 170.607 259 V 260 C 170.607 271.874 180.233 281.5 192.107 281.5 C 203.982 281.5 213.607 271.874 213.607 260 V 46.5 C 213.607 24.4086 195.699 6.5 173.607 6.5 H -327.393",
    viewBox: "0 0 530 357",
    gradientId: "vichar-hero-line-1",
    x1: "529.607", y1: "350.5", x2: "-4.39255", y2: "6.49997",
    defaultStroke: 14,
  },
  hero2: {
    d: "M 0 366.5 H 225 C 247.091 366.5 265 348.591 265 326.5 V 287.049 C 265 274.132 275.829 263.751 288.742 264.05 C 301.023 264.335 311.018 274.377 311.018 286.662 C 311.018 299.264 300.716 309.435 288.114 309.273 L 267.486 309.007 C 245.597 308.726 228 290.902 228 269.011 V 185.5 C 228 163.409 245.909 145.5 268 145.5 H 355 C 377.091 145.5 395 127.591 395 105.5 V 46.5 C 395 24.4086 412.909 6.5 435 6.5 H 803",
    viewBox: "0 0 537 373",
    gradientId: "vichar-hero-line-2",
    x1: "0", y1: "366.5", x2: "485.929", y2: "-30.7928",
    defaultStroke: 14,
  },
  arch: {
    d: "M6.75 708.822V313.75C6.75 283.374 31.3743 258.75 61.75 258.75H240.751H488.75C519.126 258.75 543.75 234.126 543.75 203.75V157.75C543.75 127.374 568.375 102.75 598.75 102.75H632.75C646.005 102.75 656.75 113.495 656.75 126.75V127.25C656.75 140.229 646.229 150.75 633.25 150.75C620.272 150.75 609.75 140.229 609.75 127.25V61.75C609.75 31.3743 634.375 6.75 664.75 6.75H1290.87",
    viewBox: "0 0 621 429",
    gradientId: "vichar-arch-line",
    x1: "6.75", y1: "708.822", x2: "1290.87", y2: "6.75",
    defaultStroke: 8,
  },
  join1: {
    d: "M850 208.5H730C699.624 208.5 675 183.876 675 153.5V28.5C675 16.3497 684.85 6.5 697 6.5H697.5C709.374 6.5 719 16.1259 719 28C719 39.8741 709.374 49.5 697.5 49.5H0",
    viewBox: "0 0 850 215",
    gradientId: "vichar-join-line-1",
    x1: "850", y1: "208.5", x2: "0", y2: "49.5",
    defaultStroke: 10,
  },
  join2: {
    d: "M0 291.5H247C258.046 291.5 267 300.454 267 311.5C267 322.546 258.046 331.5 247 331.5C235.954 331.5 227 322.546 227 311.5V61.5C227 31.1243 251.624 6.5 282 6.5H843.831",
    viewBox: "0 0 844 338",
    gradientId: "vichar-join-line-2",
    x1: "0", y1: "291.5", x2: "843.831", y2: "6.5",
    defaultStroke: 10,
  },
};

export function AnimatedLine({
  variant,
  className = "",
  lightsDuration = 6,
  strokeWidth,
  showLights = true,
}: {
  variant: LineVariant;
  className?: string;
  lightsDuration?: number;
  strokeWidth?: number;
  showLights?: boolean;
}) {
  const cfg = PATHS[variant];
  const sw = strokeWidth ?? cfg.defaultStroke;
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    // Draw in once after mount — the transition creates the one-time draw effect
    const id = requestAnimationFrame(() => {
      setTimeout(() => setDrawn(true), 150);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`vichar-animated-line ${className}`}>
      <svg
        viewBox={cfg.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={drawn ? "is-drawn" : ""}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id={cfg.gradientId}
            x1={cfg.x1}
            y1={cfg.y1}
            x2={cfg.x2}
            y2={cfg.y2}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" style={{ stopColor: "var(--color-1)" }} />
            <stop offset="0.5" style={{ stopColor: "var(--color-2)" }} />
            <stop offset="0.75" style={{ stopColor: "var(--color-3)" }} />
            <stop offset="1" style={{ stopColor: "var(--color-4)" }} />
          </linearGradient>
        </defs>
        {/* Base path — draws in ONCE and stays */}
        <path
          d={cfg.d}
          stroke={`url(#${cfg.gradientId})`}
          strokeWidth={sw}
          pathLength={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animated-line-path"
        />
        {/* Lights overlay — a subtle moving glow dot (optional) */}
        {showLights && (
          <path
            d={cfg.d}
            stroke={`url(#${cfg.gradientId})`}
            strokeWidth={sw + 0.5}
            pathLength={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animated-line-lights"
            style={{ ["--lights-duration" as string]: `${lightsDuration}s` }}
          />
        )}
      </svg>
    </div>
  );
}
