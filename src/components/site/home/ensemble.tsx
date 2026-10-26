"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import { SectionHeader } from "@/components/shared/section";
import { MiniPage } from "@/components/site/home/how-it-works";
import {
  PenLine,
  Palette,
  Code2,
  FlaskConical,
  Rocket,
  ShieldCheck,
} from "lucide-react";


const agents = [
  { name: "Planner", file: "spec.md", out: "14 sections", icon: PenLine },
  { name: "Designer", file: "tokens.json", out: "3 screens", icon: Palette },
  { name: "Engineer", file: "BookingForm.tsx", out: "42 files · 9 routes", icon: Code2 },
  { name: "Tester", file: "QA report", out: "28 checks passed", icon: FlaskConical },
  { name: "Deployer", file: "Deploy log", out: "yourbrand.ekamai.app", icon: Rocket },
  { name: "Security", file: "Pre-launch scan", out: "11 classes · 0 open", icon: ShieldCheck },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const ink3 = "var(--ek-ink-3)";
const line = "var(--ek-line)";

/* ---------- artifact pane bodies ---------- */

function BodyPlanner() {
  const rows = [
    ["Audience", "Physio patients 30–55, Pune"],
    ["Pages", "5 — Home, Services, Pricing, Book, Contact"],
    ["Booking flow", "Service → slot → confirm"],
    ["Tone", "Calm, clinical, warm"],
    ["SEO", "physiotherapy pune, online booking"],
  ];
  return (
    <div style={{ padding: "14px 18px", fontSize: 12.5 }}>
      <div style={{ fontWeight: 600, color: "var(--ek-ink)", marginBottom: 8 }}>Kinetic Physio · site spec</div>
      {rows.map(([k, v], i) => (
        <div
          key={k}
          style={{
            display: "grid",
            gridTemplateColumns: "96px 1fr",
            gap: 12,
            padding: "6px 8px",
            margin: "0 -8px",
            borderRadius: 6,
            color: "var(--ek-ink-2)",
            background: i === 1 ? "color-mix(in srgb, var(--ek-accent) 8%, transparent)" : "transparent",
          }}
        >
          <span style={{ color: ink3, fontWeight: 600 }}>{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}

function BodyDesigner() {
  const swatches = [
    ["#0A5BD3", "#0A5BD3"],
    ["#6EA8FE", "#6EA8FE"],
    ["#EEF3FB", "#EEF3FB"],
    ["#1D1D1F", "#1D1D1F"],
    ["#F5F5F7", "#F5F5F7"],
  ];
  return (
    <div style={{ padding: "14px 18px" }}>
      <div style={{ display: "flex", gap: 10 }}>
        {swatches.map(([hex]) => (
          <div key={hex}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: hex, border: `1px solid ${line}` }} />
            <div style={{ fontSize: 9, color: ink3, marginTop: 4 }}>{hex}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 14 }}>
        <span style={{ fontSize: 56, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.04em", color: "var(--ek-ink)" }}>Aa</span>
        <div>
          <div style={{ fontSize: 12, color: ink3 }}>Inter · 56 / 18</div>
          <div style={{ display: "flex", gap: 4, marginTop: 6, alignItems: "flex-end" }}>
            {[4, 8, 12, 16, 24].map((n) => (
              <div key={n} style={{ width: n, height: n, background: "var(--ek-ink-3)", opacity: 0.4, borderRadius: 2 }} />
            ))}
          </div>
        </div>
        <div style={{ marginLeft: "auto", background: "#0A5BD3", color: "#fff", fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: "8px 18px" }}>
          Book a session
        </div>
      </div>
    </div>
  );
}

function BodyEngineer() {
  const code = [
    [["export ", "k"], ["function", "k"], [" BookingForm()", "t"]],
    [["  const", "k"], [" [slot, setSlot] = useState();", "t"]],
    [["  return", "k"], [" (", "t"]],
    [["    <Section ", "t"], ["id", "a"], ['="book">', "s"]],
    [["      <DatePicker ", "t"], ["onChange", "a"], ["={setSlot} />", "t"]],
    [["      <Button ", "t"], ["variant", "a"], ['="primary">', "s"]],
    [["        Book a session", "s"]],
    [["      </Button>", "t"]],
    [["    </Section>", "t"]],
    [["  );", "t"]],
  ];
  const colors: Record<string, string> = {
    k: "#AD3DA4", t: "var(--ek-ink)", a: "#0A5BD3", s: "#D12F1B",
  };
  return (
    <div style={{ padding: "12px 18px", fontFamily: "var(--ek-font-mono)", fontSize: 11.5, lineHeight: 1.75 }}>
      {code.map((ln, i) => (
        <div key={i} className="ek-code-line">
          {ln.map(([txt, c], j) => (
            <span key={j} style={{ color: colors[c] }}>{txt}</span>
          ))}
        </div>
      ))}
      <div style={{ marginTop: 8, fontSize: 10.5, color: ink3 }}>42 files · 9 routes</div>
    </div>
  );
}

function BodyTester() {
  const checks = ["Booking flow", "Forms", "Mobile layout", "Accessibility", "Links", "Performance"];
  return (
    <div style={{ padding: "12px 18px", display: "flex", gap: 22 }}>
      <div style={{ flex: 1 }}>
        {checks.map((c) => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12.5, color: "var(--ek-ink-2)" }}>
            <span style={{ width: 15, height: 15, borderRadius: 999, background: "var(--ek-green)", color: "#fff", fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✓</span>
            {c}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
        {[98, 100, 100].map((n) => (
          <div key={n} style={{ position: "relative", width: 44, height: 44 }}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="19" fill="none" stroke={line} strokeWidth="3.5" />
              <circle cx="22" cy="22" r="19" fill="none" stroke={n === 98 ? "var(--ek-accent)" : "var(--ek-green)"} strokeWidth="3.5" strokeDasharray={`${(n / 100) * 119.4} 119.4`} strokeLinecap="round" transform="rotate(-90 22 22)" />
            </svg>
            <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "var(--ek-ink)" }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BodyDeployer() {
  const rows = [
    ["12:04:11", "build ✓ 34s"],
    ["12:04:41", "edge deploy ✓"],
    ["12:04:43", "dns: yourbrand.ekamai.app"],
    ["12:04:45", "ssl ✓"],
  ];
  return (
    <div style={{ padding: "14px 18px", fontFamily: "var(--ek-font-mono)", fontSize: 11.5, lineHeight: 2 }}>
      {rows.map(([t, m]) => (
        <div key={t} style={{ color: ink3 }}>
          <span style={{ color: ink3 }}>{t}</span>&nbsp;&nbsp;<span style={{ color: "var(--ek-ink-2)" }}>{m}</span>
        </div>
      ))}
      <div style={{ marginTop: 10, color: "var(--ek-green)", fontWeight: 600 }}>Live · yourbrand.ekamai.app</div>
    </div>
  );
}

function BodySecurity() {
  const rows = ["XSS", "Rate limit", "Headers"];
  return (
    <div style={{ padding: "14px 18px" }}>
      <div style={{ fontSize: 12, color: ink3, marginBottom: 10 }}>11 classes · 0 open</div>
      {rows.map((r) => (
        <div key={r} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${line}` }}>
          <span style={{ fontSize: 12.5, color: "var(--ek-ink-2)" }}>{r}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ek-green)" }}>Fixed ✓</span>
        </div>
      ))}
    </div>
  );
}

const bodies = [BodyPlanner, BodyDesigner, BodyEngineer, BodyTester, BodyDeployer, BodySecurity];

/* ---------- scroll mapping ---------- */
/* progress timeline: 0-.12 stacked | .12-.50 explode | .50-.78 collapse+merge | .78+ hold */
const EXPLODE = 0.12;
const COLLAPSE = 0.5;
const MERGE = 0.78;

function paneTz(i: number, p: number) {
  // explode window with per-pane stagger
  const s = EXPLODE + i * 0.03;
  const e = COLLAPSE + i * 0.015;
  const out = Math.min(Math.max((p - s) / 0.28, 0), 1);
  const back = Math.min(Math.max((p - e) / 0.22, 0), 1);
  return (8 + (86 - 8) * out * (1 - back)) * i;
}

function Pane({
  i,
  progress,
}: {
  i: number;
  progress: MotionValue<number>;
}) {
  const a = agents[i];
  const Icon = a.icon;
  const tz = useTransform(progress, (v) => paneTz(i, v));
  const opacity = useTransform(progress, i === 5 ? [0.7, 0.78] : [0.52, 0.66], [1, 0]);
  return (
    <motion.div
      className="ek-pane"
      data-pane={i}
      style={{ z: tz, opacity }}
    >
      <div className="ek-pane-head">
        <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        <span>{a.name}</span>
        <span className="ek-pane-file">{a.file}</span>
      </div>
      <div className="ek-pane-body">{bodies[i]()}</div>
      {/* invisible anchor at the right-edge midpoint, used for the leader line */}
      <div className="ek-pane-anchor" aria-hidden="true" />
    </motion.div>
  );
}

function LayerLabel({
  agent,
  index,
  progress,
  refCb,
}: {
  agent: (typeof agents)[number];
  index: number;
  progress: MotionValue<number>;
  refCb: (el: HTMLDivElement | null) => void;
}) {
  const opacity = useTransform(progress, [0.28 + index * 0.02, 0.36 + index * 0.02], [0, 1]);
  const fade = useTransform(progress, [0.5, 0.62], [1, 0]);
  return (
    <motion.div ref={refCb} className="ek-layers-label" style={{ opacity }}>
      <motion.div style={{ opacity: fade }}>
        <div className="ek-layers-label-name">{agent.name}</div>
        <div className="ek-layers-label-out">{agent.out}</div>
      </motion.div>
    </motion.div>
  );
}

export function Ensemble() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6 });
  const finalState = useMotionValue(1);
  const progress = reduce ? finalState : p;

  const rotateX = useTransform(progress, [COLLAPSE, MERGE], [58, 0]);
  const rotateZ = useTransform(progress, [COLLAPSE, MERGE], [-38, 0]);
  const scale = useTransform(progress, [COLLAPSE, MERGE], [0.78, 1]);
  const finalOpacity = useTransform(progress, [0.62, MERGE], [0, 1]);
  const finalScale = useTransform(progress, [0.62, MERGE], [1.06, 1]);
  const captionOpacity = useTransform(progress, [0.8, 0.92], [0, 1]);
  const captionY = useTransform(progress, [0.8, 0.92], [12, 0]);
  /* header fades out as the deck explodes, back in for the final reveal */
  const headerOpacity = useTransform(progress, [0.1, 0.4, 0.8, 0.95], [1, 0, 0, 1]);
  const headerY = useTransform(progress, [0.1, 0.4, 0.8, 0.95], [0, -40, -40, 0]);
  /* during explode the deck drops ~60px so the top pane clears the header zone */
  const deckY = useTransform(progress, [0.3, 0.5, 0.78], [0, 70, 0]);

  /* leaders: measured per-frame from pane anchors to label left edges */
  const svgRef = useRef<SVGSVGElement>(null);
  const linesRef = useRef<(SVGLineElement | null)[]>([]);
  const lineOpacity = useTransform(progress, [0.3, 0.42], [0, 1]);
  const lineOpacityOut = useTransform(progress, [0.5, 0.6], [1, 0]);
  const lineShown = useTransform([lineOpacity, lineOpacityOut] as const, (v) => (v[0] as number) * (v[1] as number));

  useMotionValueEvent(progress, "change", (v) => {
    if (v < 0.18 || v > 0.68) return;
    const stage = stageRef.current;
    const svg = svgRef.current;
    if (!stage || !svg) return;
    const sr = stage.getBoundingClientRect();
    agents.forEach((_, i) => {
      const l = linesRef.current[i];
      const anchor = stage.querySelector<HTMLElement>(`[data-pane="${i}"] .ek-pane-anchor`);
      const label = labelRefs.current[i];
      if (!l || !anchor || !label) return;
      const ar = anchor.getBoundingClientRect();
      const lr = label.getBoundingClientRect();
      l.setAttribute("x1", String(ar.left + ar.width / 2 - sr.left));
      l.setAttribute("y1", String(ar.top + ar.height / 2 - sr.top));
      l.setAttribute("x2", String(lr.left - sr.left));
      l.setAttribute("y2", String(lr.top + lr.height / 2 - sr.top));
    });
  });

  return (
    <section id="ensemble" ref={trackRef} className="ek-layers-track">
      <div className="ek-layers-sticky">
        <div className="ek-container">
          <motion.div style={reduce ? undefined : { opacity: headerOpacity, y: headerY }}>
            <SectionHeader
              eyebrow="The ensemble"
              title="A studio of specialists."
              desc="EKAM AI isn't one model answering prompts. It's a coordinated team. Each agent owns a discipline and hands a finished artifact to the next."
              align="center"
            />
          </motion.div>
        </div>
        <div className="ek-layers-stage" ref={stageRef}>
          <motion.div
            className="ek-layers-deck"
            style={{
              rotateX,
              rotateZ,
              scale,
              y: deckY,
              transformPerspective: 2200,
            }}
          >
            {agents.map((_, i) => (
              <Pane key={i} i={i} progress={progress} />
            ))}
            {/* final merged pane */}
            <motion.div
              className="ek-pane ek-pane-final"
              style={{ opacity: finalOpacity, scale: finalScale }}
            >
              <div className="ek-browser-bar">
                <div className="ek-browser-dots" aria-hidden="true"><span /><span /><span /></div>
                <div className="ek-browser-url">yourbrand.ekamai.app</div>
                <span style={{ width: 40 }} />
              </div>
              <div className="ek-browser-body">
                <div className="ek-browser-frame"><MiniPage /></div>
              </div>
            </motion.div>
          </motion.div>
          {/* leader lines overlay */}
          <motion.svg ref={svgRef} className="ek-layers-svg" style={{ opacity: lineShown }} aria-hidden="true">
            {agents.map((_, i) => (
              <line
                key={i}
                ref={(el) => { linesRef.current[i] = el; }}
                x1={0} y1={0} x2={0} y2={0}
                stroke="var(--ek-connector)"
                strokeWidth="1"
              />
            ))}
          </motion.svg>
          {/* label column: Planner bottom → Security top */}
          <div className="ek-layers-labels">
            {[...agents].reverse().map((a, ri) => {
              const i = agents.length - 1 - ri;
              return (
                <LayerLabel
                  key={a.name}
                  agent={a}
                  index={i}
                  progress={progress}
                  refCb={(el) => { labelRefs.current[i] = el; }}
                />
              );
            })}
          </div>
          <motion.p className="ek-layers-caption" style={reduce ? undefined : { opacity: captionOpacity, y: captionY }}>
            Six specialists. One launch.
          </motion.p>
        </div>
      </div>
      {/* mobile: snap-scroll carousel + final pane */}
      <div className="ek-layers-mobile">
        <div className="ek-layers-mobile-scroll">
          {agents.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.name}
                className="ek-pane ek-pane-m"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45, ease: EASE }}
              >
                <div className="ek-pane-head">
                  <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                  <span>{a.name}</span>
                  <span className="ek-pane-file">{a.file}</span>
                </div>
                <div className="ek-pane-body">{bodies[i]()}</div>
              </motion.div>
            );
          })}
        </div>
        <div className="ek-pane ek-pane-final ek-pane-m-static">
          <div className="ek-browser-bar">
            <div className="ek-browser-dots" aria-hidden="true"><span /><span /><span /></div>
            <div className="ek-browser-url">yourbrand.ekamai.app</div>
            <span style={{ width: 40 }} />
          </div>
          <div className="ek-browser-body">
            <div className="ek-browser-frame"><MiniPage /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
