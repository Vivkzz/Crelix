"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { LifeBuoy, ChevronRight } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleString() : "—";

const STATUS_COLOR: Record<string, string> = {
  open: "var(--color-2)",
  replied: "var(--color-3)",
  closed: "var(--color-5)",
};

export default function AdminTicketsPage() {
  const [status, setStatus] = useState("ALL");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-tickets", status],
    queryFn: () => api<any>(`/api/admin/tickets?status=${status === "ALL" ? "" : status}`),
  });

  const tickets = data?.tickets ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Tickets" description="Respond to and resolve support tickets." />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="replied">Replied</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={LifeBuoy} title="Couldn't load tickets" />}

      {!isLoading && !isError && (
        tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No tickets" description="Nothing matches this filter." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t: any) => (
                <TicketRow key={t.id} ticket={t} />
              ))}
            </TableBody>
          </Table>
        )
      )}
    </div>
  );
}

function TicketRow({ ticket }: { ticket: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");

  const patch = useMutation({
    mutationFn: (b: any) =>
      api(`/api/admin/tickets/${ticket.id}`, { method: "PATCH", body: JSON.stringify(b) }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      setReply("");
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-foreground/5" onClick={() => setOpen((o) => !o)}>
        <TableCell>
          <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
        </TableCell>
        <TableCell className="font-medium">{ticket.subject || "—"}</TableCell>
        <TableCell>{ticket.type || "—"}</TableCell>
        <TableCell>{ticket.user?.email || "—"}</TableCell>
        <TableCell>
          <BadgePill color={STATUS_COLOR[(ticket.status || "").toLowerCase()]}>
            {ticket.status || "—"}
          </BadgePill>
        </TableCell>
        <TableCell className="text-muted-foreground">{fmtDate(ticket.updatedAt || ticket.createdAt)}</TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30">
            <div className="space-y-3 p-2">
              <div>
                <Label>Message</Label>
                <p className="mt-1 whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm">
                  {ticket.message || "—"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Reply</Label>
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="Type a reply" />
              </div>
              <div className="flex gap-2">
                <Button disabled={patch.isPending || !reply.trim()} onClick={() => patch.mutate({ reply })}>
                  {patch.isPending ? "Sending…" : "Send reply"}
                </Button>
                <Button
                  variant="outline"
                  disabled={patch.isPending || ticket.status === "closed"}
                  onClick={() => patch.mutate({ status: "closed" })}
                >
                  Close ticket
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
