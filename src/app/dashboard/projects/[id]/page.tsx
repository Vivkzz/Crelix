"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Pencil,
  Download,
  Copy,
  Trash2,
  RefreshCw,
  History,
  Code2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";

type ProjectVersion = {
  id: string;
  projectId: string;
  version: number;
  html?: string | null;
  snapshot?: unknown;
  createdAt: string;
};

type ProjectDetail = {
  id: string;
  userId: string;
  type: string;
  name: string;
  prompt?: string;
  status: string;
  resultUrl?: string;
  resultHtml?: string | null;
  meta?: unknown;
  createdAt: string;
  updatedAt: string;
  versions: ProjectVersion[];
};

const TOKEN_COLORS = ["#91e500", "#12bcff", "#2f44ff", "#8200df", "#df006c"];
function colorFor(s: string) {
  let h = 0;
  for (const c of s || "x") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TOKEN_COLORS[h % TOKEN_COLORS.length];
}
function statusColor(status: string): string | undefined {
  const s = (status || "").toLowerCase();
  if (["complete", "completed", "ready", "done", "success"].includes(s)) return "var(--color-1)";
  if (["processing", "running", "queued", "pending", "in_progress"].includes(s)) return "var(--color-2)";
  if (["failed", "error"].includes(s)) return "var(--color-5)";
  if (["draft", "new", "init"].includes(s)) return "var(--color-3)";
  return undefined;
}

function downloadBlob(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const router = useRouter();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () => api<{ project: ProjectDetail }>(`/api/dashboard/projects/${id}`),
    enabled: !!id,
  });

  const project = data?.project;

  const renameM = useMutation({
    mutationFn: (b: { name: string }) =>
      api<{ project: ProjectDetail }>(`/api/dashboard/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(b),
      }),
    onSuccess: () => {
      toast.success("Renamed");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Rename failed"),
  });

  const regenM = useMutation({
    mutationFn: () =>
      api<{ project: ProjectDetail }>("/api/dashboard/projects/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: project?.prompt || "", projectId: id }),
      }),
    onSuccess: () => {
      toast.success("Regenerated");
      setSelectedVersionId(null);
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Regeneration failed"),
  });

  const dupM = useMutation({
    mutationFn: () =>
      api<{ project: { id: string } }>(`/api/dashboard/projects/${id}/duplicate`, {
        method: "POST",
      }),
    onSuccess: (res) => {
      toast.success("Duplicated");
      qc.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/dashboard/projects/${res.project.id}`);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Duplicate failed"),
  });

  const delM = useMutation({
    mutationFn: () => api(`/api/dashboard/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["projects"] });
      router.push("/dashboard/projects");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const selectedVersion = project?.versions?.find((v) => v.id === selectedVersionId) || null;
  const previewHtml = selectedVersion
    ? selectedVersion.html || ""
    : project?.resultHtml || "";
  const safeName = (project?.name || "project").replace(/[^\w-]+/g, "_");

  function exportHtml() {
    downloadBlob(`${safeName}.html`, previewHtml, "text/html");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="h-9 max-w-sm text-2xl font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") renameM.mutate({ name: nameDraft.trim() || "Untitled" });
                  if (e.key === "Escape") setEditing(false);
                }}
              />
              <Button
                size="icon"
                onClick={() => renameM.mutate({ name: nameDraft.trim() || "Untitled" })}
                disabled={renameM.isPending}
                aria-label="Save name"
              >
                {renameM.isPending ? <Spinner className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setEditing(false)} aria-label="Cancel">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {project?.name || "Untitled"}
              </h1>
              {project && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Rename"
                  onClick={() => {
                    setNameDraft(project.name || "");
                    setEditing(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-sm text-muted-foreground">
              <Link href="/dashboard/projects">
                <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
                Projects
              </Link>
            </Button>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={exportHtml} disabled={!previewHtml}>
            <Download className="h-4 w-4" />
            Export HTML
          </Button>
          <Button variant="outline" onClick={() => dupM.mutate()} disabled={dupM.isPending}>
            {dupM.isPending ? <Spinner className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Duplicate
          </Button>
          <Button
            onClick={() => regenM.mutate()}
            disabled={regenM.isPending || !project}
          >
            {regenM.isPending ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            Regenerate
          </Button>
          <Button
            variant="destructive"
            onClick={() => delM.mutate()}
            disabled={delM.isPending || !project}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load project."}
        </p>
      ) : !project ? (
        <EmptyState icon={Code2} title="Project not found" />
      ) : (
        <>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <BadgePill color={colorFor(project.type || "flow")}>{project.type || "flow"}</BadgePill>
            <BadgePill color={statusColor(project.status)}>{project.status || "draft"}</BadgePill>
            <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          </div>

          {/* Prompt */}
          {project.prompt && (
            <SectionCard title="Prompt" description="What was used to generate this project.">
              <p className="whitespace-pre-wrap text-sm">{project.prompt}</p>
            </SectionCard>
          )}

          {/* Preview */}
          <SectionCard
            title="Live preview"
            description={
              selectedVersion
                ? `Viewing version ${selectedVersion.version}`
                : "Viewing current version"
            }
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={selectedVersionId === null ? "default" : "outline"}
                onClick={() => setSelectedVersionId(null)}
              >
                Current
              </Button>
              {(project.versions || []).map((v) => (
                <Button
                  key={v.id}
                  size="sm"
                  variant={selectedVersionId === v.id ? "default" : "outline"}
                  onClick={() => setSelectedVersionId(v.id)}
                >
                  v{v.version}
                </Button>
              ))}
            </div>

            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                sandbox="allow-same-origin"
                title="Project preview"
                className="h-[70vh] w-full rounded-xl border border-border bg-white"
              />
            ) : (
              <EmptyState
                icon={Code2}
                title="No preview yet"
                description="Regenerate to produce a preview."
                action={
                  <Button onClick={() => regenM.mutate()} disabled={regenM.isPending}>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                }
              />
            )}
          </SectionCard>

          {/* Version history */}
          <SectionCard title="Version history" description="Past saved versions of this project.">
            {project.versions && project.versions.length > 0 ? (
              <div className="divide-y divide-border">
                {project.versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Version {v.version}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedVersionId === v.id ? "default" : "outline"}
                      onClick={() => setSelectedVersionId(v.id)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No saved versions yet.</p>
            )}
          </SectionCard>
        </>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}
