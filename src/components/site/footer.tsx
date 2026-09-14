"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const columns = [
  {
    title: "Suites",
    links: [
      { label: "Flow", href: "/flow" },
      { label: "Pentest", href: "/pentest" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Pricing",
    links: [
      { label: "Plans", href: "/pricing" },
      { label: "For teams", href: "/pricing" },
      { label: "For startups", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
      { label: "Compare", href: "/blog" },
      { label: "Alternatives", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Terms and Conditions", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Security", href: "#" },
      { label: "Responsible use", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-lg font-semibold tracking-tight">EKAM AI</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              EKAM AI — the AI platform that builds sites and apps from a prompt, scanned before launch.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] text-muted-foreground">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full"
                    style={{ background: "var(--color-1)", opacity: 0.6 }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: "var(--color-1)", boxShadow: "0 0 6px var(--color-1)" }}
                  />
                </span>
                All systems operational
              </span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="nav-link inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">EKAM AI © 2026.</span> All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">EKAM INNOVATIONS LLP.</span>
            <span className="text-border">·</span>
            <span>GIFT City, Gandhinagar</span>
            <span className="text-border">·</span>
            <span>India</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground/80">
          All listed company names are trademarks ™ or registered trademarks ® of their respective holders.
        </div>
      </div>
    </footer>
  );
}
