"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronDown, ArrowRight, Moon, Sun, Menu, X, LayoutGrid, ShieldCheck, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { UserMenu } from "@/components/shared/user-menu";
import { Logo } from "@/components/site/logo";

const suites = [
  {
    name: "Flow",
    desc: "Pages and apps, built from a prompt.",
    href: "/flow",
    icon: LayoutGrid,
    tag: null as string | null,
  },
  {
    name: "Pentest",
    desc: "Pre-launch security scan with actionable findings.",
    href: "/pentest",
    icon: ShieldCheck,
    tag: null,
  },
  {
    name: "Search",
    desc: "Market research that feeds your launch.",
    href: "/search",
    icon: Search,
    tag: "FREE",
  },
];

const mobileLinks = [
  { label: "Flow", href: "/flow" },
  { label: "Pentest", href: "/pentest" },
  { label: "Search", href: "/search" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "About", href: "/about" },
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMobileOpen(false);
      setOpenDropdown(null);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <header className={cn("ek-nav", scrolled && "scrolled")}>
        <nav className="ek-nav-inner" aria-label="Primary">
          <Logo />

          <div className="ek-nav-links">
            <div
              className="ek-nav-dropdown-wrap"
              onMouseEnter={() => setOpenDropdown("suites")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="ek-nav-item"
                aria-expanded={openDropdown === "suites"}
                aria-haspopup="true"
              >
                Suites
                <ChevronDown
                  className={cn("ek-nav-chevron h-3.5 w-3.5", openDropdown === "suites" && "open")}
                  aria-hidden="true"
                />
              </button>
            </div>

            <Link href="/pricing" className={cn("ek-nav-item", pathname === "/pricing" && "active")}>
              Pricing
            </Link>
            <Link href="/blog" className={cn("ek-nav-item", pathname.startsWith("/blog") && "active")}>
              Blog
            </Link>
            <Link
              href="/changelog"
              className={cn("ek-nav-item", pathname === "/changelog" && "active")}
            >
              Changelog
            </Link>
            <Link href="/about" className={cn("ek-nav-item", pathname === "/about" && "active")}>
              About
            </Link>
          </div>

          <div className="ek-nav-right">
            <button
              className="ek-nav-iconbtn"
              onClick={toggleTheme}
              aria-label={mounted && theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            {mounted && status === "authenticated" ? (
              <>
                <UserMenu />
                <Link href="/dashboard" className="ek-btn-ghost">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="ek-nav-item ek-nav-login ek-nav-login-text">
                  Log in
                </Link>
                <Link href="/signup" className="ek-btn">
                  Start free
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </>
            )}
            <button
              className="ek-nav-iconbtn ek-nav-hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {openDropdown === "suites" && (
          <>
            <motion.div
              className="ek-nav-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              onMouseEnter={() => setOpenDropdown(null)}
            />
            <motion.div
              className="ek-flyout"
              initial={{ opacity: 0, y: reduce ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={{ duration: 0.32, ease: [0.28, 0.11, 0.32, 1] }}
              onMouseEnter={() => setOpenDropdown("suites")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <div className="ek-flyout-inner">
                {suites.map((s) => (
                  <Link key={s.name} href={s.href} className="ek-flyout-item">
                    <span className="ek-flyout-name">
                      <s.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      {s.name}
                      {s.tag && <span className="ek-flyout-tag">{s.tag}</span>}
                    </span>
                    <span className="ek-flyout-desc">{s.desc}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="ek-mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {mobileLinks.map((l, i) => (
              <motion.div
                key={l.href}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.05 + i * 0.045, duration: 0.35 }}
              >
                <Link href={l.href} className="ek-mobile-link">
                  {l.label}
                  <span className="ek-mobile-idx">{String(i + 1).padStart(2, "0")}</span>
                </Link>
              </motion.div>
            ))}
            <div className="ek-mobile-menu-footer">
              {mounted && status === "authenticated" ? (
                <>
                  <Link href="/dashboard" className="ek-btn">
                    Dashboard
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="ek-btn-ghost"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signup" className="ek-btn">
                    Start free
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href="/login" className="ek-btn-ghost">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
