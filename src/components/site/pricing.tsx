"use client";

import { SectionHeader } from "./launch-stack";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Hobby",
    price: "$0",
    period: "/forever",
    desc: "For first launches and side projects.",
    cta: "Start free",
    features: [
      "1 Flow project",
      "Community templates",
      "ekamai.in subdomain",
      "1 Pentest scan / month",
      "Community support",
    ],
  },
  {
    name: "Founder",
    price: "$29",
    period: "/month",
    desc: "For founders shipping in public.",
    cta: "Start 14-day trial",
    featured: true,
    features: [
      "Unlimited Flow projects",
      "Custom domains + SSL",
      "10 Pentest scans / month",
      "Search Suite access",
      "Priority support",
      "Agent team customization",
    ],
  },
  {
    name: "Team",
    price: "$99",
    period: "/month",
    desc: "For small teams launching together.",
    cta: "Contact sales",
    features: [
      "Everything in Founder",
      "5 team seats included",
      "Unlimited Pentest scans",
      "Role-based access",
      "Shared project workspace",
      "SLA + audit log",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Start free. Scale when you ship."
          desc="Simple plans that grow with your launch. No usage tax on the things that matter — pages, scans, and domains."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.3, 0.045, 0.35, 1] }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 sm:p-7 transition-all",
                t.featured
                  ? "border-foreground/15 bg-surface shadow-[var(--shadow-1)]"
                  : "border-border bg-surface/80 hover:border-foreground/15 hover:shadow-[var(--shadow-2)]"
              )}
            >
              {t.featured && (
                <span
                  className="absolute -top-3 left-6 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white"
                  style={{
                    background: "var(--gradient-linear-3)",
                    backgroundSize: "200% auto",
                    animation: "spectrum-pan 6s linear infinite",
                  }}
                >
                  Most popular
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold tracking-tight">
                  {t.name}
                </h3>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  {t.price}
                </span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>

              <a
                href="#get-started"
                className={cn("mt-5 w-full", t.featured ? "btn-pill" : "btn-pill-outline")}
              >
                {t.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>

              <ul className="mt-6 space-y-3 border-t border-border pt-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                      style={{
                        background: "var(--gradient-linear-3)",
                        backgroundSize: "200% auto",
                      }}
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
