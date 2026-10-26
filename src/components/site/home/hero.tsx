"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { Check, Play } from "lucide-react";
import { MiniPage } from "@/components/site/home/how-it-works";
import { Reveal, SplitReveal } from "@/components/shared/reveal";

const AGENTS = [
  { name: "Planner", status: "spec.md · 14 sections" },
  { name: "Designer", status: "tokens + 3 screens" },
  { name: "Engineer", status: "frontend + api routes" },
  { name: "Tester", status: "28 checks passed" },
  { name: "Security", status: "11 classes · 0 open" },
  { name: "Deployer", status: "live · yourbrand.ekamai.app" },
];

export function WorkspaceWindow({ stage }: { stage: number }) {
  return (
    <div className="ek-window" aria-hidden="true">
      {/* chrome */}
      <div className="ek-window-bar">
        <div className="ek-window-dots"><span /><span /><span /></div>
        <div className="ek-window-title">ekam workspace</div>
        <div style={{ width: 52 }} />
      </div>
      <div className="ek-window-body">
        {/* left: prompt thread + agent list */}
        <div className="ek-window-side">
          <div className="ek-window-bubble">
            Booking site for a physiotherapy clinic in Pune. Calm, trustworthy,
            online scheduling. References: Apple, Calm.
          </div>
          <div className="ek-window-agents">
            {AGENTS.map((a, i) => {
              const done = i < stage;
              const running = i === stage;
              return (
                <div key={a.name} className={`ek-window-agent${done ? " done" : running ? " running" : ""}`}>
                  <span className="ek-window-agent-ico">
                    {done ? <Check className="h-3 w-3" /> : running ? <span className="ek-window-pulse" /> : <span className="ek-window-dot" />}
                  </span>
                  <span className="ek-window-agent-name">{a.name}</span>
                  <span className="ek-window-agent-status">{done || running ? a.status : "·"}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* right: live preview */}
        <div className="ek-window-preview">
          <div className="ek-window-preview-label">preview · yourbrand.ekamai.app</div>
          <div className="ek-window-preview-frame">
            <MiniPage />
          </div>
        </div>
      </div>
      <div className="ek-window-foot">
        <span className="ek-window-scan">Security scan · 11 classes · 0 open</span>
        <span className="ek-window-publish"><Play className="h-3 w-3" />Publish</span>
      </div>
    </div>
  );
}

export function HomeHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 899px)").matches;
  const [startY, setStartY] = useState(260);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6 });

  useEffect(() => {
    const measure = () => {
      const copy = copyRef.current;
      if (!copy) return;
      const r = copy.getBoundingClientRect();
      const sticky = copy.closest(".ek-hero2-sticky");
      const stickyR = sticky ? sticky.getBoundingClientRect() : { top: 0 };
      const win = sticky?.querySelector(".ek-window-wrap");
      const winH = win ? win.getBoundingClientRect().height : 550;
      /* window is vertically centred in the sticky; at progress 0 its TOP edge
         must sit at (copy bottom + 48px gap) */
      const copyBottom = r.bottom - stickyR.top;
      const offset = copyBottom + 48 + winH / 2 - window.innerHeight / 2;
      setStartY(Math.max(0, Math.round(offset)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (copyRef.current) ro.observe(copyRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const rotateX = useTransform(p, [0, 1], [18, 0]);
  const scale = useTransform(p, [0, 1], [0.86, 1]);
  /* window starts below the copy and rises to dead-centre */
  const y = useTransform(p, [0, 1], [startY, 0]);
  const copyOpacity = useTransform(p, [0.05, 0.45], [1, 0]);
  const copyY = useTransform(p, [0.05, 0.45], [0, -60]);

  const [stage, setStage] = useState(0);
  useMotionValueEvent(p, "change", (v) => setStage(Math.min(6, Math.max(0, Math.floor(v * 7)))));

  return (
    <div ref={trackRef} className="ek-hero2">
      <div className="ek-hero2-sticky">
        <motion.div ref={copyRef} className="ek-hero2-copy" style={reduce ? undefined : { opacity: copyOpacity, y: copyY }}>
          <Reveal>
            <div className="ek-hero2-eyebrow">EKAM AI</div>
          </Reveal>
          <SplitReveal
            as="h1"
            className="ek-h1"
            lines={["Many agents.", "One launch."]}
          />
          <Reveal delay={220}>
            <p className="ek-hero2-sub">
              Describe it. Six AI specialists build it. Twelve more secure it.
              Live before lunch.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="ek-hero2-ctas">
              <Link href="/signup" className="ek-btn">Start free</Link>
              <Link href="#how-it-works" className="ek-link" style={{ fontSize: 17 }}>See how it works</Link>
            </div>
            <p className="ek-hero2-note">No card required · Authorized scans only</p>
          </Reveal>
        </motion.div>

        <div className="ek-window-perspective">
          <motion.div
            className="ek-window-wrap"
            style={reduce || narrow ? undefined : { rotateX, scale, y }}
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <WorkspaceWindow stage={stage} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
