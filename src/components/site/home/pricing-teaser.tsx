"use client";

import Link from "next/link";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { pricingTiers } from "@/lib/data/site";

export function PricingTeaser() {
  return (
    <Section id="pricing">
      <SectionHeader
        eyebrow="Pricing"
        title="Priced like a tool, not a platform tax."
        desc="Start free for 14 days, every suite included, no card. Then a flat monthly plan that scales with how much you ship."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 60} className="h-full">
            <div className={"ek-tile h-full" + (t.featured ? " featured" : "")} style={{ minHeight: 0, padding: "28px 26px" }}>
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold" style={{ color: "var(--ek-ink)" }}>{t.name}</span>
                {t.featured && (
                  <span className="ek-pill-pop">Most popular</span>
                )}
              </div>
              <div className="mt-3 text-[30px] font-semibold tracking-tight" style={{ color: "var(--ek-ink)", letterSpacing: "-0.02em" }}>
                {t.price === 0 ? "$0" : `$${t.price}`}
                <span className="text-[13px] font-normal" style={{ color: "var(--ek-ink-3)" }}> {t.period}</span>
              </div>
              <p className="mt-2 text-[13px]" style={{ color: "var(--ek-ink-2)" }}>{t.description}</p>
              <Link href="/pricing" className="ek-link mt-auto pt-5" style={{ fontSize: 14 }}>
                Compare plans
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
