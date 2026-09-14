"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Map,
  Target,
  DollarSign,
  Compass,
  ArrowRight,
  Check,
  FileText,
  TrendingUp,
} from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { SuiteHero } from "@/components/site/suite-hero";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { FAQAccordion } from "@/components/shared/faq";
import { suites } from "@/lib/data/site";

const searchSuite = suites.find((s) => s.slug === "search")!;

const deliverables = [
  {
    icon: Compass,
    title: "Positioning drafts",
    desc: "Three positioning drafts you can hand directly to Flow as a starting prompt. Each is grounded in real audience language.",
  },
  {
    icon: TrendingUp,
    title: "Market signals",
    desc: "Where the audience is, what they complain about, and what they pay for today. Sourced, not invented.",
  },
  {
    icon: FileText,
    title: "Page-ready angles",
    desc: "Headline + subhead + feature bullets, ready to paste into Flow. Three angles per run, ranked by strength.",
  },
];

const workflow = [
  { icon: Search, title: "Describe", desc: "Product, audience, or angle to explore." },
  { icon: Users, title: "Audience", desc: "Signals from where they already hang out." },
  { icon: Map, title: "Competitors", desc: "Map of who's shipping what, and how." },
  { icon: Target, title: "Positioning", desc: "Three drafts, grounded in real language." },
  { icon: DollarSign, title: "Pricing", desc: "What the market actually pays today." },
  { icon: ArrowRight, title: "Hand to Flow", desc: "Strongest output becomes the Flow prompt." },
];

const searchFAQs = [
  {
    q: "Is Search really free?",
    a: "Search is free for all EKAM AI users on any paid plan. Free trial users get 3 Search runs. The output is yours to keep and use however you like.",
  },
  {
    q: "What sources does Search use?",
    a: "Public forums (Reddit, HN, Indie Hackers), review sites (G2, Capterra), competitor sites, and search trends. We only use publicly available data — no scraping behind logins.",
  },
  {
    q: "How long does a Search run take?",
    a: "Most runs complete in 2–4 minutes. You'll see the agent gather sources, cluster signals, and draft positioning in real time.",
  },
  {
    q: "Can I export the research?",
    a: "Yes. Every Search run produces a markdown report with sources, signals, positioning drafts, and page-ready angles. Exportable as MD or PDF.",
  },
  {
    q: "Does Search work for any market?",
    a: "Search works best for B2B SaaS, dev tools, and consumer apps with an English-speaking audience. For niche or non-English markets, results may be thinner — we'll tell you upfront.",
  },
];

export default function SearchPage() {
  return (
    <SiteLayout>
      <SuiteHero suite={searchSuite} />

      {/* What you get */}
      <Section id="inside">
        <SectionHeader
          eyebrow="What you get"
          title="Sharper inputs for better launches"
          desc="Three deliverables that feed every step of your launch — positioning, market signals, page-ready angles."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((d, i) => (
            <Reveal key={d.title} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-border bg-white/80 p-6 hover:border-foreground/15 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-white text-[#2f44ff] group-hover:scale-105 transition-transform">
                  <d.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Workflow */}
      <Section>
        <SectionHeader
          eyebrow="Workflow"
          title="From product idea to page-ready angle"
          desc="Describe the product, audience, or angle to explore. Search runs structured market research and hands the strongest output to Flow."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflow.map((step, i) => (
            <Reveal key={step.title} delay={i * 50}>
              <div className="group relative flex items-start gap-4 rounded-xl border border-border bg-white/80 p-5 hover:border-foreground/15 transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-[#2f44ff]">
                  <step.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    <span className="text-sm font-semibold">{step.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{step.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Research demo */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-3)" }} />
                Sample output
              </div>
              <h2
                className="mt-4 font-semibold tracking-tight"
                style={{ fontSize: "clamp(28px, 2.2vw + 16px, 44px)", lineHeight: 1.1 }}
              >
                Find the right angle
              </h2>
              <p className="mt-4 text-muted-foreground">
                Turn a rough idea into three grounded positioning angles. Search
                surfaces audience pain, competitor gaps, and the language real
                users use — then drafts page-ready copy you can hand to Flow.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Audience pain, sourced from real forums",
                  "Competitor map: who ships what, and where the gap is",
                  "Three positioning drafts, ranked by strength",
                  "Page-ready headline + subhead + bullets",
                  "One click to hand the strongest angle to Flow",
                ].map((step) => (
                  <li key={step} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white" style={{ background: "var(--color-3)" }}>
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-foreground/85">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ResearchDemo />
          </Reveal>
        </div>
      </Section>

      <Section>
        <FAQAccordion items={searchFAQs} title="Search FAQ" />
      </Section>

      <FinalCTA
        title="Run research before"
        subtitle="you build a single page."
        primary={{ label: "Start free trial", href: "/#get-started" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </SiteLayout>
  );
}

function ResearchDemo() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-2 border-b border-border bg-[#f2f1f1]/60 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#f94144]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ecaa0b]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#91e500]" />
        </div>
        <div className="ml-2 font-mono text-[11px] text-muted-foreground">EKAM AI — search</div>
      </div>
      <div className="space-y-3 p-5">
        <div className="rounded-xl border border-border bg-[#f2f1f1]/40 p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">prompt</div>
          <p className="mt-1.5 text-sm text-foreground/90">
            "AI note-taking app for students. Competitors: Notion, Obsidian.
            Find a sharper angle."
          </p>
        </div>

        <div className="space-y-2">
          {[
            { name: "Audience signals", status: "127 sources", color: "var(--color-1)" },
            { name: "Competitor map", status: "8 mapped", color: "var(--color-2)" },
            { name: "Pricing research", status: "$4–12/mo range", color: "var(--color-3)" },
          ].map((row, i) => (
            <motion.div
              key={row.name}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
              className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: row.color }} />
                <span className="font-mono text-xs text-foreground/90">{row.name}</span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">{row.status}</span>
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl border border-[#2f44ff]/30 bg-[#2f44ff]/5 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-[#2f44ff]" />
            <span className="font-mono text-xs text-[#2f44ff]">strongest angle</span>
          </div>
          <div className="mt-2 text-sm font-medium text-foreground/90">
            "Notes that find themselves."
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Auto-tagging + semantic search. Targets students who already use
            Obsidian but want zero-config structure.
          </div>
        </div>
      </div>
    </div>
  );
}
