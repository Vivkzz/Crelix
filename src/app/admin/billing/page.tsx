"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { formatPrice } from "@/lib/constants";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { CreditCard } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleDateString() : "—";

const SUB_STATUS_COLOR: Record<string, string> = {
  active: "var(--color-1)",
  trialing: "var(--color-2)",
  past_due: "var(--color-5)",
  canceled: "var(--color-5)",
  cancelled: "var(--color-5)",
  incomplete: "var(--color-3)",
  paid: "var(--color-1)",
  open: "var(--color-2)",
  void: "var(--color-5)",
  uncollectible: "var(--color-5)",
};

export default function AdminBillingPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-billing"],
    queryFn: () => api<any>("/api/admin/billing"),
  });

  const subs = data?.subscriptions ?? [];
  const invoices = data?.invoices ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Billing" description="Subscriptions and invoices across the platform." />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={CreditCard} title="Couldn't load billing" />}

      {!isLoading && !isError && (
        <>
          <SectionCard title="Active subscriptions" description="Recurring plans currently in effect.">
            {subs.length === 0 ? (
              <EmptyState icon={CreditCard} title="No subscriptions" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current period end</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.user?.email || "—"}</TableCell>
                      <TableCell>{s.plan}</TableCell>
                      <TableCell>
                        <BadgePill color={SUB_STATUS_COLOR[(s.status || "").toLowerCase()]}>
                          {s.status || "—"}
                        </BadgePill>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(s.currentPeriodEnd)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>

          <SectionCard title="Invoices" description="Recent billing records.">
            {invoices.length === 0 ? (
              <EmptyState icon={CreditCard} title="No invoices" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.user?.email || "—"}</TableCell>
                      <TableCell>{inv.plan || "—"}</TableCell>
                      <TableCell>{formatPrice(inv.amount ?? 0)}</TableCell>
                      <TableCell>
                        <BadgePill color={SUB_STATUS_COLOR[(inv.status || "").toLowerCase()]}>
                          {inv.status || "—"}
                        </BadgePill>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(inv.date || inv.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
