import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

const title = "Contact";
const ogTitle = "Contact EKAM AI";
const description =
  "Get in touch with the EKAM AI team: support, sales, agency partnerships, and education or non-profit discounts.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  keywords: ["contact EKAM AI", "EKAM AI support", "EKAM AI sales"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    title: ogTitle,
    description,
  },
  twitter: { card: "summary_large_image", title: ogTitle, description },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
