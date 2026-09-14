"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, KeyRound, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

type Secret = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default function AgentSecretsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-secrets"],
    queryFn: () => api<{ secrets: Secret[] }>("/api/dashboard/agents/variables"),
  });

  const save = useMutation({
    mutationFn: (b: { name: string; value: string }) =>
      api<{ id: string; name: string }>("/api/dashboard/agents/variables", {
        method: "POST",
        body: JSON.stringify(b),
      }),
    onSuccess: () => {
      toast.success("Secret saved");
      qc.invalidateQueries({ queryKey: ["agent-secrets"] });
      setName("");
      setValue("");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to save secret"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/dashboard/agents/variables?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Secret deleted");
      qc.invalidateQueries({ queryKey: ["agent-secrets"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to delete secret"),
  });

  const secrets = data?.secrets ?? [];
  const nameValid = name.trim().length > 0 && !/\s/.test(name.trim());
  const canSave = nameValid && value.length > 0 && !save.isPending;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Agent secrets"
        description="Store reusable secrets for your agents — API tokens, credentials, anything an agent run might need."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/agents">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <SectionCard title="New secret" description="Name it like a variable (no spaces). The value is encrypted at rest.">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="secret-name">Name</Label>
            <Input
              id="secret-name"
              autoComplete="off"
              placeholder="e.g. SLACK_TOKEN"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="secret-value">Value</Label>
            <Input
              id="secret-value"
              type="password"
              autoComplete="off"
              placeholder="Secret value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <Button
            disabled={!canSave}
            onClick={() => save.mutate({ name: name.trim(), value })}
          >
            {save.isPending ? <Spinner className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
            Save
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Values are encrypted at rest and never shown again.
        </p>
      </SectionCard>

      <SectionCard title="Your secrets" description="Only the names are listed here — values are write-only.">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <EmptyState icon={KeyRound} title="Couldn't load secrets" />}
        {!isLoading && !isError && (
          secrets.length === 0 ? (
            <EmptyState icon={KeyRound} title="No secrets yet" description="Add one above to make it available to your agents." />
          ) : (
            <div className="divide-y divide-border">
              {secrets.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <span className="truncate font-medium">{s.name}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Added {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                      {s.updatedAt !== s.createdAt && (
                        <> · updated {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}</>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={remove.isPending && remove.variables === s.id}
                    onClick={() => {
                      if (window.confirm(`Delete secret "${s.name}"? This cannot be undone.`)) {
                        remove.mutate(s.id);
                      }
                    }}
                  >
                    {remove.isPending && remove.variables === s.id ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
      </SectionCard>

      <Toaster richColors position="top-center" />
    </div>
  );
}
