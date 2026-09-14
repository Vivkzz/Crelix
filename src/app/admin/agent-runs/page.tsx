"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { History, Trash2, X } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  completed: "var(--color-1)",
  failed: "var(--color-5)",
  running: "var(--color-2)",
};

const truncate = (s?: string | null, n = 60) =>
  s ? (s.length > n ? s.slice(0, n) + "…" : s) : "—";

export default function AdminAgentRunsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [delId, setDelId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-agent-runs", status, userId, agentId],
    queryFn: () =>
      api<{ runs: any[] }>(
        `/api/admin/agent-runs?status=${encodeURIComponent(status)}&userId=${encodeURIComponent(userId)}&agentId=${encodeURIComponent(agentId)}`
      ),
  });

  const cancel = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/agent-runs/${id}`, { method: "PATCH", body: JSON.stringify({ action: "cancel" }) }),
    onSuccess: () => {
      toast.success("Run cancelled");
      qc.invalidateQueries({ queryKey: ["admin-agent-runs"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/admin/agent-runs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Run deleted");
      qc.invalidateQueries({ queryKey: ["admin-agent-runs"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const runs = data?.runs ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="All agent runs" description="Monitor, cancel, and remove agent runs across the platform." />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Filter by user id"
          className="w-56"
        />
        <Input
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          placeholder="Filter by agent id"
          className="w-56"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && (
        <EmptyState icon={History} title="Couldn't load runs" description="Try refreshing the page." />
      )}

      {!isLoading && !isError && (
        runs.length === 0 ? (
          <EmptyState icon={History} title="No runs found" description="Try adjusting your filters." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Input</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-[16rem]">
                    <Link href={`/dashboard/agents/runs/${r.id}`} className="hover:underline">
                      <span className="line-clamp-1 text-muted-foreground">{truncate(r.input)}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <BadgePill color={STATUS_COLOR[r.status]}>{r.status}</BadgePill>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.provider}{r.model ? ` · ${r.model}` : ""}
                  </TableCell>
                  <TableCell>{r.agentName || "—"}</TableCell>
                  <TableCell>{r.userEmail || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === "running" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Cancel"
                          onClick={() => cancel.mutate(r.id)}
                          disabled={cancel.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => setDelId(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}

      <Dialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this run?</DialogTitle>
            <DialogDescription>This will permanently remove the run and its notes. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => delId && remove.mutate(delId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
