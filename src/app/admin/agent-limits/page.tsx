"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gauge } from "lucide-react";

export default function AdminAgentLimitsPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-limits"],
    queryFn: () => api<{ maxPerUser: number; maxRunsPerDay: number }>(`/api/admin/agent-limits`),
  });

  const [maxPerUser, setMaxPerUser] = useState("");
  const [maxRunsPerDay, setMaxRunsPerDay] = useState("");

  useEffect(() => {
    if (data) {
      setMaxPerUser(String(data.maxPerUser ?? ""));
      setMaxRunsPerDay(String(data.maxRunsPerDay ?? ""));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (b: { maxPerUser: number; maxRunsPerDay: number }) =>
      api("/api/admin/agent-limits", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: (res: any) => {
      toast.success("Limits saved");
      qc.invalidateQueries({ queryKey: ["agent-limits"] });
      if (res?.maxPerUser !== undefined) setMaxPerUser(String(res.maxPerUser));
      if (res?.maxRunsPerDay !== undefined) setMaxRunsPerDay(String(res.maxRunsPerDay));
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Agent limits" description="Set advisory quotas for agent usage across the platform." />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={Gauge} title="Couldn't load limits" description="Try refreshing the page." />}

      {!isLoading && !isError && (
        <SectionCard
          title="Usage limits"
          description="These are advisory limits surfaced in the dashboard to inform users of fair-use guidance."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="max-per-user">Max agents per user</Label>
              <Input
                id="max-per-user"
                type="number"
                min={0}
                value={maxPerUser}
                onChange={(e) => setMaxPerUser(e.target.value)}
                placeholder="20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-runs-per-day">Max runs per day</Label>
              <Input
                id="max-runs-per-day"
                type="number"
                min={0}
                value={maxRunsPerDay}
                onChange={(e) => setMaxRunsPerDay(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button
              disabled={
                save.isPending ||
                maxPerUser.trim() === "" ||
                maxRunsPerDay.trim() === "" ||
                Number.isNaN(Number(maxPerUser)) ||
                Number.isNaN(Number(maxRunsPerDay))
              }
              onClick={() =>
                save.mutate({
                  maxPerUser: Number(maxPerUser),
                  maxRunsPerDay: Number(maxRunsPerDay),
                })
              }
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
            <p className="text-xs text-muted-foreground">
              These values are advisory and surfaced in the dashboard to guide usage; they are not hard-enforced here.
            </p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
