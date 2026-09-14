"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCTA } from "@/components/shared/final-cta";
import { blogPosts } from "@/lib/data/site";
import { AnimatedBackground } from "@/components/shared/animated-background";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === params.slug) || blogPosts[0];
  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <SiteLayout>
      <article className="relative overflow-hidden pt-32 pb-12 sm:pt-40">
        <AnimatedBackground variant="soft" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to blog
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-[#f2f1f1] px-2 py-0.5 font-mono uppercase tracking-wider">{post.category}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <h1
              className="mt-4 font-semibold tracking-tight"
              style={{ fontSize: "clamp(28px, 2.4vw + 18px, 44px)", lineHeight: 1.15 }}
            >
              {post.title}
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-6 flex items-center justify-between border-y border-border py-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white font-mono text-xs font-semibold"
                  style={{ background: "var(--gradient-linear-3)" }}
                >
                  {post.author.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium">{post.author}</div>
                  <div className="text-xs text-muted-foreground">Author</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:text-foreground transition-colors" aria-label="Share on X">
                  <Twitter className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:text-foreground transition-colors" aria-label="Share on LinkedIn">
                  <Linkedin className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:text-foreground transition-colors" aria-label="Share">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
              {post.content.split("\n\n").map((para, i) => {
                if (para.startsWith("## ")) {
                  return (
                    <h2 key={i} className="mt-10 text-2xl font-semibold tracking-tight">
                      {para.replace(/^##\s+/, "")}
                    </h2>
                  );
                }
                if (para.startsWith("### ")) {
                  return (
                    <h3 key={i} className="mt-8 text-xl font-semibold tracking-tight">
                      {para.replace(/^###\s+/, "")}
                    </h3>
                  );
                }
                return <p key={i} className="text-muted-foreground">{para}</p>;
              })}
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full border border-border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </article>

      {related.length > 0 && (
        <Section className="!pt-0">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-xl font-semibold tracking-tight">Related articles</h2>
            </Reveal>
            <div className="mt-6 space-y-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-white/80 p-5 hover:border-foreground/15 transition-all"
                  >
                    <div>
                      <div className="text-xs text-muted-foreground">{p.date} · {p.readTime}</div>
                      <div className="mt-1 text-base font-semibold tracking-tight">{p.title}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      )}

      <FinalCTA
        title="Build with EKAM AI —"
        subtitle="from prompt to live."
        primary={{ label: "Start free trial", href: "/#get-started" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </SiteLayout>
  );
}
