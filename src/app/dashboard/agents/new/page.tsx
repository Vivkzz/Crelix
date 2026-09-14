"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

type Provider = "playbook" | "openai" | "anthropic";
type Playbook = {
  id: string;
  name: string;
  description?: string;
  steps: string[];
  tools: string[];
};

const TOOL_OPTIONS = ["web_search", "web_fetch", "research_topic", "generate_page", "run_scan"];
const DEFAULT_MODEL: Record<Exclude<Provider, "playbook">, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
};

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [provider, setProvider] = useState<Provider>("playbook");
  const [playbookId, setPlaybookId] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL.openai);
  const [tools, setTools] = useState<string[]>([]);

  // Swap the default model when the user switches LLM provider.
  useEffect(() => {
    if (provider === "openai" || provider === "anthropic") {
      setModel(DEFAULT_MODEL[provider]);
    }
  }, [provider]);

  const { data: playbooks, isLoading: pbLoading } = useQuery({
    queryKey: ["agent-playbooks"],
    queryFn: () =>
      api<{ playbooks: Playbook[] }>("/api/dashboard/agents/playbooks").then((r) => r.playbooks),
    enabled: provider === "playbook",
  });
  const selectedPlaybook = playbooks?.find((p) => p.id === playbookId);

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api<{ agent: { id: string } }>("/api/dashboard/agents", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (res) => {
      toast.success("Agent created");
      router.push(`/dashboard/agents/${res.agent.id}`);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to create agent"),
  });

  const toggleTool = (t: string) =>
    setTools((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const canSubmit = name.trim().length > 0 && (provider !== "playbook" || playbookId !== "");

  const submit = () => {
    const body: Record<string, unknown> = { name: name.trim(), provider };
    if (systemPrompt.trim()) body.systemPrompt = systemPrompt.trim();
    if (provider === "playbook") {
      if (playbookId) body.playbookId = playbookId;
    } else {
      body.model = model.trim();
      body.tools = tools;
    }
    create.mutate(body);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="New agent"
        description="Configure how your agent runs."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/agents">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <SectionCard title="Basics" description="Name your agent and choose how it runs.">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Site auditor"
            />
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playbook">Playbook (keyless)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">System prompt (optional)</Label>
            <Textarea
              id="prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              placeholder="Describe the agent's role, tone, and constraints…"
              className="resize-none"
            />
          </div>
        </div>
      </SectionCard>

      {provider === "playbook" ? (
        <SectionCard
          title="Playbook"
          description="Pick a prebuilt playbook. Playbooks use their own tools."
        >
          {pbLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="h-4 w-4" /> Loading playbooks…
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Playbook</Label>
                <Select value={playbookId} onValueChange={setPlaybookId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a playbook" />
                  </SelectTrigger>
                  <SelectContent>
                    {(playbooks ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlaybook && (
                <div className="space-y-3 rounded-lg border border-border bg-foreground/[0.02] p-4">
                  {selectedPlaybook.description && (
                    <p className="text-sm text-muted-foreground">{selectedPlaybook.description}</p>
                  )}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Steps
                    </p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                      {selectedPlaybook.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      ) : (
        <SectionCard
          title="Model & tools"
          description="Run the agent on your own key or the server key."
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={DEFAULT_MODEL[provider]}
              />
            </div>

            <div className="space-y-2">
              <Label>Tools</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TOOL_OPTIONS.map((t) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-foreground/[0.03]"
                  >
                    <Checkbox checked={tools.includes(t)} onCheckedChange={() => toggleTool(t)} />
                    <span className="font-mono text-xs">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-foreground/[0.02] p-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Add your API key in Agents → Keys, or use the server key if configured.</p>
            </div>
          </div>
        </SectionCard>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/agents")}
          disabled={create.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={!canSubmit || create.isPending}
          style={{ background: "var(--gradient-linear-3)", color: "#fff" }}
          className="border-transparent hover:opacity-90 transition-opacity"
        >
          {create.isPending ? (
            <>
              <Spinner className="h-4 w-4" />
              Creating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Create agent
            </>
          )}
        </Button>
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
}
