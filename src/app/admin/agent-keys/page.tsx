"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";

type AdminKey = {
  id: string;
  label: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  userEmail: string | null;
};

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleString() : "—";

export default function AdminAgentKeysPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-agent-keys"],
    queryFn: () => api<{ keys: AdminKey[] }>("/api/admin/agent-keys"),
  });

  const revoke = useMutation({
    mutationFn: (id: string) =>
      api<{ ok: true }>("/api/admin/agent-keys", {
        method: "PATCH",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      toast.success("Key revoked");
      qc.invalidateQueries({ queryKey: ["admin-agent-keys"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to revoke key"),
  });

  const keys = data?.keys ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Agent API keys"
        description="Every eai_ key across the platform. Revoke a key to immediately block programmatic access."
      />

      <SectionCard title="All keys" description="Ordered by creation date, newest first.">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <EmptyState icon={KeyRound} title="Couldn't load keys" />}
        {!isLoading && !isError && (
          keys.length === 0 ? (
            <EmptyState icon={KeyRound} title="No API keys" description="No eai_ keys have been issued yet." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Prefix</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.label || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{k.prefix}…</TableCell>
                      <TableCell>{k.userEmail || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {k.lastUsedAt ? formatDistanceToNow(new Date(k.lastUsedAt), { addSuffix: true }) : "Never"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(k.createdAt)}</TableCell>
                      <TableCell>
                        {k.revokedAt ? (
                          <Badge variant="secondary">Revoked</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!k.revokedAt && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={revoke.isPending && revoke.variables === k.id}
                            onClick={() => {
                              if (window.confirm(`Revoke key "${k.label || k.prefix}"? This immediately blocks its use.`)) {
                                revoke.mutate(k.id);
                              }
                            }}
                          >
                            {revoke.isPending && revoke.variables === k.id ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        )}
      </SectionCard>

      <Toaster richColors position="top-center" />
    </div>
  );
}
