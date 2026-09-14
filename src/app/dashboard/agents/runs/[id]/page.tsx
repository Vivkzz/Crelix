"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Terminal,
  Download,
  Share2,
  Copy,
  Send,
  Plus,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/client-api";
import { SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import ReactMarkdown from "react-markdown";

type Run = {
  id: string;
  agentId: string;
  status: string;
  provider?: string;
  model?: string;
  input?: string;
  steps?: string; // JSON string
  artifacts?: string; // JSON string
  finalMessage?: string;
  error?: string;
  shareToken?: string;
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

export default function RunConsolePage() {
  const { id } = useParams<{ id: string }>();

  const { data: run, isLoading, error } = useQuery({
    queryKey: ["agent-run", id],
    queryFn: () => api<{ run: Run }>(`/api/dashboard/agents/runs/${id}`).then((r) => r.run),
    enabled: !!id,
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

  const isRunning = (run?.status || "").toLowerCase() === "running";

  const qc = useQueryClient();
  const [origin, setOrigin] = useState("");
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliverTo, setDeliverTo] = useState<"email" | "webhook">("email");
  const [deliverEmail, setDeliverEmail] = useState("");
  const [deliverWebhook, setDeliverWebhook] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = run?.shareToken ? `${origin}/share/runs/${run.shareToken}` : "";

  const exportRun = () => {
    const a = document.createElement("a");
    a.href = `/api/dashboard/agents/runs/${id}/export`;
    a.download = `run-${id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const createShare = useMutation({
    mutationFn: () =>
      api<{ shareToken: string }>(`/api/dashboard/agents/runs/${id}/share`, { method: "POST" }),
    onSuccess: (d) => {
      toast.success("Public link created");
      navigator.clipboard?.writeText(`${origin}/share/runs/${d.shareToken}`).catch(() => {});
      qc.invalidateQueries({ queryKey: ["agent-run", id] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create link"),
  });

  const revokeShare = useMutation({
    mutationFn: () => api(`/api/dashboard/agents/runs/${id}/share`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Public link revoked");
      qc.invalidateQueries({ queryKey: ["agent-run", id] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to revoke"),
  });

  const copyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard
      ?.writeText(shareUrl)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Copy failed"));
  };

  const deliver = useMutation({
    mutationFn: () =>
      api<{ ok: boolean; delivered?: boolean }>(`/api/dashboard/agents/runs/${id}/deliver`, {
        method: "POST",
        body: JSON.stringify({
          to: deliverTo,
          email: deliverTo === "email" ? deliverEmail : undefined,
          webhookUrl: deliverTo === "webhook" ? deliverWebhook : undefined,
        }),
      }),
    onSuccess: (d) => {
      if (deliverTo === "email" && d.delivered) {
        toast.success("Email sent");
        setDeliverOpen(false);
        setDeliverEmail("");
      } else if (deliverTo === "webhook" && d.ok) {
        toast.success("Webhook delivered");
        setDeliverOpen(false);
        setDeliverWebhook("");
      } else if (deliverTo === "email") {
        toast.error("Email failed to send");
      } else {
        toast.error("Webhook delivery failed");
      }
    },
    onError: (e: any) => toast.error(e.message || "Failed to deliver"),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <EmptyState
          icon={Terminal}
          title="Run not found"
          description="This run may have been deleted or you do not have access to it."
          action={
            <Button asChild>
              <Link href="/dashboard/agents">
                <ArrowLeft className="h-4 w-4" />
                Back to agents
              </Link>
            </Button>
          }
        />
      ) : !run ? null : (
        <>
          {/* Header */}
          <div>
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
              <Link href={`/dashboard/agents/${run.agentId}`}>
                <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
                Back to agent
              </Link>
            </Button>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">Run console</h1>
              <Badge className="capitalize" style={statusStyle(run.status)}>{run.status || "unknown"}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {run.provider && <span>{run.provider}</span>}
              {run.model && <span className="font-mono text-xs">{run.model}</span>}
              <span>· {created}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportRun}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            {run.shareToken ? (
              <div className="flex items-center gap-2">
                <Input readOnly value={shareUrl} className="h-8 w-56 font-mono text-xs" />
                <Button variant="outline" size="sm" onClick={copyShare}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={revokeShare.isPending}
                  onClick={() => revokeShare.mutate()}
                >
                  Revoke
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={createShare.isPending}
                onClick={() => createShare.mutate()}
              >
                <Share2 className="h-4 w-4" />
                Create public link
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setDeliverOpen(true)}>
              <Send className="h-4 w-4" />
              Deliver
            </Button>
          </div>

          <div className="spectrum-rule" />

          {/* Input */}
          {run.input && (
            <SectionCard title="Input" description="The prompt that started this run.">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{run.input}</p>
            </SectionCard>
          )}

          {/* Error */}
          {run.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Run failed</AlertTitle>
              <AlertDescription>{run.error}</AlertDescription>
            </Alert>
          )}

          {/* Steps */}
          <SectionCard title="Steps" description="The step-by-step timeline of this run.">
            {steps.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isRunning ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Run in progress…
                  </>
                ) : (
                  <span>No steps recorded.</span>
                )}
              </div>
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

          {/* Artifacts */}
          {artifacts.length > 0 && (
            <SectionCard title="Artifacts" description="Outputs produced during this run.">
              <div className="space-y-3">
                {artifacts.map((a, i) => (
                  <ArtifactView key={i} artifact={a} />
                ))}
              </div>
            </SectionCard>
          )}

          {/* Final answer */}
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

          {/* Notes */}
          <RunNotes runId={id} />
        </>
      )}

      {/* Deliver dialog */}
      <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deliver run result</DialogTitle>
            <DialogDescription>Send this run's result via email or to a webhook.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Deliver to</Label>
              <Select value={deliverTo} onValueChange={(v) => setDeliverTo(v as "email" | "webhook")}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {deliverTo === "email" ? (
              <div className="space-y-1.5">
                <Label htmlFor="deliver-email">Email address</Label>
                <Input
                  id="deliver-email"
                  type="email"
                  value={deliverEmail}
                  onChange={(e) => setDeliverEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="deliver-webhook">Webhook URL</Label>
                <Input
                  id="deliver-webhook"
                  value={deliverWebhook}
                  onChange={(e) => setDeliverWebhook(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliverOpen(false)}>Cancel</Button>
            <Button
              disabled={deliver.isPending || (deliverTo === "email" ? !deliverEmail.trim() : !deliverWebhook.trim())}
              onClick={() => deliver.mutate()}
            >
              {deliver.isPending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

function RunNotes({ runId }: { runId: string }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const { data: notes, isLoading } = useQuery({
    queryKey: ["run-notes", runId],
    queryFn: () =>
      api<{ notes: { id: string; body: string; userId: string; createdAt: string }[] }>(
        `/api/dashboard/agents/runs/${runId}/notes`,
      ).then((r) => r.notes),
    enabled: !!runId,
  });

  const add = useMutation({
    mutationFn: (b: string) =>
      api(`/api/dashboard/agents/runs/${runId}/notes`, { method: "POST", body: JSON.stringify({ body: b }) }),
    onSuccess: () => {
      toast.success("Note added");
      setBody("");
      qc.invalidateQueries({ queryKey: ["run-notes", runId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to add note"),
  });

  const remove = useMutation({
    mutationFn: (noteId: string) =>
      api(`/api/dashboard/agents/runs/${runId}/notes/${noteId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Note deleted");
      qc.invalidateQueries({ queryKey: ["run-notes", runId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete note"),
  });

  const list = notes ?? [];

  return (
    <SectionCard title="Notes" description="Private notes for this run.">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a note…"
            rows={2}
            className="flex-1"
          />
          <Button disabled={add.isPending || !body.trim()} onClick={() => add.mutate(body.trim())}>
            <Plus className="h-4 w-4" />
            Add note
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner className="h-5 w-5" />
          </div>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {list.map((n) => (
              <div key={n.id} className="flex items-start gap-3 py-3">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-sm">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete note"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(n.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
