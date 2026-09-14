"use client";

import { type ReactNode } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: "var(--body)", color: "var(--text)" }}
    >
      <Navbar />
      <main className="flex-1 page-enter">{children}</main>
      <Footer />
    </div>
  );
}
