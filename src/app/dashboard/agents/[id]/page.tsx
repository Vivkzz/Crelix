"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Pencil,
  Trash2,
  Play,
  ExternalLink,
  Wrench,
  Bot,
  AlertCircle,
  Download,
  BarChart3,
  Calendar,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";
import { Toaster } from "@/components/ui/sonner";

type Agent = {
  id: string;
  name: string;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  playbookId?: string;
  tools?: string[];
  createdAt: string;
  updatedAt: string;
};

type RunListItem = {
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

type Artifact = {
  title?: string;
  type: "html" | "markdown" | "json" | "text";
  content: string;
};

type StepBase = { id: string; title: string; status: "running" | "done" | "error" };
type TimelineStep = StepBase & {
  kind: "step" | "tool";
  tool?: string;
  args?: unknown;
  result?: unknown;
  hasResult?: boolean;
};

type SSEEvent =
  | { type: "run_started"; runId: string }
  | { type: "step"; step: StepBase }
  | { type: "tool_call"; tool: string; args?: unknown }
  | { type: "tool_result"; tool: string; result?: unknown }
  | { type: "message"; content: string }
  | { type: "artifact"; artifact: Artifact }
  | { type: "done"; runId: string; finalMessage?: string }
  | { type: "error"; message: string };

// Real engine tools — must match src/lib/agents/tools.ts (ALL_TOOL_NAMES).
const TOOL_OPTIONS = ["web_search", "web_fetch", "research_topic", "generate_page", "run_scan"];

const TOKEN_COLORS = ["#91e500", "#12bcff", "#2f44ff", "#8200df", "#df006c"];
function colorFor(s: string) {
  let h = 0;
  for (const c of s || "x") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TOKEN_COLORS[h % TOKEN_COLORS.length];
}
function providerStyle(provider: string): React.CSSProperties {
  const c = colorFor(provider);
  return { background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c, borderColor: "transparent" };
}
function statusStyle(status: string): React.CSSProperties {
  const s = (status || "").toLowerCase();
  let color = "var(--muted-foreground)";
  if (["completed", "complete", "done", "success"].includes(s)) color = "var(--color-1)";
  else if (["failed", "error"].includes(s)) color = "var(--color-5)";
  else if (["running", "processing", "pending", "queued", "in_progress"].includes(s)) color = "var(--color-2)";
  return { background: `color-mix(in srgb, ${color} 14%, transparent)`, color, borderColor: "transparent" };
}
function safeStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
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

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [messageText, setMessageText] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    systemPrompt: "",
    model: "",
    playbookId: "",
    tools: [] as string[],
  });

  const consoleRef = useRef<HTMLDivElement>(null);

  const { data: agentData, isLoading, error } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => api<{ agent: Agent }>(`/api/dashboard/agents/${id}`).then((r) => r.agent),
    enabled: !!id,
  });
  const agent = agentData;

  const { data: runsData } = useQuery({
    queryKey: ["agent-runs", id],
    queryFn: () =>
      api<{ runs: RunListItem[] }>(`/api/dashboard/agents/runs?agentId=${id}`).then((r) => r.runs),
    enabled: !!id,
  });
  const runs = runsData ?? [];

  const { data: playbooksData } = useQuery({
    queryKey: ["agent-playbooks"],
    queryFn: () =>
      api<{ playbooks: { id: string; name: string; description?: string; steps: string[]; tools: string[] }[] }>(
        "/api/dashboard/agents/playbooks",
      ).then((r) => r.playbooks),
  });
  const playbooks = playbooksData ?? [];

  useEffect(() => {
    const vp = consoleRef.current?.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
    if (vp) vp.scrollTop = vp.scrollHeight;
  }, [steps, messageText, artifacts, running]);

  const editM = useMutation({
    mutationFn: (b: {
      name: string;
      systemPrompt: string;
      model?: string;
      playbookId?: string;
      tools?: string[];
    }) =>
      api<{ agent: Agent }>(`/api/dashboard/agents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(b),
      }),
    onSuccess: () => {
      toast.success("Agent updated");
      setEditOpen(false);
      qc.invalidateQueries({ queryKey: ["agent", id] });
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const delM = useMutation({
    mutationFn: () => api(`/api/dashboard/agents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Agent deleted");
      qc.invalidateQueries({ queryKey: ["agents"] });
      router.push("/dashboard/agents");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  function openEdit() {
    if (!agent) return;
    setForm({
      name: agent.name || "",
      systemPrompt: agent.systemPrompt || "",
      model: agent.model || "",
      playbookId: agent.playbookId || "",
      tools: agent.tools || [],
    });
    setEditOpen(true);
  }

  function toggleTool(t: string) {
    setForm((f) => ({
      ...f,
      tools: f.tools.includes(t) ? f.tools.filter((x) => x !== t) : [...f.tools, t],
    }));
  }

  async function exportConfig() {
    if (!id || exporting) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/dashboard/agents/${id}/export-config`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error((j as { error?: string })?.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "agent.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Config exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function runAgent() {
    if (!agent || running) return;
    const runInput = (input.trim() || agent.systemPrompt || "").trim();
    setRunning(true);
    setRunId(null);
    setSteps([]);
    setArtifacts([]);
    setMessageText("");
    setRunError(null);
    let resolved = false;
    try {
      const res = await fetch(`/api/dashboard/agents/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(runInput ? { input: runInput } : {}),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        toast.error((j as { error?: string })?.error || "Run failed");
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
          let ev: SSEEvent;
          try {
            ev = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          switch (ev.type) {
            case "run_started":
              setRunId(ev.runId);
              setSteps((s) => [...s, { id: "__run", title: "Run started", status: "running", kind: "step" }]);
              break;
            case "step": {
              const st = ev.step;
              setSteps((s) => {
                const i = s.findIndex((x) => x.id === st.id);
                if (i >= 0) {
                  const copy = [...s];
                  copy[i] = { ...copy[i], title: st.title || copy[i].title, status: st.status };
                  return copy;
                }
                return [...s, { ...st, kind: "step" }];
              });
              break;
            }
            case "tool_call":
              setSteps((s) => [
                ...s,
                {
                  id: `tool-${s.length}-${ev.tool}`,
                  title: `Tool: ${ev.tool}`,
                  status: "running",
                  kind: "tool",
                  tool: ev.tool,
                  args: ev.args,
                },
              ]);
              break;
            case "tool_result":
              setSteps((s) => {
                const copy = [...s];
                for (let i = copy.length - 1; i >= 0; i--) {
                  if (copy[i].kind === "tool" && copy[i].tool === ev.tool && !copy[i].hasResult) {
                    copy[i] = { ...copy[i], result: ev.result, hasResult: true, status: "done" };
                    break;
                  }
                }
                return copy;
              });
              break;
            case "message":
              setMessageText((m) => m + (ev.content ?? ""));
              break;
            case "artifact":
              setArtifacts((a) => [...a, ev.artifact]);
              break;
            case "done":
              resolved = true;
              setRunning(false);
              setRunId(ev.runId);
              if (ev.finalMessage) {
                const fm = ev.finalMessage;
                setMessageText((m) => m || fm);
              }
              toast.success("Run complete");
              qc.invalidateQueries({ queryKey: ["agent-runs", id] });
              break;
            case "error":
              resolved = true;
              setRunning(false);
              setRunError(ev.message);
              toast.error(ev.message || "Run error");
              qc.invalidateQueries({ queryKey: ["agent-runs", id] });
              break;
          }
        }
      }
      if (!resolved) {
        setRunning(false);
        qc.invalidateQueries({ queryKey: ["agent-runs", id] });
      }
    } catch (e) {
      setRunning(false);
      toast.error(e instanceof Error ? e.message : "Run failed");
    }
  }

  const isPlaybook = /playbook/i.test(agent?.provider || "");
  const hasConsole = steps.length > 0 || messageText.length > 0 || artifacts.length > 0 || running;
  const selectedPlaybook = playbooks.find((p) => p.id === form.playbookId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <EmptyState
          icon={Bot}
          title="Agent not found"
          description="This agent may have been deleted or you do not have access to it."
          action={
            <Button asChild>
              <Link href="/dashboard/agents">
                <ArrowLeft className="h-4 w-4" />
                Back to agents
              </Link>
            </Button>
          }
        />
      ) : !agent ? null : (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Button asChild variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
                <Link href="/dashboard/agents">
                  <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
                  Agents
                </Link>
              </Button>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{agent.name || "Untitled agent"}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {agent.provider && <Badge style={providerStyle(agent.provider)}>{agent.provider}</Badge>}
                {agent.model && <span className="font-mono text-xs text-muted-foreground">{agent.model}</span>}
                {agent.playbookId && <span className="text-xs text-muted-foreground">Playbook: {agent.playbookId}</span>}
                <span className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })}
                </span>
              </div>
              {agent.tools && agent.tools.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <Wrench className="h-3.5 w-3.5" />
                  {agent.tools.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={exportConfig} disabled={exporting}>
                {exporting ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                Export config
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/agents/${id}/analytics`}>
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/agents/${id}/schedule`}>
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/agents/${id}/prompts`}>
                  <FileText className="h-4 w-4" />
                  Prompts
                </Link>
              </Button>
              <Button variant="outline" onClick={openEdit}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setDelOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="spectrum-rule" />

          {/* Run panel */}
          <SectionCard title="Run agent" description="Describe a task or leave blank to use the agent's system prompt.">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what this agent should do…"
              rows={4}
              disabled={running}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button onClick={runAgent} disabled={running}>
                {running ? <Spinner className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? "Running…" : "Run agent"}
              </Button>
              <p className="text-xs text-muted-foreground">Costs 3 credits (playbook) / 5 credits (LLM) per run</p>
            </div>
          </SectionCard>

          {/* Live console */}
          <SectionCard title="Live console" description="Steps, tool calls and streamed output appear here in real time.">
            {runId && !running && (
              <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Run saved.</span>
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={`/dashboard/agents/runs/${runId}`}>
                    Open full run
                    <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            )}

            {runError && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Run error</AlertTitle>
                <AlertDescription>{runError}</AlertDescription>
              </Alert>
            )}

            {!hasConsole ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Run the agent to see live output.</p>
            ) : (
              <ScrollArea className="h-[420px] rounded-lg border border-border p-1">
                <div ref={consoleRef} className="space-y-3 p-2">
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
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{s.title}</div>
                        {s.kind === "tool" && (
                          <details className="mt-1 text-xs text-muted-foreground">
                            <summary className="cursor-pointer select-none">Details</summary>
                            {s.args != null && (
                              <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-[11px]">{safeStr(s.args)}</pre>
                            )}
                            {s.hasResult && (
                              <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-[11px]">{safeStr(s.result)}</pre>
                            )}
                          </details>
                        )}
                      </div>
                    </div>
                  ))}

                  {messageText && (
                    <div className="rounded-lg border border-border p-3 text-sm [&_a]:text-[var(--color-3)] [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3">
                      <ReactMarkdown>{messageText}</ReactMarkdown>
                    </div>
                  )}

                  {artifacts.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      {artifacts.map((a, i) => (
                        <ArtifactView key={i} artifact={a} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </SectionCard>

          {/* Run history */}
          <SectionCard title="Run history" description="Past runs of this agent.">
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {runs.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Badge className="capitalize" style={statusStyle(r.status)}>{r.status || "unknown"}</Badge>
                    {r.provider && <span className="text-xs text-muted-foreground">{r.provider}</span>}
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {r.input ? r.input : <span className="italic">No input</span>}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/agents/runs/${r.id}`}>Open</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit agent</DialogTitle>
            <DialogDescription>Update the agent configuration.</DialogDescription>
            {agent?.provider && (
              <Badge style={providerStyle(agent.provider)} className="w-fit">{agent.provider}</Badge>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="agent-name">Name</Label>
              <Input
                id="agent-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agent-prompt">System prompt</Label>
              <Textarea
                id="agent-prompt"
                value={form.systemPrompt}
                onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
                rows={6}
              />
            </div>

            {!isPlaybook && (
              <div className="space-y-1.5">
                <Label htmlFor="agent-model">Model</Label>
                <Input
                  id="agent-model"
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  placeholder="e.g. gpt-4o, claude-sonnet-4"
                />
              </div>
            )}

            {!isPlaybook && (
              <div className="space-y-1.5">
                <Label>Tools</Label>
                <div className="flex flex-wrap gap-3">
                  {TOOL_OPTIONS.map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.tools.includes(t)} onCheckedChange={() => toggleTool(t)} />
                      <span className="font-mono text-xs">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isPlaybook && (
              <div className="space-y-1.5">
                <Label>Playbook</Label>
                <Select
                  value={form.playbookId || "__none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, playbookId: v === "__none" ? "" : v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a playbook" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">None</SelectItem>
                    {playbooks.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlaybook?.description && (
                  <p className="text-xs text-muted-foreground">{selectedPlaybook.description}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              onClick={() =>
                editM.mutate({
                  name: form.name.trim() || "Untitled",
                  systemPrompt: form.systemPrompt,
                  model: form.model.trim() || undefined,
                  playbookId: form.playbookId || undefined,
                  tools: form.tools,
                })
              }
              disabled={editM.isPending}
            >
              {editM.isPending ? <Spinner className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete agent?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The agent and its configuration will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => delM.mutate()} disabled={delM.isPending}>
              {delM.isPending ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster richColors position="top-center" />
    </div>
  );
}
