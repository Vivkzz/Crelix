"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { CREDIT_COSTS } from "@/lib/constants";
import { PageHeader, SectionCard, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";

const EXAMPLES = [
  "A bold landing page for a fintech startup with a gradient hero and pricing section",
  "A personal portfolio site with projects grid and contact form",
  "A SaaS pricing page with three tiers and an FAQ accordion",
  "A product launch page for an AI note-taking app, dark mode",
];

export default function NewProjectPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const m = useMutation({
    mutationFn: (b: { prompt: string }) =>
      api<{ project: { id: string } }>("/api/dashboard/projects/generate", {
        method: "POST",
        body: JSON.stringify(b),
      }),
    onSuccess: (res) => {
      toast.success("Project generated");
      router.push(`/dashboard/projects/${res.project.id}`);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  const cost = CREDIT_COSTS.flowGenerate;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="New project"
        description="Describe what you want and Flow will generate it."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <SectionCard
        title="Prompt"
        description={`Describe the site or page you want. This costs ${cost} credit${cost > 1 ? "s" : ""} to generate.`}
      >
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A clean landing page for a coffee subscription service…"
          rows={6}
          className="resize-none"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {ex.length > 48 ? ex.slice(0, 48) + "…" : ex}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Cost: <span className="font-medium text-foreground">{cost} credit{cost > 1 ? "s" : ""}</span>
          </span>
          <Button
            onClick={() => m.mutate({ prompt })}
            disabled={!prompt.trim() || m.isPending}
          >
            {m.isPending ? (
              <>
                <Spinner className="h-4 w-4" />
                Generating…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate with Flow
              </>
            )}
          </Button>
        </div>
      </SectionCard>

      <Toaster richColors position="top-center" />
    </div>
  );
}
