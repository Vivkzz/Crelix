"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

const TEXT =
  "EKAM isn't one model answering prompts. It's six specialists that plan, design, build and deploy your idea, and twelve more that try to break it before anyone else can.";

function Word({ word, index, total, progress }: { word: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.25, 1]);
  const color = useTransform(progress, [start, end], ["var(--ek-ink-3)", "var(--ek-ink)"]);
  return (
    <motion.span style={{ opacity, color }}>
      {word}{" "}
    </motion.span>
  );
}

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  const words = TEXT.split(" ");

  return (
    <div ref={ref} className="ek-statement">
      <p>
        {words.map((w, i) =>
          reduce ? (
            <span key={i}>{w} </span>
          ) : (
            <Word key={i} word={w} index={i} total={words.length} progress={scrollYProgress} />
          )
        )}
      </p>
    </div>
  );
}
