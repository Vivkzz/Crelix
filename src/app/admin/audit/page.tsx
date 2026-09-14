"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
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
import { ScrollText } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleString() : "—";

export default function AdminAuditPage() {
  const [limit, setLimit] = useState(50);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-audit", limit],
    queryFn: () => api<any>(`/api/admin/audit?limit=${limit}`),
  });

  const logs = data?.logs ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Audit log" description="Recent admin and system actions." />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Limit</span>
        <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={ScrollText} title="Couldn't load audit log" />}

      {!isLoading && !isError && (
        logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No audit events" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target type</TableHead>
                <TableHead>Target ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-muted-foreground">{fmtDate(l.createdAt)}</TableCell>
                  <TableCell className="font-mono text-xs">{l.actorUserId || "—"}</TableCell>
                  <TableCell>
                    <BadgePill color="var(--color-4)">{l.action}</BadgePill>
                  </TableCell>
                  <TableCell>{l.targetType || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{l.targetId || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}
    </div>
  );
}
