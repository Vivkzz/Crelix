"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Plus, Copy, AlertTriangle } from "lucide-react";
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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";

function formatDate(d: string | number | Date) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

export default function KeysPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["keys"],
    queryFn: () => api("/api/dashboard/keys"),
  });

  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (b: { label?: string }) =>
      api("/api/dashboard/keys", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: (d: any) => {
      setNewKey(d.key);
      setLabel("");
      toast.success("API key created");
      qc.invalidateQueries({ queryKey: ["keys"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create key"),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => api(`/api/dashboard/keys/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Key revoked");
      qc.invalidateQueries({ queryKey: ["keys"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to revoke key"),
  });

  const copy = (text: string) =>
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));

  const keys: any[] = data?.keys ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader
        title="API keys"
        description="Create keys to access the EKAM AI API programmatically."
      />

      <SectionCard
        title="Create key"
        description="Use a descriptive label so you can tell keys apart later."
      >
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ label: label || undefined });
          }}
        >
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <Label htmlFor="key-label">Label</Label>
            <Input
              id="key-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Production server"
            />
          </div>
          <Button
            type="submit"
            className={GRADIENT_BTN}
            disabled={create.isPending}
            style={{ background: "var(--gradient-linear-3)", color: "#fff", border: "none" }}
          >
            <Plus className="h-4 w-4" /> Create key
          </Button>
        </form>

        {newKey && (
          <div
            className="mt-4 rounded-lg border p-4"
            style={{
              borderColor: "var(--color-5)",
              background: "color-mix(in srgb, var(--color-5) 8%, transparent)",
            }}
          >
            <div
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--color-5)" }}
            >
              <AlertTriangle className="h-4 w-4" /> Save this key now — you won't see it again.
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-background px-3 py-2 font-mono text-sm">
                {newKey}
              </code>
              <Button type="button" variant="outline" onClick={() => copy(newKey)}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Your keys"
        description="Existing API keys. Revoked keys can no longer authenticate."
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading keys…
          </div>
        ) : error ? (
          <EmptyState
            icon={KeyRound}
            title="Couldn't load keys"
            description={(error as Error).message}
          />
        ) : keys.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k: any) => {
                const revoked = !!k.revokedAt;
                return (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.label || "Default"}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{k.prefix}…</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(k.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {k.lastUsedAt ? timeAgo(k.lastUsedAt) : "Never"}
                    </TableCell>
                    <TableCell>
                      <BadgePill color={revoked ? "var(--color-5)" : "var(--color-1)"}>
                        {revoked ? "Revoked" : "Active"}
                      </BadgePill>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={revoked || revoke.isPending}
                        onClick={() => revoke.mutate(k.id)}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Create your first key above."
          />
        )}
      </SectionCard>
    </div>
  );
}
