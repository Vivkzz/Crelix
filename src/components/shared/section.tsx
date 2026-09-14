"use client";

import { type ReactNode } from "react";
import { Reveal } from "@/components/shared/reveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function PageHeader({
  eyebrow,
  eyebrowSuite,
  title,
  titleGradient = true,
  subtitle,
  ctas,
  align = "center",
}: {
  eyebrow?: string;
  eyebrowSuite?: string;
  title: ReactNode;
  titleGradient?: boolean;
  subtitle?: string;
  ctas?: { label: string; href: string; variant?: "primary" | "outline" }[];
  align?: "center" | "left";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl text-left"
      }
    >
      {eyebrow && (
        <Reveal>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            data-suite={eyebrowSuite}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--suite-color, var(--gradient-linear-3))" }}
            />
            {eyebrow}
          </div>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h1
          className="mt-4 font-semibold tracking-tight"
          style={{ fontSize: "clamp(36px, 4vw + 16px, 72px)", lineHeight: 1.05 }}
        >
          {titleGradient ? <span className="text-spectrum-animated">{title}</span> : title}
        </h1>
      </Reveal>
      {subtitle && (
        <Reveal delay={160}>
          <p
            className={
              "mt-5 text-pretty text-muted-foreground " +
              (align === "center" ? "mx-auto max-w-2xl" : "")
            }
            style={{ fontSize: "clamp(16px, 1vw + 12px, 19px)", lineHeight: 1.5 }}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
      {ctas && ctas.length > 0 && (
        <Reveal delay={240}>
          <div
            className={
              "mt-8 flex flex-col items-stretch gap-3 sm:flex-row " +
              (align === "center" ? "sm:justify-center" : "")
            }
          >
            {ctas.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className={c.variant === "outline" ? "btn-pill-outline" : "btn-pill"}
              >
                {c.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  desc?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--gradient-linear-3)" }}
          />
          {eyebrow}
        </div>
      )}
      <h2
        className="mt-4 font-semibold tracking-tight"
        style={{ fontSize: "clamp(28px, 2.2vw + 16px, 48px)", lineHeight: 1.1 }}
      >
        {title}
      </h2>
      {desc && (
        <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
          {desc}
        </p>
      )}
    </Reveal>
  );
}

export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={"relative py-16 sm:py-24 " + className}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
