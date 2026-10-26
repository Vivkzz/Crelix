"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section, SectionHeader, PageHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { FAQAccordion } from "@/components/shared/faq";
import { pricingTiers, creditPacks, pricingFAQs } from "@/lib/data/site";
import { cn } from "@/lib/utils";

const COMPARE_ROWS = [
  { label: "EKAM AI Flow", values: ["✓", "✓", "✓", "✓"] },
  { label: "EKAM AI Pentest", values: ["✗", "✗", "Beta", "✓"] },
  { label: "EKAM AI Search", values: ["✓", "✓", "✓", "✓"] },
  { label: "Monthly credits", values: ["5 gen", "75", "350", "1,200"] },
  { label: "Team seats", values: ["1", "2", "10", "Unlimited"] },
  { label: "Custom domains", values: ["✗", "1", "5", "Unlimited"] },
  { label: "Deploy to production", values: ["✗", "✗", "✓", "✓"] },
  { label: "Priority support", values: ["✗", "✗", "✓", "✓"] },
  { label: "Dedicated success engineer", values: ["✗", "✗", "✗", "✓"] },
  { label: "Custom integrations", values: ["✗", "✗", "✗", "✓"] },
  { label: "SLA", values: ["✗", "✗", "✗", "✓"] },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <SiteLayout>
      <div className="ek-pagehead">
        <PageHeader
        eyebrow="Pricing"
        align="center"
        title={<>Simple pricing. One factory.</>}
        subtitle="Free to try. Paid plans scale by credits and seats. Pentest and Search included on Enterprise."
      >
        <div
          className="mt-10 inline-flex items-center rounded-full p-1"
          style={{ background: "var(--ek-bg-2)", border: "1px solid var(--ek-line)" }}
        >
          {(["Monthly", "Yearly"] as const).map((label) => {
            const active = (label === "Yearly") === yearly;
            return (
              <button
                key={label}
                onClick={() => setYearly(label === "Yearly")}
                aria-pressed={active}
                className={cn(
                  "relative rounded-full px-5 py-1.5 text-[14px] font-medium transition-colors",
                  active ? "text-[var(--ek-ink)]" : "text-[var(--ek-ink-3)] hover:text-[var(--ek-ink)]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "var(--ek-surface)", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">
                  {label}
                  {label === "Yearly" && (
                    <span className="ml-1.5" style={{ color: active ? "var(--ek-a6-ink)" : "var(--ek-ink-3)" }}>
                      −20%
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        </PageHeader>
      </div>

      {/* tiers */}
      <Section className="!pt-0">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pricingTiers.map((tier, i) => {
            const price = yearly && tier.price > 0 ? Math.round(tier.price * 0.8) : tier.price;
            return (
              <Reveal key={tier.name} delay={i * 80} className="h-full">
                <div className={cn("ek-tier", tier.featured && "featured")}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-[17px] font-medium" style={{ color: "var(--ek-ink)" }}>{tier.name}</h3>
                    {tier.featured && <span className="ek-pill-pop">Most popular</span>}
                  </div>
                  <div className="ek-tier-price mt-5">
                    <span className="ek-tier-amount">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={price}
                          initial={{ y: "60%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-60%", opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          style={{ display: "inline-block" }}
                        >
                          {tier.price === 0 ? "$0" : `$${price}`}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <small> {tier.period}</small>
                  </div>
                  <div className="ek-tier-save">
                    {yearly && tier.price > 0 ? `Save $${(tier.price - price) * 12}/yr` : "\u00a0"}
                  </div>
                  <p className="mt-3 text-sm" style={{ color: "var(--ek-ink-2)" }}>{tier.description}</p>
                  <Link
                    href="/signup"
                    className={cn("mt-5 w-full text-center", tier.featured ? "ek-btn" : "ek-btn-ghost")}
                    style={{ justifyContent: "center" }}
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <ul className="ek-tier-feats">
                    {tier.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* credit packs */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Top up"
          title={<>Credit packs.</>}
          desc="One-time packs sit on top of your subscription. Useful for a busy launch week or a single Pentest scan."
        />
        <Reveal className="mt-14">
          <div style={{ borderTop: "1px solid var(--ek-line)" }}>
            {creditPacks.map((pack) => (
              <div key={pack.credits} className="ek-pack">
                <span className="credits">
                  {pack.credits}
                  {pack.popular && <span className="ek-tag improved">Best value</span>}
                </span>
                <span className="desc">{pack.desc}</span>
                <span className="price">{pack.price}</span>
                <Link href="/signup" className="go">Get started →</Link>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* compare */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Compare"
          title={<>What's in each plan.</>}
          desc="A side-by-side breakdown of features, credits, and seats across plans."
        />
        <Reveal className="mt-14">
          <div className="overflow-x-auto" style={{ border: "1px solid var(--ek-line)", borderRadius: "var(--ek-r-lg)" }}>
            <table className="ek-compare">
              <thead>
                <tr>
                  <th>Feature</th>
                  {pricingTiers.map((t) => (
                    <th key={t.name} className={t.featured ? "featured" : undefined}>{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className={pricingTiers[j]?.featured ? "featured" : undefined}>
                        {v === "✓" ? (
                          <span className="yes">✓</span>
                        ) : v === "✗" ? (
                          <span className="no">✗</span>
                        ) : (
                          <span style={{ fontSize: 12 }}>{v}</span>
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
        primary={{ label: "Start free trial", href: "/signup" }}
        secondary={{ label: "Talk to sales", href: "/contact" }}
      />
    </SiteLayout>
  );
}
