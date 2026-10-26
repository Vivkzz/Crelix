"use client";

import { useState } from "react";
import { Reveal } from "@/components/shared/reveal";
import { Eyebrow } from "@/components/shared/section";
import { cn } from "@/lib/utils";

export function FAQAccordion({
  items,
  title = "Frequently asked questions",
  desc,
  eyebrow = "Questions",
}: {
  items: { q: string; a: string }[];
  title?: string;
  desc?: string;
  eyebrow?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-4xl">
      <Reveal className="mb-12">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="ek-h2 mt-6">{title}</h2>
        {desc && <p className="ek-bodytext mt-4">{desc}</p>}
      </Reveal>

      <div className="ek-faq">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={cn("ek-faq-item", isOpen && "open")}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="ek-faq-q"
                aria-expanded={isOpen}
              >
                <span className="ek-faq-idx" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item.q}</span>
                <span className="ek-faq-plus" aria-hidden="true" />
              </button>
              <div className="ek-faq-a">
                <div className="ek-faq-a-inner">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
