"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
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
import { Blocks, Trash2 } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleString() : "—";

const TYPE_COLOR: Record<string, string> = {
  flow: "var(--color-2)",
  pentest: "var(--color-5)",
  search: "var(--color-3)",
};

export default function AdminProjectsPage() {
  const qc = useQueryClient();
  const [type, setType] = useState("ALL");
  const [delId, setDelId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-projects", type],
    queryFn: () => api<any>(`/api/admin/projects?type=${type === "ALL" ? "" : type}`),
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/admin/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const projects = data?.projects ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Projects" description="All projects across the platform." />

      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All types</SelectItem>
          <SelectItem value="flow">Flow</SelectItem>
          <SelectItem value="pentest">Pentest</SelectItem>
          <SelectItem value="search">Search</SelectItem>
        </SelectContent>
      </Select>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={Blocks} title="Couldn't load projects" />}

      {!isLoading && !isError && (
        projects.length === 0 ? (
          <EmptyState icon={Blocks} title="No projects" description="No projects match this filter." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name || p.title || "—"}</TableCell>
                  <TableCell><BadgePill color={TYPE_COLOR[p.type]}>{p.type}</BadgePill></TableCell>
                  <TableCell>{p.status || "—"}</TableCell>
                  <TableCell>{p.user?.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(p.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDelId(p.id)}>
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
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>This will permanently remove the project. This cannot be undone.</DialogDescription>
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
