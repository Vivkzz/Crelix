import type { Metadata } from "next";
import { SITE_URL, OG_IMAGES } from "@/lib/site";

const title = "Changelog";
const ogTitle = "Changelog · EKAM AI";
const description =
  "What's new in EKAM AI: new features, improvements, and fixes across Flow, Pentest, and Search.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/changelog" },
  keywords: ["EKAM AI changelog", "product updates", "release notes"],
  openGraph: {
    images: OG_IMAGES,
    type: "website",
    url: `${SITE_URL}/changelog`,
    title: ogTitle,
    description,
  },
  twitter: { card: "summary_large_image", images: OG_IMAGES.map((i) => i.url), title: ogTitle, description },
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
