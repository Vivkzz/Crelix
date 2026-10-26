import type { Metadata } from "next";
import { SITE_URL, OG_IMAGES } from "@/lib/site";

const title = "Pricing: Start free, scale when it works";
const description =
  "EKAM AI pricing: start free for 14 days with every suite included, then scale from Starter to Enterprise as your launches grow. No card required to start.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pricing" },
  keywords: ["EKAM AI pricing", "AI website builder pricing", "SaaS pricing"],
  openGraph: {
    images: OG_IMAGES,
    type: "website",
    url: `${SITE_URL}/pricing`,
    title,
    description,
  },
  twitter: { card: "summary_large_image", images: OG_IMAGES.map((i) => i.url), title, description },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
