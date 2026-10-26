"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";

type Key = {
  id: string;
  label: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

export default function ProgrammaticApiPage() {
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["keys"],
    queryFn: () => api<{ keys: Key[] }>("/api/dashboard/keys"),
  });

  const create = useMutation({
    mutationFn: (l: string) =>
      api<{ key: string; label: string; prefix: string }>("/api/dashboard/keys", {
        method: "POST",
        body: JSON.stringify({ label: l }),
      }),
    onSuccess: (res) => {
      setNewKey(res.key);
      qc.invalidateQueries({ queryKey: ["keys"] });
      setLabel("");
      toast.success("API key created");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to create key"),
  });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  };

  const keys = data?.keys ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Programmatic API"
        description="Trigger any of your agents over HTTP with an eai_ API key — from scripts, CI, or any backend."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/agents">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <SectionCard title="Trigger an agent" description="Authenticate with a Bearer token and POST the input.">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Endpoint</p>
            <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">POST /api/v1/agents/{"{agent_id}"}/run</pre>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Example request (curl)</p>
            <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{`curl -X POST "$CRELIX_URL/api/v1/agents/{agent_id}/run" \\
  -H "Authorization: Bearer eai_..." \\
  -H "Content-Type: application/json" \\
  -d '{"input":"Research the market for AI note apps"}'`}</pre>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Request body</p>
              <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{`{
  "input": "Research the market for AI note apps"
}`}</pre>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Example response</p>
              <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{`{
  "runId": "clxxx...",
  "status": "completed",
  "finalMessage": "Here's a summary of the market...",
  "artifacts": []
}`}</pre>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Need an agent id? See them on the{" "}
            <Link href="/dashboard/agents" className="font-medium text-foreground underline-offset-2 hover:underline">
              agents page
            </Link>
            .
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Your API keys"
        description="Generate an eai_ key per integration. The full key is shown only once at creation."
      >
        <div className="space-y-4">
          {newKey && (
            <Alert className="border-primary/40">
              <KeyRound className="h-4 w-4" />
              <AlertTitle>Your new API key — copy it now</AlertTitle>
              <AlertDescription>
                <p className="text-xs text-muted-foreground">
                  This is the only time the full key will be shown. Store it somewhere safe.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 text-xs">{newKey}</code>
                  <Button size="sm" variant="outline" onClick={() => copy(newKey)}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setNewKey(null)}>
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="key-label">Label for new key</Label>
              <Input
                id="key-label"
                placeholder="e.g. CI nightly run"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={40}
              />
            </div>
            <Button disabled={create.isPending || !label.trim()} onClick={() => create.mutate(label.trim())}>
              {create.isPending ? <Spinner className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
              Create key
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-6">
              <Spinner className="h-6 w-6" />
            </div>
          )}
          {isError && <EmptyState icon={KeyRound} title="Couldn't load keys" />}
          {!isLoading && !isError && (
            keys.length === 0 ? (
              <EmptyState icon={KeyRound} title="No API keys yet" description="Create one above to start using the API." />
            ) : (
              <div className="divide-y divide-border">
                {keys.map((k) => (
                  <div key={k.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{k.label}</span>
                        {k.revokedAt && <Badge variant="secondary">Revoked</Badge>}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{k.prefix}…</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {k.lastUsedAt ? `Used ${formatDistanceToNow(new Date(k.lastUsedAt), { addSuffix: true })}` : "Never used"}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          <Button asChild variant="link" size="sm" className="px-0">
            <Link href="/dashboard/agents">
              Find an agent id
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SectionCard>

      <Toaster richColors position="top-center" />
    </div>
  );
}
