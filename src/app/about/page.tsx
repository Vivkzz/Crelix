"use client";

import Link from "next/link";
import { ArrowRight, Rocket, Cpu, Shield, Layers } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { team, values } from "@/lib/data/site";
import { AnimatedBackground } from "@/components/shared/animated-background";

const valueIcons = [Rocket, Cpu, Shield, Layers];

export default function AboutPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <AnimatedBackground variant="default" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-linear-3)" }} />
              About us
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1
              className="mt-4 font-semibold tracking-tight"
              style={{ fontSize: "clamp(40px, 3.5vw + 28px, 72px)", lineHeight: 1.05 }}
            >
              <span className="block">Built by engineers</span>
              <span className="block text-spectrum-animated">who ship.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 text-pretty text-muted-foreground text-lg mx-auto max-w-2xl">
              EKAM AI is built by a team of engineers and entrepreneurs based in
              GIFT City, Gandhinagar, India, who've shipped products across AI,
              fintech, and enterprise systems. We're not building another AI
              wrapper — we're building the execution layer.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <Section>
        <SectionHeader
          eyebrow="The team"
          title="Co-founders who ship"
          desc="A small team with deep production experience across AI, fintech, and enterprise systems."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-border bg-white/80 p-6 hover:border-foreground/15 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-white font-mono text-base font-semibold"
                    style={{
                      background: "var(--gradient-linear-3)",
                      backgroundSize: "200% auto",
                    }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <div className="text-base font-semibold tracking-tight">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  {member.companies.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Values */}
      <Section>
        <SectionHeader
          eyebrow="What drives us"
          title="Four principles"
          desc="The operating principles behind every decision we make."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {values.map((v, i) => {
            const Icon = valueIcons[i] || Rocket;
            return (
              <Reveal key={v.title} delay={i * 80}>
                <div className="group flex h-full items-start gap-5 rounded-2xl border border-border bg-white/80 p-6 hover:border-foreground/15 transition-all">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-foreground group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Company info */}
      <Section>
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-border bg-white p-8 sm:p-12 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  The company
                </div>
                <h3
                  className="mt-4 font-semibold tracking-tight"
                  style={{ fontSize: "clamp(24px, 1.8vw + 14px, 32px)", lineHeight: 1.15 }}
                >
                  EKAM INNOVATIONS LLP.
                </h3>
                <p className="mt-3 text-muted-foreground">
                  The company behind EKAM AI. Based in GIFT City, Gandhinagar,
                  India. EKAM AI is the platform we wished we had.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Headquarters", value: "GIFT City, Gandhinagar, India" },
                  { label: "Country", value: "India" },
                  { label: "Email", value: "contact@ekamai.in" },
                  { label: "Social", value: "@ekam_ai" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-[#f2f1f1]/40 p-4">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="mt-1 font-mono text-sm text-foreground/90">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <FinalCTA
        title="Create your account and"
        subtitle="start using EKAM AI today."
        primary={{ label: "Create account", href: "/signup" }}
        secondary={{ label: "Contact us", href: "/contact" }}
      />
    </SiteLayout>
  );
}
