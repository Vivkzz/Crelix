"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  PenLine,
  Code2,
  Palette,
  Rocket,
  Globe,
  RefreshCw,
  Check,
  ArrowRight,
  Terminal,
  Layout,
  Database,
  Cloud,
} from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { SuiteHero } from "@/components/site/suite-hero";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { FAQAccordion } from "@/components/shared/faq";
import { suites } from "@/lib/data/site";

const flowSuite = suites.find((s) => s.slug === "flow")!;

const insideFeatures = [
  {
    icon: PenLine,
    title: "Prompt-based pages and apps",
    desc: "Describe a launch page, dashboard, or SaaS. Flow plans the structure, generates the site, previews it, and deploys a live URL.",
  },
  {
    icon: Palette,
    title: "Design that doesn't look AI-generated",
    desc: "Custom fonts, brand colors, sourced images. No template smell. Every output is structurally unique to your prompt and references.",
  },
  {
    icon: Code2,
    title: "Frontend + backend, generated",
    desc: "React, API routes, database schema, auth, billing — generated and wired together. Not just a static page.",
  },
  {
    icon: Rocket,
    title: "Go live in one click",
    desc: "Publish landing pages and edits, and hand the live URL to Pentest when you are ready. No DevOps required.",
  },
  {
    icon: RefreshCw,
    title: "Iterate without losing work",
    desc: "Edit copy, swap sections, restyle — every change is a versioned diff you can review, revert, or ship.",
  },
  {
    icon: Globe,
    title: "Custom domains + SSL",
    desc: "Bring your own domain. SSL is provisioned automatically. Apex, www, and subdomains all supported.",
  },
];

const projectTypes = [
  { name: "Launch page", icon: Layout, desc: "Single-page marketing site with hero, features, pricing, FAQ." },
  { name: "SaaS app", icon: Database, desc: "Auth, billing, dashboard, multi-tenant — generated end-to-end." },
  { name: "Dashboard", icon: Terminal, desc: "Internal tool or admin panel with tables, charts, and CRUD." },
  { name: "Portfolio", icon: Palette, desc: "Personal site with case studies, contact, and blog." },
  { name: "API", icon: Cloud, desc: "REST or GraphQL API with schema, validation, and docs." },
  { name: "Mobile app", icon: Rocket, desc: "React Native app with shared schema and API." },
];

const flowFAQs = [
  {
    q: "How long does a Flow generation take?",
    a: "A launch page typically generates in 30–60 seconds. A full SaaS app with auth, billing, and database can take 3–8 minutes depending on complexity. You'll see real-time progress as each agent works.",
  },
  {
    q: "Can I edit the generated code?",
    a: "Yes. Every project is exportable as clean React + TypeScript. You can also iterate inside EKAM AI using natural language — describe the change, and the engineer agent applies it as a versioned diff.",
  },
  {
    q: "What stacks does Flow support?",
    a: "Next.js + TypeScript + Tailwind + Prisma by default. We can also generate Remix, Astro, or plain React + Vite. Backend stacks include Node, Bun, and edge runtimes.",
  },
  {
    q: "Do I own the generated code?",
    a: "Yes, 100%. You can export the code, deploy it yourself, or hand it to another team at any time. No lock-in.",
  },
  {
    q: "Can I bring my own design system?",
    a: "Yes. Upload your brand kit (colors, fonts, logo) and Flow applies it consistently. You can also share a Figma file as a reference.",
  },
];

export default function FlowPage() {
  return (
    <SiteLayout>
      <SuiteHero suite={flowSuite} />

      <Section id="inside">
        <SectionHeader
          eyebrow="Inside Flow"
          title="One workspace, landing pages or full apps"
          desc="Everything you need from prompt to live URL — for marketing pages and full applications."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {insideFeatures.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="group h-full rounded-2xl border border-border bg-white/80 p-6 hover:border-foreground/15 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-white text-[#12bcff] group-hover:scale-105 transition-transform">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Project types"
          title="What you can build"
          desc="Flow handles everything from a single landing page to a full multi-tenant SaaS — same workspace, same prompt."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectTypes.map((p, i) => (
            <Reveal key={p.name} delay={i * 50}>
              <div className="group flex items-start gap-4 rounded-xl border border-border bg-white/80 p-5 hover:border-foreground/15 transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-[#12bcff]">
                  <p.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-2)" }} />
                Prompt to live
              </div>
              <h2
                className="mt-4 font-semibold tracking-tight"
                style={{ fontSize: "clamp(28px, 2.2vw + 16px, 44px)", lineHeight: 1.1 }}
              >
                From a prompt to a live URL
              </h2>
              <p className="mt-4 text-muted-foreground">
                Describe the launch page you need. Flow plans the structure,
                generates the site, previews it, and deploys a live URL — usually
                in under a minute.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Describe your offer, audience, and angle",
                  "Add screenshots or Figma as references",
                  "Flow generates design, copy, code, and deploy",
                  "Iterate with natural language edits",
                  "Hand the live URL to Pentest before launch",
                ].map((step) => (
                  <li key={step} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white" style={{ background: "var(--color-2)" }}>
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-foreground/85">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <PromptDemo />
          </Reveal>
        </div>
      </Section>

      <Section>
        <FAQAccordion items={flowFAQs} title="Flow FAQ" />
      </Section>

      <FinalCTA
        title="Build with Flow."
        subtitle="Ship in an afternoon."
        primary={{ label: "Start free trial", href: "/#get-started" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </SiteLayout>
  );
}

function PromptDemo() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-2 border-b border-border bg-[#f2f1f1]/60 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#f94144]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ecaa0b]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#91e500]" />
        </div>
        <div className="ml-2 font-mono text-[11px] text-muted-foreground">EKAM AI — flow</div>
      </div>
      <div className="space-y-4 p-5">
        <div className="rounded-xl border border-border bg-[#f2f1f1]/40 p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">prompt</div>
          <p className="mt-1.5 text-sm text-foreground/90">
            "Build a launch page for an AI note-taking app aimed at students.
            Tone: friendly but credible. References: Notion, Linear. Include
            hero, features, pricing, FAQ."
          </p>
        </div>

        <div className="space-y-2">
          {[
            { name: "Planner", status: "spec ready", color: "var(--color-1)" },
            { name: "Designer", status: "layout + copy", color: "var(--color-2)" },
            { name: "Engineer", status: "frontend + API", color: "var(--color-3)" },
            { name: "Deployer", status: "live URL", color: "var(--color-4)" },
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

        <div className="rounded-xl border border-[#12bcff]/30 bg-[#12bcff]/5 p-4">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-[#12bcff]" />
            <span className="font-mono text-xs text-[#12bcff]">live URL ready</span>
          </div>
          <div className="mt-2 font-mono text-xs text-foreground/90">
            https://notes-app.ekamai.in
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Generated in 47 seconds · 1 credit used
          </div>
        </div>
      </div>
    </div>
  );
}
