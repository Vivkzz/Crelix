"use client";

import { useId } from "react";

/**
 * Hand-authored, data-driven SVG illustrations for the four "How it works"
 * steps. Each uses the brand spectrum tokens (--color-1 … --color-5) so the
 * artwork is on-brand and renders with zero network requests. Replaces the
 * previous generic stock PNGs that had nothing to do with each step.
 *
 * All four share a 400×300 (4:3) viewBox so they fill the `aspect-[4/3]` card
 * uniformly.
 */

export type StepVariant = "describe" | "assets" | "security" | "launch";

const C = {
  c1: "#91e500",
  c2: "#12bcff",
  c3: "#2f44ff",
  c4: "#8200df",
  c5: "#df006c",
  ink: "#13121f",
};

/** Soft shared background: a pale card + two faint spectrum glows. */
function Bg({ id }: { id: string }) {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" fill="#f6f7fb" />
      <defs>
        <radialGradient id={`${id}-g1`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.c2} stopOpacity="0.16" />
          <stop offset="100%" stopColor={C.c2} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-g2`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.c4} stopOpacity="0.14" />
          <stop offset="100%" stopColor={C.c4} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="70" r="110" fill={`url(#${id}-g1)`} />
      <circle cx="90" cy="250" r="120" fill={`url(#${id}-g2)`} />
    </>
  );
}

function Describe({ id }: { id: string }) {
  return (
    <>
      <Bg id={`${id}-bg`} />
      {/* Prompt document card */}
      <rect x="108" y="74" width="184" height="152" rx="16" fill="#ffffff" stroke={C.ink} strokeOpacity="0.12" strokeWidth="2" />
      {/* Text lines (spectrum bars) */}
      <rect x="128" y="100" width="120" height="9" rx="4.5" fill={C.c1} />
      <rect x="128" y="122" width="144" height="9" rx="4.5" fill={C.c2} />
      <rect x="128" y="144" width="96" height="9" rx="4.5" fill={C.c3} />
      {/* Prompt input row */}
      <rect x="128" y="182" width="128" height="26" rx="13" fill="#f1f3f9" stroke={C.ink} strokeOpacity="0.1" />
      <circle cx="142" cy="195" r="5" fill={C.c4} />
      <rect x="154" y="190" width="60" height="9" rx="4.5" fill={C.ink} fillOpacity="0.18" />
      {/* Blinking caret */}
      <rect x="222" y="187" width="3" height="16" rx="1.5" fill={C.c5} />
      {/* Sparkle (top-right) */}
      <path
        d="M278 60 q4 -12 16 -16 q-12 -4 -16 -16 q-4 12 -16 16 q12 4 16 16Z"
        fill={C.c1}
      />
      <path
        d="M300 92 q2 -6 8 -8 q-6 -2 -8 -8 q-2 6 -8 8 q6 2 8 8Z"
        fill={C.c2}
      />
    </>
  );
}

function Assets({ id }: { id: string }) {
  return (
    <>
      <Bg id={`${id}-bg`} />
      {/* Floating file chips being dropped */}
      <g transform="rotate(-8 150 120)">
        <rect x="92" y="92" width="86" height="60" rx="10" fill="#ffffff" stroke={C.c1} strokeWidth="3" />
        <rect x="106" y="106" width="58" height="7" rx="3.5" fill={C.c1} />
        <rect x="106" y="120" width="40" height="7" rx="3.5" fill={C.c1} opacity="0.5" />
        <path d="M170 108 l14 0 l0 14" fill="none" stroke={C.c1} strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="rotate(7 250 110)">
        <rect x="208" y="86" width="86" height="60" rx="10" fill="#ffffff" stroke={C.c2} strokeWidth="3" />
        <rect x="222" y="100" width="58" height="7" rx="3.5" fill={C.c2} />
        <rect x="222" y="114" width="40" height="7" rx="3.5" fill={C.c2} opacity="0.5" />
        <path d="M286 102 l14 0 l0 14" fill="none" stroke={C.c2} strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* Dashed drop zone */}
      <rect
        x="120"
        y="176"
        width="160"
        height="78"
        rx="16"
        fill="#ffffff"
        stroke={C.c4}
        strokeWidth="3"
        strokeDasharray="10 9"
        strokeLinecap="round"
      />
      {/* Upload arrow into the tray */}
      <g stroke={C.c4} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M200 232 l0 -38" />
        <path d="M184 210 l16 -18 l16 18" />
      </g>
      {/* Sparkle */}
      <path d="M300 200 q3 -8 10 -10 q-7 -2 -10 -10 q-3 8 -10 10 q7 2 10 10Z" fill={C.c5} />
    </>
  );
}

