import Link from "next/link";

/* A "c" with a full-stop dot. Keep in step with scripts/gen-seo-assets.mjs,
   which draws the same mark for the favicon, app icons and social card. */
export function CrelixMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M44.4 18.6A19 19 0 1 0 44.4 45.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <circle cx="51.5" cy="52.5" r="4.8" fill="var(--ek-accent)" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="ek-logo" aria-label="Crelix AI home">
      <CrelixMark size={24} />
      <span className="ek-logo-word">crelix</span>
    </Link>
  );
}
