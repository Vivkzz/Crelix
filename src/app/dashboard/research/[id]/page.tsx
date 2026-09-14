"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Trash2,
  Download,
  FileJson,
  ExternalLink,
  Newspaper,
  Users,
  Tag,
  StickyNote,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";

type Research = {
  id: string;
  userId: string;
  topic: string;
  status: string;
  data?: string;
  notes?: string;
  bookmarked: boolean;
  createdAt: string;
};

type ParsedData = {
  topic?: string;
  summary?: string;
  competitors?: { name: string; url: string; snippet?: string }[];
  keywords?: string[];
  sources?: { title: string; url: string; source?: string }[];
  news?: { title: string; url: string; points?: number }[];
  markdown?: string;
};

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
function sanitize(s: string): string {
  return (s || "research").replace(/[^\w.-]+/g, "_");
}

export default function ResearchDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["research", id],
    queryFn: () => api<{ research: Research }>(`/api/dashboard/research/${id}`),
    enabled: !!id,
  });

  const research = data?.research;

  const parsed = useMemo<ParsedData | null>(() => {
    if (!research?.data) return null;
    try {
      return JSON.parse(research.data) as ParsedData;
    } catch {
      return null;
    }
  }, [research]);

  // Notes: sync once per loaded research id (handles param changes without remount).
  const [notes, setNotes] = useState("");
  const [notesId, setNotesId] = useState<string | null>(null);
  useEffect(() => {
    if (research && research.id !== notesId) {
      setNotes(research.notes || "");
      setNotesId(research.id);
    }
  }, [research, notesId]);

  const notesM = useMutation({
    mutationFn: (b: { notes: string }) =>
      api<{ research: Research }>(`/api/dashboard/research/${id}`, {
        method: "PATCH",
        body: JSON.stringify(b),
      }),
    onSuccess: () => {
      toast.success("Notes saved");
      qc.invalidateQueries({ queryKey: ["research", id] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save notes"),
  });

  function saveNotes() {
    if (research && notes !== (research.notes || "")) {
      notesM.mutate({ notes });
    }
  }

  const bookmarkM = useMutation({
    mutationFn: (b: { bookmarked: boolean }) =>
      api<{ research: Research }>(`/api/dashboard/research/${id}`, {
        method: "PATCH",
        body: JSON.stringify(b),
      }),
    onMutate: async (b) => {
      await qc.cancelQueries({ queryKey: ["research", id] });
      const prev = qc.getQueryData<{ research: Research }>(["research", id]);
      if (prev) {
        qc.setQueryData(["research", id], {
          research: { ...prev.research, bookmarked: b.bookmarked },
        });
      }
      return { prev };
    },
    onError: (_e, _b, ctx) => {
      if (ctx?.prev) qc.setQueryData(["research", id], ctx.prev);
      toast.error("Could not update bookmark");
    },
    onSuccess: () => {
      toast.success("Bookmark updated");
      qc.invalidateQueries({ queryKey: ["research"] });
    },
  });

  const delM = useMutation({
    mutationFn: () => api(`/api/dashboard/research/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Research deleted");
      qc.invalidateQueries({ queryKey: ["research"] });
      router.push("/dashboard/research");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const topic = research?.topic || "Research";

  function exportMarkdown() {
    downloadBlob(`${sanitize(topic)}.md`, parsed?.markdown || "", "text/markdown");
  }
  function exportJson() {
    downloadBlob(`${sanitize(topic)}.json`, JSON.stringify(parsed || {}, null, 2), "application/json");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title={topic}
        description={research ? `Started ${formatDistanceToNow(new Date(research.createdAt), { addSuffix: true })}` : "Research report"}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={research?.bookmarked ? "Remove bookmark" : "Add bookmark"}
              onClick={() => bookmarkM.mutate({ bookmarked: !research?.bookmarked })}
              disabled={!research || bookmarkM.isPending}
              style={research?.bookmarked ? { color: "var(--color-5)" } : undefined}
            >
              <Star className="h-4 w-4" fill={research?.bookmarked ? "currentColor" : "none"} />
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/research">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={exportMarkdown} disabled={!parsed?.markdown}>
              <Download className="h-4 w-4" />
              Markdown
            </Button>
            <Button variant="outline" size="sm" onClick={exportJson} disabled={!parsed}>
              <FileJson className="h-4 w-4" />
              JSON
            </Button>
            <Button variant="destructive" size="sm" onClick={() => delM.mutate()} disabled={delM.isPending || !research}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load research."}
        </p>
      ) : !research ? (
        <EmptyState icon={Tag} title="Research not found" />
      ) : !parsed ? (
        <SectionCard title="Summary">
          <p className="text-sm text-muted-foreground">
            {research.status && research.status.toLowerCase() !== "complete"
              ? `Research is ${research.status}. Results will appear here once complete.`
              : "No research data available for this topic."}
          </p>
        </SectionCard>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <BadgePill color={statusColor(research.status)}>{research.status || "complete"}</BadgePill>
            {research.bookmarked && (
              <BadgePill color="var(--color-5)">
                <Star className="mr-1 h-3 w-3" fill="currentColor" />
                Bookmarked
              </BadgePill>
            )}
          </div>

          {/* Notes */}
          <SectionCard title="Notes" description="Your private notes for this research.">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Add your notes…"
              rows={4}
              className="resize-y"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={saveNotes} disabled={notesM.isPending}>
                {notesM.isPending ? <Spinner className="h-4 w-4" /> : <StickyNote className="h-4 w-4" />}
                Save notes
              </Button>
            </div>
          </SectionCard>

          {/* Summary */}
          {parsed.summary && (
            <SectionCard title="Summary" description="AI-generated summary of the topic.">
              <p className="text-sm leading-relaxed">{parsed.summary}</p>
            </SectionCard>
          )}

          {/* Keywords */}
          {parsed.keywords && parsed.keywords.length > 0 && (
            <SectionCard title="Keywords" description="Top terms across the research.">
              <div className="flex flex-wrap gap-2">
                {parsed.keywords.map((k, i) => (
                  <BadgePill key={`${k}-${i}`} color="var(--color-2)">
                    <Tag className="mr-1 h-3 w-3" />
                    {k}
                  </BadgePill>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Competitors */}
          {parsed.competitors && parsed.competitors.length > 0 && (
            <SectionCard title="Competitors" description="Related products and companies.">
              <div className="grid gap-3 sm:grid-cols-2">
                {parsed.competitors.map((c, i) => (
                  <a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-xl border border-border p-4 transition-colors hover:bg-foreground/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-medium">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {c.name}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {c.snippet && <p className="mt-1.5 text-xs text-muted-foreground">{c.snippet}</p>}
                  </a>
                ))}
              </div>
            </SectionCard>
          )}

          {/* News */}
          {parsed.news && parsed.news.length > 0 && (
            <SectionCard title="News" description="Recent coverage and mentions.">
              <div className="divide-y divide-border">
                {parsed.news.map((n, i) => (
                  <a
                    key={i}
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-foreground"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Newspaper className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{n.title}</span>
                    </span>
                    {typeof n.points === "number" && (
                      <BadgePill color="var(--color-1)">{n.points} pts</BadgePill>
                    )}
                  </a>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Sources */}
          {parsed.sources && parsed.sources.length > 0 && (
            <SectionCard title="Sources" description="Where this research came from.">
              <div className="divide-y divide-border">
                {parsed.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-foreground"
                  >
                    <span className="min-w-0 truncate text-sm">{s.title || s.url}</span>
                    {s.source && <BadgePill>{s.source}</BadgePill>}
                  </a>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Full markdown report */}
          {parsed.markdown && (
            <SectionCard title="Full report" description="Complete markdown report generated for this topic.">
              <div className="text-sm">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="mb-2 mt-6 text-xl font-semibold">{children}</h1>,
                    h2: ({ children }) => <h2 className="mb-2 mt-5 text-lg font-semibold">{children}</h2>,
                    h3: ({ children }) => <h3 className="mb-1 mt-4 text-base font-semibold">{children}</h3>,
                    p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
                    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    a: ({ children, href }) => (
                      <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4" style={{ color: "var(--color-2)" }}>
                        {children}
                      </a>
                    ),
                    code: ({ className, children }) => {
                      const isBlock = /language-/.test(className || "");
                      return isBlock ? (
                        <pre className="my-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                          <code>{children}</code>
                        </pre>
                      ) : (
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="my-2 border-l-2 border-border pl-3 italic text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {parsed.markdown}
                </ReactMarkdown>
              </div>
            </SectionCard>
          )}
        </>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}
