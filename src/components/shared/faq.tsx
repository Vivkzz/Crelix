"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

export function FAQAccordion({
  items,
  title = "Frequently asked questions",
  desc,
}: {
  items: { q: string; a: string }[];
  title?: string;
  desc?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-linear-3)" }} />
          FAQ
        </div>
        <h2
          className="mt-4 font-semibold tracking-tight"
          style={{ fontSize: "clamp(28px, 2.2vw + 16px, 40px)", lineHeight: 1.1 }}
        >
          {title}
        </h2>
        {desc && <p className="mt-3 text-muted-foreground">{desc}</p>}
      </Reveal>

      <div className="space-y-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={i} delay={i * 50}>
              <div
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white/80 transition-all",
                  isOpen ? "border-foreground/15 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)]" : "border-border"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
