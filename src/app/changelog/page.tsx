"use client";

import { useState } from "react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section, PageHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { changelog } from "@/lib/data/site";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const filters = ["all", "feature", "improvement", "fix", "chore"] as const;

const tagClass: Record<string, string> = {
  feature: "new",
  improvement: "improved",
  fix: "fix",
  chore: "chore",
};
const tagLabel: Record<string, string> = {
  feature: "Feature",
  improvement: "Improvement",
  fix: "Fix",
  chore: "Chore",
};

export default function ChangelogPage() {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? changelog : changelog.filter((e) => e.type === filter);
  const months = Array.from(new Set(filtered.map((e) => e.month)));

  return (
    <SiteLayout>
      <div className="ek-pagehead">
        <PageHeader
          eyebrow="Changelog"
          title={<>What we ship, when we ship it.</>}
          subtitle="Newest first. Every feature, fix, and chore, straight from the team."
        >
          <div className="ek-chlog-filters mt-8 inline-flex max-w-full items-center overflow-x-auto rounded-full p-1" style={{ background: "var(--ek-bg-2)", border: "1px solid var(--ek-line)" }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn("ek-chipbtn relative capitalize", filter === f && "active")}
              >
                {filter === f && (
                  <motion.span
                    layoutId="chlog-pill"
                    className="ek-chipbtn-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{f}</span>
              </button>
            ))}
          </div>
        </PageHeader>
      </div>

      <Section className="!pt-0">
        {months.map((month) => {
          const entries = filtered.filter((e) => e.month === month);
          return (
            <div key={month} className="ek-chlog mb-16">
              <div className="ek-chlog-month">{month}</div>
              <div className="ek-chlog-list" style={{ borderTop: "1px solid var(--ek-line)" }}>
                {entries.map((entry, i) => (
                  <Reveal key={entry.title} delay={i * 50}>
                    <div className="ek-chlog-entry" data-type={entry.type}>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`ek-tag ${tagClass[entry.type] ?? "chore"}`}>{tagLabel[entry.type] ?? entry.type}</span>
                        <span className="text-[11px]" style={{ color: "var(--ek-ink-3)" }}>
                          {entry.date}
                        </span>
                      </div>
                      <h3 className="ek-chlog-title mt-3">{entry.title}</h3>
                      <p className="ek-chlog-desc">{entry.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      <FinalCTA
        title="Build with the team"
        subtitle="that ships every week."
        primary={{ label: "Start free trial", href: "/signup" }}
        secondary={{ label: "Read the blog", href: "/blog" }}
      />
    </SiteLayout>
  );
}
