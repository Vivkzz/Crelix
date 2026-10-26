"use client";

import { BrandLogos } from "@/components/site/brand-logos";

export function ModelsStrip() {
  return (
    <div id="models" className="ek-models">
      <div className="ek-container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <span className="ek-cap">Orchestrates</span>
        <BrandLogos />
      </div>
    </div>
  );
}
