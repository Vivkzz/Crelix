"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useScroll, useMotionValueEvent, useSpring, AnimatePresence } from "framer-motion";
import { Eyebrow } from "@/components/shared/section";

const steps = [
  {
    idx: "Step 1",
    title: "Describe",
    desc: "Tell the agents what you're building, who it's for, and the angle. Drop references, copy fragments, brand colours, no setup marathon.",
  },
  {
    idx: "Step 2",
    title: "Build",
    desc: "Six specialists plan, design, write and assemble the real thing (frontend, backend, copy) while you watch it come together.",
  },
  {
    idx: "Step 3",
    title: "Scan",
    desc: "Twelve security specialists run an authorized pre-launch scan across the OWASP classes. Findings come back with evidence and fixes.",
  },
  {
    idx: "Step 4",
    title: "Go live",
    desc: "One click and it's on a URL you own, already scanned and validated. Every project ships with its launch check done.",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const line = "var(--ek-line)";
const lineStrong = "var(--ek-line-strong)";
const ink3 = "var(--ek-ink-3)";
const bg2 = "var(--ek-bg-2)";

/* A finished mini landing page inside the browser window — real text content,
   not grey boxes. assemble=true shows outline wireframes first (~0.6s),
   then the filled content fades/slides in, staggered. */
function RevealBlock({
  delay,
  style,
  children,
  fill,
  assemble,
}: {
  delay: number;
  style?: CSSProperties;
  children: React.ReactNode;
  fill?: CSSProperties;
  assemble: boolean;
}) {
  return (
    <motion.div
      initial={assemble ? { opacity: 0, y: 5 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: EASE }}
      style={{ border: `1px solid ${line}`, borderRadius: 5, position: "relative", overflow: "hidden", ...style }}
    >
      <motion.div
        initial={assemble ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.6, duration: 0.45, ease: EASE }}
        style={{ position: "absolute", inset: 0, ...fill }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export const PAGE_W = 1280;
export const PAGE_H = 800;

/* Renders a real-sized 1280x800 page scaled to fit its container.
   The canvas is authored at real website proportions so the
   thumbnail reads like an actual site, not a wireframe. */
export function ScaledCanvas({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.001);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const cs = getComputedStyle(el);
      const padW = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const w = el.clientWidth - padW;
      setScale(w / PAGE_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${PAGE_W}/${PAGE_H}` }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: PAGE_W,
          height: PAGE_H,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const heroPhoto: CSSProperties = {
  background:
    "radial-gradient(closest-side at 30% 26%, rgba(255,255,255,0.85) 0%, transparent 60%)," +
    "radial-gradient(closest-side at 72% 68%, rgba(60,120,190,0.55) 0%, transparent 65%)," +
    "radial-gradient(closest-side at 20% 82%, rgba(180,200,225,0.7) 0%, transparent 60%)," +
    "linear-gradient(150deg, #DBE5F0 0%, #B8CCE4 45%, #8FAECC 78%, #7A9CBD 100%)",
};

const cardPhoto = (tint: string): CSSProperties => ({
  background:
    `radial-gradient(closest-side at 70% 20%, rgba(255,255,255,0.75) 0%, transparent 55%),` +
    `linear-gradient(140deg, ${tint} 0%, color-mix(in srgb, ${tint} 72%, #8a97a6) 100%)`,
});

function PageNav({ assemble }: { assemble?: boolean }) {
  return (
    <RevealBlock assemble={assemble ?? false} delay={0.05} style={{ height: 72 }}>
      <div className="flex h-full items-center justify-between" style={{ padding: "0 48px" }}>
        <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ek-ink)" }}>
          Kinetic Physio
        </span>
        <span className="flex items-center" style={{ gap: 34, fontSize: 14, color: "var(--ek-ink-2)" }}>
          <span>Services</span><span>About</span><span>Pricing</span><span>Contact</span>
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--ek-accent-ink)",
            background: "var(--ek-accent)",
            borderRadius: 999,
            padding: "8px 18px",
          }}
        >
          Book a session
        </span>
      </div>
    </RevealBlock>
  );
}

function PageHero({ assemble }: { assemble?: boolean }) {
  return (
    <RevealBlock assemble={assemble ?? false} delay={0.15} style={{ height: 404 }}>
      <div className="grid h-full grid-cols-[1.05fr_0.95fr] items-center" style={{ gap: 56, padding: "44px 48px" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ek-accent)" }}>
            Physiotherapy in Pune
          </div>
          <div
            className="ek-page-title"
            style={{
              marginTop: 18,
              fontSize: 56,
              lineHeight: 1.06,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--ek-ink)",
            }}
          >
            Move without pain.
          </div>
          <div style={{ marginTop: 18, fontSize: 18, lineHeight: 1.45, color: "var(--ek-ink-2)", maxWidth: 460 }}>
            Evidence-based physiotherapy. Same-week appointments, transparent
            pricing, plans built around your body.
          </div>
          <div className="flex items-center" style={{ gap: 20, marginTop: 28 }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "var(--ek-accent-ink)",
                background: "var(--ek-accent)",
                borderRadius: 999,
                padding: "11px 24px",
              }}
            >
              Book a session
            </span>
            <span style={{ fontSize: 16, color: "var(--ek-link)" }}>Learn more ›</span>
          </div>
          <div style={{ marginTop: 22, fontSize: 13, color: "var(--ek-ink-3)" }}>
            Same-week appointments · From ₹1,200 / session
          </div>
        </div>
        <div style={{ position: "relative", height: 336 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 28, ...heroPhoto }} />
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              borderRadius: 16,
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(12px)",
              padding: "14px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ek-ink)",
              boxShadow: "0 8px 30px -10px rgba(0,0,0,0.15)",
            }}
          >
            ★ 4.9 · 1,200+ sessions
          </div>
        </div>
      </div>
    </RevealBlock>
  );
}

