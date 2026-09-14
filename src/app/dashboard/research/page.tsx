"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
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

function statusColor(status: string): string | undefined {
  const s = (status || "").toLowerCase();
  if (["complete", "completed", "ready", "done", "success"].includes(s)) return "var(--color-1)";
  if (["processing", "running", "queued", "pending", "in_progress"].includes(s)) return "var(--color-2)";
  if (["failed", "error"].includes(s)) return "var(--color-5)";
  if (["draft", "new", "init"].includes(s)) return "var(--color-3)";
  return undefined;
}

export default function ResearchListPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["research"],
    queryFn: () => api<{ research: Research[] }>("/api/dashboard/research"),
  });

  const all = data?.research ?? [];
  const filtered = useMemo(
    () => (bookmarkedOnly ? all.filter((r) => r.bookmarked) : all),
    [all, bookmarkedOnly]
  );

  const bookmarkM = useMutation({
    mutationFn: (b: { id: string; bookmarked: boolean }) =>
      api<{ research: Research }>(`/api/dashboard/research/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ bookmarked: b.bookmarked }),
      }),
    onMutate: async (b) => {
      await qc.cancelQueries({ queryKey: ["research"] });
      const prev = qc.getQueryData<{ research: Research[] }>(["research"]);
      if (prev) {
        qc.setQueryData(["research"], {
          research: prev.research.map((r) =>
            r.id === b.id ? { ...r, bookmarked: b.bookmarked } : r
          ),
        });
      }
      return { prev };
    },
    onError: (_e, _b, ctx) => {
      if (ctx?.prev) qc.setQueryData(["research"], ctx.prev);
      toast.error("Could not update bookmark");
    },
    onSuccess: () => toast.success("Bookmark updated"),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Research"
        description="Market and competitor research you have run."
        action={
          <Button asChild>
            <Link href="/dashboard/research/new">
              <Plus className="h-4 w-4" />
              New research
            </Link>
          </Button>
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
      ) : all.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No research yet"
          description="Run research on a topic to gather insights, competitors and sources."
          action={
            <Button asChild>
              <Link href="/dashboard/research/new">
                <Plus className="h-4 w-4" />
                New research
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant={bookmarkedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setBookmarkedOnly((v) => !v)}
            >
              <Star className="h-4 w-4" />
              {bookmarkedOnly ? "Bookmarked only" : "Filter bookmarked"}
            </Button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookmarked research yet.</p>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  onClick={() => router.push(`/dashboard/research/${r.id}`)}
                  className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-foreground/5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{r.topic || "Untitled research"}</span>
                      <BadgePill color={statusColor(r.status)}>{r.status || "draft"}</BadgePill>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={r.bookmarked ? "Remove bookmark" : "Add bookmark"}
                    onClick={(e) => {
                      e.stopPropagation();
                      bookmarkM.mutate({ id: r.id, bookmarked: !r.bookmarked });
                    }}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10"
                    style={r.bookmarked ? { color: "var(--color-5)" } : undefined}
                  >
                    <Star className="h-4 w-4" fill={r.bookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}
