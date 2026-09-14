"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Bot, Plus, KeyRound, ArrowRight, Trash2, Star, Copy, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

type Agent = {
  id: string;
  name: string;
  systemPrompt?: string;
  provider: "playbook" | "openai" | "anthropic";
  model?: string;
  playbookId?: string;
  tools: string[];
  tags: string[];
  favorited: boolean;
  createdAt: string;
  updatedAt: string;
};

type Playbook = { id: string; name: string; tools: string[] };

const PROVIDER_BADGE: Record<Agent["provider"], { label: string; color: string }> = {
  playbook: { label: "Playbook", color: "var(--color-2)" },
  openai: { label: "OpenAI", color: "#10b981" },
  anthropic: { label: "Anthropic", color: "#f97316" },
};

const GRADIENT_BTN = {
  style: { background: "var(--gradient-linear-3)", color: "#fff" },
  className: "border-transparent hover:opacity-90 transition-opacity",
};

const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(s),
  );

function ProviderBadge({ provider }: { provider: Agent["provider"] }) {
  const { label, color } = PROVIDER_BADGE[provider];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export default function AgentsListPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Always fetch the full, unfiltered list so the tag filter shows every tag.
  const { data: allAgents } = useQuery({
    queryKey: ["agents", "all-tags"],
    queryFn: () => api<{ agents: Agent[] }>("/api/dashboard/agents").then((r) => r.agents),
  });

  const uniqueTags = useMemo(
    () => Array.from(new Set((allAgents ?? []).flatMap((a) => a.tags ?? []))).sort(),
    [allAgents],
  );

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["agents", tagFilter, onlyFavorite],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (tagFilter !== "all") sp.set("tag", tagFilter);
      if (onlyFavorite) sp.set("favorite", "1");
      const qs = sp.toString();
      return api<{ agents: Agent[] }>(`/api/dashboard/agents${qs ? `?${qs}` : ""}`).then(
        (r) => r.agents,
      );
    },
  });

  const { data: playbooks } = useQuery({
    queryKey: ["agent-playbooks"],
    queryFn: () =>
      api<{ playbooks: Playbook[] }>("/api/dashboard/agents/playbooks").then((r) => r.playbooks),
  });

  const playbookOf = (id?: string) => playbooks?.find((p) => p.id === id);

  const del = useMutation({
    mutationFn: (id: string) =>
      api<{ ok: true }>(`/api/dashboard/agents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent deleted");
      setDeletingId(null);
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Failed to delete agent");
      setDeletingId(null);
    },
  });

  const onDelete = (a: Agent) => {
    if (!window.confirm(`Delete "${a.name}"? This cannot be undone.`)) return;
    setDeletingId(a.id);
    del.mutate(a.id);
  };

  const favM = useMutation({
    mutationFn: (a: Agent) =>
      api<{ agent: Agent }>(`/api/dashboard/agents/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ favorited: !a.favorited }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to update favorite"),
  });

  const dupM = useMutation({
    mutationFn: (id: string) =>
      api<{ agent: Agent }>(`/api/dashboard/agents/${id}/duplicate`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent duplicated");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to duplicate agent"),
  });

  const importM = useMutation({
    mutationFn: (config: unknown) =>
      api<{ agent: Agent }>("/api/dashboard/agents/import", {
        method: "POST",
        body: JSON.stringify(config),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setImportOpen(false);
      setImportFile(null);
      toast.success("Agent imported");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to import agent"),
  });

  async function doImport() {
    if (!importFile) {
      toast.error("Choose a JSON file to import");
      return;
    }
    try {
      const text = await importFile.text();
      const parsed = JSON.parse(text);
      importM.mutate(parsed);
    } catch {
      toast.error("That file is not valid JSON");
    }
  }

  const list = agents ?? [];
  const filtering = tagFilter !== "all" || onlyFavorite;
  const hasAgents = (allAgents ?? []).length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ background: "var(--gradient-linear-3)" }}
          >
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Autonomous agents that research, build, and audit — keyless or with your own AI key.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import config
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/agents/keys">
              <KeyRound className="h-4 w-4" />
              API keys
            </Link>
          </Button>
          <Button asChild {...GRADIENT_BTN}>
            <Link href="/dashboard/agents/new">
              <Plus className="h-4 w-4" />
              New agent
            </Link>
          </Button>
        </div>
      </div>

      {(allAgents ?? []).length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {uniqueTags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={onlyFavorite ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyFavorite((v) => !v)}
            aria-pressed={onlyFavorite}
          >
            <Star
              className={
                onlyFavorite ? "h-4 w-4 fill-current text-amber-400" : "h-4 w-4"
              }
            />
            Favorites
          </Button>
          {(tagFilter !== "all" || onlyFavorite) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTagFilter("all");
                setOnlyFavorite(false);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load agents."}
        </p>
      ) : list.length === 0 ? (
        filtering && hasAgents ? (
          <EmptyState
            icon={Bot}
            title="No agents match this filter"
            description="Try a different tag, toggle favorites off, or clear the filter to see all agents."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setTagFilter("all");
                  setOnlyFavorite(false);
                }}
              >
                Clear filter
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Bot}
            title="No agents yet"
            description="Create your first agent to research, build, or audit autonomously."
            action={
              <Button asChild {...GRADIENT_BTN}>
                <Link href="/dashboard/agents/new">
                  <Plus className="h-4 w-4" />
                  Create your first agent
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => {
            const pb = playbookOf(a.playbookId);
            const toolCount = a.provider === "playbook" ? (pb?.tools.length ?? 0) : a.tools.length;
            return (
              <Card key={a.id} className="dash-card gap-0 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-base font-semibold tracking-tight">{a.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => favM.mutate(a)}
                      disabled={favM.isPending && favM.variables?.id === a.id}
                      aria-label={a.favorited ? `Unfavorite ${a.name}` : `Favorite ${a.name}`}
                      aria-pressed={a.favorited}
                    >
                      <Star
                        className={
                          a.favorited
                            ? "h-4 w-4 fill-current text-amber-400"
                            : "h-4 w-4 text-muted-foreground"
                        }
                      />
                    </Button>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <ProviderBadge provider={a.provider} />
                  {a.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>

                <dl className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      {a.provider === "playbook" ? "Playbook" : "Model"}
                    </dt>
                    <dd className="truncate text-right font-mono text-xs text-foreground/80">
                      {a.provider === "playbook" ? pb?.name || "—" : a.model || "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Created</dt>
                    <dd className="text-xs text-muted-foreground">{fmtDate(a.createdAt)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Tools</dt>
                    <dd>
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {toolCount} {toolCount === 1 ? "tool" : "tools"}
                      </Badge>
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex items-center gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/dashboard/agents/${a.id}`}>
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dupM.mutate(a.id)}
                    disabled={dupM.isPending && dupM.variables === a.id}
                    aria-label={`Duplicate ${a.name}`}
                  >
                    {dupM.isPending && dupM.variables === a.id ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(a)}
                    disabled={deletingId === a.id}
                    aria-label={`Delete ${a.name}`}
                  >
                    {deletingId === a.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import agent config</DialogTitle>
            <DialogDescription>
              Select a previously exported agent JSON file to import as a new agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm hover:file:bg-muted"
            />
            {importFile && <p className="text-xs text-muted-foreground">{importFile.name}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doImport} disabled={importM.isPending || !importFile}>
              {importM.isPending ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster richColors position="top-center" />
    </div>
  );
}
