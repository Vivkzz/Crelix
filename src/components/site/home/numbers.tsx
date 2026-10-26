"use client";

import { useEffect, useRef, useState } from "react";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";

const nums = [
  { value: 6, label: "Specialist build agents per run" },
  { value: 12, label: "Security specialists per scan" },
  { value: 10, suffix: "/10", label: "OWASP Top 10 categories covered" },
  { value: 14, suffix: " days", label: "Free. No card required" },
];

const runLog: { t: string; msg: string; cls?: string }[] = [
  { t: "00:00.4", msg: "planner     → spec.md written (14 sections)" },
  { t: "00:06.1", msg: "designer    → tokens + 3 screens approved" },
  { t: "00:11.8", msg: "engineer    → frontend + api routes built" },
  { t: "00:24.3", msg: "tester      → 28 checks passed" },
  { t: "00:31.0", msg: "security    → 11 classes scanned · 3 findings", cls: "warn" },
  { t: "00:38.7", msg: "security    → findings resolved · rescan clean", cls: "ok" },
  { t: "00:47.2", msg: "deployer    → live at yourbrand.ekamai.app", cls: "ok" },
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
      {runLog.slice(0, shown).map((l, i) => (
        <div key={i}>
          <span className="t">[{l.t}]</span>{" "}
          <span className={l.cls ?? ""}>{l.msg}</span>
        </div>
      ))}
      {shown < runLog.length && <span className="ek-promptbar-caret" aria-hidden="true" />}
    </div>
  );
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
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
    const dur = 1200;
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
    <span ref={ref} className="ek-num-value">
      {display}
      {suffix}
    </span>
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
              <CountUp value={n.value} suffix={n.suffix ?? ""} />
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
