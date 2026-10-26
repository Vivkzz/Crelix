"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Blocks,
  ShieldCheck,
  Search,
  TrendingUp,
  Package,
  Activity,
  Play,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/client-api";
import { planById } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { AreaChartMini, BarChartMini } from "@/components/dashboard/charts";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TOKEN_COLORS = ["#91e500", "#12bcff", "#2f44ff", "#8200df", "#df006c"];
function colorFor(s: string) {
  let h = 0;
  for (const c of s || "x") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TOKEN_COLORS[h % TOKEN_COLORS.length];
}
function statusStyle(status: string): React.CSSProperties {
  const s = (status || "").toLowerCase();
  let color = "var(--muted-foreground)";
  if (["completed", "complete", "done", "success"].includes(s)) color = "var(--color-1)";
  else if (["failed", "error"].includes(s)) color = "var(--color-5)";
  else if (["running", "processing", "pending", "queued", "in_progress"].includes(s)) color = "var(--color-2)";
  return { background: `color-mix(in srgb, ${color} 14%, transparent)`, color, borderColor: "transparent" };
}

export default function DashboardOverviewPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api<{
      user: { credits: number; plan: string; role: string; name: string; email: string };
      counts: { projects: number; scans: number; research: number };
      creditSeries: { label: string; credits: number }[];
      byType: { type: string; count: number }[];
      recent: { id: string; reason: string; delta: number; balanceAfter: number; createdAt: string }[];
    }>("/api/dashboard/overview"),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Overview"
        description="Your Crelix AI workspace at a glance."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <SectionCard>
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load overview."}
          </p>
        </SectionCard>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Credits"
              value={data.user.credits ?? 0}
              hint="Available balance"
              accent="var(--color-1)"
            />
            <StatCard
              label="Current plan"
              value={planById(data.user.plan).name}
              hint={data.user.plan || "FREE"}
              accent="var(--color-3)"
            />
            <StatCard
              label="Projects"
              value={data.counts.projects}
              hint="Generated with Flow"
              accent="var(--color-2)"
            />
            <StatCard
              label="Scans"
              value={data.counts.scans}
              hint="Security scans run"
              accent="var(--color-5)"
            />
          </div>

          {/* Quick start */}
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick start</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <QuickStartCard
                href="/dashboard/projects/new"
                icon={<Blocks className="h-5 w-5" />}
                title="New project"
                desc="Generate a site with Flow"
                color="var(--color-1)"
              />
              <QuickStartCard
                href="/dashboard/scans/new"
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Run a scan"
                desc="Audit a URL for issues"
                color="var(--color-2)"
              />
              <QuickStartCard
                href="/dashboard/research/new"
                icon={<Search className="h-5 w-5" />}
                title="Research a topic"
                desc="Market & competitor research"
                color="var(--color-3)"
              />
            </div>
          </div>

          {/* Quick run + recent runs */}
          <div className="grid gap-4 lg:grid-cols-2">
            <QuickRunCard />
            <RecentRunsCard />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Credit balance over time"
              description="How your credit balance changed recently."
            >
              {data.creditSeries && data.creditSeries.length > 0 ? (
                <AreaChartMini
                  data={data.creditSeries}
                  dataKey="credits"
                  xKey="label"
                  color="var(--color-2)"
                />
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="No credit activity yet"
                  description="Generate, scan, or research to see your balance move."
                />
              )}
            </SectionCard>

            <SectionCard
              title="Projects by type"
              description="Breakdown of what you have generated."
            >
              {data.byType && data.byType.length > 0 ? (
                <div className="space-y-4">
                  <BarChartMini
                    data={data.byType}
                    dataKey="count"
                    xKey="type"
                    color="var(--color-3)"
                  />
                  <div className="flex flex-wrap gap-2">
                    {data.byType.map((t) => (
                      <BadgePill key={t.type} color={colorFor(t.type)}>
                        {t.type} · {t.count}
                      </BadgePill>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="No projects yet"
                  description="Create your first project to see a breakdown here."
                  action={
                    <Link
                      href="/dashboard/projects/new"
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      New project
                    </Link>
                  }
                />
              )}
            </SectionCard>
          </div>

          {/* Recent activity */}
          <SectionCard
            title="Recent activity"
            description="Credit movements across your account."
          >
            {data.recent && data.recent.length > 0 ? (
              <div className="divide-y divide-border">
                {data.recent.map((r) => {
                  const positive = (r.delta ?? 0) >= 0;
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: `color-mix(in srgb, ${
                              positive ? "var(--color-1)" : "var(--color-5)"
                            } 14%, transparent)`,
                            color: positive ? "var(--color-1)" : "var(--color-5)",
                          }}
                        >
                          {positive ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <Activity className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{r.reason}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                            {typeof r.balanceAfter === "number" && (
                              <> · balance {r.balanceAfter}</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className="shrink-0 text-sm font-semibold tabular-nums"
                        style={{ color: positive ? "var(--color-1)" : "var(--color-5)" }}
                      >
                        {positive ? "+" : "−"}
                        {Math.abs(r.delta ?? 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="No recent activity"
                description="Credit movements will appear here once you start using Crelix AI."
              />
            )}
          </SectionCard>
        </>
      ) : null}

      <Toaster richColors position="top-center" />
    </div>
  );
}

function QuickStartCard({
  href,
  icon,
  title,
  desc,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <Link href={href} className="block">
      <div
        className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-card)]"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: `color-mix(in srgb, ${color} 14%, transparent)`,
              color,
            }}
          >
            {icon}
          </span>
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground">{desc}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickRunCard() {
  const [agentId, setAgentId] = useState("");
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () =>
      api<{ agents: any[] }>(`/api/dashboard/agents`).then((r) =>
        r.agents.filter((a: any) => a.provider === "playbook"),
      ),
  });
  const agents = data ?? [];

  async function run() {
    if (running || !agentId) return;
    const runInput = input.trim();
    setRunning(true);
    setResult(null);
    setRunId(null);
    setError(null);
    let resolved = false;
    let msg = "";
    try {
      const res = await fetch(`/api/dashboard/agents/${agentId}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: runInput }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        const m = (j as { error?: string })?.error || "Run failed";
        setError(m);
        toast.error(m);
        setRunning(false);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const line = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          let ev: { type: string; runId?: string; content?: string; finalMessage?: string; message?: string };
          try {
            ev = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          switch (ev.type) {
            case "run_started":
              setRunId(ev.runId ?? null);
              break;
            case "message":
              msg += ev.content ?? "";
              setResult(msg);
              break;
            case "done":
              resolved = true;
              setRunId(ev.runId ?? null);
              if (ev.finalMessage) {
                msg = ev.finalMessage;
                setResult(msg);
              }
              setRunning(false);
              toast.success("Run complete");
              break;
            case "error":
              resolved = true;
              setError(ev.message || "Run error");
              toast.error(ev.message || "Run error");
              setRunning(false);
              break;
          }
        }
      }
      if (!resolved) setRunning(false);
    } catch (e) {
      setRunning(false);
      const m = e instanceof Error ? e.message : "Run failed";
      setError(m);
      toast.error(m);
    }
  }

  return (
    <SectionCard title="Quick run an agent" description="Run a playbook agent without leaving the dashboard.">
      <div className="space-y-3">
        <Select value={agentId} onValueChange={setAgentId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoading ? "Loading…" : "Select a playbook agent"} />
          </SelectTrigger>
          <SelectContent>
            {agents.map((a: any) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what this agent should do…"
          disabled={running}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={running || !agentId}>
            {running ? <Spinner className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Running…" : "Run"}
          </Button>
          {runId && (
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href={`/dashboard/agents/runs/${runId}`}>
                Open run
                <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function RecentRunsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-runs"],
    queryFn: () => api<{ runs: any[] }>(`/api/dashboard/agents/runs`).then((r) => r.runs),
  });
  const runs = (data ?? []).slice(0, 5);

  return (
    <SectionCard title="Recent agent runs" description="Your latest agent runs across all agents.">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="h-5 w-5" />
        </div>
      ) : runs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No runs yet"
          description="Run an agent to see your recent activity here."
        />
      ) : (
        <div className="divide-y divide-border">
          {runs.map((r: any) => {
            const raw = r.input || "";
            const preview = raw.length > 80 ? raw.slice(0, 80) + "…" : raw;
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                <Badge className="capitalize" style={statusStyle(r.status)}>
                  {r.status || "unknown"}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {preview || <span className="italic">No input</span>}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/agents/runs/${r.id}`}>Open</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
