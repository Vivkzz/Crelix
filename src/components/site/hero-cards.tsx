"use client";

import { ShieldCheck, Sparkles, Search, PenLine } from "lucide-react";

/**
 * Hero floating cards — kalit's signature parallax cards
 * that appear around the hero title on wide screens.
 */

export function HeroCards() {
  return (
    <div className="hero-cards pointer-events-none absolute inset-0 hidden xl:block" aria-hidden="true">
      {/* Card 1 — top left */}
      <div
        className="hero-card"
        data-suite="pentest"
        style={{
          top: "8%",
          left: "-2%",
          animation: "hero-card-float-1 5s ease-in-out infinite",
        }}
      >
        <div className="hero-card-icon">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="hero-card-name">Pre-launch scan</div>
          <div className="hero-card-desc">3 high findings · fixed</div>
        </div>
        <span className="hero-card-model">claude</span>
      </div>

      {/* Card 2 — top right */}
      <div
        className="hero-card"
        data-suite="flow"
        style={{
          top: "12%",
          right: "-2%",
          animation: "hero-card-float-2 5.5s ease-in-out infinite",
        }}
      >
        <div className="hero-card-icon">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="hero-card-name">Prompt → live URL</div>
          <div className="hero-card-desc">47 seconds · 1 credit</div>
        </div>
        <span className="hero-card-model">gpt-4</span>
      </div>

      {/* Card 3 — bottom left */}
      <div
        className="hero-card"
        data-suite="search"
        style={{
          bottom: "10%",
          left: "4%",
          animation: "hero-card-float-3 6s ease-in-out infinite",
        }}
      >
        <div className="hero-card-icon">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <div className="hero-card-name">127 audience signals</div>
          <div className="hero-card-desc">3 positioning drafts ready</div>
        </div>
        <span className="hero-card-model">gemini</span>
      </div>

      {/* Card 4 — bottom right */}
      <div
        className="hero-card"
        data-suite="marketing"
        style={{
          bottom: "8%",
          right: "4%",
          ["--suite-color" as string]: "var(--color-3)",
          animation: "hero-card-float-4 6.5s ease-in-out infinite",
        }}
      >
        <div className="hero-card-icon">
          <PenLine className="h-5 w-5" />
        </div>
        <div>
          <div className="hero-card-name">Copy variant B</div>
          <div className="hero-card-desc">+18% conversion vs A</div>
        </div>
        <span className="hero-card-model">claude</span>
      </div>
    </div>
  );
}
