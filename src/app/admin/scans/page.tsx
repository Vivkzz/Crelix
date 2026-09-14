"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
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
import { ShieldCheck, Trash2 } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleString() : "—";

function scoreColor(score?: number | null) {
  if (score == null) return undefined;
  if (score >= 80) return "var(--color-1)";
  if (score >= 50) return "var(--color-2)";
  return "var(--color-5)";
}

const STATUS_COLOR: Record<string, string> = {
  completed: "var(--color-1)",
  running: "var(--color-2)",
  failed: "var(--color-5)",
  pending: "var(--color-3)",
  queued: "var(--color-3)",
};

export default function AdminScansPage() {
  const qc = useQueryClient();
  const [delId, setDelId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-scans"],
    queryFn: () => api<any>("/api/admin/scans"),
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/admin/scans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Scan deleted");
      qc.invalidateQueries({ queryKey: ["admin-scans"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const scans = data?.scans ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Scans" description="Security scans run across all users." />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={ShieldCheck} title="Couldn't load scans" />}

      {!isLoading && !isError && (
        scans.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No scans" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.targetUrl || s.target || "—"}</TableCell>
                  <TableCell>
                    {s.score != null ? <BadgePill color={scoreColor(s.score)}>{s.score}</BadgePill> : "—"}
                  </TableCell>
                  <TableCell>
                    <BadgePill color={STATUS_COLOR[(s.status || "").toLowerCase()]}>
                      {s.status || "—"}
                    </BadgePill>
                  </TableCell>
                  <TableCell>{s.user?.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(s.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDelId(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>Delete this scan?</DialogTitle>
            <DialogDescription>This will permanently remove the scan record.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={del.isPending} onClick={() => delId && del.mutate(delId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
