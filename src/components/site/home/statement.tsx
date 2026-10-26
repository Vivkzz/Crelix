"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { AGENTS } from "@/components/site/home/agents";
import { useReducedMotionSafe } from "@/components/shared/use-reduced-motion";

/* inline figures that sit in the sentence like words */
function SixDots() {
  return (
    <span className="ek-inline-six" aria-hidden="true">
      {AGENTS.map((a) => <i key={a.key} style={{ background: a.hue }} />)}
    </span>
  );
}

function TwelveDots() {
  return (
    <span className="ek-inline-twelve" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => <i key={i} />)}
    </span>
  );
}

const TOKENS: (string | { node: ReactNode })[] = [
  ..."Crelix isn't one model answering prompts. It's six specialists".split(" "),
  { node: <SixDots /> },
  ..."that plan, design, build and deploy your idea, and twelve more".split(" "),
  { node: <TwelveDots /> },
  ..."that try to break it before anyone else can.".split(" "),
];

function Token({ token, index, total, progress }: { token: (typeof TOKENS)[number]; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const end = start + 1.5 / total;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  const scale = useTransform(progress, [start, end], [0.6, 1]);
  if (typeof token === "string") {
    return <motion.span style={{ opacity }}>{token} </motion.span>;
  }
  return (
    <>
      <motion.span style={{ opacity, scale, display: "inline-block" }}>{token.node}</motion.span>{" "}
    </>
  );
}

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  return (
    <div ref={ref} className="ek-statement">
      <p>
        {TOKENS.map((tk, i) =>
          reduce ? (
            <span key={i}>{typeof tk === "string" ? tk : tk.node} </span>
          ) : (
            <Token key={i} token={tk} index={i} total={TOKENS.length} progress={scrollYProgress} />
          )
        )}
      </p>
    </div>
  );
}
