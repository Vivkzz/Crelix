"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { AreaChartMini, BarChartMini } from "@/components/dashboard/charts";
import { formatPrice } from "@/lib/constants";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Users, ScrollText, Activity, FileDown } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleString() : "—";

const ROLE_COLOR: Record<string, string> = {
  USER: "var(--color-2)",
  ADMIN: "var(--color-4)",
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "var(--color-1)",
  SUSPENDED: "var(--color-5)",
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => api<any>("/api/admin/overview"),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Overview" description="Platform health at a glance." />

      <SectionCard
        title="Pitch deck"
        description="Latest EKAM AI pitch deck — admin download only."
      >
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/pitch-deck"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            <FileDown className="h-4 w-4" />
            Download EKAM-AI-Pitch.pptx
          </a>
          <span className="text-xs text-muted-foreground">
            10 slides · 16:9 · apple-design build
          </span>
        </div>
      </SectionCard>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Activity}
          title="Couldn't load overview"
          description="The overview endpoint returned an error. Try refreshing."
        />
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Users" value={data.kpis?.users ?? 0} accent="var(--color-2)" />
            <StatCard label="Projects" value={data.kpis?.projects ?? 0} accent="var(--color-3)" />
            <StatCard label="Scans" value={data.kpis?.scans ?? 0} accent="var(--color-1)" />
            <StatCard label="Research" value={data.kpis?.research ?? 0} accent="var(--color-2)" />
            <StatCard label="Active subs" value={data.kpis?.activeSubs ?? 0} accent="var(--color-4)" />
            <StatCard label="MRR" value={formatPrice(data.kpis?.mrr ?? 0)} accent="var(--color-5)" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Signups" description="New users over the recent window.">
              {data.signups?.length ? (
                <AreaChartMini data={data.signups} dataKey="count" xKey="label" />
              ) : (
                <EmptyState icon={Users} title="No signups yet" />
              )}
            </SectionCard>
            <SectionCard title="Credits" description="Issued vs used across the platform.">
              <BarChartMini
                data={[
                  { label: "Issued", value: data.credits?.issued ?? 0 },
                  { label: "Used", value: data.credits?.used ?? 0 },
                ]}
                dataKey="value"
              />
            </SectionCard>
          </div>

          <SectionCard title="Recent users" description="Latest accounts created.">
            {data.recentUsers?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentUsers.map((u: any) => (
                    <TableRow
                      key={u.id}
                      className="cursor-pointer hover:bg-foreground/5"
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                    >
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>
                        <BadgePill color={ROLE_COLOR[u.role]}>{u.role}</BadgePill>
                      </TableCell>
                      <TableCell>{u.plan}</TableCell>
                      <TableCell>
                        <BadgePill color={STATUS_COLOR[u.status]}>{u.status}</BadgePill>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={Users} title="No users yet" />
            )}
          </SectionCard>

          <SectionCard title="Recent audit" description="Latest admin actions.">
            {data.recentAudit?.length ? (
              <div className="divide-y divide-border">
                {data.recentAudit.map((a: any) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                    <BadgePill color="var(--color-4)">{a.action}</BadgePill>
                    <span className="text-muted-foreground">
                      {a.targetType}
                      {a.targetId ? ` · ${a.targetId}` : ""}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {a.actorUserId ? `by ${a.actorUserId} · ` : ""}
                      {fmtDate(a.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={ScrollText} title="No audit events yet" />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
