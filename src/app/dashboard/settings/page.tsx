"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, Spinner, EmptyState } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

const GRADIENT_BTN = "hover:opacity-90";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/api/dashboard/settings"),
  });

  const [prefs, setPrefs] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data?.prefs) setPrefs(data.prefs);
  }, [data]);

  const save = useMutation({
    mutationFn: (b: any) =>
      api("/api/dashboard/settings", { method: "PATCH", body: JSON.stringify(b) }),
    onSuccess: () => {
      toast.success("Preferences saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to save preferences"),
  });

  const set = (k: string, v: any) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader title="Settings" description="Preferences for your EKAM AI workspace." />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading settings…
        </div>
      ) : error ? (
        <EmptyState
          icon={SettingsIcon}
          title="Couldn't load settings"
          description={(error as Error).message}
        />
      ) : (
        <SectionCard title="Preferences" description="Changes apply across your dashboard.">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="emailNotifs">Email notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about your account and scans.
                </p>
              </div>
              <Switch
                id="emailNotifs"
                checked={!!prefs.emailNotifs}
                onCheckedChange={(v) => set("emailNotifs", v)}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="productUpdates">Product updates</Label>
                <p className="text-sm text-muted-foreground">
                  Hear about new EKAM AI features and improvements.
                </p>
              </div>
              <Switch
                id="productUpdates"
                checked={!!prefs.productUpdates}
                onCheckedChange={(v) => set("productUpdates", v)}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="defaultProjectType">Default project type</Label>
                <p className="text-sm text-muted-foreground">
                  Pre-selected when you start a new project.
                </p>
              </div>
              <Select
                value={prefs.defaultProjectType || "flow"}
                onValueChange={(v) => set("defaultProjectType", v)}
              >
                <SelectTrigger id="defaultProjectType" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flow">Flow</SelectItem>
                  <SelectItem value="pentest">Pentest</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                className={GRADIENT_BTN}
                disabled={save.isPending}
                onClick={() => save.mutate(prefs)}
                style={{ background: "var(--gradient-linear-3)", color: "#fff", border: "none" }}
              >
                <Save className="h-4 w-4" /> Save preferences
              </Button>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
