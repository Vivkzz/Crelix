"use client";

import Link from "next/link";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section, PageHeader } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { blogPosts } from "@/lib/data/site";
import { ThreadCover, categoryHue } from "@/components/site/thread-cover";
import type { CSSProperties } from "react";

export default function BlogPage() {
  const featured = blogPosts.find((p) => p.featured) || blogPosts[0];
  const rest = blogPosts.filter((p) => p.slug !== featured.slug);

  return (
    <SiteLayout>
      <div className="ek-pagehead">
        <PageHeader
          eyebrow="Newsroom"
          title={<>Build notes and deep dives.</>}
          subtitle="From the EKAM AI team: technical deep-dives, launch playbooks, and product thinking."
        />
      </div>

      {/* Featured post — Apple Newsroom split tile */}
      <Section className="!pt-0">
        <Reveal>
          <Link href={`/blog/${featured.slug}`} className="group block no-underline">
            <div
              className="grid overflow-hidden rounded-[28px] lg:grid-cols-12"
              style={{ background: "var(--ek-bg-2)" }}
            >
              <div
                className="ek-cover-wrap lg:col-span-7"
                style={{ aspectRatio: "16/10", "--c": categoryHue(featured.category) } as CSSProperties}
              >
                <ThreadCover seed={featured.slug} category={featured.category} />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-5">
                <div className="ek-cat capitalize" style={{ "--c": categoryHue(featured.category) } as CSSProperties}>{featured.category}</div>
                <div className="mt-3 text-[28px] sm:text-[32px] font-semibold leading-tight" style={{ color: "var(--ek-ink)", letterSpacing: "-0.02em" }}>
                  {featured.title}
                </div>
                <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--ek-ink-2)" }}>
                  {featured.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-2 text-[13px]" style={{ color: "var(--ek-ink-3)" }}>
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.readTime}</span>
                </div>
                <span className="ek-link mt-4 inline-flex text-[15px]">Read article</span>
              </div>
            </div>
          </Link>
        </Reveal>
      </Section>

      {/* Post grid */}
      <Section className="!pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal key={post.slug} delay={(i % 3) * 60} className="h-full">
              <Link href={`/blog/${post.slug}`} className="group block h-full no-underline">
                <div className="ek-tile h-full" style={{ padding: 0, overflow: "hidden" }}>
                  <div className="ek-cover-wrap" style={{ aspectRatio: "16/9", "--c": categoryHue(post.category) } as CSSProperties}>
                    <ThreadCover seed={post.slug} category={post.category} />
                  </div>
                  <div style={{ padding: "22px 24px 26px" }}>
                    <div className="ek-meta mb-2">
                      <span className="ek-cat capitalize" style={{ "--c": categoryHue(post.category) } as CSSProperties}>{post.category}</span>
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <div className="text-[19px] font-semibold leading-snug" style={{ color: "var(--ek-ink)", letterSpacing: "-0.01em" }}>
                      {post.title}
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--ek-ink-2)" }}>
                      {post.excerpt}
                    </p>
                    <span className="ek-link mt-3 inline-flex text-[14px]">Read</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <FinalCTA
        title="Build, scan, ship,"
        subtitle="all in one workflow."
        primary={{ label: "Start free trial", href: "/signup" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </SiteLayout>
  );
}
