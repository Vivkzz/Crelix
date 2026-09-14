"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  ArrowRight,
  PenTool,
  GitBranch,
  GitCompare,
  ArrowLeftRight,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { UserMenu } from "@/components/shared/user-menu";

const suites = [
  {
    name: "pentest",
    title: "Pentest Suite",
    desc: "Pre-launch security scan with actionable findings.",
    href: "/pentest",
    suite: "pentest",
    badge: null as string | null,
  },
  {
    name: "flow",
    title: "Flow",
    desc: "Pages and apps, built from a prompt.",
    href: "/flow",
    suite: "flow",
    badge: null,
  },
  {
    name: "search",
    title: "Search Suite",
    desc: "Market research that feeds your launch.",
    href: "/search",
    suite: "search",
    badge: "Free",
  },
];

const SUITE_PATHS: Record<string, string> = {
  pentest: "M20.366 10.1298H30.6829C42.0383 10.1298 51.2437 19.3351 51.2437 30.6906C51.2437 42.046 42.0383 51.2513 30.6829 51.2513C19.3274 51.2513 10.1221 42.046 10.1221 30.6906V82.0436",
  flow: "M61.3701 10.5157H40.9951C16.2951 10.5157 10.1201 31.099 10.1201 41.3907V81.9811M40.9951 50.7657H61.3701",
  search: "M30.5918 30.4995C30.5918 19.1779 39.7697 10 51.0913 10C62.4129 10 71.5908 19.1779 71.5908 30.4995C71.5908 41.8211 62.4129 50.999 51.0913 50.999L30.6721 50.999L7.07098 74.6001",
};

const resources = [
  { title: "Blog", desc: "Build notes and deep dives.", icon: PenTool, href: "/blog" },
  { title: "Changelog", desc: "What we ship, when.", icon: GitBranch, href: "/changelog" },
  { title: "Compare", desc: "EKAM AI vs other AI builders.", icon: GitCompare, href: "/blog" },
  { title: "Alternatives", desc: "Switching from another tool?", icon: ArrowLeftRight, href: "/blog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const reduce = useReducedMotion();
  const { status } = useSession();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMobileOpen(false);
      setOpenDropdown(null);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={cn("nav-wrapper", scrolled && "scrolled", mobileOpen && "menu-open")}>
      <nav className="nav-pill">
        {/* Logo */}
        <Link href="/" className="nav-logo-link">
          <span className="nav-logo-text">EKAM AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-desktop">
          {/* Suites dropdown */}
          <div
            className="nav-dropdown-trigger"
            onMouseEnter={() => setOpenDropdown("suites")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="nav-item">
              Suites
              <ChevronDown className={cn("nav-chevron", openDropdown === "suites" && "rotate-180")} />
            </button>
            {openDropdown === "suites" && (
              <div className="nav-dropdown">
                <ul className="nav-dropdown-list">
                  {suites.map((s) => {
                    const colorVar = s.suite === "pentest" ? "var(--color-1)" : s.suite === "flow" ? "var(--color-2)" : "var(--color-5)";
                    return (
                      <li key={s.name} style={{ ["--color" as string]: colorVar }}>
                        <Link
                          href={s.href}
                          className="nav-dropdown-item"
                        >
                          <div className="nav-dropdown-logo">
                            <svg viewBox="0 0 82 82">
                              <title>EKAM AI — {s.title}</title>
                              <path
                                data-logo-id={s.suite}
                                d={SUITE_PATHS[s.suite]}
                                pathLength={2}
                                fill="none"
                                stroke={colorVar}
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={2}
                                strokeDashoffset={0}
                              />
                            </svg>
                          </div>
                          <span className="nav-dropdown-content">
                            <strong>
                              {s.name}
                              {s.badge && (
                                <span className="nav-badge" style={{ background: colorVar }}>{s.badge}</span>
                              )}
                            </strong>
                            <p>{s.desc}</p>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <Link href="/pricing" className={cn("nav-item", pathname === "/pricing" && "active")}>
            Pricing
          </Link>

          {/* Resources dropdown */}
          <div
            className="nav-dropdown-trigger"
            onMouseEnter={() => setOpenDropdown("resources")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="nav-item">
              Resources
              <ChevronDown className={cn("nav-chevron", openDropdown === "resources" && "rotate-180")} />
            </button>
            {openDropdown === "resources" && (
              <div className="nav-dropdown">
                <ul className="nav-dropdown-list">
                  {resources.map((r) => (
                    <li key={r.title}>
                      <Link href={r.href} className="nav-dropdown-item">
                        <div className="nav-dropdown-icon">
                          <r.icon className="h-4 w-4" />
                        </div>
                        <span className="nav-dropdown-content">
                          <strong>{r.title}</strong>
                          <p>{r.desc}</p>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link href="/#how-it-works" className="nav-item">How it works</Link>
          <Link href="/#try-now" className="nav-item">Try now</Link>
          <Link href="/#architecture" className="nav-item">Why EKAM AI?</Link>
        </div>

        {/* Right side */}
        <div className="nav-right">
          <button
            className="nav-theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {mounted && status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="nav-cta">
                Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-item">Log in</Link>
              <Link href="/signup" className="nav-cta">
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
          {/* Mobile hamburger — clean Lucide icon */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav-mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={
              reduce
                ? { duration: 0.2, ease: "easeOut" }
                : { type: "spring", bounce: 0, duration: 0.4 }
            }
          >
          {suites.map((s) => {
            const colorVar = s.suite === "pentest" ? "var(--color-1)" : s.suite === "flow" ? "var(--color-2)" : "var(--color-5)";
            return (
              <Link key={s.name} href={s.href} className="nav-mobile-item" style={{ ["--color" as string]: colorVar }}>
                <svg viewBox="0 0 82 82" className="nav-mobile-logo">
                  <path d={SUITE_PATHS[s.suite]} pathLength={2} fill="none" stroke={colorVar} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.badge && <span className="nav-badge" style={{ background: colorVar }}>{s.badge}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </Link>
            );
          })}
          <Link href="/pricing" className="nav-mobile-link">Pricing</Link>
          <div className="nav-mobile-section">Resources</div>
          {resources.map((r) => (
            <Link key={r.title} href={r.href} className="nav-mobile-item">
              <r.icon className="h-4 w-4 text-foreground" />
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
            </Link>
          ))}
          <Link href="/#how-it-works" className="nav-mobile-link">How it works</Link>
          <Link href="/#try-now" className="nav-mobile-link">Try now</Link>
          <Link href="/#architecture" className="nav-mobile-link">Why EKAM AI?</Link>
          {mounted && status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="nav-mobile-cta">
                Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="nav-mobile-link text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-mobile-link">Log in</Link>
              <Link href="/signup" className="nav-mobile-cta">
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
