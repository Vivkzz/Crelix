import type { Metadata } from "next";
import { SITE_URL, softwareAppJsonLd } from "@/lib/site";

const title = "Search Suite — Market research for your launch";
const description =
  "Free market research that feeds your launch. EKAM AI Search surfaces competitors, positioning angles, and audience language before you commit to a message.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/search" },
  keywords: [
    "market research",
    "competitor analysis",
    "positioning",
    "launch research",
    "audience research",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/search`,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareAppJsonLd({
              name: "EKAM AI Search Suite",
              applicationCategory: "BusinessApplication",
              description,
              path: "/search",
            })
          ),
        }}
      />
    </>
  );
}
