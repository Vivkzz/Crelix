"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GitCompare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from "react-markdown";

type Run = {
  id: string;
  agentId: string;
  status: string;
  provider?: string;
  model?: string;
  input?: string;
  steps?: string;
  artifacts?: string;
  finalMessage?: string;
  error?: string;
  createdAt: string;
};

type Step = { id: string; title: string; status?: string };
type Artifact = { title?: string; type: string };

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

function RunColumn({
  run,
  isLoading,
  label,
}: {
  run?: Run;
  isLoading: boolean;
  label: string;
}) {
  const steps = useMemo<Step[]>(() => {
    if (!run?.steps) return [];
    try {
      return JSON.parse(run.steps) as Step[];
    } catch {
      return [];
    }
  }, [run?.steps]);

  const artifacts = useMemo<Artifact[]>(() => {
    if (!run?.artifacts) return [];
    try {
      return JSON.parse(run.artifacts) as Artifact[];
    } catch {
      return [];
    }
  }, [run?.artifacts]);

  if (isLoading || !run) {
    return (
      <SectionCard title={`Run ${label}`}>
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      </SectionCard>
    );
  }

  const created = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(run.createdAt));

  return (
    <SectionCard title={`Run ${label}`} description={preview(run.input)}>
      <div className="space-y-5">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge className="capitalize" style={statusStyle(run.status)}>
            {run.status || "unknown"}
          </Badge>
          {run.provider && <span className="capitalize">{run.provider}</span>}
          {run.model && <span className="font-mono text-xs">{run.model}</span>}
          <span>·</span>
          <span>{created}</span>
        </div>

        {/* Error */}
        {run.error && (
          <div
            className="rounded-lg p-3 text-sm"
            style={{
              background: "color-mix(in srgb, var(--color-5) 8%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-5) 40%, transparent)",
              color: "var(--color-5)",
            }}
          >
            {run.error}
          </div>
        )}

        {/* Steps */}
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Steps
          </h3>
          {steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No steps recorded.</p>
          ) : (
            <ul className="space-y-1.5">
              {steps.map((s, i) => (
                <li key={s.id || i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                  <span>{s.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Artifacts */}
        {artifacts.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Artifacts
            </h3>
            <ul className="space-y-1.5">
              {artifacts.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{a.title || "Untitled artifact"}</span>
                  <Badge variant="outline" className="uppercase text-[10px]">{a.type}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Final answer */}
        {run.finalMessage && (
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Final answer
            </h3>
            <div
              className="rounded-lg p-4 text-sm [&_a]:text-[var(--color-3)] [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3"
              style={{
                background: "color-mix(in srgb, var(--color-1) 6%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-1) 40%, transparent)",
              }}
            >
              <ReactMarkdown>{run.finalMessage}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function RunSelect({
  value,
  onChange,
  placeholder,
  runs,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  runs: Run[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {runs.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {preview(r.input).slice(0, 60)} ·{" "}
            {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function CompareRunsPage() {
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");

  const { data: allRuns, isLoading: listLoading } = useQuery({
    queryKey: ["agent-runs-all"],
    queryFn: () => api<{ runs: Run[] }>(`/api/dashboard/agents/runs`).then((r) => r.runs),
  });

  const { data: runA, isLoading: aLoading } = useQuery({
    queryKey: ["agent-run", aId],
    queryFn: () => api<{ run: Run }>(`/api/dashboard/agents/runs/${aId}`).then((r) => r.run),
    enabled: !!aId,
  });

  const { data: runB, isLoading: bLoading } = useQuery({
    queryKey: ["agent-run", bId],
    queryFn: () => api<{ run: Run }>(`/api/dashboard/agents/runs/${bId}`).then((r) => r.run),
    enabled: !!bId,
  });

  const runs = allRuns ?? [];
  const both = !!aId && !!bId;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Compare runs" description="Side-by-side comparison of two runs." />

      <div className="spectrum-rule" />

      {/* Selectors */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Run A
          </div>
          <RunSelect
            value={aId}
            onChange={setAId}
            placeholder="Select run A"
            runs={runs}
          />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Run B
          </div>
          <RunSelect
            value={bId}
            onChange={setBId}
            placeholder="Select run B"
            runs={runs}
          />
        </div>
      </div>

      {/* Body */}
      {listLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : !both ? (
        <EmptyState
          icon={GitCompare}
          title="Select two runs to compare"
          description="Pick a run in each column to see their steps, artifacts, and final answers side by side."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RunColumn run={runA} isLoading={aLoading} label="A" />
          <RunColumn run={runB} isLoading={bLoading} label="B" />
        </div>
      )}
    </div>
  );
}
