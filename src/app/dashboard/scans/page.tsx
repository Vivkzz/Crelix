"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";

type Scan = {
  id: string;
  userId: string;
  projectId?: string;
  targetUrl: string;
  status: string;
  findings?: string;
  score?: number | null;
  createdAt: string;
};

function scoreColor(score?: number | null): string | undefined {
  if (score == null) return undefined;
  if (score >= 80) return "var(--color-1)";
  if (score >= 50) return "#f59e0b";
  return "var(--color-5)";
}
function statusColor(status: string): string | undefined {
  const s = (status || "").toLowerCase();
  if (["complete", "completed", "ready", "done", "success"].includes(s)) return "var(--color-1)";
  if (["processing", "running", "queued", "pending", "in_progress"].includes(s)) return "var(--color-2)";
  if (["failed", "error"].includes(s)) return "var(--color-5)";
  return undefined;
}

export default function ScansListPage() {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["scans"],
    queryFn: () => api<{ scans: Scan[] }>("/api/dashboard/scans"),
  });

  const scans = data?.scans ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Scans"
        description="Security audits you have run against URLs."
        action={
          <Button asChild>
            <Link href="/dashboard/scans/new">
              <Plus className="h-4 w-4" />
              New scan
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
          {error instanceof Error ? error.message : "Failed to load scans."}
        </p>
      ) : scans.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No scans yet"
          description="Audit a URL to find security and content issues."
          action={
            <Button asChild>
              <Link href="/dashboard/scans/new">
                <Plus className="h-4 w-4" />
                New scan
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((s) => (
                <TableRow
                  key={s.id}
                  onClick={() => router.push(`/dashboard/scans/${s.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="max-w-[280px] truncate font-medium">
                    {s.targetUrl}
                  </TableCell>
                  <TableCell>
                    {s.score != null ? (
                      <BadgePill color={scoreColor(s.score)}>{s.score}</BadgePill>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <BadgePill color={statusColor(s.status)}>{s.status || "pending"}</BadgePill>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}
