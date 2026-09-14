"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner } from "@/components/dashboard/ui";
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
import { Inbox, Trash2 } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleString() : "—";

export default function AdminInboxPage() {
  const qc = useQueryClient();
  const [delId, setDelId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-inbox"],
    queryFn: () => api<any>("/api/admin/inbox"),
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/admin/inbox/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Message deleted");
      qc.invalidateQueries({ queryKey: ["admin-inbox"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const messages = data?.messages ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Inbox" description="Messages submitted through the contact form." />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={Inbox} title="Couldn't load inbox" />}

      {!isLoading && !isError && (
        messages.length === 0 ? (
          <EmptyState icon={Inbox} title="No messages" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name || "—"}</TableCell>
                  <TableCell>{m.email || "—"}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{m.message || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(m.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDelId(m.id)}>
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
            <DialogTitle>Delete this message?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
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
