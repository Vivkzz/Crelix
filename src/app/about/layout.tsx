import type { Metadata } from "next";
import { SITE_URL, OG_IMAGES } from "@/lib/site";

const title = "About";
const ogTitle = "About EKAM AI";
const description =
  "EKAM AI is an AI software company, operated by EKAM INNOVATIONS LLP in GIFT City, Gandhinagar, India. AI agents build websites and apps from a prompt, with security scanning built in.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  keywords: ["about EKAM AI", "EKAM INNOVATIONS", "AI startup India"],
  openGraph: {
    images: OG_IMAGES,
    type: "website",
    url: `${SITE_URL}/about`,
    title: ogTitle,
    description,
  },
  twitter: { card: "summary_large_image", images: OG_IMAGES.map((i) => i.url), title: ogTitle, description },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
