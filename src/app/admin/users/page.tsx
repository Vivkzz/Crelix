"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleDateString() : "—";

const ROLE_COLOR: Record<string, string> = {
  USER: "var(--color-2)",
  ADMIN: "var(--color-4)",
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "var(--color-1)",
  SUSPENDED: "var(--color-5)",
};

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => setPage(1), [debouncedQ, role, status]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", debouncedQ, role, status, page],
    queryFn: () =>
      api<any>(
        `/api/admin/users?q=${encodeURIComponent(debouncedQ)}&role=${
          role === "ALL" ? "" : role
        }&status=${status === "ALL" ? "" : status}&page=${page}&pageSize=${PAGE_SIZE}`
      ),
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Users" description="Search, filter, and manage accounts." />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or name"
            className="w-64 pl-8"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && (
        <EmptyState icon={Users} title="Couldn't load users" description="Try refreshing the page." />
      )}

      {!isLoading && !isError && (
        <>
          {users.length === 0 ? (
            <EmptyState icon={Users} title="No users found" description="Try adjusting your filters." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow
                    key={u.id}
                    className="cursor-pointer hover:bg-foreground/5"
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                  >
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>{u.name || "—"}</TableCell>
                    <TableCell>
                      <BadgePill color={ROLE_COLOR[u.role]}>{u.role}</BadgePill>
                    </TableCell>
                    <TableCell>{u.plan}</TableCell>
                    <TableCell>{u.credits ?? 0}</TableCell>
                    <TableCell>
                      <BadgePill color={STATUS_COLOR[u.status]}>{u.status}</BadgePill>
                    </TableCell>
                    <TableCell>{u._count?.projects ?? 0}</TableCell>
                    <TableCell>{u._count?.scans ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} users · page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
