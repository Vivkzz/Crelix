"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { blogPosts } from "@/lib/data/site";
import { ThreadCover, categoryHue } from "@/components/site/thread-cover";
import type { CSSProperties } from "react";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === params.slug) || blogPosts[0];
  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <SiteLayout>
      <article className="ek-pagehead">
        <div className="ek-container" style={{ maxWidth: 760 }}>
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-[12px] no-underline"
              style={{ color: "var(--ek-ink-3)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to blog
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <div className="ek-meta mt-8">
              <span className="ek-cat capitalize" style={{ "--c": categoryHue(post.category) } as CSSProperties}>{post.category}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <h1
              className="ek-serif mt-6"
              style={{ fontSize: "clamp(34px, 2.8vw + 18px, 52px)", lineHeight: 1.08, color: "var(--ek-ink)" }}
            >
              {post.title}
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--ek-ink-2)" }}>{post.excerpt}</p>
          </Reveal>

          <Reveal delay={320}>
            <div
              className="mt-8 flex items-center justify-between"
              style={{ borderTop: "1px solid var(--ek-line)", borderBottom: "1px solid var(--ek-line)", padding: "16px 0" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full ek-serif text-sm"
                  style={{ border: "1px solid var(--ek-line-strong)", color: "var(--ek-ink)" }}
                >
                  {post.author.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--ek-ink)" }}>{post.author}</div>
                  <div className="text-[11px]" style={{ color: "var(--ek-ink-3)" }}>Author</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { icon: Twitter, label: "Share on X" },
                  { icon: Linkedin, label: "Share on LinkedIn" },
                  { icon: Share2, label: "Share" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                    style={{ border: "1px solid var(--ek-line)", color: "var(--ek-ink-3)" }}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={360}>
            <div className="ek-cover-wrap ek-cover-post mt-10" style={{ "--c": categoryHue(post.category) } as CSSProperties}>
              <ThreadCover seed={post.slug} category={post.category} />
            </div>
          </Reveal>

          <Reveal delay={420}>
            <div className="ek-prose mt-10">
              {post.content.split("\n\n").map((para, i) => {
                if (para.startsWith("## ")) {
                  return <h2 key={i}>{para.replace(/^##\s+/, "")}</h2>;
                }
                if (para.startsWith("### ")) {
                  return <h3 key={i}>{para.replace(/^###\s+/, "")}</h3>;
                }
                return <p key={i}>{para}</p>;
              })}
            </div>
          </Reveal>

          <Reveal>
            <div
              className="mt-10 flex flex-wrap items-center gap-2"
              style={{ borderTop: "1px solid var(--ek-line)", paddingTop: 24 }}
            >
              {post.tags.map((t) => (
                <span key={t} className="ek-suite-tag">#{t}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </article>

      {related.length > 0 && (
        <Section className="!pt-0">
          <div className="ek-container" style={{ maxWidth: 760 }}>
            <Reveal>
              <h2 className="ek-serif text-3xl" style={{ color: "var(--ek-ink)" }}>Related articles</h2>
            </Reveal>
            <div className="mt-8" style={{ borderTop: "1px solid var(--ek-line)" }}>
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="ek-post-row" style={{ gridTemplateColumns: "1fr auto" }}>
                  <span>
                    <span className="ek-post-tag">{p.date} · {p.readTime}</span>
                    <span className="t mt-1 block" style={{ fontSize: 22 }}>{p.title}</span>
                  </span>
                  <ArrowRight className="arr h-5 w-5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}

      <FinalCTA
        title="Build with Crelix AI,"
        subtitle="from prompt to live."
        primary={{ label: "Start free trial", href: "/signup" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </SiteLayout>
  );
}
