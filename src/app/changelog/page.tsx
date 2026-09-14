"use client";

import { useState } from "react";
import { Calendar, Tag } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { changelog } from "@/lib/data/site";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { cn } from "@/lib/utils";

const filters = ["all", "feature", "improvement", "fix", "chore"];

const typeColors: Record<string, string> = {
  feature: "var(--color-1)",
  improvement: "var(--color-2)",
  fix: "var(--color-5)",
  chore: "var(--color-4)",
};

export default function ChangelogPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? changelog : changelog.filter((e) => e.type === filter);

  // Group by month
  const months = Array.from(new Set(filtered.map((e) => e.month)));

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16">
        <AnimatedBackground variant="soft" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-linear-3)" }} />
              Changelog
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1
              className="mt-4 font-semibold tracking-tight"
              style={{ fontSize: "clamp(40px, 3.5vw + 28px, 64px)", lineHeight: 1.05 }}
            >
              <span className="text-spectrum-animated">What we ship,</span>
              <br />
              when we ship it.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 text-pretty text-muted-foreground text-lg">
              Newest first. Every feature, fix, and chore — straight from the team.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filters */}
      <Section className="!pt-0 !pb-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all",
                filter === f
                  ? "border-foreground bg-[#13121f] text-white"
                  : "border-border bg-white/80 text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section className="!pt-0">
        <div className="mx-auto max-w-3xl">
          {months.map((month) => (
            <div key={month} className="mb-12">
              <Reveal>
                <h2 className="mb-6 text-2xl font-semibold tracking-tight">{month}</h2>
              </Reveal>
              <div className="relative space-y-4 border-l border-border pl-6">
                {filtered
                  .filter((e) => e.month === month)
                  .map((entry, i) => (
                    <Reveal key={entry.title} delay={i * 60}>
                      <div className="relative">
                        <span
                          className="absolute -left-[31px] top-4 h-3 w-3 rounded-full border-2 border-white"
                          style={{ background: typeColors[entry.type] }}
                        />
                        <div className="rounded-2xl border border-border bg-white/80 p-5 hover:border-foreground/15 transition-all">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span
                              className="rounded-full px-2 py-0.5 font-mono uppercase tracking-wider text-white"
                              style={{ background: typeColors[entry.type] }}
                            >
                              {entry.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {entry.date}
                            </span>
                          </div>
                          <h3 className="mt-3 text-base font-semibold tracking-tight">
                            {entry.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {entry.description}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <FinalCTA
        title="Build with the team"
        subtitle="that ships every week."
        primary={{ label: "Start free trial", href: "/#get-started" }}
        secondary={{ label: "Read the blog", href: "/blog" }}
      />
    </SiteLayout>
  );
}
