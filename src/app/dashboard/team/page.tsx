"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

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

export default function TeamPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["team"],
    queryFn: () => api("/api/dashboard/team"),
  });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  const invite = useMutation({
    mutationFn: (b: { email: string; role?: string }) =>
      api("/api/dashboard/team", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: () => {
      toast.success("Invitation sent");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to invite"),
  });

  const updateRole = useMutation({
    mutationFn: (b: { id: string; role: string }) =>
      api(`/api/dashboard/team/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: b.role }),
      }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to update role"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/dashboard/team/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Member removed");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to remove"),
  });

  const seatsUsed: number = data?.seatsUsed ?? 0;
  const rawLimit = data?.seatsLimit;
  // Enterprise has Infinity seats, but JSON.stringify(Infinity) -> null over the wire.
  const unlimited = rawLimit == null || rawLimit === Infinity;
  const seatsLimit: number = unlimited ? Infinity : (rawLimit as number);
  const seatsFull = !unlimited && seatsUsed >= seatsLimit;
  const remaining = unlimited ? 0 : Math.max(seatsLimit - seatsUsed, 0);
  const members: any[] = data?.members ?? [];
  const pendingCount = members.filter((m) => m.status === "pending").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader title="Team" description="Invite teammates and manage their roles." />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading team…
        </div>
      ) : error ? (
        <EmptyState icon={Users} title="Couldn't load team" description={(error as Error).message} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Seats"
              value={`${seatsUsed} / ${unlimited ? "∞" : seatsLimit}`}
              hint={
                unlimited
                  ? "Unlimited seats on your plan."
                  : `${remaining} seat${remaining === 1 ? "" : "s"} remaining.`
              }
            />
            <StatCard
              label="Pending invitations"
              value={pendingCount}
              hint={pendingCount ? "Awaiting acceptance." : "No outstanding invites."}
            />
          </div>

          <SectionCard
            title="Invite a teammate"
            description="They'll get an email invitation to join your workspace."
          >
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                invite.mutate({ email, role });
              }}
            >
              <div className="min-w-[220px] flex-1 space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="teammate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className={GRADIENT_BTN}
                disabled={invite.isPending || seatsFull || !email}
                style={{ background: "var(--gradient-linear-3)", color: "#fff", border: "none" }}
              >
                <UserPlus className="h-4 w-4" /> Invite
              </Button>
            </form>
            {seatsFull && (
              <p className="mt-3 text-sm text-muted-foreground">
                You've used all {seatsLimit} seats on your plan. Upgrade your plan to invite more
                teammates.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Members" description="People with access to your workspace.">
            {members.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.inviteeEmail}</TableCell>
                      <TableCell>
                        <BadgePill color={m.role === "ADMIN" ? "var(--color-3)" : undefined}>
                          {m.role}
                        </BadgePill>
                      </TableCell>
                      <TableCell>
                        <BadgePill
                          color={
                            m.status === "active"
                              ? "var(--color-1)"
                              : m.status === "pending"
                              ? "var(--color-2)"
                              : undefined
                          }
                        >
                          {m.status}
                        </BadgePill>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {timeAgo(m.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Select
                            value={m.role}
                            onValueChange={(r) => updateRole.mutate({ id: m.id, role: r })}
                          >
                            <SelectTrigger size="sm" className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Remove member"
                            disabled={remove.isPending}
                            onClick={() => remove.mutate(m.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={Users}
                title="No teammates yet"
                description="Invite your first teammate above."
              />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
