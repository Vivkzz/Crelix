"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  Spinner,
} from "@/components/dashboard/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function AdminAgentCreditsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-credit-spend"],
    queryFn: () => api<{ data: any }>("/api/admin/agent-credits"),
  });

  const d = data?.data;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Agent credit spend"
        description="Credits spent on agent runs across the platform."
      />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Activity}
          title="Couldn't load credit spend"
          description="The endpoint returned an error. Try refreshing."
        />
      )}

      {d && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total spend" value={d.totalSpend ?? 0} accent="var(--color-4)" />
            <StatCard label="Transactions" value={d.txnCount ?? 0} accent="var(--color-2)" />
          </div>

          <SectionCard
            title="Spend by user"
            description="Total credits spent on agent runs per user."
          >
            {d.byUser && d.byUser.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.byUser.map((u: any) => (
                    <TableRow key={u.userId}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.name || "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {u.spend}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={Activity} title="No spend yet" />
            )}
          </SectionCard>

          <SectionCard
            title="Recent transactions"
            description="Latest agent.run credit movements."
          >
            {d.txns && d.txns.length > 0 ? (
              <div className="divide-y divide-border">
                {d.txns.map((t: any) => {
                  const positive = (t.delta ?? 0) >= 0;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {t.refId || "agent.run"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                          {typeof t.balanceAfter === "number" && (
                            <> · balance {t.balanceAfter}</>
                          )}
                        </div>
                      </div>
                      <div
                        className="shrink-0 text-sm font-semibold tabular-nums"
                        style={{ color: positive ? "var(--color-1)" : "var(--color-5)" }}
                      >
                        {positive ? "+" : "−"}
                        {Math.abs(t.delta ?? 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Activity} title="No transactions yet" />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
