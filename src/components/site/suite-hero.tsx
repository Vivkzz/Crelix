"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/shared/reveal";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { VicharLogo } from "@/components/site/vichar-logo";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.3, 0.045, 0.35, 1] as const },
  }),
};

export function SuiteHero({
  suite,
}: {
  suite: {
    slug: string;
    fullName: string;
    tagline: string;
    description: string;
    color: string;
  };
}) {
  return (
    <section
      id="top"
      data-suite={suite.slug}
      className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20"
    >
      <AnimatedBackground variant="default" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <VicharLogo active={suite.slug as any} size={20} />
            <span className="font-mono">EKAM AI · {suite.slug}</span>
            <span className="text-foreground/80">· {suite.fullName}</span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 font-semibold tracking-tight"
            style={{ fontSize: "clamp(40px, 3.5vw + 28px, 80px)", lineHeight: 1.05 }}
          >
            <span className="block">{suite.tagline}</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground"
            style={{ fontSize: "clamp(16px, 1vw + 13px, 20px)", lineHeight: 1.5 }}
          >
            {suite.description}
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            {suite.slug === "flow" && ["Launch page", "SaaS app", "Dashboard", "Portfolio", "API"].map((t) => (
              <span key={t} className="rounded-full border border-border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
            {suite.slug === "pentest" && ["Authorized targets", "Pre-launch checks", "Live scan feed"].map((t) => (
              <span key={t} className="rounded-full border border-border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
            {suite.slug === "search" && ["Audience signals", "Competitor map", "Launch angles"].map((t) => (
              <span key={t} className="rounded-full border border-border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a href="#get-started" className="btn-pill w-full sm:w-auto">
              {suite.slug === "flow" && "Build my site"}
              {suite.slug === "pentest" && "Run scan"}
              {suite.slug === "search" && "Run research"}
            </a>
            <a href="#inside" className="btn-pill-outline w-full sm:w-auto">
              Learn more
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
