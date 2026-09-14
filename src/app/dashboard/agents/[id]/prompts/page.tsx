"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

type SavedPrompt = {
  id: string;
  label: string;
  input: string;
  createdAt: string;
};

export default function SavedPromptsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [label, setLabel] = useState("");
  const [input, setInput] = useState("");
  const [runningId, setRunningId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["agent-prompts", id],
    queryFn: () =>
      api<{ prompts: SavedPrompt[] }>(`/api/dashboard/agents/${id}/prompts`).then((r) => r.prompts),
    enabled: !!id,
  });
  const prompts = data ?? [];

  const saveM = useMutation({
    mutationFn: (b: { label: string; input: string }) =>
      api<{ prompt: SavedPrompt }>(`/api/dashboard/agents/${id}/prompts`, {
        method: "POST",
        body: JSON.stringify(b),
      }),
    onSuccess: () => {
      toast.success("Prompt saved");
      setLabel("");
      setInput("");
      qc.invalidateQueries({ queryKey: ["agent-prompts", id] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const delM = useMutation({
    mutationFn: (promptId: string) =>
      api(`/api/dashboard/agents/${id}/prompts?promptId=${promptId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Prompt deleted");
      qc.invalidateQueries({ queryKey: ["agent-prompts", id] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  async function runPrompt(p: SavedPrompt) {
    if (runningId) return;
    setRunningId(p.id);
    let captured: string | null = null;
    try {
      const res = await fetch(`/api/dashboard/agents/${id}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: p.input }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        toast.error((j as { error?: string })?.error || "Run failed");
        setRunningId(null);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (captured === null) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const line = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          let ev: { type: string; runId?: string; message?: string };
          try {
            ev = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (ev.type === "run_started" && ev.runId) {
            captured = ev.runId;
            break;
          }
          if (ev.type === "error") {
            toast.error(ev.message || "Run error");
            await reader.cancel().catch(() => {});
            setRunningId(null);
            return;
          }
        }
      }
      if (captured) {
        await reader.cancel().catch(() => {});
        router.push(`/dashboard/agents/runs/${captured}`);
      } else {
        setRunningId(null);
        toast.error("Run did not start");
      }
    } catch (e) {
      setRunningId(null);
      toast.error(e instanceof Error ? e.message : "Run failed");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Button asChild variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
        <Link href={`/dashboard/agents/${id}`}>
          <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
          Back to agent
        </Link>
      </Button>

      <PageHeader title="Saved prompts" description="Reusable prompts and quick actions for this agent." />

      {/* Save form */}
      <SectionCard title="Save a prompt" description="Store a reusable prompt to run anytime.">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="prompt-label">Label</Label>
            <Input
              id="prompt-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Weekly report"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prompt-input">Prompt</Label>
            <Textarea
              id="prompt-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="The input to send to the agent…"
              rows={4}
            />
          </div>
          <Button
            onClick={() => saveM.mutate({ label: label.trim(), input: input.trim() })}
            disabled={saveM.isPending || !label.trim() || !input.trim()}
          >
            {saveM.isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            Save prompt
          </Button>
        </div>
      </SectionCard>

      {/* List */}
      <SectionCard title="Your prompts" description="Saved prompts for this agent.">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-5 w-5" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load prompts."}
          </p>
        ) : prompts.length === 0 ? (
          <EmptyState
            icon={Save}
            title="No saved prompts"
            description="Save a reusable prompt above to run it again later."
          />
        ) : (
          <div className="divide-y divide-border">
            {prompts.map((p) => {
              const raw = p.input || "";
              const preview = raw.length > 120 ? raw.slice(0, 120) + "…" : raw;
              return (
                <div key={p.id} className="flex flex-wrap items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{p.label}</div>
                    <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{preview}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runPrompt(p)}
                      disabled={!!runningId}
                    >
                      {runningId === p.id ? <Spinner className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      Run
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => delM.mutate(p.id)}
                      disabled={delM.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <Toaster richColors position="top-center" />
    </div>
  );
}
