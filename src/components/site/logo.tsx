import Link from "next/link";

export function EkamMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M13 32H51A19 19 0 1 0 45.4 45.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="52.5" cy="52.5" r="4.8" fill="var(--ek-accent)" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="ek-logo" aria-label="EKAM AI home">
      <EkamMark size={24} />
      <span className="ek-logo-word">ekam</span>
    </Link>
  );
}
