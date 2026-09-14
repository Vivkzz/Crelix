"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Marquee } from "@/components/shared/marquee";
import { AnimatedLine } from "@/components/site/animated-line";
import { BrandLogos } from "@/components/site/brand-logos";
import { VicharLogo } from "@/components/site/vichar-logo";
import { ProfileAvatar } from "@/components/site/profile-avatar";
import { testimonials } from "@/lib/data/site";
import { LaunchStackSection } from "@/components/site/launch-stack-section";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.3, 0.045, 0.35, 1] as const },
  }),
};

const quickButtons = [
  { label: "Flow", suite: "flow", href: "/flow" },
  { label: "Pentest", suite: "pentest", href: "/pentest" },
  { label: "Search", suite: "search", href: "/search" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24">
      {/* Background — very soft glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[20%] h-[260px] w-[480px] -translate-x-1/2 rounded-full spectrum-blob opacity-[0.08] blur-[100px]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Early access pill */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: "var(--color-1)" }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-1)" }} />
              </span>
              Early access — Flow + Pentest + Search
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative mt-6 inline-block"
          >
            <h1
              className="font-semibold tracking-tight"
              style={{
                fontSize: "clamp(48px, 3.5vw + 36px, 96px)",
                lineHeight: 1.04,
              }}
            >
              <span className="block">Build with AI.</span>
              <span className="block text-spectrum-animated">Scan before go-live.</span>
            </h1>
          </motion.div>

          {/* Product description — with animated lines flanking it */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-8 max-w-2xl"
          >
            <div className="hero-desc-wrapper" style={{ position: "relative" }}>
              {/* Lines positioned at the description paragraph level */}
              <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
                {/* Left line */}
                <div className="absolute right-full w-[25vw] max-w-[500px]" style={{ top: "50%", transform: "translateY(-50%)" }}>
                  <AnimatedLine variant="hero1" lightsDuration={8} />
                </div>
                {/* Right line */}
                <div className="absolute left-full w-[25vw] max-w-[500px]" style={{ top: "50%", transform: "translateY(-50%)" }}>
                  <AnimatedLine variant="hero2" lightsDuration={8} />
                </div>
              </div>

              <p
                className="text-pretty text-muted-foreground text-center"
                style={{ fontSize: "clamp(16px, 1vw + 13px, 20px)", lineHeight: 1.55 }}
              >
                EKAM AI is an AI software platform. Describe your idea and AI agents
                plan, design, and build your site or app — with an authorized security
                scan before every launch. No coding required.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-pill w-full sm:w-auto">
                Launch with EKAM AI
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/flow" className="btn-pill-outline w-full sm:w-auto">
                Explore the suite
              </Link>
            </div>

            {/* Quick buttons */}
            <div className="mt-5 flex items-center justify-center gap-2">
              {quickButtons.map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  data-suite={q.suite}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-white/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-foreground/20"
                  style={{ ["--suite-color" as string]: `var(--color-${q.suite === "pentest" ? "1" : q.suite === "flow" ? "2" : "5"})` }}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                    style={{ background: "var(--suite-color)" }}
                  >
                    <VicharLogo active={q.suite as any} size={16} />
                  </span>
                  {q.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Trust row — brand logos */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-12 flex flex-col items-center justify-center gap-3 pb-8"
          >
            <span className="text-xs text-muted-foreground">
              Powered by leading AI models, orchestrated by EKAM AI
            </span>
            <BrandLogos />
          </motion.div>
        </div>
      </div>

      {/* Launch stack section */}
      <LaunchStackSection />

      {/* Testimonial marquee */}
      <div className="mt-16">
        <Marquee
          items={testimonials}
          renderItem={(t) => (
            <div className="w-[380px] rounded-2xl border border-border bg-white/80 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <ProfileAvatar
                  seed={t.author}
                  size={48}
                  className="rounded-full border-2 border-white shadow-sm"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{t.author}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.role}</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">"{t.quote}"</p>
            </div>
          )}
        />
      </div>
    </section>
  );
}
