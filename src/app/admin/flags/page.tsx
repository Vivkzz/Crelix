"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";

export default function AdminFlagsPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-flags"],
    queryFn: () => api<any>("/api/admin/flags"),
  });

  const patch = useMutation({
    mutationFn: (flags: Record<string, boolean>) =>
      api("/api/admin/flags", { method: "PATCH", body: JSON.stringify({ flags }) }),
    onSuccess: () => {
      toast.success("Flag updated");
      qc.invalidateQueries({ queryKey: ["admin-flags"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const flags = data?.flags ?? {};
  const entries = Object.entries(flags);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Feature flags" description="Toggle platform features on or off." />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={Flag} title="Couldn't load flags" />}

      {!isLoading && !isError && (
        entries.length === 0 ? (
          <EmptyState icon={Flag} title="No flags" description="No feature flags configured." />
        ) : (
          <SectionCard title="Flags" description="Changes apply immediately.">
            <div className="divide-y divide-border">
              {entries.map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <div>
                    <Label className="font-mono text-sm">{key}</Label>
                    <p className="text-xs text-muted-foreground">{val ? "Enabled" : "Disabled"}</p>
                  </div>
                  <Switch
                    checked={!!val}
                    onCheckedChange={(v) => patch.mutate({ [key]: v })}
                    disabled={patch.isPending}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        )
      )}
    </div>
  );
}
