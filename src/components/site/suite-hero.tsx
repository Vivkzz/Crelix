"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type RefObject } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Reveal, SplitReveal } from "@/components/shared/reveal";
import { WorkspaceWindow, useAgentRun } from "@/components/site/home/hero";
import { FindingsReport } from "@/components/site/home/security";
import { Threads, type ThreadHue } from "@/components/site/home/threads";
import { AGENTS } from "@/components/site/home/agents";
import { useReducedMotionSafe } from "@/components/shared/use-reduced-motion";

const TAGS: Record<string, string[]> = {
  flow: ["Launch page", "SaaS app", "Dashboard", "Portfolio", "API"],
  pentest: ["Authorized targets", "Pre-launch checks", "Live scan feed"],
  search: ["Audience signals", "Competitor map", "Launch angles"],
};

const CTA: Record<string, string> = {
  flow: "Build my site",
  pentest: "Run scan",
  search: "Run research",
};

/* each suite borrows the hue of the agent it is about */
const HUE: Record<string, string> = {
  flow: "var(--ek-a3)",
  pentest: "var(--ek-a5)",
  search: "var(--ek-a1)",
};

/* thread palettes: Flow uses the whole ensemble; Pentest the cool security
   range; Search the warm planning range */
const PALETTES: Record<string, ThreadHue[]> = {
  flow: AGENTS,
  pentest: [
    { rgb: [28, 140, 255], rgbDark: [58, 155, 255] },
    { rgb: [15, 181, 174], rgbDark: [28, 207, 198] },
    { rgb: [79, 200, 213], rgbDark: [79, 221, 213] },
    { rgb: [10, 150, 140], rgbDark: [20, 190, 175] },
    { rgb: [60, 120, 230], rgbDark: [90, 150, 255] },
    { rgb: [122, 92, 255], rgbDark: [140, 115, 255] },
  ],
  search: [
    { rgb: [255, 77, 126], rgbDark: [255, 92, 138] },
    { rgb: [255, 120, 70], rgbDark: [255, 135, 85] },
    { rgb: [255, 159, 28], rgbDark: [255, 169, 58] },
    { rgb: [245, 185, 60], rgbDark: [255, 196, 80] },
    { rgb: [235, 100, 50], rgbDark: [255, 115, 65] },
    { rgb: [255, 140, 100], rgbDark: [255, 155, 115] },
  ],
};

function SevFloat({ text, color, style }: { text: string; color: string; style?: CSSProperties }) {
  return (
    <div
      className="ek-suitehero-float"
      style={{ ...style, borderColor: `color-mix(in srgb, ${color} 40%, var(--ek-line))`, color }}
    >
      {text}
    </div>
  );
}

function FlowVisual() {
  const reduce = useReducedMotionSafe();
  const { stage, replay } = useAgentRun(!reduce);
  return <WorkspaceWindow stage={stage} demo={!reduce} onReplay={reduce ? undefined : replay} />;
}

function PentestVisual() {
  const [tilt, setTilt] = useState<[number, number]>([0, 0]);
  return (
    <div
      className="ek-pentest-stage"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt([((e.clientX - r.left) / r.width - 0.5) * 12, ((e.clientY - r.top) / r.height - 0.5) * 12]);
      }}
      onPointerLeave={() => setTilt([0, 0])}
    >
      <div className="ek-suitehero-panel">
        <FindingsReport />
        <div className="ek-scanline" aria-hidden="true" />
      </div>
      <SevFloat
        text="High · XSS"
        color="var(--ek-red)"
        style={{ left: 8, top: "14%", transform: `translate(${tilt[0]}px, ${tilt[1]}px)` }}
      />
      <SevFloat
        text="Medium · Rate limit"
        color="var(--ek-orange)"
        style={{ right: 8, top: "36%", transform: `translate(${tilt[0] * -0.7}px, ${tilt[1] * -0.7}px)` }}
      />
    </div>
  );
}

