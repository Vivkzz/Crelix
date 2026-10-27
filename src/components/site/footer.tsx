
import { Logo } from "@/components/site/logo";
import Link from "next/link";

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
    <footer className="ek-footer mt-auto">
      <div className="ek-container">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-12">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Logo />
            <p className="ek-bodytext mt-5 max-w-xs" style={{ fontSize: 14.5 }}>
              The AI platform that builds sites and apps from a prompt, scanned
              before launch.
            </p>
            <p className="ek-footer-status mt-6">All systems normal</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="ek-footer-col-title">{col.title}</h4>
              <ul className="mt-4 space-y-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="ek-footer-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--ek-line)" }}>
          <p className="text-[12px]" style={{ color: "var(--ek-ink-3)" }}>
            Many agents. One launch.
          </p>
          <p className="text-[12px]" style={{ color: "var(--ek-ink-3)" }}>
            A product of CRELIX INNOVATIONS LLP · GIFT City, Gandhinagar · India
          </p>
        </div>
        <p className="mt-2 text-[12px]" style={{ color: "var(--ek-ink-3)" }}>
          © 2026 Crelix AI. All listed company names are trademarks ™ or registered
          trademarks ® of their respective holders.
        </p>
      </div>
    </footer>
  );
}
