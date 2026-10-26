"use client";

/**
 * Brand logos (OpenAI, Anthropic, Google) — uses the same sprites.svg
 * approach as kalit.ai.
 */

export function BrandLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-10 gap-y-4 ${className}`}>
      <svg className="brand-logo" viewBox="0 0 89 23" aria-label="OpenAI" style={{ height: 19 }}>
        <use href="/img/sprites.svg#open-ai" />
      </svg>
      <svg className="brand-logo" viewBox="0 0 143 16" aria-label="Anthropic" style={{ height: 13 }}>
        <use href="/img/sprites.svg#anthropic" />
      </svg>
      <svg className="brand-logo" viewBox="0 0 88 30" aria-label="Google" style={{ height: 21 }}>
        <use href="/img/sprites.svg#google" />
      </svg>
    </div>
  );
}
