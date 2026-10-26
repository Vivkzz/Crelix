"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Lock } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { MiniPage } from "@/components/site/home/how-it-works";
import { AGENTS } from "@/components/site/home/agents";
import { useReducedMotionSafe } from "@/components/shared/use-reduced-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/* plays once when the tile scrolls into view; reduced motion starts at the end state */
function useShown<T extends Element>() {
  const ref = useRef<T>(null);
  const reduce = useReducedMotionSafe();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return { ref, on: reduce || inView, reduce };
}

/* ---------- tile visuals ---------- */

function VizFlow() {
  const { ref, on } = useShown<HTMLDivElement>();
  const chips = [
    { a: AGENTS[1], text: "tokens + 3 screens", x: "3%", y: "0%" },
    { a: AGENTS[2], text: "42 files · 9 routes", x: "52%", y: "0%" },
  ];
  return (
    <div ref={ref} className="ek-viz-flow" aria-hidden="true">
      <motion.div
        className="ek-viz-flow-window"
        initial={{ y: 40, opacity: 0 }}
        animate={on ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 1, ease: EASE }}
      >
        <div className="ek-browser-bar">
          <div className="ek-browser-dots"><span /><span /><span /></div>
          <div className="ek-browser-url"><span className="live-dot" />yourbrand.ekamai.app</div>
          <span style={{ width: 40 }} />
        </div>
        <MiniPage />
      </motion.div>
      {chips.map((c, i) => (
        <motion.span
          key={c.text}
          className="ek-viz-agentchip"
          style={{ left: c.x, top: c.y, "--hue": c.a.hue } as CSSProperties}
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={on ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ delay: 0.5 + i * 0.25, duration: 0.6, ease: EASE }}
        >
          <i />
          <b>{c.a.name}</b> <span>{c.text}</span>
        </motion.span>
      ))}
    </div>
  );
}

/* the twelve specialists (OWASP classes + race conditions), short labels */
const SPECIALISTS = [
  "Access control", "Cryptography", "Injection", "Insecure design",
  "Misconfiguration", "Components", "Auth & session", "Data integrity",
  "Logging", "SSRF", "Business logic", "Race conditions",
];
/* which specialists raise a finding before the fix */
const FLAGGED: Record<number, string> = { 2: "high", 7: "low", 10: "medium" };

function VizPentest() {
  const { ref, on, reduce } = useShown<HTMLDivElement>();
  return (
    <div ref={ref} className="ek-viz-spec" aria-hidden="true">
      <div className="ek-viz-spec-grid">
        {SPECIALISTS.map((name, i) => {
          const sev = FLAGGED[i];
          return (
            <motion.span
              key={name}
              className={`ek-viz-spec-cell${sev ? ` flag ${sev}` : ""}`}
              initial={{ opacity: 0.25 }}
              animate={on ? { opacity: 1 } : undefined}
              transition={{ delay: reduce ? 0 : 0.2 + i * 0.11, duration: 0.35 }}
            >
              <motion.i
                initial={{ scale: 0 }}
                animate={on ? { scale: 1 } : undefined}
                transition={{ delay: reduce ? 0 : 0.2 + i * 0.11, type: "spring", stiffness: 420, damping: 22 }}
              />
              {name}
            </motion.span>
          );
        })}
      </div>
      <motion.div
        className="ek-viz-pentest-foot"
        initial={{ opacity: 0, y: 6 }}
        animate={on ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: reduce ? 0 : 1.8, duration: 0.5, ease: EASE }}
      >
        <span className="ek-live-ping" /> 3 found · 3 fixed · rescan clean
      </motion.div>
    </div>
  );
}

function VizSearch() {
  const { ref, on } = useShown<HTMLDivElement>();
  const rivals: [number, number, string][] = [
    [24, 30, "Wix"], [62, 66, "Framer"], [68, 38, "Webflow"], [28, 72, "Durable"],
  ];
  return (
    <div ref={ref} className="ek-viz-map" aria-hidden="true">
      <span className="ek-viz-map-axis x">Built-in security →</span>
      <span className="ek-viz-map-axis y">Speed ↑</span>
      <i className="ek-viz-map-v" /><i className="ek-viz-map-h" />
      {rivals.map(([x, y, n], i) => (
        <motion.span
          key={n}
          className="ek-viz-map-dot"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={on ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: 0.15 + i * 0.1, duration: 0.4, ease: EASE }}
        >
          <i />{n}
        </motion.span>
      ))}
      <motion.span
        className="ek-viz-map-dot ekam"
        style={{ left: "84%", top: "16%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={on ? { opacity: 1, scale: 1 } : undefined}
        transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 18 }}
      >
        <i />You
      </motion.span>
    </div>
  );
}

