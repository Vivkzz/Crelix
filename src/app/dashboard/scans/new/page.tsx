"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { CREDIT_COSTS } from "@/lib/constants";
import { PageHeader, SectionCard, Spinner } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

const EXAMPLES = [
  "https://example.com",
  "https://news.ycombinator.com",
  "https://stripe.com",
  "https://vercel.com",
];

export default function NewScanPage() {
  const router = useRouter();
  const [target, setTarget] = useState("");

  const m = useMutation({
    mutationFn: (b: { target: string }) =>
      api<{ scan: { id: string } }>("/api/dashboard/scans/run", {
        method: "POST",
        body: JSON.stringify(b),
      }),
    onSuccess: (res) => {
      toast.success("Scan started");
      router.push(`/dashboard/scans/${res.scan.id}`);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Scan failed"),
  });

  const cost = CREDIT_COSTS.scanRun;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="New scan"
        description="Audit a URL for security and content issues."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/scans">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <SectionCard
        title="Target URL"
        description={`Running a scan costs ${cost} credit${cost > 1 ? "s" : ""}.`}
      >
        <div className="space-y-2">
          <Label htmlFor="target" className="sr-only">
            Target URL
          </Label>
          <Input
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => {
              if (e.key === "Enter" && target.trim()) m.mutate({ target: target.trim() });
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setTarget(ex)}
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
            onClick={() => m.mutate({ target: target.trim() })}
            disabled={!target.trim() || m.isPending}
          >
            {m.isPending ? (
              <>
                <Spinner className="h-4 w-4" />
                Scanning…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Run scan
              </>
            )}
          </Button>
        </div>
      </SectionCard>

      <Toaster richColors position="top-center" />
    </div>
  );
}
