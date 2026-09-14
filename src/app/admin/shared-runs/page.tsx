"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SharedRun = {
  id: string;
  agentId: string;
  agentName: string | null;
  userEmail: string | null;
  shareToken: string | null;
  createdAt: string;
  status: string;
};

function statusStyle(status: string): React.CSSProperties {
  const s = (status || "").toLowerCase();
  let color = "var(--muted-foreground)";
  if (["completed", "complete", "done", "success"].includes(s)) color = "var(--color-1)";
  else if (["failed", "error"].includes(s)) color = "var(--color-5)";
  else if (["running", "processing", "pending", "queued", "in_progress"].includes(s)) color = "var(--color-2)";
  return { background: `color-mix(in srgb, ${color} 14%, transparent)`, color, borderColor: "transparent" };
}

export default function AdminSharedRunsPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-shared-runs"],
    queryFn: () => api<{ runs: SharedRun[] }>(`/api/admin/shared-runs`),
  });

  const revoke = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/shared-runs`, { method: "PATCH", body: JSON.stringify({ id, revoke: true }) }),
    onSuccess: () => {
      toast.success("Share revoked");
      qc.invalidateQueries({ queryKey: ["admin-shared-runs"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to revoke"),
  });

  const runs = data?.runs ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Shared runs" description="Moderate publicly shared agent runs." />

      <SectionCard title="Shared runs" description="Runs with an active public share link.">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isError ? (
          <EmptyState icon={ShieldOff} title="Couldn't load shared runs" />
        ) : runs.length === 0 ? (
          <EmptyState
            icon={ShieldOff}
            title="No shared runs"
            description="No agent runs are currently shared publicly."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/agents/runs/${r.id}`}
                        className="font-mono text-xs hover:underline"
                      >
                        {r.id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{r.agentName || "—"}</TableCell>
                    <TableCell className="text-sm">{r.userEmail || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize" style={statusStyle(r.status)}>
                        {r.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={revoke.isPending}
                        onClick={() => revoke.mutate(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <Toaster />
    </div>
  );
}
