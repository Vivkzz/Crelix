"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Check, FileText } from "lucide-react";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { PLAN_LIST, formatPrice, planById } from "@/lib/constants";

function formatDate(d: string | number | Date) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const GRADIENT_BTN = "hover:opacity-90";

export default function BillingPage() {
  const qc = useQueryClient();
  const overview = useQuery({
    queryKey: ["overview"],
    queryFn: () => api("/api/dashboard/overview"),
  });
  const billing = useQuery({
    queryKey: ["billing"],
    queryFn: () => api("/api/dashboard/billing"),
  });

  const upgrade = useMutation({
    mutationFn: (b: { planId: string }) =>
      api("/api/dashboard/billing/upgrade", {
        method: "POST",
        body: JSON.stringify(b),
      }),
    onSuccess: (_d, vars) => {
      const p = planById(vars.planId);
      toast.success(`Plan updated to ${p.name}`);
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["billing"] });
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to update plan"),
  });

  const loading = overview.isLoading || billing.isLoading;
  const currentPlanId: string = overview.data?.user?.plan || "FREE";
  const currentPrice = planById(currentPlanId).price;
  const sub = billing.data?.subscription;
  const invoices: any[] = billing.data?.invoices ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader
        title="Billing"
        description="Manage your subscription and view invoices."
        action={
          <span className="text-xs text-muted-foreground">Mock billing — no real charges</span>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading billing…
        </div>
      ) : overview.error || billing.error ? (
        <EmptyState
          icon={CreditCard}
          title="Couldn't load billing"
          description={((overview.error || billing.error) as Error).message}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_LIST.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const label = isCurrent
                ? "Current plan"
                : plan.price > currentPrice
                ? "Upgrade"
                : plan.price < currentPrice
                ? "Downgrade"
                : "Switch";
              return (
                <div
                  key={plan.id}
                  className="relative flex flex-col gap-3 rounded-xl border bg-card p-5"
                  style={
                    isCurrent
                      ? { borderColor: "var(--color-1)", boxShadow: "var(--shadow-card)" }
                      : { borderColor: "var(--border)" }
                  }
                >
                  {isCurrent && (
                    <span
                      className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={{ background: "var(--gradient-linear-3)" }}
                    >
                      <Check className="h-3 w-3" /> Current
                    </span>
                  )}
                  <div className="text-sm font-medium text-muted-foreground">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tracking-tight">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li>{plan.credits} credits / period</li>
                    <li>
                      {plan.seats === Infinity
                        ? "Unlimited seats"
                        : `${plan.seats} seat${plan.seats > 1 ? "s" : ""}`}
                    </li>
                  </ul>
                  <Button
                    className={`mt-auto ${GRADIENT_BTN}`}
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || upgrade.isPending}
                    onClick={() => upgrade.mutate({ planId: plan.id })}
                    style={
                      isCurrent
                        ? undefined
                        : { background: "var(--gradient-linear-3)", color: "#fff", border: "none" }
                    }
                  >
                    {label}
                  </Button>
                </div>
              );
            })}
          </div>

          {sub && (
            <SectionCard title="Active subscription" description="Your current recurring plan.">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span>
                  <span className="text-muted-foreground">Plan:</span> {planById(sub.plan).name}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Status:</span>
                  <BadgePill color={sub.status === "active" ? "var(--color-1)" : "var(--color-5)"}>
                    {sub.status}
                  </BadgePill>
                </span>
                {sub.currentPeriodEnd && (
                  <span>
                    <span className="text-muted-foreground">Renews:</span>{" "}
                    {formatDate(sub.currentPeriodEnd)}
                  </span>
                )}
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Invoices"
            description="A record of plan changes and credit pack purchases."
          >
            {invoices.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(inv.createdAt)}
                      </TableCell>
                      <TableCell>{inv.plan}</TableCell>
                      <TableCell>{formatPrice(inv.amount)}</TableCell>
                      <TableCell>
                        <BadgePill color={inv.status === "paid" ? "var(--color-1)" : "var(--color-5)"}>
                          {inv.status}
                        </BadgePill>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={FileText}
                title="No invoices yet"
                description="Invoices from plan changes and credit packs will appear here."
              />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
