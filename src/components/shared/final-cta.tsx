"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { AnimatedBackground } from "@/components/shared/animated-background";

export function FinalCTA({
  title,
  subtitle,
  primary = { label: "Create account", href: "/signup" },
  secondary = { label: "Talk to us", href: "/login" },
  id = "get-started",
}: {
  title?: string;
  subtitle?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  id?: string;
}) {
  return (
    <section id={id} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-white p-8 sm:p-14 text-center shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)]">
            <AnimatedBackground variant="soft" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: "var(--color-1)" }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--color-1)" }}
                  />
                </span>
                Get started
              </div>

              <h2
                className="mt-5 font-semibold tracking-tight"
                style={{ fontSize: "clamp(32px, 2.5vw + 20px, 56px)", lineHeight: 1.1 }}
              >
                <span className="block">{title || "Create your account and start"}</span>
                <span className="block text-spectrum-animated">
                  {subtitle || "using EKAM AI today."}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
                No waitlist, no delays. Spin up a launch page, run a pre-launch
                scan, and ship — all in one workflow.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href={primary.href} className="btn-pill">
                  {primary.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={secondary.href} className="btn-pill-outline">
                  {secondary.label}
                </Link>
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                By continuing you agree to our Terms &amp; Privacy Policy.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
