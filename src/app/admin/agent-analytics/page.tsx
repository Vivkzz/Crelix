"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  Spinner,
} from "@/components/dashboard/ui";
import { AreaChartMini, BarChartMini } from "@/components/dashboard/charts";

export default function AdminAgentAnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["platform-agent-stats"],
    queryFn: () => api<{ stats: any }>("/api/admin/agent-analytics"),
  });

  const stats = data?.stats;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Platform agent analytics"
        description="Agent runs and providers across the platform."
      />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Activity}
          title="Couldn't load agent analytics"
          description="The endpoint returned an error. Try refreshing."
        />
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total runs" value={stats.totalRuns ?? 0} accent="var(--color-1)" />
            <StatCard label="Completed" value={stats.completed ?? 0} accent="var(--color-1)" />
            <StatCard label="Failed" value={stats.failed ?? 0} accent="var(--color-5)" />
            <StatCard
              label="Credit spend"
              value={stats.creditSpend ?? 0}
              accent="var(--color-4)"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Runs by provider"
              description="Agent runs grouped by provider."
            >
              {stats.byProvider && stats.byProvider.length > 0 ? (
                <BarChartMini
                  data={stats.byProvider}
                  dataKey="count"
                  xKey="provider"
                  color="var(--color-3)"
                />
              ) : (
                <EmptyState icon={Activity} title="No provider data yet" />
              )}
            </SectionCard>

            <SectionCard
              title="Runs over time"
              description="Daily platform agent runs."
            >
              {stats.runsByDay && stats.runsByDay.length > 0 ? (
                <AreaChartMini
                  data={stats.runsByDay}
                  dataKey="count"
                  xKey="date"
                  color="var(--color-2)"
                />
              ) : (
                <EmptyState icon={Activity} title="No runs yet" />
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Top agents"
            description="Most active agents by run count."
          >
            {stats.topAgents && stats.topAgents.length > 0 ? (
              <div className="divide-y divide-border">
                {stats.topAgents.map((a: any, i: number) => (
                  <div
                    key={a.agentId}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-sm font-semibold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{a.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {a.agentId}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold tabular-nums">
                      {a.runs} runs
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Activity} title="No agent runs yet" />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
