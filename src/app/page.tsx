"use client";

import { SiteLayout } from "@/components/shared/site-layout";
import { HomeHero } from "@/components/site/home/hero";
import { ModelsStrip } from "@/components/site/home/models-strip";
import { Statement } from "@/components/site/home/statement";
import { Ensemble } from "@/components/site/home/ensemble";
import { HomeHowItWorks } from "@/components/site/home/how-it-works";
import { Suites } from "@/components/site/home/suites";
import { Security } from "@/components/site/home/security";
import { Numbers } from "@/components/site/home/numbers";
import { PricingTeaser } from "@/components/site/home/pricing-teaser";
import { FinalCTA } from "@/components/shared/final-cta";
import { FAQAccordion } from "@/components/shared/faq";
import { Section } from "@/components/shared/section";
import { generalFAQs } from "@/lib/data/site";

export default function Home() {
  return (
    <SiteLayout>
      <HomeHero />
      <ModelsStrip />
      <Statement />
      <Ensemble />
      <HomeHowItWorks />
      <Suites />
      <Security />
      <Numbers />
      <PricingTeaser />
      <Section id="faq">
        <FAQAccordion items={generalFAQs} eyebrow="Questions" />
      </Section>
      <FinalCTA
        title="Describe it today."
        subtitle="Launch it scanned tomorrow."
      />
    </SiteLayout>
  );
}
