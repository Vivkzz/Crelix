"use client";

import { useRef } from "react";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { Threads } from "@/components/site/home/threads";

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
  const btnRef = useRef<HTMLDivElement>(null);
  return (
    <section id={id} className="ek-finalcta">
      {/* every thread ends in the button: the launch is one click away */}
      <div className="ek-finalcta-art">
        <Threads focusRef={btnRef} focusOffset={25} spread={0.24} tone="dark" />
      </div>
      <div className="ek-container">
        <Reveal>
          <h2 className="ek-finalcta-title">
            <span className="block">{title || "Describe it today."}</span>
            <span className="block ek-finalcta-title-2">{subtitle || "Launch it scanned tomorrow."}</span>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="ek-finalcta-sub">
            Free to start. Scanned before launch.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div className="ek-finalcta-ctas">
            <div ref={btnRef}>
              <Link href={primary.href} className="ek-btn ek-finalcta-btn">
                {primary.label}
              </Link>
            </div>
            <Link href={secondary.href} className="ek-link" style={{ fontSize: 17 }}>
              {secondary.label}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
