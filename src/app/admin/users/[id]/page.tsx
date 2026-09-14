"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PLAN_LIST } from "@/lib/constants";
import { ArrowLeft, UserCog } from "lucide-react";

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

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => api<any>(`/api/admin/users/${id}`),
  });

  const user = data?.user;
  const [creditDelta, setCreditDelta] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const patch = useMutation({
    mutationFn: (body: any) =>
      api(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-user", id] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const impersonate = useMutation({
    mutationFn: () => api<any>(`/api/admin/users/${id}/impersonate`, { method: "POST" }),
    onSuccess: (d) => {
      if (d?.link) window.open(d.link, "_blank");
      toast.success("Impersonation link opened in a new tab");
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const remove = useMutation({
    mutationFn: () => api(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      router.push("/admin/users");
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")} className="mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Button>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && (
        <EmptyState icon={UserCog} title="Couldn't load user" description="This account may not exist." />
      )}

      {user && (
        <>
          <PageHeader
            title={user.email}
            description={`${user.name || "No name"} · ${user.id}`}
            action={
              <div className="flex items-center gap-2">
                <BadgePill color={ROLE_COLOR[user.role]}>{user.role}</BadgePill>
                <BadgePill color={STATUS_COLOR[user.status]}>{user.status}</BadgePill>
              </div>
            }
          />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SectionCard title="Plan"><div className="text-lg font-semibold">{user.plan}</div></SectionCard>
            <SectionCard title="Credits"><div className="text-lg font-semibold">{user.credits ?? 0}</div></SectionCard>
            <SectionCard title="Projects"><div className="text-lg font-semibold">{user._count?.projects ?? 0}</div></SectionCard>
            <SectionCard title="Scans"><div className="text-lg font-semibold">{user._count?.scans ?? 0}</div></SectionCard>
          </div>

          <SectionCard title="Actions" description="Manage role, status, credits, plan, and access.">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={user.role} onValueChange={(v) => patch.mutate({ role: v })}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={user.plan} onValueChange={(v) => patch.mutate({ plan: v })}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_LIST.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div>
                  {user.status === "ACTIVE" ? (
                    <Button
                      variant="outline"
                      disabled={patch.isPending}
                      onClick={() => patch.mutate({ status: "SUSPENDED" })}
                    >
                      Suspend user
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled={patch.isPending}
                      onClick={() => patch.mutate({ status: "ACTIVE" })}
                    >
                      Activate user
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adjust credits (delta)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={creditDelta}
                    onChange={(e) => setCreditDelta(Number(e.target.value))}
                    className="w-32"
                  />
                  <Button
                    disabled={patch.isPending}
                    onClick={() => {
                      patch.mutate({ creditDelta });
                      setCreditDelta(0);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Impersonate</Label>
                <div>
                  <Button
                    variant="secondary"
                    disabled={impersonate.isPending}
                    onClick={() => impersonate.mutate()}
                  >
                    {impersonate.isPending ? "Generating…" : "Open session link"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delete account</Label>
                <div>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                    Delete user
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Credit ledger" description="Recent credit transactions.">
            {user.txns?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delta</TableHead>
                    <TableHead>Balance after</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.txns.map((t: any, i: number) => (
                    <TableRow key={t.id ?? i}>
                      <TableCell className={t.delta >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {t.delta >= 0 ? "+" : ""}{t.delta}
                      </TableCell>
                      <TableCell>{t.balanceAfter}</TableCell>
                      <TableCell>{t.reason || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={UserCog} title="No transactions yet" />
            )}
          </SectionCard>
        </>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this user?</DialogTitle>
            <DialogDescription>
              This permanently deletes the account and its data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
