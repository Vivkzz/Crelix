/**
 * Central SEO config + JSON-LD builders for EKAM AI.
 *
 * Security note: structured data intentionally omits street address and
 * company registration numbers. Only city/region/country are published.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://ekamai.in"
).replace(/\/$/, "");

export const SITE_NAME = "EKAM AI";
export const SITE_LEGAL_NAME = "EKAM INNOVATIONS LLP";

export const SITE_DESCRIPTION =
  "EKAM AI is an AI software platform (SaaS): describe your idea and AI agents plan, design, and build your website or app — with an authorized security scan before every launch. No coding required.";

export const SITE_TAGLINE = "Build with AI. Scan before go-live.";

/** Resolve a site-relative path to an absolute URL. */
export function url(path: string = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_LEGAL_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: url("/logo.svg"),
    description: SITE_DESCRIPTION,
    knowsAbout: [
      "Artificial intelligence",
      "AI software development",
      "Web application development",
      "Application security",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gandhinagar",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@type": "Organization", name: SITE_LEGAL_NAME, url: SITE_URL },
  };
}

export function softwareAppJsonLd(opts: {
  name: string;
  applicationCategory: string;
  description: string;
  path: string;
  price?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    applicationCategory: opts.applicationCategory,
    operatingSystem: "Web",
    description: opts.description,
    url: url(opts.path),
    offers: opts.price
      ? { "@type": "Offer", price: opts.price, priceCurrency: "USD" }
      : undefined,
    publisher: { "@type": "Organization", name: SITE_LEGAL_NAME, url: SITE_URL },
  };
}

export function blogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "EKAM AI Blog",
    url: url("/blog"),
    publisher: { "@type": "Organization", name: SITE_LEGAL_NAME, url: SITE_URL },
  };
}

export function blogPostingJsonLd(post: {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
}) {
  const iso = new Date(post.date).toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: iso,
    dateModified: iso,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_LEGAL_NAME,
      url: SITE_URL,
      logo: url("/logo.svg"),
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url(`/blog/${post.slug}`) },
    keywords: post.tags.join(", "),
    image: url("/og-image.png"),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: url(it.path),
    })),
  };
}
