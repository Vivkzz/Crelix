import type { Metadata } from "next";
import { blogPosts } from "@/lib/data/site";
import { SITE_URL, blogPostingJsonLd, OG_IMAGES } from "@/lib/site";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug) ?? blogPosts[0];
  return {
    title: { absolute: `${post.title} · EKAM AI` },
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags,
    openGraph: {
      images: OG_IMAGES,
      type: "article",
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      images: OG_IMAGES.map((i) => i.url),
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug) ?? blogPosts[0];
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd(post)) }}
      />
    </>
  );
}