function SearchVisual() {
  const dots = [
    { n: "Framer", x: 66, y: 62 },
    { n: "Webflow", x: 72, y: 38 },
    { n: "Wix", x: 24, y: 30 },
    { n: "Relume", x: 52, y: 78 },
    { n: "Durable", x: 20, y: 68 },
  ];
  return (
    <div className="ek-research ek-research-card" aria-hidden="true">
      <div className="ek-research-map">
        <div className="ek-research-axis-y">Price</div>
        <div className="ek-research-axis-x">Built-in security →</div>
        <div className="ek-research-vline" /><div className="ek-research-hline" />
        {dots.map((d, i) => (
          <motion.div
            key={d.n}
            className="ek-research-dot"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span />{d.n}
          </motion.div>
        ))}
        <motion.div
          className="ek-research-dot ek-research-ekam"
          style={{ left: "74%", top: "16%" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, type: "spring", stiffness: 300, damping: 18 }}
        >
          <span />EKAM AI
        </motion.div>
      </div>
      <div className="ek-research-side">
        {[
          ["\"I'd pay double if it scanned before launch.\"", "r/SaaS"],
          ["\"Building is fast. Knowing it won't get hacked is slower.\"", "Indie Hackers"],
          ["\"We spent two weeks on positioning alone.\"", "G2 review"],
        ].map(([q, src], i) => (
          <motion.div
            key={src}
            className="ek-research-quote"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ fontSize: 14, color: "var(--ek-ink-2)", lineHeight: 1.5 }}>{q}</div>
            <div style={{ fontSize: 12, color: "var(--ek-ink-3)", marginTop: 6 }}>{src}</div>
          </motion.div>
        ))}
        <div className="ek-research-angles">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ek-ink-3)", marginBottom: 6 }}>Launch angles</div>
          {["Security-first builder", "Agencies shipping client sites", "Prompt-to-production"].map((a) => (
            <div key={a} className="ek-research-angle"><span />{a}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroVisual({ slug, focusRef }: { slug: string; focusRef: RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.7 });
  const y = useTransform(p, [0, 1], [36, 0]);
  const scale = useTransform(p, [0, 1], [0.96, 1]);
  return (
    <div className="ek-suitehero-scene" ref={ref} data-suite={slug}>
      <motion.div ref={focusRef} className="ek-suitehero-tilt" style={reduce ? undefined : { y, scale }}>
        {slug === "flow" && <FlowVisual />}
        {slug === "pentest" && <PentestVisual />}
        {slug === "search" && <SearchVisual />}
      </motion.div>
    </div>
  );
}

export function SuiteHero({
  suite,
}: {
  suite: {
    slug: string;
    name: string;
    fullName: string;
    tagline: string;
    description: string;
    color: string;
  };
}) {
  const focusRef = useRef<HTMLDivElement>(null);
  const hue = HUE[suite.slug] ?? "var(--ek-accent)";
  return (
    <section className="ek-suitehero">
      <div className="ek-hero3-art ek-suitehero-art">
        <Threads focusRef={focusRef} focusOffset={-2} spread={0.2} palette={PALETTES[suite.slug] ?? AGENTS} />
      </div>
      <div className="ek-container text-center">
        <Reveal>
          <div className="ek-hero3-eyebrow">
            <span className="ek-suite-dot" style={{ background: hue }} aria-hidden="true" />
            EKAM AI {suite.name.replace(" Suite", "")}
          </div>
        </Reveal>
        <SplitReveal
          as="h1"
          className="ek-h1-page mx-auto"
          lines={[suite.tagline]}
        />
        <Reveal delay={200}>
          <p className="ek-hero2-sub mx-auto mt-5" style={{ maxWidth: "58ch" }}>
            {suite.description}
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="ek-hero2-ctas">
            <Link href="/signup" className="ek-btn">{CTA[suite.slug] ?? "Start free"}</Link>
            <a href="#inside" className="ek-link" style={{ fontSize: 17 }}>Learn more</a>
          </div>
        </Reveal>
        <Reveal delay={380}>
          <div className="ek-suite-tags mt-7" style={{ justifyContent: "center" }}>
            {(TAGS[suite.slug] ?? []).map((t) => (
              <span key={t} className="ek-suite-tag">{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
      <HeroVisual slug={suite.slug} focusRef={focusRef} />
    </section>
  );
}
