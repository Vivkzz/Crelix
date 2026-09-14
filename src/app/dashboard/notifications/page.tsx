"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  Trash2,
  CreditCard,
  ShieldCheck,
  Users,
  Info,
  Megaphone,
} from "lucide-react";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  Spinner,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const ICONS: Record<string, any> = {
  billing: CreditCard,
  security: ShieldCheck,
  team: Users,
  system: Info,
  announcement: Megaphone,
};

function timeAgo(d: string | number | Date) {
  const date = new Date(d);
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api("/api/dashboard/notifications"),
  });

  const readAll = useMutation({
    mutationFn: () => api("/api/dashboard/notifications/read-all", { method: "POST" }),
    onSuccess: () => {
      toast.success("All marked as read");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to mark read"),
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      api(`/api/dashboard/notifications/${id}`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e: any) => toast.error(e.message || "Failed to mark read"),
  });

  const del = useMutation({
    mutationFn: (id: string) =>
      api(`/api/dashboard/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  const notifications: any[] = data?.notifications ?? [];
  const unread: number = data?.unread ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader
        title="Notifications"
        description="Updates from your EKAM AI workspace."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => readAll.mutate()}
            disabled={!unread || readAll.isPending}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading notifications…
        </div>
      ) : error ? (
        <EmptyState
          icon={Bell}
          title="Couldn't load notifications"
          description={(error as Error).message}
        />
      ) : notifications.length ? (
        <SectionCard>
          <div className="mb-4 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : "All caught up."}
          </div>
          <div className="divide-y divide-border">
            {notifications.map((n: any) => {
              const Icon = ICONS[n.type] || Bell;
              const isUnread = !n.read;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 py-3 ${isUnread ? "" : "opacity-70"}`}
                >
                  <button
                    type="button"
                    className="flex flex-1 items-start gap-3 text-left disabled:cursor-default"
                    onClick={() => isUnread && markRead.mutate(n.id)}
                    disabled={!isUnread}
                    title={isUnread ? "Mark as read" : undefined}
                  >
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={
                        isUnread
                          ? {
                              background: "color-mix(in srgb, var(--color-3) 14%, transparent)",
                              color: "var(--color-3)",
                            }
                          : {
                              background: "var(--secondary)",
                              color: "var(--muted-foreground)",
                            }
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        {isUnread && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: "var(--color-1)" }}
                          />
                        )}
                      </span>
                      {n.body && (
                        <span className="block text-sm text-muted-foreground">{n.body}</span>
                      )}
                      <span className="block text-xs text-muted-foreground">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete notification"
                    disabled={del.isPending}
                    onClick={() => del.mutate(n.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      )}
    </div>
  );
}
