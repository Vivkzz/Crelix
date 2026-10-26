"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Coins, Plus, Sparkles, History } from "lucide-react";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  Spinner,
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
import { CREDIT_PACKS, formatPrice, planById } from "@/lib/constants";

function timeAgo(d: string | number | Date) {
  const date = new Date(d);
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const GRADIENT_BTN = "hover:opacity-90";

export default function CreditsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["credits"],
    queryFn: () => api("/api/dashboard/credits"),
  });

  const buy = useMutation({
    mutationFn: (b: { packId: string }) =>
      api("/api/dashboard/billing/buy-credits", {
        method: "POST",
        body: JSON.stringify(b),
      }),
    onSuccess: (_d, vars) => {
      const pack = CREDIT_PACKS.find((p) => p.id === vars.packId);
      toast.success(pack ? `Added ${pack.credits} credits` : "Credits added");
      qc.invalidateQueries({ queryKey: ["credits"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to add credits"),
  });

  const balance: number = data?.balance ?? 0;
  const plan = planById(data?.plan || "FREE");
  const ledger: any[] = data?.ledger ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader
        title="Credits"
        description="Top up credits for scans, research, and generation. One credit equals one unit of usage."
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading credits…
        </div>
      ) : error ? (
        <EmptyState
          icon={Coins}
          title="Couldn't load credits"
          description={(error as Error).message}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Available credits"
              value={balance}
              accent="var(--color-1)"
              hint="Updated in real time as you use Crelix AI."
            />
            <StatCard
              label="Current plan"
              value={plan.name}
              hint={`${plan.credits} credits per period (${plan.period})`}
            />
          </div>

          <SectionCard
            title="Credit packs"
            description="Buy additional credits anytime. Packs never expire."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
                  style={
                    pack.popular
                      ? { borderColor: "var(--color-1)", boxShadow: "var(--shadow-card)" }
                      : undefined
                  }
                >
                  {pack.popular && (
                    <span
                      className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={{ background: "var(--gradient-linear-3)" }}
                    >
                      <Sparkles className="h-3 w-3" /> Popular
                    </span>
                  )}
                  <div className="text-sm text-muted-foreground">{pack.label}</div>
                  <div className="text-3xl font-semibold tracking-tight">
                    {formatPrice(pack.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pack.credits} credits added to your balance
                  </div>
                  <Button
                    className={`mt-auto w-full ${GRADIENT_BTN}`}
                    style={{ background: "var(--gradient-linear-3)", color: "#fff", border: "none" }}
                    onClick={() => buy.mutate({ packId: pack.id })}
                    disabled={buy.isPending}
                  >
                    <Plus className="h-4 w-4" /> Buy {pack.credits} credits
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Usage history"
            description="Your most recent credit transactions."
          >
            {ledger.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((t: any) => {
                    const delta = Number(t.delta ?? 0);
                    const positive = delta >= 0;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="text-muted-foreground">
                          {timeAgo(t.createdAt)}
                        </TableCell>
                        <TableCell
                          style={{
                            color: positive ? "var(--color-1)" : "var(--color-5)",
                            fontWeight: 600,
                          }}
                        >
                          {positive ? `+${delta}` : delta}
                        </TableCell>
                        <TableCell>{t.balanceAfter}</TableCell>
                        <TableCell className="text-muted-foreground">{t.reason}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={History}
                title="No transactions yet"
                description="Credit usage and top-ups will appear here."
              />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
