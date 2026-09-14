"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Blocks } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";

type Project = {
  id: string;
  userId: string;
  type: string;
  name: string;
  prompt?: string;
  status: string;
  resultUrl?: string;
  resultHtml?: string;
  meta?: unknown;
  createdAt: string;
  updatedAt: string;
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

export default function ProjectsListPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api<{ projects: Project[] }>("/api/dashboard/projects"),
  });

  const projects = data?.projects ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Projects"
        description="Sites and pages you have generated with Flow."
        action={
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="h-4 w-4" />
              New project
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
          {error instanceof Error ? error.message : "Failed to load projects."}
        </p>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Blocks}
          title="No projects yet"
          description="Generate your first site with Flow from a single prompt."
          action={
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="h-4 w-4" />
                New project
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects by name…"
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects match “{query}”.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{p.name || "Untitled"}</TableCell>
                      <TableCell>
                        <BadgePill color={colorFor(p.type || "flow")}>{p.type || "flow"}</BadgePill>
                      </TableCell>
                      <TableCell>
                        <BadgePill color={statusColor(p.status)}>{p.status || "draft"}</BadgePill>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}
