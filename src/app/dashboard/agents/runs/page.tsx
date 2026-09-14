"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type Run = {
  id: string;
  agentId: string;
  status: string;
  provider?: string;
  model?: string;
  input?: string;
  finalMessage?: string;
  error?: string;
  createdAt: string;
};

function statusStyle(status: string): React.CSSProperties {
  const s = (status || "").toLowerCase();
  let color = "var(--muted-foreground)";
  if (["completed", "complete", "done", "success"].includes(s)) color = "var(--color-1)";
  else if (["failed", "error"].includes(s)) color = "var(--color-5)";
  else if (["running", "processing", "pending", "queued", "in_progress"].includes(s)) color = "var(--color-2)";
  return {
    background: `color-mix(in srgb, ${color} 14%, transparent)`,
    color,
    borderColor: "transparent",
  };
}

function preview(text?: string): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t || "(no input)";
}

// "all" is a UI-only value; the API treats `status=all` / `provider=all` as a
// literal filter (matching nothing), so translate it to an empty string which
// the runs endpoint coerces back to `undefined` (no filter).
function allParam(v: string): string {
  return v === "all" ? "" : v;
}

export default function AgentRunsPage() {
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("all");

  const commit = () => setQ(qInput.trim());

  const { data: runs, isLoading, error } = useQuery({
    queryKey: ["agent-runs", q, status, provider],
    queryFn: () =>
      api<{ runs: Run[] }>(
        `/api/dashboard/agents/runs?q=${encodeURIComponent(q)}&status=${allParam(status)}&provider=${allParam(provider)}`,
      ).then((r) => r.runs),
  });

  const list = runs ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Agent runs"
        description="Search and inspect every run across your agents."
      />

      <div className="spectrum-rule" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
            }}
            onBlur={commit}
            placeholder="Search runs by input…"
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={commit}>
          <Search className="h-4 w-4" />
          Search
        </Button>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="playbook">Playbook</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load runs."}
        </p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={History}
          title="No runs found"
          description="Try adjusting your search or filters to find a run."
        />
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <Link key={r.id} href={`/dashboard/agents/runs/${r.id}`} className="block">
              <Card className="dash-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{preview(r.input)}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      {r.provider && <span className="capitalize">{r.provider}</span>}
                      {r.model && <span className="font-mono">{r.model}</span>}
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Badge className="capitalize" style={statusStyle(r.status)}>
                    {r.status || "unknown"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