function Security({ id }: { id: string }) {
  return (
    <>
      <Bg id={`${id}-bg`} />
      <defs>
        <linearGradient id={`${id}-shield`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.c1} />
          <stop offset="35%" stopColor={C.c2} />
          <stop offset="70%" stopColor={C.c3} />
          <stop offset="100%" stopColor={C.c4} />
        </linearGradient>
      </defs>
      {/* Browser window */}
      <rect x="84" y="64" width="232" height="158" rx="14" fill="#ffffff" stroke={C.ink} strokeOpacity="0.12" strokeWidth="2" />
      <rect x="84" y="64" width="232" height="34" rx="14" fill="#eef1f8" />
      <rect x="84" y="84" width="232" height="14" fill="#eef1f8" />
      <circle cx="104" cy="81" r="5" fill={C.c5} />
      <circle cx="120" cy="81" r="5" fill={C.c1} />
      <circle cx="136" cy="81" r="5" fill={C.c2} />
      <rect x="156" y="74" width="148" height="14" rx="7" fill="#ffffff" stroke={C.ink} strokeOpacity="0.08" />
      {/* Window content lines */}
      <rect x="104" y="120" width="120" height="8" rx="4" fill={C.c2} opacity="0.6" />
      <rect x="104" y="138" width="160" height="8" rx="4" fill={C.ink} opacity="0.1" />
      <rect x="104" y="156" width="96" height="8" rx="4" fill={C.ink} opacity="0.1" />
      {/* Shield overlay (bottom-right) */}
      <path
        d="M248 188 l40 -14 l0 34 q0 22 -40 40 q-40 -18 -40 -40 l0 -34 z"
        fill={`url(#${id}-shield)`}
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M232 214 l12 12 l22 -24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function Launch({ id }: { id: string }) {
  return (
    <>
      <Bg id={`${id}-bg`} />
      <defs>
        <linearGradient id={`${id}-rocket`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.c2} />
          <stop offset="50%" stopColor={C.c3} />
          <stop offset="100%" stopColor={C.c4} />
        </linearGradient>
        <linearGradient id={`${id}-flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.c1} />
          <stop offset="60%" stopColor={C.c5} />
          <stop offset="100%" stopColor={C.c5} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Deploy orbit arc */}
      <path
        d="M120 232 q80 -90 160 -90"
        fill="none"
        stroke={C.c3}
        strokeWidth="3"
        strokeDasharray="4 8"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Deployed page card (bottom) */}
      <rect x="120" y="212" width="160" height="54" rx="12" fill="#ffffff" stroke={C.ink} strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="138" cy="226" r="4" fill={C.c5} />
      <rect x="150" y="222" width="64" height="8" rx="4" fill={C.ink} opacity="0.12" />
      <rect x="136" y="246" width="128" height="7" rx="3.5" fill={C.c2} opacity="0.5" />
      {/* Rocket */}
      <g transform="translate(200 150) rotate(20)">
        {/* flame */}
        <path d="M-12 38 q12 26 24 0 q-12 18 -24 -2 Z" fill={`url(#${id}-flame)`} />
        {/* body */}
        <path d="M0 -52 q22 18 22 46 l0 22 l-44 0 l0 -22 q0 -28 22 -46 Z" fill={`url(#${id}-rocket)`} />
        {/* window */}
        <circle cx="0" cy="-14" r="9" fill="#ffffff" />
        {/* fins */}
        <path d="M-22 6 l-16 18 l16 0 Z" fill={C.c5} />
        <path d="M22 6 l16 18 l-16 0 Z" fill={C.c5} />
      </g>
      {/* Stars */}
      <path d="M120 120 q2 -7 8 -8 q-6 -1 -8 -8 q-2 7 -8 8 q6 1 8 8Z" fill={C.c1} />
      <path d="M296 96 q2 -6 7 -7 q-5 -1 -7 -7 q-2 6 -7 7 q5 1 7 7Z" fill={C.c4} />
      <circle cx="262" cy="150" r="3" fill={C.c2} />
    </>
  );
}

export function StepArt({ variant, className }: { variant: StepVariant; className?: string }) {
  const raw = useId();
  const id = "sa" + raw.replace(/[:]/g, "");
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {variant === "describe" && <Describe id={id} />}
      {variant === "assets" && <Assets id={id} />}
      {variant === "security" && <Security id={id} />}
      {variant === "launch" && <Launch id={id} />}
    </svg>
  );
}
