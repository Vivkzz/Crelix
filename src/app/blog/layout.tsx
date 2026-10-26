import type { Metadata } from "next";
import { SITE_URL, blogJsonLd, OG_IMAGES } from "@/lib/site";

const title = "Blog";
const ogTitle = "Blog · EKAM AI";
const description =
  "Guides and stories on launching with AI: building pages and apps with Flow, pre-launch security with Pentest, and market research with Search.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  keywords: ["EKAM AI blog", "AI launch guide", "no-code", "pre-launch security"],
  openGraph: {
    images: OG_IMAGES,
    type: "website",
    url: `${SITE_URL}/blog`,
    title: ogTitle,
    description,
  },
  twitter: { card: "summary_large_image", images: OG_IMAGES.map((i) => i.url), title: ogTitle, description },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd()) }}
      />
    </>
  );
}
