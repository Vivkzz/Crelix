import type { Metadata } from "next";
import { SITE_URL, softwareAppJsonLd } from "@/lib/site";

const title = "Flow: Pages and apps, built from a prompt";
const description =
  "EKAM AI Flow is an AI builder: describe the page or app you want and AI agents plan, design, and build it, ready to publish in minutes. Design, copy, structure, frontend, and backend included.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/flow" },
  keywords: [
    "AI website builder",
    "AI app builder",
    "AI builder",
    "AI software platform",
    "launch page builder",
    "prompt to website",
    "no-code app builder",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/flow`,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function FlowLayout({
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
              name: "EKAM AI Flow",
              applicationCategory: "DeveloperApplication",
              description,
              path: "/flow",
              price: "29",
            })
          ),
        }}
      />
    </>
  );
}
