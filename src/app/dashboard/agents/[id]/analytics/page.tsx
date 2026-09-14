"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  Spinner,
} from "@/components/dashboard/ui";
import { AreaChartMini } from "@/components/dashboard/charts";

export default function AgentAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["agent-analytics", id],
    queryFn: () => api<{ stats: any }>(`/api/dashboard/agents/${id}/analytics`),
  });

  const stats = data?.stats;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Link
        href={`/dashboard/agents/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to agent
      </Link>

      <PageHeader
        title="Agent analytics"
        description="Performance and credit spend for this agent."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <SectionCard>
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load agent analytics."}
          </p>
        </SectionCard>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total runs" value={stats.total ?? 0} accent="var(--color-1)" />
            <StatCard label="Completed" value={stats.completed ?? 0} accent="var(--color-1)" />
            <StatCard label="Failed" value={stats.failed ?? 0} accent="var(--color-5)" />
            <StatCard label="Running" value={stats.running ?? 0} accent="var(--color-2)" />
            <StatCard label="Success rate" value={`${stats.successRate}%`} accent="var(--color-3)" />
            <StatCard
              label="Avg duration (ms)"
              value={stats.avgDurationMs ?? 0}
              accent="var(--color-2)"
            />
            <StatCard label="Credit spend" value={stats.creditSpend ?? 0} accent="var(--color-4)" />
          </div>

          <SectionCard
            title="Runs over time"
            description="Daily agent runs for the last 14 days."
          >
            {stats.runsByDay && stats.runsByDay.length > 0 ? (
              <AreaChartMini
                data={stats.runsByDay}
                dataKey="count"
                xKey="date"
                color="var(--color-2)"
              />
            ) : (
              <EmptyState
                icon={Activity}
                title="No runs yet"
                description="Run this agent to see analytics here."
                action={
                  <Link
                    href={`/dashboard/agents/${id}`}
                    className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Back to agent
                  </Link>
                }
              />
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
