"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { SuiteHero } from "@/components/site/suite-hero";
import { Section, SectionHeader, Eyebrow } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { FAQAccordion } from "@/components/shared/faq";
import { suites } from "@/lib/data/site";
import { AGENTS } from "@/components/site/home/agents";

const flowSuite = suites.find((s) => s.slug === "flow")!;

const insideFeatures = [
  {
    title: "Prompt-based pages and apps",
    desc: "Describe a launch page, dashboard, or SaaS. Flow plans the structure, generates the site, previews it, and deploys a live URL.",
  },
  {
    title: "Design that doesn't look AI-generated",
    desc: "Custom fonts, brand colors, sourced images. No template smell. Every output is structurally unique to your prompt and references.",
  },
  {
    title: "Frontend + backend, generated",
    desc: "React, API routes, database schema, auth, billing, generated and wired together. Not just a static page.",
  },
  {
    title: "Go live in one click",
    desc: "Publish landing pages and edits, and hand the live URL to Pentest when you are ready. No DevOps required.",
  },
  {
    title: "Iterate without losing work",
    desc: "Edit copy, swap sections, restyle. Every change is a versioned diff you can review, revert, or ship.",
  },
  {
    title: "Custom domains + SSL",
    desc: "Bring your own domain. SSL is provisioned automatically. Apex, www, and subdomains all supported.",
  },
];

const projectTypes = [
  { name: "Launch page", desc: "Single-page marketing site with hero, features, pricing, FAQ." },
  { name: "SaaS app", desc: "Auth, billing, dashboard, multi-tenant, generated end-to-end." },
  { name: "Dashboard", desc: "Internal tool or admin panel with tables, charts, and CRUD." },
  { name: "Portfolio", desc: "Personal site with case studies, contact, and blog." },
  { name: "API", desc: "REST or GraphQL API with schema, validation, and docs." },
  { name: "Mobile app", desc: "React Native app with shared schema and API." },
];

