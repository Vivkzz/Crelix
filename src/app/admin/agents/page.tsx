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
import { Bot, Search, Star, Trash2 } from "lucide-react";

export default function AdminAgentsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [userId, setUserId] = useState("");
  const [delId, setDelId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-agents", q, userId],
    queryFn: () =>
      api<{ agents: any[] }>(
        `/api/admin/agents?q=${encodeURIComponent(q)}&userId=${encodeURIComponent(userId)}`
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/admin/agents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Agent deleted");
      qc.invalidateQueries({ queryKey: ["admin-agents"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const agents = data?.agents ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="All agents" description="Browse, filter, and remove agents across the platform." />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search agent name"
            className="w-64 pl-8"
          />
        </div>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Filter by user id"
          className="w-64"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && (
        <EmptyState icon={Bot} title="Couldn't load agents" description="Try refreshing the page." />
      )}

      {!isLoading && !isError && (
        agents.length === 0 ? (
          <EmptyState icon={Bot} title="No agents found" description="Try adjusting your filters." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Fav</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/agents/${a.id}`} className="hover:underline">
                      {a.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <BadgePill>{a.provider}</BadgePill>
                  </TableCell>
                  <TableCell>{a.userEmail || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(a.tags ?? []).map((t: string) => (
                        <BadgePill key={t}>{t}</BadgePill>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {a.favorited ? (
                      <Star className="h-4 w-4 fill-current text-amber-500" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => setDelId(a.id)}
                    >
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
            <DialogTitle>Delete this agent?</DialogTitle>
            <DialogDescription>
              This will also remove its runs, schedules, and saved prompts. This cannot be undone.
            </DialogDescription>
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
