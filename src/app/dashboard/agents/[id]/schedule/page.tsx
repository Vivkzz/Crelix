"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

type Schedule = {
  id: string;
  agentId: string;
  userId: string;
  intervalMinutes: number;
  prompt: string;
  active: boolean;
  lastRunAt?: string | null;
  createdAt: string;
};

const INTERVAL_OPTIONS = [
  { value: "15", label: "Every 15 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every hour" },
  { value: "120", label: "Every 2 hours" },
  { value: "240", label: "Every 4 hours" },
  { value: "1440", label: "Every day" },
];

export default function AgentSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [interval, setInterval] = useState("60");
  const [prompt, setPrompt] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-schedules", id],
    queryFn: () => api<{ schedules: Schedule[] }>(`/api/dashboard/agents/${id}/schedule`),
    enabled: !!id,
  });
  const schedules = data?.schedules ?? [];

  const create = useMutation({
    mutationFn: (b: { intervalMinutes: number; prompt: string }) =>
      api<{ schedule: Schedule }>(`/api/dashboard/agents/${id}/schedule`, {
        method: "POST",
        body: JSON.stringify(b),
      }),
    onSuccess: () => {
      toast.success("Schedule created");
      setPrompt("");
      qc.invalidateQueries({ queryKey: ["agent-schedules", id] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to create schedule"),
  });

  const remove = useMutation({
    mutationFn: (scheduleId: string) =>
      api(`/api/dashboard/agents/${id}/schedule?scheduleId=${scheduleId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Schedule deleted");
      qc.invalidateQueries({ queryKey: ["agent-schedules", id] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to delete schedule"),
  });

  function submit() {
    const text = prompt.trim();
    if (!text) {
      toast.error("Prompt is required");
      return;
    }
    create.mutate({ intervalMinutes: Number(interval), prompt: text });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Button asChild variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
        <Link href={`/dashboard/agents/${id}`}>
          <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
          Back to agent
        </Link>
      </Button>

      <PageHeader title="Schedule" description="Run this agent automatically on a recurring interval." />

      <SectionCard title="New schedule" description="Pick an interval and a prompt to run on each tick.">
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Interval</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sched-prompt">Prompt</Label>
            <Textarea
              id="sched-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should this agent do on each scheduled run?"
              rows={4}
            />
          </div>
          <div>
            <Button disabled={create.isPending || !prompt.trim()} onClick={submit}>
              {create.isPending ? <Spinner className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
              Create schedule
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Schedules" description="Recurring runs for this agent.">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <EmptyState icon={CalendarClock} title="Couldn't load schedules" />}
        {!isLoading && !isError && (
          schedules.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No schedules" description="Create one above." />
          ) : (
            <div className="divide-y divide-border">
              {schedules.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <BadgePill color="var(--color-2)">every {s.intervalMinutes} min</BadgePill>
                      {s.active ? (
                        <BadgePill color="var(--color-1)">active</BadgePill>
                      ) : (
                        <BadgePill color="var(--muted-foreground)">paused</BadgePill>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Last run{" "}
                        {s.lastRunAt
                          ? formatDistanceToNow(new Date(s.lastRunAt), { addSuffix: true })
                          : "Never"}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{s.prompt}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete schedule"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
      </SectionCard>

      <Toaster richColors position="top-center" />
    </div>
  );
}
