"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useScroll, useMotionValueEvent, useSpring, AnimatePresence } from "framer-motion";
import { Eyebrow } from "@/components/shared/section";
import { useReducedMotionSafe } from "@/components/shared/use-reduced-motion";

const steps = [
  {
    idx: "Step 1",
    hue: "var(--ek-a1)",
    ink: "var(--ek-a1-ink)",
    title: "Describe",
    desc: "Tell the agents what you're building, who it's for, and the angle. Drop references, copy fragments, brand colours, no setup marathon.",
  },
  {
    idx: "Step 2",
    hue: "var(--ek-a3)",
    ink: "var(--ek-a3-ink)",
    title: "Build",
    desc: "Six specialists plan, design, write and assemble the real thing (frontend, backend, copy) while you watch it come together.",
  },
  {
    idx: "Step 3",
    hue: "var(--ek-a5)",
    ink: "var(--ek-a5-ink)",
    title: "Scan",
    desc: "Twelve security specialists run an authorized pre-launch scan across the OWASP classes. Findings come back with evidence and fixes.",
  },
  {
    idx: "Step 4",
    hue: "var(--ek-a6)",
    ink: "var(--ek-a6-ink)",
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
      <div className="ek-minipage" style={{ background: "#FFFFFF", height: "100%", display: "flex", flexDirection: "column" }}>
        <PageNav assemble={assemble} />
        <PageHero assemble={assemble} />
        <PageCards assemble={assemble} />
        <PageFooter assemble={assemble} />
      </div>
    </ScaledCanvas>
  );
}

const PROMPT = "A booking site for a physiotherapy clinic in Pune. Calm, trustworthy, online scheduling in Hindi and English.";

function useTypewriter(text: string, speed = 26, delay = 350) {
  const reduce = useReducedMotionSafe();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) {
      const id = window.setTimeout(() => setN(text.length), 0);
      return () => window.clearTimeout(id);
    }
    let i = 0;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) window.clearInterval(id);
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [text, speed, delay, reduce]);
  return text.slice(0, n);
}

function FrameDescribe() {
  const typed = useTypewriter(PROMPT);
  const done = typed.length === PROMPT.length;
  return (
    <div className="ek-compose-wrap" aria-hidden="true">
      <div className="ek-compose">
        <div className="ek-compose-text">
          {typed}
          <span className="ek-promptbar-caret" />
        </div>
        <div className="ek-compose-row">
          <span className="ek-compose-chip">＋ Reference</span>
          <span className="ek-compose-chip">Flow + Pentest</span>
          <span className={`ek-compose-send${done ? " ready" : ""}`}>↑</span>
        </div>
      </div>
      <div className="ek-compose-suggest">
        {["Add pricing page", "Match this reference", "Brand: calm blues"].map((c, i) => (
          <motion.span
            key={c}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.12, duration: 0.45, ease: EASE }}
          >
            {c}
          </motion.span>
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
    <div className="ek-sevchip" style={{ top, left }}>
      <span className={`ek-sevchip-dot ${sev}`} />
      <motion.span
        className="ek-sevchip-pill"
        initial={{ opacity: 0, scale: 0.7, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: EASE }}
      >
        <span className={`ek-chip ${sev}`}>{text.split(" · ")[0]}</span>
        {text.split(" · ")[1]}
      </motion.span>
      <motion.span
        className="ek-sevchip-pill fixed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1.6, duration: 0.3 }}
      >
        Fixed ✓
      </motion.span>
    </div>
  );
}

function FrameScan() {
  return (
    <div className="relative h-full ek-minipage" aria-hidden="true">
      <MiniPage />
      <div className="ek-scanline" />
      <SevChip sev="high" text="High · XSS" top="12%" left="16%" delay={0.9} />
      <SevChip sev="medium" text="Medium · Rate limit" top="44%" left="62%" delay={1.5} />
      <SevChip sev="low" text="Low · Headers" top="72%" left="30%" delay={2.1} />
    </div>
  );
}

function FrameLive() {
  return (
    <div className="relative h-full ek-minipage" aria-hidden="true">
      <MiniPage />
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
        className="ek-deployed"
      >
        <span className="ek-deployed-ico">✓</span>
        <span>
          <span className="ek-deployed-t">Deployed · scanned clean</span>
          <span className="ek-deployed-s">yourbrand.ekamai.app · 47s</span>
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
  const rail = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <div className="ek-hiw" id="how-it-works">
      <div ref={track} className="ek-hiw-track hidden lg:block">
        <div className="ek-hiw-sticky">
          <div className="ek-container" style={{ width: "100%" }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="ek-h2 ek-hiw-title">From a sentence to a scanned launch.</h2>
            <div className="ek-hiw-grid">
              <div className="ek-hiw-steps">
                <motion.div className="ek-hiw-rail" style={{ scaleY: rail }} aria-hidden="true" />
                {steps.map((s, i) => (
                  <div
                    key={s.idx}
                    className={`ek-hiw-step${active === i ? " active" : ""}${active > i ? " past" : ""}`}
                    style={{ "--hue": s.hue, "--hue-ink": s.ink } as CSSProperties}
                  >
                    <span className="ek-hiw-node" aria-hidden="true" />
                    <span className="ek-hiw-step-idx">{s.idx}</span>
                    <h3 className="ek-hiw-step-title">{s.title}</h3>
                    <div className="ek-hiw-step-body">
                      <div><p className="ek-hiw-step-desc">{s.desc}</p></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ek-hiw-stage">
                {steps.map((s, i) => (
                  <span
                    key={s.idx}
                    className={`ek-hiw-glow${active === i ? " on" : ""}`}
                    style={{ "--hue": s.hue } as CSSProperties}
                    aria-hidden="true"
                  />
                ))}
                <div className="ek-browser ek-hiw-browser">
                  <div className="ek-browser-bar">
                    <div className="ek-browser-dots" aria-hidden="true">
                      <span /><span /><span />
                    </div>
                    <div className="ek-browser-url">
                      {active === 3 && <span className="live-dot" aria-hidden="true" />}
                      {active === 0 ? "ekam.ai/new" : "yourbrand.ekamai.app"}
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
                            initial={{ opacity: 0, scale: 0.985 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
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
      </div>
      {/* mobile: 4 stacked cards, each with a static frame */}
      <div className="lg:hidden" style={{ padding: "72px 0" }}>
        <div className="ek-container">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="ek-h2 mt-5">From a sentence to a scanned launch.</h2>
          <div className="mt-10" />
          {steps.map((s, i) => {
            const Frame = frames[i];
            return (
              <div key={s.idx} className="ek-hiw-mstep" style={{ "--hue": s.hue, "--hue-ink": s.ink } as CSSProperties}>
                <span className="ek-hiw-step-idx">{s.idx}</span>
                <h3 className="ek-hiw-step-title">{s.title}</h3>
                <p className="ek-hiw-step-desc">{s.desc}</p>
                <div className="ek-browser ek-hiw-browser mt-5">
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
