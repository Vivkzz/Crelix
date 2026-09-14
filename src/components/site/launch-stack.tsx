"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Search,
  ArrowRight,
  Terminal,
  Bug,
  FileSearch,
  Rocket,
  Check,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { suites } from "@/lib/data/site";

export function LaunchStack() {
  return (
    <Section id="flow">
      <SectionHeader
        eyebrow="Launch stack"
        title="From launch page to security check"
        desc="Start with EKAM AI Flow to create and publish your public site, then use EKAM AI Pentest to scan authorized targets before you announce."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {suites.map((s, i) => (
          <Reveal key={s.slug} delay={i * 80}>
            <div
              id={s.slug}
              data-suite={s.slug}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]"
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 group-hover:opacity-25 transition-opacity blur-3xl"
                style={{ background: s.color }}
              />

              <div className="flex items-center justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-white"
                  style={{ color: s.color }}
                >
                  {s.slug === "pentest" && <ShieldCheck className="h-5 w-5" />}
                  {s.slug === "flow" && <Sparkles className="h-5 w-5" />}
                  {s.slug === "search" && <Search className="h-5 w-5" />}
                </div>
                <span className="suite-chip">EKAM AI · {s.slug}</span>
              </div>

              <div className="mt-5">
                <div className="text-xs text-muted-foreground">{s.tagline}</div>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">
                  {s.fullName}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>

              <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                {s.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4" style={{ color: s.color }} />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-2">
                <Link
                  href={s.href}
                  className="btn-pill-outline w-full"
                >
                  {s.slug === "pentest" ? "Run a pre-launch scan" : s.slug === "flow" ? "Build with Flow" : "Run research"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
