"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { MiniPage } from "@/components/site/home/how-it-works";

const line = "var(--ek-line)";

function Parallax({ children, range = 20 }: { children: React.ReactNode; range?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  return (
    <motion.div ref={ref} className="ek-tile-visual" style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

function MiniFindings() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        { sev: "high", label: "High", title: "Reflected XSS in search endpoint" },
        { sev: "medium", label: "Medium", title: "Missing rate limit on login" },
        { sev: "low", label: "Low", title: "Verbose error in production" },
      ].map((f) => (
        <div
          key={f.title}
          className="flex items-center gap-3"
          style={{
            background: "#1C1C1E",
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <span className={`ek-chip ${f.sev}`}>{f.label}</span>
          <span className="text-[13px] font-medium" style={{ color: "#F5F5F7" }}>{f.title}</span>
        </div>
      ))}
    </div>
  );
}

function MiniConstellation() {
  const pts: [number, number][] = [
    [10, 62], [26, 34], [44, 50], [60, 22], [76, 42], [88, 18], [52, 74], [80, 70],
  ];
  const links: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 7],
  ];
  return (
    <svg viewBox="0 0 100 90" className="w-full" style={{ maxHeight: 150 }} aria-hidden="true">
      {links.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
          stroke="var(--ek-ink-3)" strokeOpacity="0.4" strokeWidth="0.5"
        />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="var(--ek-ink-3)" />
      ))}
    </svg>
  );
}

export function Suites() {
  const Viz = Parallax;

  const tiles: {
    key: string;
    big?: boolean;
    black?: boolean;
    title: React.ReactNode;
    link: { label: string; href: string };
    viz: React.ReactNode;
  }[] = [
    {
      key: "flow",
      big: true,
      title: <>EKAM AI <b>Flow.</b> Pages and full apps from a prompt. Plan, design, build, deploy.</>,
      link: { label: "Learn more", href: "/flow" },
      viz: (
        <div className="ek-glass" style={{ borderRadius: 14, overflow: "hidden", padding: 14, background: "var(--ek-surface)" }}>
          <MiniPage />
        </div>
      ),
    },
    {
      key: "pentest",
      big: true,
      black: true,
      title: <>EKAM AI <b>Pentest.</b> Twelve security specialists scan it before anyone sees it.</>,
      link: { label: "Learn more", href: "/pentest" },
      viz: <MiniFindings />,
    },
    {
      key: "search",
      title: <>EKAM AI <b>Search.</b> Market research that feeds your launch.</>,
      link: { label: "Learn more", href: "/search" },
      viz: <MiniConstellation />,
    },
    {
      key: "domains",
      title: <><b>Custom domains + SSL.</b> Bring your own. Provisioned automatically.</>,
      link: { label: "Learn more", href: "/flow" },
      viz: (
        <div style={{ fontSize: 13, color: "var(--ek-ink-2)", border: `1px solid ${line}`, borderRadius: 10, padding: "10px 14px", background: "var(--ek-surface)" }}>
          https://yourbrand.com <span style={{ color: "var(--ek-green)" }}>· ssl ok</span>
        </div>
      ),
    },
    {
      key: "preview",
      title: <><b>Real-time preview.</b> Watch every edit land as the agents work.</>,
      link: { label: "Learn more", href: "/flow" },
      viz: (
        <div style={{ display: "flex", gap: 8 }}>
          {["nav", "hero", "cards"].map((s, i) => (
            <div key={s} style={{ flex: 1, height: 44, borderRadius: 8, background: `color-mix(in srgb, var(--ek-ink) ${8 + i * 4}%, transparent)` }} />
          ))}
        </div>
      ),
    },
    {
      key: "redeploy",
      title: <><b>One-click redeploy.</b> Every change is a versioned diff. Ship or revert.</>,
      link: { label: "Learn more", href: "/flow" },
      viz: (
        <div style={{ fontSize: 12, color: "var(--ek-ink-3)" }}>
          <div>v12 · deployed 47s ago</div>
          <div style={{ color: "var(--ek-green)" }}>✓ live</div>
        </div>
      ),
    },
  ];

  return (
    <Section id="suites" className="ek-band">
      <SectionHeader
        eyebrow="The suite"
        title="Everything a launch needs."
        desc="Three suites in one workflow (build, scan, research), plus the infrastructure around them."
        align="center"
      />
      <div className="ek-bento mt-14">
        {tiles.map((t, i) => (
          <Reveal key={t.key} delay={i * 80} className={t.big ? "md:col-span-1 lg:row-span-1" : ""}>
            <div className={"ek-tile h-full" + (t.black ? " black" : "")}>
              <div className="ek-tile-title ek-tile-desc">{t.title}</div>
              <Link href={t.link.href} className="ek-link">{t.link.label}</Link>
              <Viz>{t.viz}</Viz>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
