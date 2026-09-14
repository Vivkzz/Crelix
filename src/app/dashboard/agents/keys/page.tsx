"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

type Provider = "openai" | "anthropic";
type KeyInfo = { provider: Provider; hasKey: boolean; createdAt?: string };

const PROVIDERS: { id: Provider; label: string; accent: string }[] = [
  { id: "openai", label: "OpenAI", accent: "#10b981" },
  { id: "anthropic", label: "Anthropic", accent: "#f97316" },
];

const green = { background: "color-mix(in srgb, #10b981 16%, transparent)", color: "#059669" };

const fmtDate = (s?: string) =>
  s
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(s),
      )
    : "";

export default function AgentKeysPage() {
  const queryClient = useQueryClient();
  const [vals, setVals] = useState<Record<Provider, string>>({ openai: "", anthropic: "" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["agent-keys"],
    queryFn: () =>
      api<{ keys: KeyInfo[]; serverKeys: Record<Provider, boolean> }>("/api/dashboard/agents/keys"),
  });

  const keyFor = (p: Provider) => data?.keys.find((k) => k.provider === p);

  const save = useMutation({
    mutationFn: ({ provider, apiKey }: { provider: Provider; apiKey: string }) =>
      api<{ ok: true; provider: Provider }>("/api/dashboard/agents/keys", {
        method: "POST",
        body: JSON.stringify({ provider, apiKey }),
      }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["agent-keys"] });
      setVals((v) => ({ ...v, [vars.provider]: "" }));
      toast.success("Key saved");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to save key"),
  });

  const remove = useMutation({
    mutationFn: (provider: Provider) =>
      api<{ ok: true }>("/api/dashboard/agents/keys", {
        method: "DELETE",
        body: JSON.stringify({ provider }),
      }),
    onSuccess: (_res, provider) => {
      queryClient.invalidateQueries({ queryKey: ["agent-keys"] });
      toast.success(`${PROVIDERS.find((p) => p.id === provider)?.label ?? "Key"} removed`);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to remove key"),
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="API keys"
        description="Your keys are encrypted at rest (AES-256-GCM) and never leave your account. If a server key is configured, agents work for everyone without a personal key."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/agents">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load keys."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PROVIDERS.map((p) => {
            const info = keyFor(p.id);
            const server = data?.serverKeys?.[p.id];
            const saving = save.isPending && save.variables?.provider === p.id;
            const removing = remove.isPending && remove.variables === p.id;
            return (
              <Card key={p.id} className="dash-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                    {p.label}
                  </CardTitle>
                  <CardAction>
                    {server ? (
                      <Badge style={green} className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Server key
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No server key</Badge>
                    )}
                  </CardAction>
                  <CardDescription>
                    Use your own {p.label} key, or rely on the server key when available.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Your key
                    </p>
                    {info?.hasKey ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge style={green} className="gap-1">
                          <Check className="h-3 w-3" /> Set
                        </Badge>
                        {info.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            Added {fmtDate(info.createdAt)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not set</p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2.5">
                    <Label htmlFor={`key-${p.id}`}>{info?.hasKey ? "Replace key" : "Add key"}</Label>
                    <Input
                      id={`key-${p.id}`}
                      type="password"
                      autoComplete="off"
                      value={vals[p.id]}
                      onChange={(e) => setVals((v) => ({ ...v, [p.id]: e.target.value }))}
                      placeholder="sk-…"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        disabled={!vals[p.id].trim() || saving}
                        onClick={() => save.mutate({ provider: p.id, apiKey: vals[p.id].trim() })}
                      >
                        {saving ? <Spinner className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                        Save key
                      </Button>
                      {info?.hasKey && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={removing}
                          onClick={() => {
                            if (window.confirm(`Remove your ${p.label} key?`)) remove.mutate(p.id);
                          }}
                        >
                          {removing ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}
