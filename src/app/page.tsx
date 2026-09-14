"use client";

import { SiteLayout } from "@/components/shared/site-layout";
import { Hero } from "@/components/site/hero";
import { Architecture } from "@/components/site/architecture";
import { HowItWorks } from "@/components/site/how-it-works";
import { Portfolio } from "@/components/site/portfolio";
import { FinalCTA } from "@/components/shared/final-cta";
import { FAQAccordion } from "@/components/shared/faq";
import { Section } from "@/components/shared/section";
import { generalFAQs } from "@/lib/data/site";

export default function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Architecture />
      <HowItWorks />
      <Portfolio />
      <Section>
        <FAQAccordion items={generalFAQs} />
      </Section>
      <FinalCTA />
    </SiteLayout>
  );
}