function VizDomains() {
  const { ref, on } = useShown<HTMLDivElement>();
  const steps = ["DNS", "SSL", "Live"];
  return (
    <div ref={ref} className="ek-viz-domain" aria-hidden="true">
      <div className="ek-viz-domain-url">
        <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
        <span>yourbrand.com</span>
      </div>
      <div className="ek-viz-domain-steps">
        {steps.map((s, i) => (
          <motion.span
            key={s}
            initial={{ opacity: 0.35 }}
            animate={on ? { opacity: 1 } : undefined}
            transition={{ delay: 0.3 + i * 0.45, duration: 0.3 }}
          >
            <motion.i
              initial={{ scale: 0 }}
              animate={on ? { scale: 1 } : undefined}
              transition={{ delay: 0.3 + i * 0.45, type: "spring", stiffness: 420, damping: 20 }}
            >
              ✓
            </motion.i>
            {s}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function VizPreview() {
  const { ref, on } = useShown<HTMLDivElement>();
  return (
    <div ref={ref} className="ek-viz-preview" aria-hidden="true">
      <motion.div
        className="ek-viz-preview-ask"
        initial={{ opacity: 0, y: 8 }}
        animate={on ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, ease: EASE }}
      >
        Make the hero calmer
      </motion.div>
      <div className="ek-viz-preview-page">
        <i className="nav" />
        <motion.i
          className="hero"
          initial={{ backgroundColor: "rgba(120,120,128,0.14)" }}
          animate={on ? { backgroundColor: ["rgba(120,120,128,0.14)", "rgba(255,77,126,0.16)", "rgba(110,168,254,0.32)"] } : undefined}
          transition={{ delay: 0.7, duration: 1.2, times: [0, 0.4, 1] }}
        />
        <span className="cards"><i /><i /><i /></span>
        <motion.span
          className="ek-viz-preview-tag"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={on ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: 1.5, duration: 0.4, ease: EASE }}
        >
          hero updated · 0.8s
        </motion.span>
      </div>
    </div>
  );
}

function VizRedeploy() {
  const { ref, on } = useShown<HTMLDivElement>();
  const versions = [
    { v: "v12", note: "Calmer hero", when: "47s ago", live: true },
    { v: "v11", note: "Pricing page", when: "2h ago" },
    { v: "v10", note: "Hindi + English", when: "yesterday" },
  ];
  return (
    <div ref={ref} className="ek-viz-versions" aria-hidden="true">
      {versions.map((r, i) => (
        <motion.div
          key={r.v}
          className={`ek-viz-version${r.live ? " live" : ""}`}
          initial={{ opacity: 0, y: -10 }}
          animate={on ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: EASE }}
        >
          <i />
          <b>{r.v}</b>
          <span className="n">{r.note}</span>
          <span className="w">{r.live ? "live" : "revert"}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- tiles ---------- */

type Tile = {
  key: string;
  size: "big" | "small";
  dark?: boolean;
  hue: string;
  title: ReactNode;
  link: { label: string; href: string };
  viz: ReactNode;
};

const TILES: Tile[] = [
  {
    key: "flow",
    size: "big",
    hue: "var(--ek-a3)",
    title: <><b>EKAM AI Flow.</b> Pages and full apps from a prompt. Plan, design, build, deploy.</>,
    link: { label: "Explore Flow", href: "/flow" },
    viz: <VizFlow />,
  },
  {
    key: "pentest",
    size: "big",
    dark: true,
    hue: "var(--ek-a5)",
    title: <><b>EKAM AI Pentest.</b> Twelve security specialists try to break it before anyone sees it.</>,
    link: { label: "Explore Pentest", href: "/pentest" },
    viz: <VizPentest />,
  },
  {
    key: "search",
    size: "small",
    hue: "var(--ek-a1)",
    title: <><b>EKAM AI Search.</b> Market research that feeds your launch.</>,
    link: { label: "Explore Search", href: "/search" },
    viz: <VizSearch />,
  },
  {
    key: "domains",
    size: "small",
    hue: "var(--ek-a6)",
    title: <><b>Custom domains.</b> Bring your own. SSL provisioned automatically.</>,
    link: { label: "Learn more", href: "/flow" },
    viz: <VizDomains />,
  },
  {
    key: "preview",
    size: "small",
    hue: "var(--ek-a2)",
    title: <><b>Real-time preview.</b> Watch every edit land as the agents work.</>,
    link: { label: "Learn more", href: "/flow" },
    viz: <VizPreview />,
  },
  {
    key: "redeploy",
    size: "small",
    hue: "var(--ek-a4)",
    title: <><b>One-click redeploy.</b> Every change is a versioned diff. Ship or revert.</>,
    link: { label: "Learn more", href: "/flow" },
    viz: <VizRedeploy />,
  },
];

export function Suites() {
  return (
    <Section id="suites" className="ek-band">
      <SectionHeader
        eyebrow="The suite"
        title="Everything a launch needs."
        desc="Three suites in one workflow (build, scan, research), plus the infrastructure around them."
        align="center"
      />
      <div className="ek-bento mt-14">
        {TILES.map((t, i) => (
          <Reveal key={t.key} delay={(i % 4) * 70} className={`ek-bento-cell ${t.size}`}>
            <div
              className={`ek-tile ${t.size}${t.dark ? " dark-tile" : ""}`}
              style={{ "--hue": t.hue } as CSSProperties}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <div className="ek-tile-copy">
                <p className="ek-tile-title">{t.title}</p>
                <Link href={t.link.href} className="ek-link ek-tile-link">{t.link.label}</Link>
              </div>
              <div className="ek-tile-visual">{t.viz}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
