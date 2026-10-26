"use client";

import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";

export function FinalCTA({
  title,
  subtitle,
  primary = { label: "Create account", href: "/signup" },
  secondary = { label: "Talk to us", href: "/contact" },
  id = "get-started",
}: {
  title?: string;
  subtitle?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  id?: string;
}) {
  return (
    <section id={id} className="ek-finalcta">
      <div className="ek-container">
        <Reveal>
          <h2 className="ek-finalcta-title">
            <span className="block">{title || "Describe it today."}</span>
            <span className="block">{subtitle || "Launch it scanned tomorrow."}</span>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="ek-finalcta-sub">
            Free to start. Scanned before launch.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={primary.href} className="ek-btn">
              {primary.label}
            </Link>
            <Link href={secondary.href} className="ek-link" style={{ fontSize: 17 }}>
              {secondary.label}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
