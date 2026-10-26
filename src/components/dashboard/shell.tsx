"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Blocks,
  Bot,
  ShieldCheck,
  Search,
  Coins,
  CreditCard,
  Users,
  User as UserIcon,
  Settings,
  Lock,
  Bell,
  KeyRound,
  LifeBuoy,
  Moon,
  Sun,
  Menu,
  ShieldAlert,
  Megaphone,
  Newspaper,
  FileText,
  Inbox,
  ScrollText,
  Flag,
  LayoutTemplate,
  History,
  FileStack,
  CalendarClock,
  Share2,
  BarChart3,
  Gauge,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/shared/user-menu";

export type DashUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  plan?: string;
  credits?: number;
};

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard };

const DASH_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: Blocks },
  { label: "Scans", href: "/dashboard/scans", icon: ShieldCheck },
  { label: "Research", href: "/dashboard/research", icon: Search },
  { label: "Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Templates", href: "/dashboard/agents/templates", icon: LayoutTemplate },
  { label: "Runs", href: "/dashboard/agents/runs", icon: History },
  { label: "Artifacts", href: "/dashboard/artifacts", icon: FileStack },
  { label: "Credits", href: "/dashboard/credits", icon: Coins },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Security", href: "/dashboard/security", icon: Lock },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "API keys", href: "/dashboard/keys", icon: KeyRound },
  { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Projects", href: "/admin/projects", icon: Blocks },
  { label: "Scans", href: "/admin/scans", icon: ShieldCheck },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Plans", href: "/admin/plans", icon: Coins },
  { label: "Tickets", href: "/admin/tickets", icon: LifeBuoy },
  { label: "Inbox", href: "/admin/inbox", icon: Inbox },
  { label: "Audit log", href: "/admin/audit", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Flags", href: "/admin/flags", icon: Flag },
  { label: "Agents", href: "/admin/agents", icon: Bot },
  { label: "Agent runs", href: "/admin/agent-runs", icon: History },
  { label: "Templates", href: "/admin/agent-templates", icon: LayoutTemplate },
  { label: "Agent analytics", href: "/admin/agent-analytics", icon: BarChart3 },
  { label: "Schedules", href: "/admin/agent-schedules", icon: CalendarClock },
  { label: "Shared runs", href: "/admin/shared-runs", icon: Share2 },
  { label: "Agent keys", href: "/admin/agent-keys", icon: KeyRound },
  { label: "Artifacts", href: "/admin/artifacts", icon: FileStack },
  { label: "Limits", href: "/admin/agent-limits", icon: Gauge },
  { label: "Credits", href: "/admin/agent-credits", icon: BarChart3 },
];

function AppShell({
  nav,
  homeHref,
  badge,
  planBadge,
  children,
}: {
  nav: NavItem[];
  homeHref: string;
  badge?: string;
  planBadge?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isActive = (href: string) =>
    href === homeHref ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const navList = (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r border-border bg-card/60 backdrop-blur lg:flex">
        <Link
          href={homeHref}
          className="flex h-14 items-center gap-2 px-5 text-base font-semibold tracking-tight"
        >
          Crelix AI
          {badge && (
            <span className="ml-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">
              {badge}
            </span>
          )}
        </Link>
        <div className="flex-1 overflow-y-auto px-3 pb-4">{navList}</div>
        {planBadge && (
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            {planBadge}
          </div>
        )}
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Link
                href={homeHref}
                className="flex h-14 items-center px-5 text-base font-semibold tracking-tight"
                onClick={() => setOpen(false)}
              >
                Crelix AI
                {badge && (
                  <span className="ml-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">
                    {badge}
                  </span>
                )}
              </Link>
              <div className="px-3">{navList}</div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild variant="ghost" size="icon" aria-label="Back to site">
              <Link href="/"><FileText className="h-4 w-4" /></Link>
            </Button>
            {homeHref === "/dashboard" && (
              <Button asChild variant="ghost" size="icon" aria-label="Notifications">
                <Link href="/dashboard/notifications"><Bell className="h-4 w-4" /></Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({ user, children }: { user: DashUser; children: React.ReactNode }) {
  return (
    <AppShell
      nav={DASH_NAV}
      homeHref="/dashboard"
      planBadge={`Plan: ${user.plan || "FREE"} · ${user.credits ?? 0} credits`}
    >
      {children}
    </AppShell>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <AppShell nav={ADMIN_NAV} homeHref="/admin" badge="ADMIN">{children}</AppShell>;
}

// Re-export ShieldAlert for callers that want an admin-ish icon.
export { ShieldAlert };
