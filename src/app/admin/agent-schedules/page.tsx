"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { Switch } from "@/components/ui/switch";
import { formatDistanceToNow } from "date-fns";
import { CalendarClock } from "lucide-react";

type Schedule = {
  id: string;
  agentId: string;
  userId: string;
  intervalMinutes: number;
  prompt: string;
  active: boolean;
  lastRunAt?: string | null;
  createdAt: string;
  agentName: string | null;
  userEmail: string | null;
};

export default function AdminAgentSchedulesPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-agent-schedules"],
    queryFn: () => api<{ schedules: Schedule[] }>(`/api/admin/agent-schedules`),
  });

  const patch = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api(`/api/admin/agent-schedules`, {
        method: "PATCH",
        body: JSON.stringify({ id, active }),
      }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-agent-schedules"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const schedules = data?.schedules ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Scheduled runs" description="All recurring agent schedules across the platform." />

      <SectionCard title="Schedules" description="Toggle active state to pause or resume a schedule.">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <EmptyState icon={CalendarClock} title="Couldn't load schedules" />}
        {!isLoading && !isError && (
          schedules.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No schedules" description="Users have not created any scheduled runs yet." />
          ) : (
            <div className="divide-y divide-border">
              {schedules.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">{s.agentName || "Untitled agent"}</span>
                      <BadgePill color="var(--color-2)">every {s.intervalMinutes} min</BadgePill>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{s.prompt}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{s.userEmail || "—"}</span>
                      <span>·</span>
                      <span>
                        Last run{" "}
                        {s.lastRunAt
                          ? formatDistanceToNow(new Date(s.lastRunAt), { addSuffix: true })
                          : "Never"}
                      </span>
                      <span>·</span>
                      <span>Created {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Switch
                    checked={!!s.active}
                    onCheckedChange={(v) => patch.mutate({ id: s.id, active: v })}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </SectionCard>
    </div>
  );
}