function PageCards({ assemble }: { assemble?: boolean }) {
  const cards = [
    { t: "Sports rehab", s: "Return to play, safely.", tint: "#BFD0E4" },
    { t: "Back & neck", s: "Desk-work relief plans.", tint: "#C9D6C9" },
    { t: "Post-op recovery", s: "Guided, gentle progress.", tint: "#D9D4C8" },
  ];
  return (
    <RevealBlock assemble={assemble ?? false} delay={0.35} style={{ height: 212, margin: "0 48px" }}>
      <div className="grid h-full grid-cols-3" style={{ gap: 24 }}>
        {cards.map((c, i) => (
          <motion.div
            key={c.t}
            initial={assemble ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + 0.4 + i * 0.12, duration: 0.45, ease: EASE }}
            style={{
              borderRadius: 20,
              border: `1px solid ${line}`,
              background: "var(--ek-surface)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ height: 88, ...cardPhoto(c.tint) }} />
            <div style={{ padding: "14px 18px 16px" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ek-ink)" }}>{c.t}</div>
              <div style={{ fontSize: 13, color: "var(--ek-ink-2)", marginTop: 3 }}>{c.s}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ek-accent)", marginTop: 8 }}>
                ₹1,200 / session
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </RevealBlock>
  );
}

function PageFooter({ assemble }: { assemble?: boolean }) {
  return (
    <RevealBlock assemble={assemble ?? false} delay={0.65} style={{ height: 64 }}>
      <div
        className="flex h-full items-center justify-between"
        style={{ padding: "0 48px", fontSize: 12, color: "var(--ek-ink-3)", borderTop: `1px solid ${line}` }}
      >
        <span>Kinetic Physio · Pune</span>
        <span>Mon–Sat · 9:00–19:00</span>
      </div>
    </RevealBlock>
  );
}

export function MiniPage({ assemble = false }: { assemble?: boolean }) {
  return (
    <ScaledCanvas>
      <div style={{ background: "#FFFFFF", height: "100%", display: "flex", flexDirection: "column", color: "#1D1D1F" }}>
        <PageNav assemble={assemble} />
        <PageHero assemble={assemble} />
        <PageCards assemble={assemble} />
        <PageFooter assemble={assemble} />
      </div>
    </ScaledCanvas>
  );
}

function FrameDescribe() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6" aria-hidden="true">
      {/* prompt composer */}
      <div
        className="ek-glass w-full"
        style={{ borderRadius: 18, padding: "14px 16px", maxWidth: 520 }}
      >
        <div className="flex items-center justify-between gap-3">
          <span style={{ fontSize: 15, color: "var(--ek-ink)", minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            A booking site for a physiotherapy clinic in Pune. Calm, trustworthy…
            <span className="ek-promptbar-caret" aria-hidden="true" />
          </span>
          <span
            style={{
              flex: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "var(--ek-ink-2)",
              border: `1px solid ${line}`,
              borderRadius: 999,
              padding: "4px 10px",
              background: "var(--ek-surface)",
            }}
          >
            Flow + Pentest
          </span>
          <span
            style={{
              flex: "none",
              width: 34,
              height: 34,
              borderRadius: 999,
              background: "var(--ek-accent)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ↑
          </span>
        </div>
      </div>
      <div className="flex gap-2.5">
        {["Add pricing page", "Match this reference", "Hindi + English"].map((c) => (
          <span
            key={c}
            style={{
              fontSize: 12.5,
              color: "var(--ek-ink-2)",
              border: `1px solid ${line}`,
              borderRadius: 999,
              padding: "6px 12px",
              background: "var(--ek-surface)",
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

const FrameBuild = () => <MiniPage assemble />;

function SevChip({
  sev,
  text,
  top,
  left,
  delay,
}: {
  sev: "high" | "medium" | "low";
  text: string;
  top: string;
  left: string;
  delay: number;
}) {
  return (
    <div style={{ position: "absolute", top, left }}>
      {/* leader line to the finding point */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: -34,
          width: 34,
          height: 1,
          background: "var(--ek-line-strong)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 5,
          left: -38,
          width: 7,
          height: 7,
          borderRadius: 999,
          background: `var(--ek-${sev === "high" ? "red" : sev === "medium" ? "orange" : "indigo"})`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: EASE }}
        className={`ek-chip ${sev}`}
        style={{
          background: "var(--ek-surface)",
          border: `1px solid var(--ek-line)`,
          borderRadius: 8,
          padding: "5px 10px",
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 20px -6px rgba(0,0,0,0.18)",
        }}
      >
        {text}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1.8, duration: 0.3 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--ek-surface)",
            border: `1px solid var(--ek-line)`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            padding: "5px 10px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--ek-green)",
            whiteSpace: "nowrap",
            boxShadow: "0 6px 20px -6px rgba(0,0,0,0.18)",
          }}
        >
          Fixed ✓
        </span>
      </motion.div>
    </div>
  );
}

function FrameScan() {
  return (
    <div className="relative h-full" aria-hidden="true">
      <MiniPage />
      <div className="ek-scanline" />
      <SevChip sev="high" text="High · XSS" top="12%" left="14%" delay={0.9} />
      <SevChip sev="medium" text="Medium · Rate limit" top="44%" left="62%" delay={1.5} />
      <SevChip sev="low" text="Low · Headers" top="72%" left="30%" delay={2.1} />
    </div>
  );
}

function FrameLive() {
  return (
    <div className="relative h-full" aria-hidden="true">
      <MiniPage />
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
        className="ek-glass"
        style={{
          position: "absolute",
          right: 14,
          top: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderRadius: 14,
          padding: "10px 14px",
          boxShadow: "0 16px 40px -12px rgba(0,0,0,0.2)",
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "var(--ek-green)",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          ✓
        </span>
        <span>
          <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ek-ink)", lineHeight: 1.2 }}>Deployed</span>
          <span style={{ display: "block", fontSize: 12, color: "var(--ek-ink-2)", lineHeight: 1.3 }}>yourbrand.ekamai.app · 47s</span>
        </span>
      </motion.div>
    </div>
  );
}

const frames = [FrameDescribe, FrameBuild, FrameScan, FrameLive];

export function HomeHowItWorks() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(3, Math.floor(v * 4)));
  });
  const scrollYSpring = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <div className="ek-hiw" id="how-it-works">
      <div ref={track} className="ek-hiw-track hidden lg:block">
        <div className="ek-hiw-sticky">
          <div className="ek-container" style={{ width: "100%" }}>
            <Eyebrow>How it works</Eyebrow>
            <div className="ek-hiw-grid mt-10">
              <div className="ek-hiw-steps">
                <motion.div
                  className="ek-hiw-rail"
                  style={{ scaleY: scrollYSpring }}
                  aria-hidden="true"
                />
                {steps.map((s, i) => (
                  <div key={s.idx} className={`ek-hiw-step ${active === i ? "active" : ""}`}>
                    <span className="ek-hiw-step-idx">{s.idx}</span>
                    <h3 className="ek-hiw-step-title">{s.title}</h3>
                    <p className="ek-hiw-step-desc">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="ek-browser ek-glass">
                <div className="ek-browser-bar">
                  <div className="ek-browser-dots" aria-hidden="true">
                    <span /><span /><span />
                  </div>
                  <div className="ek-browser-url">
                    {active === 3 && <span className="live-dot" aria-hidden="true" />}
                    yourbrand.ekamai.app
                  </div>
                  <span style={{ width: 40 }} />
                </div>
                <div className="ek-browser-body">
                  <AnimatePresence mode="wait">
                    {frames.map((Frame, i) =>
                      active === i ? (
                        <motion.div
                          key={i}
                          className="ek-browser-frame"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                        >
                          <Frame />
                        </motion.div>
                      ) : null
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* mobile: 4 stacked cards, each with a static frame */}
      <div className="lg:hidden" style={{ padding: "72px 0" }}>
        <div className="ek-container">
          <Eyebrow>How it works</Eyebrow>
          <div className="mt-8" />
          {steps.map((s, i) => {
            const Frame = frames[i];
            return (
              <div key={s.idx} className="ek-hiw-step" style={{ opacity: 1 }}>
                <span className="ek-hiw-step-idx">{s.idx}</span>
                <h3 className="ek-hiw-step-title">{s.title}</h3>
                <p className="ek-hiw-step-desc">{s.desc}</p>
                <div className="ek-browser ek-glass mt-5">
                  <div className="ek-browser-bar">
                    <div className="ek-browser-dots" aria-hidden="true"><span /><span /><span /></div>
                    <div className="ek-browser-url">yourbrand.ekamai.app</div>
                    <span style={{ width: 40 }} />
                  </div>
                  <div className="ek-browser-body">
                    <div className="ek-browser-frame"><Frame /></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
