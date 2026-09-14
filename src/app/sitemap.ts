import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/data/site";
import { SITE_URL } from "@/lib/site";

const STATIC: {
  path: string;
  priority: number;
  freq: "daily" | "weekly" | "monthly";
}[] = [
  { path: "/", priority: 1.0, freq: "weekly" },
  { path: "/flow", priority: 0.9, freq: "weekly" },
  { path: "/pentest", priority: 0.9, freq: "weekly" },
  { path: "/search", priority: 0.9, freq: "weekly" },
  { path: "/pricing", priority: 0.9, freq: "weekly" },
  { path: "/blog", priority: 0.8, freq: "weekly" },
  { path: "/about", priority: 0.7, freq: "monthly" },
  { path: "/contact", priority: 0.7, freq: "monthly" },
  { path: "/changelog", priority: 0.6, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
