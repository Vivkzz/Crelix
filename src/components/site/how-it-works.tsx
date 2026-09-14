"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PenLine,
  Upload,
  ShieldCheck,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { StepArt, type StepVariant } from "@/components/site/step-art";
import { stats } from "@/lib/data/site";
import { useCountUp } from "@/components/shared/use-count-up";

const steps: { n: string; icon: typeof PenLine; title: string; desc: string; art: StepVariant }[] = [
  {
    n: "01",
    icon: PenLine,
    title: "Describe your project",
    desc: "Share what you are building, who it is for, and the angle. Add references, screenshots, and assets to match your vision. No coding required.",
    art: "describe",
  },
  {
    n: "02",
    icon: Upload,
    title: "Add references & assets",
    desc: "Drop in screenshots, copy fragments, brand colors, or a Figma link. Agents match the structure and voice you want — without a setup marathon.",
    art: "assets",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Pair launch & security",
    desc: "Create the page, iterate on copy and visuals, then run a pre-launch scan — without leaving the EKAM AI workflow.",
    art: "security",
  },
  {
    n: "04",
    icon: Rocket,
    title: "Go live with one click",
    desc: "Publish landing pages and edits, and hand the live URL to Pentest when you are ready to validate. Every project goes live on a public URL you own.",
    art: "launch",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeader
        eyebrow="How it works"
        title="Built for the public launch moment"
        desc="Go from idea to live launch page, then validate the obvious security risks before you drive traffic."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 80}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white/80 hover:border-foreground/15 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all">
              {/* Brand SVG illustration — data-driven, no external image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <StepArt
                  variant={s.art}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-foreground overflow-hidden transition-all group-hover:border-transparent group-hover:text-white">
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "var(--gradient-linear-3)", backgroundSize: "200% auto" }}
                    />
                    <s.icon className="relative h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Stats strip */}
      <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-white/80 p-6 sm:p-8 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <StatBlock value={s.value} label={s.label} />
          </Reveal>
        ))}
      </div>

      {/* Agents callout */}
      <Reveal>
        <div
          id="why"
          className="mt-12 overflow-hidden rounded-2xl border border-border bg-white/80 p-6 sm:p-10 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Why EKAM AI?
              </div>
              <h3
                className="mt-4 font-semibold tracking-tight"
                style={{ fontSize: "clamp(24px, 1.8vw + 14px, 36px)", lineHeight: 1.15 }}
              >
                Specialized AI agents coordinated as one team
              </h3>
              <p className="mt-3 text-pretty text-muted-foreground">
                Each agent handles a role — planning, coding, design, testing,
                deployment. They coordinate so you don't have to. The result is a
                coherent launch artifact, not a pile of disconnected outputs.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { name: "Planner", color: "var(--color-1)" },
                  { name: "Designer", color: "var(--color-2)" },
                  { name: "Engineer", color: "var(--color-3)" },
                  { name: "Tester", color: "var(--color-4)" },
                  { name: "Deployer", color: "var(--color-1)" },
                  { name: "Security", color: "var(--color-5)" },
                ].map((role) => (
                  <span
                    key={role.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: role.color }} />
                    {role.name} agent
                  </span>
                ))}
              </div>
            </div>

            <div className="relative rounded-xl border border-border bg-white p-5">
              <div className="space-y-2.5">
                {[
                  { name: "Planner", out: "spec → design brief", color: "var(--color-1)" },
                  { name: "Designer", out: "layout + copy", color: "var(--color-2)" },
                  { name: "Engineer", out: "frontend + backend", color: "var(--color-3)" },
                  { name: "Tester", out: "smoke + a11y checks", color: "var(--color-4)" },
                  { name: "Deployer", out: "live URL", color: "var(--color-1)" },
                  { name: "Security", out: "pre-launch scan", color: "var(--color-5)" },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between rounded-md border border-border bg-[#eaeaea]/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: row.color }} />
                      <span className="font-mono text-xs text-foreground/90">{row.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{row.out}</span>
                  </div>
                ))}
              </div>
              <div
                className="mt-3 flex items-center justify-between rounded-md border px-3 py-2"
                style={{
                  borderColor: "var(--color-2)",
                  background: "color-mix(in srgb, var(--color-2) 8%, transparent)",
                }}
              >
                <span className="font-mono text-[11px]" style={{ color: "var(--color-3)" }}>
                  coordinated by EKAM AI
                </span>
                <ArrowRight className="h-3 w-3" style={{ color: "var(--color-3)" }} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Get started inline CTA */}
      <Reveal>
        <div
          id="try"
          className="mt-12 relative overflow-hidden rounded-2xl border border-border bg-white/80 p-6 sm:p-10 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]"
        >
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full spectrum-blob opacity-30" />
          </div>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h3
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(24px, 1.8vw + 14px, 36px)", lineHeight: 1.15 }}
              >
                Start with Flow. Add Pentest before launch.
              </h3>
              <p className="mt-3 text-pretty text-muted-foreground">
                Use Flow to create the public page, then run an authorized
                security check on your app, API, or staging target.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/#get-started" className="btn-pill">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="btn-pill-outline">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  // Try to extract a numeric prefix for count-up
  const m = value.match(/^([\d,.]+)/);
  const num = m ? parseFloat(m[1].replace(/,/g, "")) : null;
  const suffix = m ? value.slice(m[1].length) : "";
  const prefix = m ? "" : value;
  const { ref, count } = useCountUp(num || 0, 1600);

  return (
    <div className="text-center">
      <div
        ref={ref}
        className="text-3xl font-semibold tracking-tight sm:text-4xl"
        style={{
          background: "var(--gradient-linear-3)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {num !== null
          ? `${count >= 1000 ? Math.round(count).toLocaleString() : Math.round(count)}${suffix}`
          : prefix}
      </div>
      <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</div>
    </div>
  );
}
