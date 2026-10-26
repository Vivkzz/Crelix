"use client";

import { type ReactNode } from "react";
import { Reveal } from "@/components/shared/reveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Eyebrow({
  index,
  children,
  dot,
  rule = true,
  className = "",
}: {
  index?: string;
  children: ReactNode;
  dot?: string;
  rule?: boolean;
  className?: string;
}) {
  return (
    <span className={`ek-eyebrow ${className}`}>
      {rule && <span className="ek-eyebrow-rule" aria-hidden="true" />}
      {index && <span className="ek-eyebrow-index">{index}</span>}
      {dot && (
        <span className="ek-eyebrow-dot" style={{ background: dot }} aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
}

export function PageHeader({
  eyebrow,
  eyebrowSuite,
  title,
  subtitle,
  ctas,
  align = "left",
  children,
}: {
  eyebrow?: string;
  eyebrowSuite?: string;
  title: ReactNode;
  titleGradient?: boolean;
  subtitle?: string;
  ctas?: { label: string; href: string; variant?: "primary" | "outline" }[];
  align?: "center" | "left";
  children?: ReactNode;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left"}>
      {eyebrow && (
        <Reveal>
          <Eyebrow dot={eyebrowSuite ? `var(--ek-${eyebrowSuite})` : undefined}>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h1 className="ek-h1-page mt-6">{title}</h1>
      </Reveal>
      {subtitle && (
        <Reveal delay={160}>
          <p className={`ek-lead mt-6 ${align === "center" ? "mx-auto" : ""}`}>{subtitle}</p>
        </Reveal>
      )}
      {ctas && ctas.length > 0 && (
        <Reveal delay={240}>
          <div
            className={
              "mt-9 flex flex-col items-stretch gap-3 sm:flex-row " +
              (align === "center" ? "sm:justify-center" : "")
            }
          >
            {ctas.map((c) =>
              c.variant === "outline" ? (
                <Link key={c.label} href={c.href} className="ek-btn-ghost">
                  {c.label}
                </Link>
              ) : (
                <Link key={c.label} href={c.href} className="ek-btn">
                  {c.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )
            )}
          </div>
        </Reveal>
      )}
      {children && <Reveal delay={300}>{children}</Reveal>}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  desc?: string;
  align?: "center" | "left";
}) {
  if (align === "center") {
    return (
      <Reveal className="mx-auto max-w-2xl text-center">
        {eyebrow && <Eyebrow rule={false}>{eyebrow}</Eyebrow>}
        <h2 className="ek-h2 mt-6">{title}</h2>
        {desc && <p className="ek-lead mt-5 mx-auto" style={{ fontSize: 18 }}>{desc}</p>}
      </Reveal>
    );
  }
  return (
    <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="ek-h2 mt-6">{title}</h2>
      </div>
      {desc && (
        <div className="lg:col-span-5">
          <p className="ek-bodytext lg:pb-2" style={{ fontSize: 17 }}>{desc}</p>
        </div>
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
    <section id={id} className={"ek-section " + className}>
      <div className="ek-container">{children}</div>
    </section>
  );
}
