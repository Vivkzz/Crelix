"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  AnimatePresence,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { SectionHeader } from "@/components/shared/section";
import { MiniPage } from "@/components/site/home/how-it-works";
import { AGENTS } from "@/components/site/home/agents";
import { useReducedMotionSafe } from "@/components/shared/use-reduced-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const ink3 = "var(--ek-ink-3)";
const line = "var(--ek-line)";

/* ---------- the score: who works when, in run seconds ---------- */

type Clip = { agent: number; start: number; end: number; label: string };

const CLIPS: Clip[] = [
  { agent: 0, start: 0, end: 5.8, label: "spec.md" },
  { agent: 1, start: 5.0, end: 11.6, label: "tokens" },
  { agent: 2, start: 10.6, end: 24.0, label: "42 files · 9 routes" },
  { agent: 3, start: 18.0, end: 30.4, label: "28 checks" },
  { agent: 4, start: 24.6, end: 31.0, label: "3 findings" },
  { agent: 2, start: 31.0, end: 35.4, label: "fix ×3" },
  { agent: 4, start: 35.4, end: 38.7, label: "rescan · clean" },
  { agent: 5, start: 38.7, end: 47.2, label: "live" },
];
/* handoffs: [from clip, to clip] — drawn as threads between lanes */
const HANDOFFS: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [6, 7]];

const TOTAL = 48;
const RUN_END = 47.2;
/* wall-clock seconds for one full play-through */
const PLAY_SECONDS = 18;

const pct = (s: number) => `${(s / TOTAL) * 100}%`;
const fmt = (s: number) => {
  const v = Math.min(s, RUN_END);
  return `00:${v.toFixed(1).padStart(4, "0")}`;
};

/* ---------- artifact panes ---------- */

function Rows({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "16px 20px", fontSize: 12.5 }}>{children}</div>;
}

function stagger(i: number, base = 0.05) {
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: base + i * 0.07, duration: 0.45, ease: EASE },
  };
}

function BodyPlanner() {
  const rows = [
    ["Audience", "Physio patients 30–55, Pune"],
    ["Pages", "Home, Services, Pricing, Book, Contact"],
    ["Booking flow", "Service → slot → confirm"],
    ["Tone", "Calm, clinical, warm"],
    ["SEO", "physiotherapy pune, online booking"],
  ];
  return (
    <Rows>
      <motion.div {...stagger(0)} style={{ fontWeight: 600, color: "var(--ek-ink)", marginBottom: 10, fontSize: 14 }}>
        Kinetic Physio · site spec
      </motion.div>
      {rows.map(([k, v], i) => (
        <motion.div
          key={k}
          {...stagger(i + 1)}
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr",
            gap: 12,
            padding: "7px 10px",
            margin: "0 -10px",
            borderRadius: 8,
            color: "var(--ek-ink-2)",
            background: i === 2 ? "color-mix(in srgb, var(--ek-a1) 12%, transparent)" : "transparent",
          }}
        >
          <span style={{ color: i === 2 ? "var(--ek-a1-ink)" : ink3, fontWeight: 600 }}>{k}</span>
          <span>{v}</span>
        </motion.div>
      ))}
    </Rows>
  );
}

function BodyDesigner() {
  const swatches = ["#0A5BD3", "#6EA8FE", "#EEF3FB", "#1D1D1F", "#F5F5F7"];
  return (
    <Rows>
      <div style={{ display: "flex", gap: 10 }}>
        {swatches.map((hex, i) => (
          <motion.div
            key={hex}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.06, type: "spring", stiffness: 380, damping: 22 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: hex, boxShadow: `inset 0 0 0 1px ${line}` }} />
            <div style={{ fontSize: 9.5, color: ink3, marginTop: 5, fontFamily: "var(--ek-font-mono)" }}>{hex}</div>
          </motion.div>
        ))}
      </div>
      <motion.div {...stagger(5)} style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 18 }}>
        <span style={{ fontSize: 60, fontWeight: 600, lineHeight: 0.9, letterSpacing: "-0.04em", color: "var(--ek-ink)" }}>Aa</span>
        <div>
          <div style={{ fontSize: 12, color: ink3 }}>Inter · 56 / 18</div>
          <div style={{ display: "flex", gap: 4, marginTop: 6, alignItems: "flex-end" }}>
            {[4, 8, 12, 16, 24].map((n) => (
              <div key={n} style={{ width: n, height: n, background: "var(--ek-a2)", opacity: 0.35, borderRadius: 3 }} />
            ))}
          </div>
        </div>
        <div style={{ marginLeft: "auto", background: "#0A5BD3", color: "#fff", fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: "9px 18px" }}>
          Book a session
        </div>
      </motion.div>
    </Rows>
  );
}

