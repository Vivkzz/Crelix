"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LayoutTemplate } from "lucide-react";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

type Provider = "playbook" | "openai" | "anthropic";

type Template = {
  id: string;
  name: string;
  description?: string;
  category: string;
  provider: Provider;
  model?: string;
  tools: string[];
  playbookId?: string;
  systemPrompt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const PROVIDER_BADGE: Record<Provider, { label: string; color: string }> = {
  playbook: { label: "Playbook", color: "var(--color-2)" },
  openai: { label: "OpenAI", color: "#10b981" },
  anthropic: { label: "Anthropic", color: "#f97316" },
};

const CATEGORY_COLOR = "var(--color-4)";

export default function AgentTemplatesPage() {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["agent-templates"],
    queryFn: () => api<{ templates: any[] }>("/api/dashboard/agents/templates"),
  });

  const create = useMutation({
    mutationFn: (t: Template) =>
      api<{ agent: { id: string } }>("/api/dashboard/agents", {
        method: "POST",
        body: JSON.stringify({
          name: t.name,
          systemPrompt: t.systemPrompt,
          provider: t.provider,
          model: t.model,
          tools: t.tools,
          playbookId: t.playbookId,
        }),
      }),
    onSuccess: (res) => {
      toast.success("Agent created from template");
      router.push(`/dashboard/agents/${res.agent.id}`);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to create agent"),
  });

  const templates = (data?.templates ?? []) as Template[];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Agent templates"
        description="Start from a prebuilt agent configuration."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load templates."}
        </p>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates available"
          description="Check back later for prebuilt agent configurations."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => {
            const pb = PROVIDER_BADGE[t.provider] ?? {
              label: t.provider,
              color: "var(--color-4)",
            };
            const creating =
              create.isPending && create.variables?.id === t.id;
            return (
              <SectionCard key={t.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-base font-semibold tracking-tight">
                    {t.name}
                  </h3>
                  <BadgePill color={CATEGORY_COLOR}>{t.category}</BadgePill>
                </div>

                {t.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {t.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground/70">
                    No description.
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <BadgePill color={pb.color}>{pb.label}</BadgePill>
                  {t.model && (
                    <span className="truncate font-mono text-[11px] text-muted-foreground">
                      {t.model}
                    </span>
                  )}
                </div>

                {t.tools.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-5">
                  <Button
                    className="w-full"
                    disabled={create.isPending}
                    onClick={() => create.mutate(t)}
                  >
                    {creating ? "Creating…" : "Use template"}
                  </Button>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}
