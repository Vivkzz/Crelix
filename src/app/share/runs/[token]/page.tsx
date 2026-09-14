"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Terminal, Share2 } from "lucide-react";
import { api } from "@/lib/client-api";
import { SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

type Run = {
  id: string;
  status: string;
  provider?: string;
  model?: string;
  input?: string;
  steps?: string; // JSON string
  artifacts?: string; // JSON string
  finalMessage?: string;
  createdAt: string;
};

type Step = { id: string; title: string; status: "running" | "done" | "error" };
type Artifact = { title?: string; type: "html" | "markdown" | "json" | "text"; content: string };

function statusStyle(status: string): React.CSSProperties {
  const s = (status || "").toLowerCase();
  let color = "var(--muted-foreground)";
  if (["completed", "complete", "done", "success"].includes(s)) color = "var(--color-1)";
  else if (["failed", "error"].includes(s)) color = "var(--color-5)";
  else if (["running", "processing", "pending", "queued", "in_progress"].includes(s)) color = "var(--color-2)";
  return { background: `color-mix(in srgb, ${color} 14%, transparent)`, color, borderColor: "transparent" };
}

function prettyJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

function ArtifactView({ artifact }: { artifact: Artifact }) {
  const { title, type, content } = artifact;
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium">{title || "Artifact"}</span>
        <Badge variant="outline" className="ml-auto uppercase text-[10px]">{type}</Badge>
      </div>
      {type === "html" ? (
        <iframe srcDoc={content} sandbox="allow-same-origin" title={title || "artifact"} className="h-[400px] w-full rounded-lg border border-border" />
      ) : type === "markdown" ? (
        <div className="text-sm [&_a]:text-[var(--color-3)] [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : type === "json" ? (
        <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{prettyJson(content)}</pre>
      ) : (
        <p className="whitespace-pre-wrap text-sm">{content}</p>
      )}
    </div>
  );
}

export default function SharedRunPage() {
  const { token } = useParams<{ token: string }>();

  const { data: run, isLoading, error } = useQuery({
    queryKey: ["public-run", token],
    queryFn: () => api<{ run: Run }>(`/api/public/runs/${token}`).then((r) => r.run),
    enabled: !!token,
  });

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

  const created = run
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(run.createdAt))
    : "";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      {/* Header — self-contained, no dashboard shell */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-[var(--color-3)]" />
          <span className="text-sm font-semibold tracking-tight">Shared run · EKAM AI</span>
        </div>
        <Button asChild variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
            Back to site
          </Link>
        </Button>
      </div>

      <div className="spectrum-rule" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error || !run ? (
        <EmptyState
          icon={Terminal}
          title="Run not found"
          description="This shared link is invalid or has been revoked."
          action={
            <Button asChild>
              <Link href="/">Go to EKAM AI</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Run</h1>
            <Badge className="capitalize" style={statusStyle(run.status)}>{run.status || "unknown"}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {run.provider && <span>{run.provider}</span>}
            {run.model && <span className="font-mono text-xs">{run.model}</span>}
            <span>· {created}</span>
          </div>

          {run.input && (
            <SectionCard title="Input" description="The prompt that started this run.">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{run.input}</p>
            </SectionCard>
          )}

          <SectionCard title="Steps" description="The step-by-step timeline of this run.">
            {steps.length === 0 ? (
              <span className="text-sm text-muted-foreground">No steps recorded.</span>
            ) : (
              <ScrollArea className="h-[320px] rounded-lg border border-border p-1">
                <div className="space-y-3 p-2">
                  {steps.map((s) => (
                    <div key={s.id} className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {s.status === "done" ? (
                          <Check className="h-4 w-4 text-[var(--color-1)]" />
                        ) : s.status === "error" ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : (
                          <Spinner className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-sm font-medium">{s.title}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </SectionCard>

          {artifacts.length > 0 && (
            <SectionCard title="Artifacts" description="Outputs produced during this run.">
              <div className="space-y-3">
                {artifacts.map((a, i) => (
                  <ArtifactView key={i} artifact={a} />
                ))}
              </div>
            </SectionCard>
          )}

          {run.finalMessage && (
            <SectionCard title="Final answer" description="The agent's final response.">
              <div
                className="rounded-lg p-4 text-sm [&_a]:text-[var(--color-3)] [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3"
                style={{
                  background: "color-mix(in srgb, var(--color-1) 6%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-1) 40%, transparent)",
                }}
              >
                <ReactMarkdown>{run.finalMessage}</ReactMarkdown>
              </div>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}
