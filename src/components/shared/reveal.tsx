"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    // Content must never stay hidden if the observer never fires
    // (e.g. full-page screenshot captures).
    const t = window.setTimeout(() => setFallback(true), 1500);
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`ek-reveal ${visible ? "is-visible" : ""} ${fallback && !visible ? "fallback" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/**
 * SplitReveal — per-line mask reveal for headlines.
 * Pass lines as an array of ReactNodes (each becomes a masked line),
 * or a single node rendered as one line.
 */
export function SplitReveal({
  lines,
  className = "",
  delay = 0,
  stagger = 70,
  as: Tag = "div",
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  stagger?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    const t = window.setTimeout(() => setVisible(true), 1500);
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <Tag ref={ref} className={`ek-split ${visible ? "is-visible" : ""} ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="ek-split-line">
          <span
            className="ek-split-inner"
            style={{ transitionDelay: `${delay + i * stagger}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
