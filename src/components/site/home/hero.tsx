"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { MiniPage } from "@/components/site/home/how-it-works";
import { Reveal, SplitReveal } from "@/components/shared/reveal";
import { AGENTS } from "@/components/site/home/agents";
import { Threads } from "@/components/site/home/threads";
import { useReducedMotionSafe } from "@/components/shared/use-reduced-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ms each agent runs in the hero demo; Engineer takes longest because the page assembles */
const DURATIONS = [1250, 1250, 2200, 1400, 1800, 1300];

/* share of the 47.2s run each agent took, for the run-time bar */
const RUN_SHARE = [6, 6, 13, 7, 8, 8];

const WIRE_SWATCHES = ["#0A5BD3", "#6EA8FE", "#EEF3FB", "#1D1D1F"];

function PreviewWire({ palette }: { palette: boolean }) {
  return (
    <div className="ek-wire" aria-hidden="true">
      <div className="ek-wire-nav"><i style={{ width: "18%" }} /><i style={{ width: "34%", marginLeft: "auto" }} /><i className="pill" /></div>
      <div className="ek-wire-hero">
        <div className="ek-wire-copy">
          <i style={{ width: "30%" }} />
          <i className="h" style={{ width: "82%" }} />
          <i className="h" style={{ width: "58%" }} />
          <i style={{ width: "74%" }} />
          <i style={{ width: "40%" }} />
        </div>
        <div className="ek-wire-img" />
      </div>
      <div className="ek-wire-cards"><span /><span /><span /></div>
      <AnimatePresence>
        {palette && (
          <motion.div
            className="ek-wire-palette"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {WIRE_SWATCHES.map((c, i) => (
              <motion.span
                key={c}
                style={{ background: c }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15 + i * 0.09, type: "spring", stiffness: 420, damping: 22 }}
              />
            ))}
            <em>Inter · 56/18</em>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentIcon({ state }: { state: "done" | "running" | "idle" }) {
  if (state === "done") {
    return (
      <span className="ek-agent-ico done">
        <Check className="h-2.5 w-2.5" strokeWidth={3.2} />
      </span>
    );
  }
  if (state === "running") return <span className="ek-agent-ico running" />;
  return <span className="ek-agent-ico" />;
}

/**
 * The ekam workspace: prompt, the six agents in hue, and a live preview
 * that follows them (wireframe → palette → assembled page → checks →
 * scan → live). `stage` = number of finished agents (0–6).
 * `demo` animates transitions; without it the window renders a still state.
 */
export function WorkspaceWindow({
  stage,
  demo = false,
  onReplay,
}: {
  stage: number;
  demo?: boolean;
  onReplay?: () => void;
}) {
  const live = stage >= 6;
  const built = stage >= 2;
  const testing = stage === 3;
  const scanning = stage === 4;

  return (
    <div className="ek-window">
      <div className="ek-window-bar" aria-hidden="true">
        <div className="ek-window-dots"><span /><span /><span /></div>
        <div className="ek-window-title">
          <span>Kinetic Physio</span>
          <span className="ek-window-title-sep">/</span>
          <span className="ek-window-title-run">run #1042</span>
        </div>
        <div className="ek-window-bar-end" />
      </div>
      <div className="ek-window-body" aria-hidden="true">
        <div className="ek-window-side">
          <div className="ek-window-bubble">
            Booking site for a physiotherapy clinic in Pune. Calm, trustworthy,
            online scheduling. References: Apple, Calm.
          </div>
          <div className="ek-window-agents">
            {AGENTS.map((a, i) => {
              const state = i < stage ? "done" : i === stage ? "running" : "idle";
              return (
                <div
                  key={a.key}
                  className={`ek-agent-row ${state}`}
                  style={{ "--hue": a.hue, "--hue-ink": a.ink, "--dur": `${DURATIONS[i]}ms` } as CSSProperties}
                >
                  <AgentIcon state={state} />
                  <span className="ek-agent-name">{a.name}</span>
                  <span className="ek-agent-status">
                    {state === "done" ? a.out : state === "running" ? `${a.doing}…` : "queued"}
                  </span>
                  {state === "running" && demo && <span className="ek-agent-bar" />}
                </div>
              );
            })}
          </div>
          <div className="ek-window-runbar">
            <div className="ek-window-runbar-head">
              <span>Run time</span>
              <span>{live ? "00:47.2" : "running"}</span>
            </div>
            <div className="ek-window-runbar-track">
              {AGENTS.map((a, i) => (
                <i
                  key={a.key}
                  className={i < stage ? "on" : ""}
                  style={{ background: a.hue, flexGrow: RUN_SHARE[i] }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="ek-window-preview">
          <div className="ek-window-preview-label">
            <span className={`ek-window-live${live ? " on" : ""}`} />
            yourbrand.ekamai.app
            <span className="ek-window-preview-state">
              {live ? "Live" : stage === 5 ? "Deploying" : built ? "Preview" : "Drafting"}
            </span>
          </div>
          <div className="ek-window-preview-frame ek-minipage">
            {built ? <MiniPage assemble={demo} /> : <PreviewWire palette={stage === 1} />}
            <AnimatePresence>
              {testing && (
                <motion.div className="ek-preview-checks" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {["Booking flow", "Mobile", "Contrast AA"].map((c, i) => (
                    <motion.span
                      key={c}
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.28, duration: 0.45, ease: EASE }}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} /> {c}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {scanning && <div className="ek-preview-scan" />}
          </div>
        </div>
      </div>
      <div className="ek-window-foot">
        <span aria-hidden="true" className={`ek-window-scan${stage > 4 ? " clean" : scanning ? " active" : ""}`}>
          {stage > 4 ? "Security · 11 classes · 0 open" : scanning ? "Scanning · 11 classes" : "Security scan · queued"}
        </span>
        <span className="flex items-center gap-2">
          {onReplay && live && (
            <button type="button" className="ek-window-replay" onClick={onReplay} aria-label="Replay the build">
              <RotateCcw className="h-3 w-3" aria-hidden="true" /> Replay
            </button>
          )}
          <span aria-hidden="true" className={`ek-window-publish${live ? " live" : ""}`}>
            {live ? <><Check className="h-3 w-3" strokeWidth={3} /> Live</> : "Publish"}
          </span>
        </span>
      </div>
    </div>
  );
}

/* runs the six agents in sequence on a timer; `run` bumps to replay */
function useAgentRun(enabled: boolean) {
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const timers: number[] = [];
    if (!enabled) {
      timers.push(window.setTimeout(() => setStage(6), 0));
      return () => timers.forEach(clearTimeout);
    }
    let at = run === 0 ? 1100 : 300;
    timers.push(window.setTimeout(() => setStage(0), 0));
    DURATIONS.forEach((d, i) => {
      at += d;
      timers.push(window.setTimeout(() => setStage(i + 1), at));
    });
    return () => timers.forEach(clearTimeout);
  }, [enabled, run]);
  return { stage, replay: () => setRun((r) => r + 1) };
}

export function HomeHero() {
  const reduce = useReducedMotionSafe();
  const stageRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const { stage, replay } = useAgentRun(!reduce);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start end", "start 0.15"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [28, 0]);

  return (
    <section className="ek-hero3">
      <div className="ek-hero3-art">
        <Threads focusRef={windowRef} focusOffset={-2} />
      </div>
      <div className="ek-hero3-copy">
        <Reveal>
          <div className="ek-hero3-eyebrow">
            <span className="ek-hue-dots" aria-hidden="true">
              {AGENTS.map((a) => <i key={a.key} style={{ background: a.hue }} />)}
            </span>
            EKAM AI
          </div>
        </Reveal>
        <SplitReveal
          as="h1"
          className="ek-h1 ek-hero3-title"
          lines={[
            "Many agents.",
            <>One launch<span className="ek-bindu" aria-hidden="true" /><span className="sr-only">.</span></>,
          ]}
          stagger={110}
        />
        <Reveal delay={260}>
          <p className="ek-hero2-sub">
            Describe it. Six AI specialists build it. Twelve more secure it.
            Live before lunch.
          </p>
        </Reveal>
        <Reveal delay={360}>
          <div className="ek-hero2-ctas">
            <Link href="/signup" className="ek-btn">Start free</Link>
            <Link href="#how-it-works" className="ek-link" style={{ fontSize: 17 }}>See how it works</Link>
          </div>
          <p className="ek-hero2-note">No card required · Authorized scans only</p>
        </Reveal>
      </div>

      <div ref={stageRef} className="ek-hero3-stage">
        <motion.div
          className="ek-window-wrap"
          initial={reduce ? false : { opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.35, ease: EASE }}
        >
          <motion.div ref={windowRef} style={reduce ? undefined : { scale, y }}>
            <WorkspaceWindow stage={stage} demo={!reduce} onReplay={reduce ? undefined : replay} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
