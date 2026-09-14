"use client";

import { cn } from "@/lib/utils";

export function AnimatedBackground({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "soft" | "minimal" | "none";
  className?: string;
}) {
  if (variant === "none") return null;
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {variant !== "minimal" && (
        <>
          <div
            className={cn(
              "absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full animate-pulse-glow",
              variant === "soft" ? "spectrum-blob-soft" : "spectrum-blob opacity-20"
            )}
          />
          <div className="absolute right-[15%] top-[20%] h-[180px] w-[180px] rounded-full bg-[#91e500]/10 blur-[100px] animate-float-slow" />
          <div className="absolute left-[10%] top-[40%] h-[160px] w-[160px] rounded-full bg-[#8200df]/10 blur-[100px] animate-float" />
        </>
      )}
      {variant === "minimal" && (
        <div className="absolute left-1/2 top-0 h-[260px] w-[520px] -translate-x-1/2 rounded-full spectrum-blob opacity-15 blur-[90px]" />
      )}
    </div>
  );
}
