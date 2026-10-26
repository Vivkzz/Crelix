import type { Metadata } from "next";
import { SITE_URL, OG_IMAGES } from "@/lib/site";

const title = "Contact";
const ogTitle = "Contact Crelix AI";
const description =
  "Get in touch with the Crelix AI team: support, sales, agency partnerships, and education or non-profit discounts.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  keywords: ["contact Crelix AI", "Crelix AI support", "Crelix AI sales"],
  openGraph: {
    images: OG_IMAGES,
    type: "website",
    url: `${SITE_URL}/contact`,
    title: ogTitle,
    description,
  },
  twitter: { card: "summary_large_image", images: OG_IMAGES.map((i) => i.url), title: ogTitle, description },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