const flowFAQs = [
  {
    q: "How long does a Flow generation take?",
    a: "A launch page typically generates in 30–60 seconds. A full SaaS app with auth, billing, and database can take 3–8 minutes depending on complexity. You'll see real-time progress as each agent works.",
  },
  {
    q: "Can I edit the generated code?",
    a: "Yes. Every project is exportable as clean React + TypeScript. You can also iterate inside EKAM AI using natural language; describe the change, and the engineer agent applies it as a versioned diff.",
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
      <div className="ek-suite-flow">
      <SuiteHero suite={flowSuite} />

      <Section id="inside">
        <SectionHeader
          eyebrow="Inside Flow"
          title={<>One workspace, pages or full apps.</>}
          desc="Everything you need from prompt to live URL, for marketing pages and full applications."
        />
        <div className="ek-feat-grid mt-14">
          {insideFeatures.map((f, i) => (
            <Reveal key={f.title} delay={i * 60} className="ek-feat h-full">
              <span className="ek-feat-idx">{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Project types"
          title={<>What you can build.</>}
          desc="Flow handles everything from a single landing page to a full multi-tenant SaaS, same workspace, same prompt."
        />
        <div className="ek-types mt-14">
          {projectTypes.map((p, i) => (
            <Reveal key={p.name} delay={(i % 3) * 70} className="h-full">
              <div className="ek-type">
                <TypeGlyph kind={i} />
                <span className="ek-type-idx">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <Eyebrow>Prompt to live</Eyebrow>
              <h2 className="ek-h2 mt-6">From a prompt to a live URL</h2>
              <p className="ek-bodytext mt-5">
                Describe the launch page you need. Flow plans the structure,
                generates the site, previews it, and deploys a live URL, usually
                in under a minute.
              </p>
              <div className="mt-7">
                {[
                  "Describe your offer, audience, and angle",
                  "Add screenshots or Figma as references",
                  "Flow generates design, copy, code, and deploy",
                  "Iterate with natural language edits",
                  "Hand the live URL to Pentest before launch",
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
        primary={{ label: "Start free trial", href: "/signup" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
      </div>
    </SiteLayout>
  );
}

/* miniature wireframes, one per project type; strokes in the suite hue */
function TypeGlyph({ kind }: { kind: number }) {
  const box = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 } as const;
  const fill = { fill: "currentColor", opacity: 0.18 } as const;
  const solid = { fill: "currentColor" } as const;
  return (
    <svg className="ek-type-glyph" viewBox="0 0 120 72" aria-hidden="true">
      <rect x="1" y="1" width="118" height="70" rx="8" {...box} opacity={0.35} />
      {kind === 0 && (
        <>
          <rect x="12" y="10" width="22" height="4" rx="2" {...solid} />
          <rect x="12" y="22" width="56" height="8" rx="3" {...solid} />
          <rect x="12" y="34" width="40" height="4" rx="2" {...fill} />
          <rect x="12" y="44" width="20" height="8" rx="4" {...solid} />
          <rect x="76" y="20" width="32" height="34" rx="6" {...fill} />
        </>
      )}
      {kind === 1 && (
        <>
          <rect x="8" y="8" width="22" height="56" rx="4" {...fill} />
          <rect x="38" y="10" width="40" height="5" rx="2" {...solid} />
          <rect x="38" y="22" width="34" height="18" rx="4" {...fill} />
          <rect x="76" y="22" width="34" height="18" rx="4" {...fill} />
          <rect x="38" y="46" width="72" height="16" rx="4" {...box} opacity={0.6} />
        </>
      )}
      {kind === 2 && (
        <>
          <rect x="10" y="10" width="30" height="20" rx="4" {...fill} />
          <rect x="45" y="10" width="30" height="20" rx="4" {...fill} />
          <rect x="80" y="10" width="30" height="20" rx="4" {...fill} />
          <polyline points="12,58 30,46 48,52 66,38 84,44 108,30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === 3 && (
        <>
          <circle cx="24" cy="22" r="9" {...fill} />
          <rect x="38" y="16" width="40" height="5" rx="2" {...solid} />
          <rect x="38" y="25" width="26" height="3" rx="1.5" {...fill} />
          <rect x="12" y="40" width="30" height="22" rx="4" {...fill} />
          <rect x="45" y="40" width="30" height="22" rx="4" {...fill} />
          <rect x="78" y="40" width="30" height="22" rx="4" {...fill} />
        </>
      )}
      {kind === 4 && (
        <>
          <text x="12" y="24" fontFamily="ui-monospace, monospace" fontSize="10" fill="currentColor">GET /v1/notes</text>
          <rect x="12" y="32" width="96" height="30" rx="5" {...fill} />
          <rect x="20" y="40" width="50" height="3" rx="1.5" {...solid} />
          <rect x="28" y="47" width="40" height="3" rx="1.5" {...solid} opacity={0.6} />
          <rect x="20" y="54" width="30" height="3" rx="1.5" {...solid} opacity={0.4} />
        </>
      )}
      {kind === 5 && (
        <>
          <rect x="44" y="6" width="32" height="60" rx="7" {...box} />
          <rect x="49" y="14" width="22" height="14" rx="3" {...fill} />
          <rect x="49" y="32" width="22" height="3" rx="1.5" {...solid} />
          <rect x="49" y="39" width="16" height="3" rx="1.5" {...fill} />
          <rect x="49" y="52" width="22" height="7" rx="3.5" {...solid} />
        </>
      )}
    </svg>
  );
}

function PromptDemo() {
  return (
    <div className="ek-demo">
      <div className="ek-browser-bar">
        <div className="ek-browser-dots" aria-hidden="true"><span /><span /><span /></div>
        <div className="ek-browser-url">ekam.ai · flow</div>
        <span style={{ width: 40 }} />
      </div>
      <div className="ek-demo-body space-y-4">
        <div className="ek-demo-box">
          <div className="ek-cap">prompt</div>
          <p className="mt-2 text-sm" style={{ color: "var(--ek-ink-2)" }}>
            "Build a launch page for an AI note-taking app aimed at students.
            Tone: friendly but credible. References: Notion, Linear. Include
            hero, features, pricing, FAQ."
          </p>
        </div>

        <div>
          {AGENTS.map((a, i) => (
            <motion.div
              key={a.key}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="ek-demo-row"
            >
              <div className="flex items-center gap-2.5">
                <span className="ek-demo-dot" style={{ background: a.hue }} />
                <span className="text-xs font-medium" style={{ color: "var(--ek-ink)" }}>{a.name}</span>
              </div>
              <span className="text-[11px]" style={{ color: "var(--ek-ink-3)", fontFamily: "var(--ek-font-mono)" }}>{a.out}</span>
            </motion.div>
          ))}
        </div>

        <div
          className="ek-demo-box"
          style={{ borderColor: "color-mix(in srgb, var(--ek-a6) 45%, transparent)", background: "color-mix(in srgb, var(--ek-a6) 6%, var(--ek-surface))" }}
        >
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5" style={{ color: "var(--ek-a6-ink)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--ek-a6-ink)" }}>live URL ready · scanned clean</span>
          </div>
          <div className="mt-2 text-xs" style={{ color: "var(--ek-ink)" }}>
            https://notes-app.ekamai.in
          </div>
          <div className="mt-1 text-[11px]" style={{ color: "var(--ek-ink-3)" }}>
            Generated in 47 seconds · 1 credit used
          </div>
        </div>
      </div>
    </div>
  );
}
