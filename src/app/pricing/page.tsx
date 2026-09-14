"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, HelpCircle } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { FAQAccordion } from "@/components/shared/faq";
import { pricingTiers, creditPacks, pricingFAQs } from "@/lib/data/site";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "@/components/shared/animated-background";

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16">
        <AnimatedBackground variant="default" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-linear-3)" }} />
                Pricing
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1
                className="mt-4 font-semibold tracking-tight"
                style={{ fontSize: "clamp(40px, 3.5vw + 28px, 72px)", lineHeight: 1.05 }}
              >
                <span className="text-spectrum-animated">Simple pricing.</span>
                <br />
                One AI software factory.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 text-pretty text-muted-foreground text-lg">
                Free to try. Paid plans scale by credits and seats. Pentest and
                Search included on Enterprise.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-white/80 p-1">
                <button
                  onClick={() => setYearly(false)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                    !yearly ? "bg-[#13121f] text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setYearly(true)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                    yearly ? "bg-[#13121f] text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Yearly
                  <span className="ml-1.5 rounded-full bg-[#91e500] px-1.5 py-0.5 text-[10px] text-[#13121f] font-bold">
                    -20%
                  </span>
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <Section className="!pt-0">
        <div className="grid gap-5 lg:grid-cols-4">
          {pricingTiers.map((tier, i) => {
            const price = yearly && tier.price > 0 ? Math.round(tier.price * 0.8) : tier.price;
            return (
              <Reveal key={tier.name} delay={i * 80}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border p-6 transition-all",
                    tier.featured
                      ? "border-foreground/15 bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)]"
                      : "border-border bg-white/80 hover:border-foreground/15 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]"
                  )}
                >
                  {tier.featured && (
                    <span
                      className="absolute -top-3 left-6 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white"
                      style={{
                        background: "var(--gradient-linear-3)",
                        backgroundSize: "200% auto",
                        animation: "spectrum-pan 6s linear infinite",
                      }}
                    >
                      Most chosen
                    </span>
                  )}
                  <h3 className="text-base font-semibold tracking-tight">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">
                      {tier.price === 0 ? "$0" : `$${price}`}
                    </span>
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </div>
                  {yearly && tier.price > 0 && (
                    <div className="mt-1 text-[11px] text-[#91e500]">
                      Save ${tier.price * 12 - price * 12}/year
                    </div>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

                  <Link
                    href="/#get-started"
                    className={cn("mt-5 w-full", tier.featured ? "btn-pill" : "btn-pill-outline")}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <ul className="mt-6 space-y-3 border-t border-border pt-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ background: "var(--gradient-linear-3)", backgroundSize: "200% auto" }}
                        >
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        <span className="text-foreground/85">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Credit packs */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Top up"
          title="Credit packs"
          desc="One-time packs sit on top of your subscription. Useful for a busy launch week or a single Pentest scan."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {creditPacks.map((pack, i) => (
            <Reveal key={pack.credits} delay={i * 80}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-6 transition-all",
                  pack.popular
                    ? "border-foreground/15 bg-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)]"
                    : "border-border bg-white/80 hover:border-foreground/15"
                )}
              >
                {pack.popular && (
                  <span
                    className="absolute -top-3 left-6 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white"
                    style={{ background: "var(--gradient-linear-3)" }}
                  >
                    Best value
                  </span>
                )}
                <div className="text-2xl font-semibold tracking-tight">{pack.credits}</div>
                <div className="mt-1 text-sm text-muted-foreground">{pack.desc}</div>
                <div className="mt-4 text-3xl font-semibold tracking-tight">{pack.price}</div>
                <Link href="/#get-started" className="btn-pill-outline mt-5 w-full">
                  Get started
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Comparison table */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Compare"
          title="What's in each plan"
          desc="A side-by-side breakdown of features, credits, and seats across plans."
        />
        <Reveal>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-white/80">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-[#f2f1f1]/40">
                  <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Feature</th>
                  {pricingTiers.map((t) => (
                    <th key={t.name} className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "EKAM AI Flow", values: ["✓", "✓", "✓", "✓"] },
                  { label: "EKAM AI Pentest", values: ["—", "—", "Beta", "✓"] },
                  { label: "EKAM AI Search", values: ["✓", "✓", "✓", "✓"] },
                  { label: "Monthly credits", values: ["5 gen", "75", "350", "1,200"] },
                  { label: "Team seats", values: ["1", "2", "10", "Unlimited"] },
                  { label: "Custom domains", values: ["—", "1", "5", "Unlimited"] },
                  { label: "Deploy to production", values: ["—", "—", "✓", "✓"] },
                  { label: "Priority support", values: ["—", "—", "✓", "✓"] },
                  { label: "Dedicated success engineer", values: ["—", "—", "—", "✓"] },
                  { label: "Custom integrations", values: ["—", "—", "—", "✓"] },
                  { label: "SLA", values: ["—", "—", "—", "✓"] },
                ].map((row, i) => (
                  <tr key={row.label} className={cn("border-b border-border", i % 2 === 1 && "bg-[#f2f1f1]/20")}>
                    <td className="px-5 py-3 font-medium text-foreground/90">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-5 py-3 text-foreground/80">
                        {v === "✓" ? (
                          <Check className="h-4 w-4 text-[#91e500]" />
                        ) : v === "—" ? (
                          <span className="text-muted-foreground/60">—</span>
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      <Section className="!pt-0">
        <FAQAccordion items={pricingFAQs} title="Pricing FAQ" />
      </Section>

      <FinalCTA
        title="Start free. Scale"
        subtitle="when you ship."
        primary={{ label: "Start free trial", href: "/#get-started" }}
        secondary={{ label: "Talk to sales", href: "/contact" }}
      />
    </SiteLayout>
  );
}
