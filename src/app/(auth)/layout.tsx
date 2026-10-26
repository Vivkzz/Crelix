import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

// Auth pages are gated and should never be indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-background">
      <Link href="/" className="mb-8 text-lg font-semibold tracking-tight">
        Crelix AI
      </Link>
      <Suspense fallback={null}>{children}</Suspense>
      <p className="mt-10 text-xs text-muted-foreground">
        EKAM INNOVATIONS LLP · GIFT City, Gandhinagar, India
      </p>
    </div>
  );
}