function BodyEngineer() {
  const code: [string, string][][] = [
    [["export ", "k"], ["function", "k"], [" BookingForm() {", "t"]],
    [["  const", "k"], [" [slot, setSlot] = useState();", "t"]],
    [["  return", "k"], [" (", "t"]],
    [["    <Section ", "t"], ["id", "a"], ['="book">', "s"]],
    [["      <DatePicker ", "t"], ["onChange", "a"], ["={setSlot} />", "t"]],
    [["      <Button ", "t"], ["variant", "a"], ['="primary">', "s"]],
    [["        Book a session", "t"]],
    [["      </Button>", "t"]],
    [["    </Section>", "t"]],
    [["  );", "t"]],
  ];
  const colors: Record<string, string> = {
    k: "var(--ek-a3-ink)", t: "var(--ek-ink)", a: "var(--ek-a4-ink)", s: "var(--ek-a2-ink)",
  };
  return (
    <div style={{ padding: "12px 20px", fontFamily: "var(--ek-font-mono)", fontSize: 11.5, lineHeight: 1.8 }}>
      {code.map((ln, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 + i * 0.06, duration: 0.3, ease: EASE }}
          style={{ display: "flex", gap: 14, whiteSpace: "pre" }}
        >
          <span style={{ color: ink3, opacity: 0.6, width: 14, textAlign: "right" }}>{i + 1}</span>
          <span>
            {ln.map(([txt, c], j) => (
              <span key={j} style={{ color: colors[c] }}>{txt}</span>
            ))}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function BodyTester() {
  const checks = ["Booking flow", "Forms", "Mobile layout", "Accessibility", "Links", "Performance"];
  const scores = [
    { label: "Perf", n: 98 },
    { label: "A11y", n: 100 },
    { label: "SEO", n: 100 },
  ];
  return (
    <div style={{ padding: "14px 20px", display: "flex", gap: 22 }}>
      <div style={{ flex: 1 }}>
        {checks.map((c, i) => (
          <motion.div
            key={c}
            {...stagger(i)}
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "5.5px 0", fontSize: 12.5, color: "var(--ek-ink-2)" }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 999, background: "var(--ek-a4)", color: "#fff", fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✓</span>
            {c}
          </motion.div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
        {scores.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 46, height: 46 }}>
              <svg width="46" height="46" viewBox="0 0 46 46">
                <circle cx="23" cy="23" r="19" fill="none" stroke={line} strokeWidth="3.5" />
                <motion.circle
                  cx="23" cy="23" r="19" fill="none"
                  stroke="var(--ek-a4)" strokeWidth="3.5" strokeLinecap="round"
                  transform="rotate(-90 23 23)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: s.n / 100 }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 1, ease: EASE }}
                />
              </svg>
              <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 600, color: "var(--ek-ink)" }}>{s.n}</span>
            </div>
            <span style={{ fontSize: 11, color: ink3, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BodySecurity({ fixed }: { fixed: boolean }) {
  const rows = [
    { sev: "high", label: "High", title: "Reflected XSS · /api/search" },
    { sev: "medium", label: "Medium", title: "No rate limit · /api/auth/login" },
    { sev: "low", label: "Low", title: "Missing CSP header" },
  ];
  return (
    <Rows>
      <motion.div {...stagger(0)} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: ink3, marginBottom: 8 }}>
        <span>11 classes · 12 specialists</span>
        <span style={{ color: fixed ? "var(--ek-a6-ink)" : "var(--ek-a5-ink)", fontWeight: 600 }}>
          {fixed ? "0 open" : "3 open"}
        </span>
      </motion.div>
      {rows.map((r, i) => (
        <motion.div
          key={r.title}
          {...stagger(i + 1)}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 2 ? `1px solid ${line}` : "none" }}
        >
          <span className={`ek-chip ${r.sev}`} style={{ width: 64 }}>{r.label}</span>
          <span style={{ fontSize: 12.5, color: "var(--ek-ink)", flex: 1 }}>{r.title}</span>
          <AnimatePresence mode="wait" initial={false}>
            {fixed ? (
              <motion.span
                key="fixed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.15, duration: 0.35, ease: EASE }}
                style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ek-a6-ink)" }}
              >
                Fixed ✓
              </motion.span>
            ) : (
              <motion.span key="open" exit={{ opacity: 0 }} style={{ fontSize: 11.5, color: ink3 }}>
                evidence ›
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </Rows>
  );
}

function BodyDeployer() {
  const rows = [
    ["12:04:11", "build ✓ 34s"],
    ["12:04:41", "edge deploy · 18 regions ✓"],
    ["12:04:43", "dns → yourbrand.ekamai.app"],
    ["12:04:45", "ssl ✓ · hsts on"],
  ];
  return (
    <div style={{ padding: "16px 20px", fontFamily: "var(--ek-font-mono)", fontSize: 11.5, lineHeight: 2.1 }}>
      {rows.map(([t, m], i) => (
        <motion.div key={t} {...stagger(i, 0.05)}>
          <span style={{ color: ink3 }}>{t}</span>&nbsp;&nbsp;<span style={{ color: "var(--ek-ink-2)" }}>{m}</span>
        </motion.div>
      ))}
      <motion.div
        {...stagger(4, 0.15)}
        style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ek-a6-ink)", fontWeight: 600, fontFamily: "var(--ek-font-sans)", fontSize: 13 }}
      >
        <span className="ek-live-ping" aria-hidden="true" />
        Live · yourbrand.ekamai.app
      </motion.div>
    </div>
  );
}

/* ---------- timeline pieces ---------- */

/* clips shorter than this (run seconds) carry their label outside, to the right */
const SHORT = 4.2;

function ClipBar({ clip, t }: { clip: Clip; t: MotionValue<number> }) {
  const a = AGENTS[clip.agent];
  const short = clip.end - clip.start < SHORT;
  const clipPath = useTransform(t, (v) => {
    const p = Math.min(Math.max((v - clip.start) / (clip.end - clip.start), 0), 1);
    return `inset(0 ${(1 - p) * 100}% 0 0 round 7px)`;
  });
  const labelOpacity = useTransform(t, [clip.start, clip.start + 0.6], [0.45, 1]);
  return (
    <div
      className="ek-clip-wrap"
      style={{ left: pct(clip.start), width: pct(clip.end - clip.start), "--hue": a.hue, "--hue-ink": a.ink } as CSSProperties}
    >
      <div className="ek-clip">
        {!short && <span className="ek-clip-label">{clip.label}</span>}
        <motion.span className="ek-clip-fill" style={{ clipPath }} aria-hidden="true">
          {!short && <span className="ek-clip-label">{clip.label}</span>}
        </motion.span>
      </div>
      {short && <motion.span className="ek-clip-outside" style={{ opacity: labelOpacity }}>{clip.label}</motion.span>}
    </div>
  );
}

function Handoff({ from, to, t, w, h }: { from: Clip; to: Clip; t: MotionValue<number>; w: number; h: number }) {
  const lane = h / AGENTS.length;
  const s2 = to.start;
  const s1 = Math.max(from.start + 0.4, s2 - 1.6);
  const x1 = (s1 / TOTAL) * w;
  const x2 = (s2 / TOTAL) * w;
  const y1 = (from.agent + 0.5) * lane;
  const y2 = (to.agent + 0.5) * lane;
  const c = Math.max((x2 - x1) * 0.7, 8);
  const d = `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
  const pathLength = useTransform(t, [s1 - 0.2, s2], [0, 1]);
  const opacity = useTransform(t, [s1 - 0.2, s1], [0, 1]);
  const id = `ho-${from.agent}-${to.agent}-${s2}`;
  return (
    <>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0" style={{ stopColor: AGENTS[from.agent].hue }} />
          <stop offset="1" style={{ stopColor: AGENTS[to.agent].hue }} />
        </linearGradient>
      </defs>
      <motion.path
        d={d}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={1.75}
        strokeLinecap="round"
        style={{ pathLength, opacity }}
      />
    </>
  );
}

function activeAt(v: number) {
  if (v >= RUN_END) return -1;
  let idx = 0;
  CLIPS.forEach((c, i) => {
    if (c.start <= v) idx = i;
  });
  return idx;
}

function Viewer({ clipIndex, t }: { clipIndex: number; t: number }) {
  if (clipIndex === -1) {
    return (
      <motion.div
        key="final"
        className="ek-score-card ek-score-final"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <div className="ek-browser-bar">
          <div className="ek-browser-dots" aria-hidden="true"><span /><span /><span /></div>
          <div className="ek-browser-url"><span className="live-dot" aria-hidden="true" />yourbrand.ekamai.app</div>
          <span style={{ width: 40 }} />
        </div>
        <div className="ek-score-final-body ek-minipage"><MiniPage /></div>
      </motion.div>
    );
  }
  const clip = CLIPS[clipIndex];
  const a = AGENTS[clip.agent];
  const Icon = a.icon;
  const done = t >= clip.end;
  let body: React.ReactNode;
  switch (clip.agent) {
    case 0: body = <BodyPlanner />; break;
    case 1: body = <BodyDesigner />; break;
    case 2: body = clipIndex === 5 ? <BodySecurity fixed /> : <BodyEngineer />; break;
    case 3: body = <BodyTester />; break;
    case 4: body = <BodySecurity fixed={clipIndex === 6} />; break;
    default: body = <BodyDeployer />;
  }
  return (
    <motion.div
      key={clipIndex}
      className="ek-score-card"
      style={{ "--hue": a.hue, "--hue-ink": a.ink } as CSSProperties}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="ek-score-card-head">
        <span className="ek-score-card-ico"><Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /></span>
        <span className="ek-score-card-name">{a.name}</span>
        <span className="ek-score-card-file">{clipIndex === 5 ? "patch ×3" : a.file}</span>
        <span className={`ek-score-card-state${done ? " done" : ""}`}>{done ? "Handed off" : "Working"}</span>
      </div>
      <div className="ek-score-card-body">{body}</div>
    </motion.div>
  );
}

/* ---------- section ---------- */

export function Ensemble() {
  const reduce = useReducedMotionSafe();
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useMotionValue(0);
  const ctrl = useRef<AnimationPlaybackControls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [clipIndex, setClipIndex] = useState(0);
  const [now, setNow] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = lanesRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const playhead = useTransform(t, (v) => pct(Math.min(v, TOTAL)));

  useMotionValueEvent(t, "change", (v) => {
    const idx = activeAt(v);
    setClipIndex((cur) => (cur === idx ? cur : idx));
    if (timeRef.current) timeRef.current.textContent = fmt(v);
    /* coarse clock for "Working / Handed off" — only re-render on whole steps */
    const step = Math.floor(v * 2) / 2;
    setNow((n) => (n === step ? n : step));
  });

  const play = useCallback(
    (from?: number) => {
      ctrl.current?.stop();
      const start = from ?? (t.get() >= TOTAL ? 0 : t.get());
      t.set(start);
      setPinned(null);
      setPlaying(true);
      ctrl.current = animate(t, TOTAL, {
        duration: ((TOTAL - start) / TOTAL) * PLAY_SECONDS,
        ease: "linear",
        onComplete: () => setPlaying(false),
      });
    },
    [t]
  );
  const pause = () => {
    ctrl.current?.stop();
    setPlaying(false);
  };

  /* reduced motion: rest on the finished run */
  useEffect(() => {
    if (reduce) t.set(TOTAL);
  }, [reduce, t]);

  /* autoplay once, the first time the panel is mostly on screen */
  useEffect(() => {
    const el = panelRef.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          play(0);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, play]);
  useEffect(() => () => ctrl.current?.stop(), []);

  const seekAgent = (agent: number) => {
    const first = CLIPS.findIndex((c) => c.agent === agent);
    if (reduce) {
      setPinned(first);
      return;
    }
    play(CLIPS[first].start);
  };

  const shown = pinned ?? clipIndex;
  const finished = !playing && t.get() >= TOTAL;

  return (
    <section id="ensemble" className="ek-section ek-ensemble">
      <div className="ek-container">
        <SectionHeader
          eyebrow="The ensemble"
          title="A studio of specialists."
          desc="Each agent owns one discipline and hands a finished artifact to the next. Watch a real run: Security finds three issues, Engineer patches them, and nothing ships until the rescan is clean."
          align="center"
        />

        <div ref={panelRef} className="ek-score mt-14">
          <div className="ek-score-main">
            <div className="ek-score-head">
              <div>
                <div className="ek-score-title">Kinetic Physio · run #1042</div>
                <div className="ek-score-sub">6 agents · 7 handoffs</div>
              </div>
              <div className="ek-score-controls">
                <span ref={timeRef} className="ek-score-time" aria-hidden="true">{fmt(0)}</span>
                {!reduce && (
                  <button
                    type="button"
                    className="ek-score-btn"
                    onClick={() => (playing ? pause() : play())}
                    aria-label={playing ? "Pause the run" : finished ? "Replay the run" : "Play the run"}
                  >
                    {playing ? <Pause className="h-3.5 w-3.5" /> : finished ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="ek-score-grid">
              <div className="ek-score-labels">
                <div className="ek-score-ruler-spacer" />
                {AGENTS.map((a, i) => (
                  <button
                    key={a.key}
                    type="button"
                    className={`ek-score-lane-label${CLIPS[shown]?.agent === i ? " active" : ""}`}
                    style={{ "--hue": a.hue } as CSSProperties}
                    onClick={() => seekAgent(i)}
                  >
                    <i aria-hidden="true" />
                    <span className="n">{a.name}</span>
                    <span className="r">{a.role}</span>
                  </button>
                ))}
              </div>

              <div className="ek-score-tracks" aria-hidden="true">
                <div className="ek-score-ruler">
                  {[0, 10, 20, 30, 40].map((s) => (
                    <span key={s} style={{ left: pct(s) }}>{`${s}s`}</span>
                  ))}
                </div>
                <div ref={lanesRef} className="ek-score-lanes">
                  {AGENTS.map((a) => <div key={a.key} className="ek-score-lane" />)}
                  {[10, 20, 30, 40].map((s) => <i key={s} className="ek-score-gridline" style={{ left: pct(s) }} />)}
                  {size.w > 0 && (
                    <svg className="ek-score-threads" viewBox={`0 0 ${size.w} ${size.h}`}>
                      {HANDOFFS.map(([f, to]) => (
                        <Handoff key={`${f}-${to}`} from={CLIPS[f]} to={CLIPS[to]} t={t} w={size.w} h={size.h} />
                      ))}
                    </svg>
                  )}
                  {CLIPS.map((c, i) => (
                    <div key={i} className="ek-score-clip-lane" style={{ top: `${(c.agent / AGENTS.length) * 100}%`, height: `${100 / AGENTS.length}%` }}>
                      <ClipBar clip={c} t={t} />
                    </div>
                  ))}
                  <motion.div className="ek-score-playhead" style={{ left: playhead }} />
                  <div className="ek-score-launch" style={{ left: pct(RUN_END) }} />
                </div>
              </div>
            </div>
          </div>

          <div className="ek-score-viewer">
            <AnimatePresence mode="wait" initial={false}>
              <Viewer key={shown} clipIndex={shown} t={pinned !== null ? TOTAL : now} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
