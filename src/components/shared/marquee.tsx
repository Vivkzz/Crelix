"use client";

import { cn } from "@/lib/utils";

export function Marquee({
  items,
  reverse = false,
  speed = "normal",
  className = "",
  renderItem,
}: {
  items: any[];
  reverse?: boolean;
  speed?: "slow" | "normal" | "fast";
  className?: string;
  renderItem: (item: any, i: number) => React.ReactNode;
}) {
  const speedClass =
    speed === "slow" ? "animate-marquee-slow" : speed === "fast" ? "animate-marquee" : "animate-marquee";
  const animClass = reverse ? "animate-marquee-reverse" : speedClass;

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className={cn("flex w-max gap-4", animClass)}>
        {doubled.map((item, i) => (
          <div key={i} className="shrink-0">
            {renderItem(item, i % items.length)}
          </div>
        ))}
      </div>
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#f2f1f1] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#f2f1f1] to-transparent" />
    </div>
  );
}
