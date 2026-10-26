"use client";

import { motion } from "framer-motion";
import { SiteLayout } from "@/components/shared/site-layout";
import { SuiteHero } from "@/components/site/suite-hero";
import { Section, SectionHeader, Eyebrow } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { FAQAccordion } from "@/components/shared/faq";
import { suites } from "@/lib/data/site";

const searchSuite = suites.find((s) => s.slug === "search")!;

const deliverables = [
  {
    title: "Positioning drafts",
    desc: "Three positioning drafts you can hand directly to Flow as a starting prompt. Each is grounded in real audience language.",
  },
  {
    title: "Market signals",
    desc: "Where the audience is, what they complain about, and what they pay for today. Sourced, not invented.",
  },
  {
    title: "Page-ready angles",
    desc: "Headline + subhead + feature bullets, ready to paste into Flow. Three angles per run, ranked by strength.",
  },
];

const workflow = [
  { title: "Describe", desc: "Product, audience, or angle to explore." },
  { title: "Audience", desc: "Signals from where they already hang out." },
  { title: "Competitors", desc: "Map of who's shipping what, and how." },
  { title: "Positioning", desc: "Three drafts, grounded in real language." },
  { title: "Pricing", desc: "What the market actually pays today." },
  { title: "Hand to Flow", desc: "Strongest output becomes the Flow prompt." },
];

const searchFAQs = [
  {
    q: "Is Search really free?",
    a: "Search is free for all EKAM AI users on any paid plan. Free trial users get 3 Search runs. The output is yours to keep and use however you like.",
  },
  {
    q: "What sources does Search use?",
    a: "Public forums (Reddit, HN, Indie Hackers), review sites (G2, Capterra), competitor sites, and search trends. We only use publicly available data; no scraping behind logins.",
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
    a: "Search works best for B2B SaaS, dev tools, and consumer apps with an English-speaking audience. For niche or non-English markets, results may be thinner; we'll tell you upfront.",
  },
];

export default function SearchPage() {
  return (
    <SiteLayout>
      <SuiteHero suite={searchSuite} />

      <Section id="inside">
        <SectionHeader
          eyebrow="What you get"
          title={<>Sharper inputs for better launches.</>}
          desc="Three deliverables that feed every step of your launch: positioning, market signals, page-ready angles."
        />
        <div className="ek-feat-grid mt-14">
          {deliverables.map((d, i) => (
            <Reveal key={d.title} delay={i * 80} className="ek-feat h-full">
              <span className="ek-feat-idx">{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Workflow"
          title={<>From idea to page-ready angle.</>}
          desc="Describe the product, audience, or angle to explore. Search runs structured market research and hands the strongest output to Flow."
        />
        <Reveal className="mt-14">
          <div className="ek-numlist">
            {workflow.map((step, i) => (
              <div key={step.title} className="ek-numlist-item">
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span className="t">{step.title}</span>
                <span className="d">{step.desc}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <Eyebrow dot="var(--ek-accent)">Sample output</Eyebrow>
              <h2 className="ek-h2 mt-6">Find the right angle</h2>
              <p className="ek-bodytext mt-5">
                Turn a rough idea into three grounded positioning angles. Search
                surfaces audience pain, competitor gaps, and the language real
                users use, then drafts page-ready copy you can hand to Flow.
              </p>
              <div className="mt-7">
                {[
                  "Audience pain, sourced from real forums",
                  "Competitor map: who ships what, and where the gap is",
                  "Three positioning drafts, ranked by strength",
                  "Page-ready headline + subhead + bullets",
                  "One click to hand the strongest angle to Flow",
                ].map((step, i) => (
                  <div key={step} className="ek-numlist-item" style={{ padding: "14px 0" }}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="t" style={{ fontSize: 15, fontWeight: 400, color: "var(--ek-ink-2)" }}>{step}</span>
                    <span />
                  </div>
                ))}
              </div>
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
        primary={{ label: "Start free trial", href: "/signup" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </SiteLayout>
  );
}

function ResearchDemo() {
  return (
    <div className="ek-demo ek-glass">
      <div className="ek-browser-bar">
        <div className="ek-browser-dots" aria-hidden="true"><span /><span /><span /></div>
        <div className="ek-browser-url">ekam.ai · search</div>
        <span style={{ width: 40 }} />
      </div>
      <div className="ek-demo-body space-y-4">
        <div className="ek-demo-box">
          <div className="ek-cap">prompt</div>
          <p className="mt-2 text-sm" style={{ color: "var(--ek-ink-2)" }}>
            "AI note-taking app for students. Competitors: Notion, Obsidian.
            Find a sharper angle."
          </p>
        </div>

        <div>
          {[
            { name: "Audience signals", status: "127 sources" },
            { name: "Competitor map", status: "8 mapped" },
            { name: "Pricing research", status: "$4–12/mo range" },
          ].map((row, i) => (
            <motion.div
              key={row.name}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
              className="ek-demo-row"
            >
              <div className="flex items-center gap-2.5">
                <span className="ek-table-dot" style={{ background: "var(--ek-accent)" }} />
                <span className="text-xs" style={{ color: "var(--ek-ink)" }}>{row.name}</span>
              </div>
              <span className="text-[11px]" style={{ color: "var(--ek-ink-3)" }}>{row.status}</span>
            </motion.div>
          ))}
        </div>

        <div
          className="ek-demo-box"
          style={{ borderColor: "color-mix(in srgb, var(--ek-accent) 40%, transparent)" }}
        >
          <div className="text-xs" style={{ color: "var(--ek-accent)" }}>strongest angle</div>
          <div className="mt-2 ek-serif" style={{ fontSize: 19, color: "var(--ek-ink)" }}>
            "Notes that find themselves."
          </div>
          <div className="mt-1 text-[12px]" style={{ color: "var(--ek-ink-2)" }}>
            Auto-tagging + semantic search. Targets students who already use
            Obsidian but want zero-config structure.
          </div>
        </div>
      </div>
    </div>
  );
}
