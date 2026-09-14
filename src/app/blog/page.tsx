"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calendar, Clock } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section, SectionHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { blogPosts } from "@/lib/data/site";
import { AnimatedBackground } from "@/components/shared/animated-background";

const categories = ["all", "guide", "product", "compare"];

export default function BlogPage() {
  const featured = blogPosts.find((p) => p.featured) || blogPosts[0];
  const rest = blogPosts.filter((p) => p.slug !== featured.slug);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16">
        <AnimatedBackground variant="soft" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-linear-3)" }} />
                Blog
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1
                className="mt-4 font-semibold tracking-tight"
                style={{ fontSize: "clamp(40px, 3.5vw + 28px, 64px)", lineHeight: 1.05 }}
              >
                Build notes, deep dives,
                <br />
                <span className="text-spectrum-animated">and product thinking.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 text-pretty text-muted-foreground text-lg">
                From the EKAM AI team — technical deep-dives, launch playbooks,
                and product thinking.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured */}
      <Section className="!pt-0">
        <Reveal>
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative grid overflow-hidden rounded-3xl border border-border bg-white transition-all hover:border-foreground/15 hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f2f1f1] lg:aspect-auto">
              <div className="absolute inset-0 spectrum-blob opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="rounded-2xl border border-border bg-white/80 px-6 py-4 text-center backdrop-blur"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">featured</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">{featured.category}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full bg-[#f2f1f1] px-2 py-0.5 font-mono uppercase tracking-wider">{featured.category}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{featured.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readTime}</span>
              </div>
              <h2
                className="mt-4 font-semibold tracking-tight"
                style={{ fontSize: "clamp(24px, 1.8vw + 14px, 36px)", lineHeight: 1.15 }}
              >
                {featured.title}
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground">{featured.excerpt}</p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white font-mono text-xs font-semibold"
                  style={{ background: "var(--gradient-linear-3)" }}
                >
                  {featured.author.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium">{featured.author}</div>
                  <div className="text-xs text-muted-foreground">Author</div>
                </div>
                <div className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:gap-2 transition-all">
                  Read article <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </Link>
        </Reveal>
      </Section>

      {/* Category chips */}
      <Section className="!pt-0 !pb-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              className="rounded-full border border-border bg-white/80 px-3 py-1.5 text-xs font-medium capitalize text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      {/* Post grid */}
      <Section className="!pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal key={post.slug} delay={(i % 3) * 60}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white/80 transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#f2f1f1]">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(135deg, var(--color-${(i % 4) + 1}), var(--color-${(i % 4) + 2}))`,
                    }}
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold tracking-tight group-hover:text-foreground transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <FinalCTA
        title="Build, scan, ship —"
        subtitle="all in one workflow."
        primary={{ label: "Start free trial", href: "/#get-started" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </SiteLayout>
  );
}
