"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Rocket,
  Clock,
  ShieldCheck,
  HeartPulse,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { Monogram } from "@/components/site/monogram";

const projects = [
  {
    name: "Northwind Labs",
    tag: "AI infra",
    desc: "Launch page + waitlist, built and shipped in an afternoon.",
    metric: "1,200 signups in week 1",
    suite: "flow",
    icon: Rocket,
    metricIcon: TrendingUp,
  },
  {
    name: "Hushnote",
    tag: "Consumer SaaS",
    desc: "Landing + auth + billing, prompt-to-deployed in under an hour.",
    metric: "Live in 47 minutes",
    suite: "flow",
    icon: Zap,
    metricIcon: Clock,
  },
  {
    name: "Sentinel Ops",
    tag: "DevTools",
    desc: "Pentest pre-launch found 3 high findings before announce.",
    metric: "0 criticals at launch",
    suite: "pentest",
    icon: ShieldCheck,
    metricIcon: ShieldCheck,
  },
  {
    name: "Mira Health",
    tag: "Healthtech",
    desc: "Marketing site + patient portal, scanned and shipped.",
    metric: "HIPAA-aligned posture",
    suite: "search",
    icon: HeartPulse,
    metricIcon: Users,
  },
];

export function Portfolio() {
  return (
    <Section id="portfolio">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeader
          align="left"
          eyebrow="EKAM AI portfolio"
          title="Real projects, shipped by founders"
          desc="A sample of what founders have built and deployed using EKAM AI — from launch pages to full apps, scanned before go-live."
        />
        <Link href="/blog" className="btn-pill-outline shrink-0">
          Explore more projects
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 60}>
            <Link
              href="/#get-started"
              data-suite={p.suite}
              className="group relative block overflow-hidden rounded-2xl border border-border bg-white/80 p-6 hover:border-foreground/15 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] transition-all"
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-10 group-hover:opacity-30 transition-opacity blur-3xl"
                style={{ background: "var(--suite-color)" }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monogram
                    seed={p.name}
                    size={40}
                    radius={20}
                    className="rounded-lg border border-border"
                  />
                  <div>
                    <div className="text-base font-semibold tracking-tight">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.tag}</div>
                  </div>
                </div>
                {/* Suite icon badge */}
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white transition-transform group-hover:scale-110"
                  style={{ color: "var(--suite-color)" }}
                >
                  <p.icon className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <p.metricIcon className="h-3.5 w-3.5" style={{ color: "var(--suite-color)" }} />
                  Outcome
                </span>
                <span className="font-mono text-xs flex items-center gap-1.5" style={{ color: "var(--suite-color)" }}>
                  {p.metric}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
