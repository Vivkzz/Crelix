"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Reveal, SplitReveal } from "@/components/shared/reveal";
import { WorkspaceWindow } from "@/components/site/home/hero";
import { FindingsReport } from "@/components/site/home/security";

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

function PentestVisual() {
  const [tilt, setTilt] = useState<[number, number]>([0, 0]);
  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt([(e.clientX / r.width - 0.5) * 12, (e.clientY / r.height - 0.5) * 12]);
      }}
      onPointerLeave={() => setTilt([0, 0])}
    >
      <div className="ek-suitehero-panel"><FindingsReport /><div className="ek-scanline" aria-hidden="true" /></div>
      <SevFloat
        text="High · XSS"
        color="var(--ek-red)"
        style={{ left: -24, top: "8%", transform: `translate(${tilt[0]}px, ${tilt[1]}px)` }}
      />
      <SevFloat
        text="Medium · Rate limit"
        color="var(--ek-orange)"
        style={{ right: -24, top: "30%", transform: `translate(${tilt[0] * -0.7}px, ${tilt[1] * -0.7}px)` }}
      />
    </div>
  );
}

function SearchVisual() {
  const dots = [
    { n: "Framer", x: 68, y: 62 },
    { n: "Webflow", x: 78, y: 38 },
    { n: "Wix", x: 24, y: 30 },
    { n: "Relume", x: 55, y: 78 },
    { n: "Durable", x: 20, y: 68 },
  ];
  return (
    <div className="ek-research" aria-hidden="true">
      {/* positioning map */}
      <div className="ek-research-map">
        <div className="ek-research-axis-y">Price</div>
        <div className="ek-research-axis-x">Built-in security →</div>
        <div className="ek-research-vline" /><div className="ek-research-hline" />
        {dots.map((d) => (
          <div key={d.n} className="ek-research-dot" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
            <span />{d.n}
          </div>
        ))}
        <div className="ek-research-dot ek-research-ekam" style={{ left: "82%", top: "14%" }}>
          <span />EKAM AI
        </div>
      </div>
      {/* quotes + angles */}
      <div className="ek-research-side">
        {[
          ["\"I'd pay double if it scanned before launch.\"", "r/SaaS"],
          ["\"Building is fast. Knowing it won't get hacked is slower.\"", "Indie Hackers"],
          ["\"We spent two weeks on positioning alone.\"", "G2 review"],
        ].map(([q, src]) => (
          <div key={src} className="ek-research-quote">
            <div style={{ fontSize: 14, color: "var(--ek-ink-2)", lineHeight: 1.5 }}>{q}</div>
            <div style={{ fontSize: 12, color: "var(--ek-ink-3)", marginTop: 6 }}>{src}</div>
          </div>
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

function HeroVisual({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.7 });
  const rotateX = useTransform(p, [0, 1], [14, 0]);
  const scale = useTransform(p, [0, 1], [0.9, 1]);
  return (
    <div className="ek-suitehero-scene" ref={ref}>
      <motion.div
        className="ek-suitehero-tilt"
        style={{ rotateX, scale, transformPerspective: 1600 }}
      >
        {slug === "flow" && <WorkspaceWindow stage={6} />}
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
  return (
    <section className="ek-suitehero">
      <div className="ek-container text-center">
        <Reveal>
          <div className="ek-eyebrow">EKAM AI {suite.name.replace(" Suite", "")}</div>
        </Reveal>
        <SplitReveal
          as="h1"
          className="ek-h1-page mt-4 mx-auto"
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
      <HeroVisual slug={suite.slug} />
    </section>
  );
}
