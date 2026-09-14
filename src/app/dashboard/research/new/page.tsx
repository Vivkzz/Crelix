"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { CREDIT_COSTS } from "@/lib/constants";
import { PageHeader, SectionCard, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

const EXAMPLES = [
  "AI note-taking apps",
  "Open-source CRMs",
  "Serverless hosting providers",
  "Productivity tools for designers",
];

export default function NewResearchPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");

  const m = useMutation({
    mutationFn: (b: { topic: string }) =>
      api<{ research: { id: string } }>("/api/dashboard/research/run", {
        method: "POST",
        body: JSON.stringify(b),
      }),
    onSuccess: (res) => {
      toast.success("Research started");
      router.push(`/dashboard/research/${res.research.id}`);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Research failed"),
  });

  const cost = CREDIT_COSTS.researchRun;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="New research"
        description="Run market and competitor research on a topic."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/research">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <SectionCard
        title="Topic"
        description={`Running research costs ${cost} credit${cost > 1 ? "s" : ""}.`}
      >
        <div className="space-y-2">
          <Label htmlFor="topic" className="sr-only">
            Topic
          </Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. AI note-taking apps"
            onKeyDown={(e) => {
              if (e.key === "Enter" && topic.trim()) m.mutate({ topic: topic.trim() });
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setTopic(ex)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Cost: <span className="font-medium text-foreground">{cost} credit{cost > 1 ? "s" : ""}</span>
          </span>
          <Button
            onClick={() => m.mutate({ topic: topic.trim() })}
            disabled={!topic.trim() || m.isPending}
          >
            {m.isPending ? (
              <>
                <Spinner className="h-4 w-4" />
                Researching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Run research
              </>
            )}
          </Button>
        </div>
      </SectionCard>

      <Toaster richColors position="top-center" />
    </div>
  );
}
