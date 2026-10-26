"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Tiro_Devanagari_Sanskrit } from "next/font/google";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section, SectionHeader, PageHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { team, values } from "@/lib/data/site";
import type { CSSProperties } from "react";

const tiro = Tiro_Devanagari_Sanskrit({
  subsets: ["devanagari"],
  weight: ["400"],
  variable: "--font-devanagari",
});

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className={`${tiro.variable} relative overflow-hidden`}>
        <div className="ek-devanagari absolute top-16 left-1/2 -translate-x-1/2 select-none" aria-hidden="true">
          एकम्
        </div>
        <div className="ek-pagehead relative pt-56 sm:pt-64">
          <PageHeader
            align="center"
            eyebrow="About"
            title={<>Built by engineers who ship.</>}
            subtitle="EKAM AI is built by a team of engineers and entrepreneurs based in GIFT City, Gandhinagar, India, who've shipped products across AI, fintech, and enterprise systems. We're not building another AI wrapper. We're building the execution layer."
          />
          <Reveal delay={360}>
            <p className="mt-8 text-center text-[12px]" style={{ color: "var(--ek-ink-3)" }}>
              एकम् · ekam · Sanskrit, "one"
            </p>
          </Reveal>
        </div>
      </div>

      {/* Team */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="The team"
          title={<>Founders who ship.</>}
          desc="A small team with deep production experience across AI, fintech, and enterprise systems."
        />
        <div className="mt-14 grid gap-10 md:grid-cols-2">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 100}>
              <div style={{ borderTop: "1px solid var(--ek-line)", paddingTop: 28 }}>
                <div className="flex items-center gap-5">
                  <span className="ek-monogram" style={{ "--hue": i % 2 ? "var(--ek-a5)" : "var(--ek-a3)" } as CSSProperties}>{member.initials}</span>
                  <div>
                    <div className="text-lg font-medium" style={{ color: "var(--ek-ink)" }}>{member.name}</div>
                    <div className="text-[12px]" style={{ color: "var(--ek-ink-3)" }}>{member.role}</div>
                  </div>
                </div>
                <p className="mt-5 text-[15px] leading-relaxed" style={{ color: "var(--ek-ink-2)", maxWidth: "52ch" }}>
                  {member.bio}
                </p>
                {member.companies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.companies.map((c) => (
                      <span key={c} className="ek-suite-tag">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Values */}
      <Section>
        <SectionHeader
          eyebrow="What drives us"
          title={<>Four principles.</>}
          desc="The operating principles behind every decision we make."
        />
        <Reveal className="mt-14">
          <div className="ek-numlist">
            {values.map((v, i) => (
              <div key={v.title} className="ek-numlist-item">
                <span className="n" style={{ color: ["var(--ek-a1-ink)", "var(--ek-a3-ink)", "var(--ek-a5-ink)", "var(--ek-a6-ink)"][i] }}>{["I", "II", "III", "IV"][i]}</span>
                <span className="t">{v.title}</span>
                <span className="d">{v.desc}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* Company */}
      <Section>
        <SectionHeader eyebrow="The company" title={<>EKAM INNOVATIONS LLP.</>} />
        <Reveal className="mt-14">
          <div className="grid gap-8 lg:grid-cols-2">
            <p className="ek-bodytext" style={{ maxWidth: "48ch" }}>
              The company behind EKAM AI. Based in GIFT City, Gandhinagar,
              India. EKAM AI is the platform we wished we had.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Headquarters", value: "GIFT City, Gandhinagar, India" },
                { label: "Country", value: "India" },
                { label: "Email", value: "contact@ekamai.in" },
                { label: "Social", value: "@ekam_ai" },
              ].map((item) => (
                <div key={item.label} className="ek-info-tile">
                  <div className="k">{item.label}</div>
                  <div className="v">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Link href="/contact" className="ek-btn-ghost mt-10 inline-flex">
            Talk to us
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
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
