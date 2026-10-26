"use client";

import { useEffect, useRef, useState } from "react";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { AGENTS } from "@/components/site/home/agents";

/* each figure carries a unit chart: one pip per unit, filled as the count runs */
const nums: { value: number; suffix?: string; label: string; pips: string[] }[] = [
  { value: 6, label: "Specialist build agents per run", pips: AGENTS.map((a) => a.hue) },
  { value: 12, label: "Security specialists per scan", pips: Array(12).fill("var(--ek-a5)") },
  { value: 10, suffix: "/10", label: "OWASP Top 10 categories covered", pips: Array(10).fill("var(--ek-a4)") },
  { value: 14, suffix: " days", label: "Free. No card required", pips: Array(14).fill("var(--ek-a6)") },
];

const runLog: { t: string; agent: number; msg: string; cls?: string }[] = [
  { t: "00:05.8", agent: 0, msg: "spec.md written (14 sections)" },
  { t: "00:11.6", agent: 1, msg: "tokens + 3 screens approved" },
  { t: "00:24.0", agent: 2, msg: "frontend + api routes built" },
  { t: "00:30.4", agent: 3, msg: "28 checks passed" },
  { t: "00:31.0", agent: 4, msg: "11 classes scanned · 3 findings", cls: "warn" },
  { t: "00:35.4", agent: 2, msg: "3 fixes patched" },
  { t: "00:38.7", agent: 4, msg: "rescan clean · 0 open", cls: "ok" },
  { t: "00:47.2", agent: 5, msg: "live at yourbrand.crelixai.com", cls: "ok" },
];

function RunLog() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        setShown((n) => {
          if (n >= runLog.length) {
            if (interval) clearInterval(interval);
            return n;
          }
          return n + 1;
        });
      }, 380);
    };
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setShown(runLog.length));
      return () => cancelAnimationFrame(raf);
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          start();
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    const t = setTimeout(() => setShown(runLog.length), 6000);
    return () => {
      obs.disconnect();
      if (interval) clearInterval(interval);
      clearTimeout(t);
    };
  }, []);

  return (
    <div ref={ref} className="ek-runlog ek-glass" aria-label="Example build run log">
      {runLog.slice(0, shown).map((l, i) => {
        const a = AGENTS[l.agent];
        return (
          <div key={i} className="ek-runlog-line">
            <span className="t">{l.t}</span>
            <span className="a" style={{ color: a.ink }}>
              <i style={{ background: a.hue }} />
              {a.key}
            </span>
            <span className={l.cls ?? ""}>{l.msg}</span>
          </div>
        );
      })}
      {shown < runLog.length && <span className="ek-promptbar-caret" aria-hidden="true" />}
    </div>
  );
}

function CountUp({ value, suffix = "", pips }: { value: number; suffix?: string; pips: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(raf);
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    const t = setTimeout(() => setSeen(true), 4000);
    return () => {
      obs.disconnect();
      clearTimeout(t);
    };
  }, [value]);

  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    const dur = 1300;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * e));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);

  return (
    <div ref={ref}>
      <div className="ek-num-pips" aria-hidden="true">
        {pips.map((c, i) => (
          <i key={i} className={i < display ? "on" : ""} style={{ background: c }} />
        ))}
      </div>
      <span className="ek-num-value">
        {display}
        {suffix && <span className="ek-num-suffix">{suffix.trim()}</span>}
      </span>
    </div>
  );
}

export function Numbers() {
  return (
    <Section id="numbers">
      <SectionHeader
        eyebrow="In numbers"
        title={<>No vanity metrics. Just the product.</>}
      />
      <Reveal className="mt-14">
        <div className="ek-nums">
          {nums.map((n) => (
            <div key={n.label} className="ek-num">
              <CountUp value={n.value} suffix={n.suffix ?? ""} pips={n.pips} />
              <div className="ek-num-label">{n.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={120} className="mt-10">
        <p className="ek-cap mb-4">Example run</p>
        <RunLog />
      </Reveal>
    </Section>
  );
}
