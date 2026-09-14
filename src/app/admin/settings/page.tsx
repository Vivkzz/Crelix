"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
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
import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api<any>("/api/admin/settings"),
  });

  const settings = data?.settings ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Settings" description="Site-wide key/value configuration." />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && <EmptyState icon={SettingsIcon} title="Couldn't load settings" />}

      {!isLoading && !isError && (
        <SectionCard title="Site settings" description="Edit values or add new keys. Each row saves independently.">
          <SettingsEditor settings={settings} endpoint="/api/admin/settings" queryKey={["admin-settings"]} />
        </SectionCard>
      )}
    </div>
  );
}

function SettingsEditor({
  settings,
  endpoint,
  queryKey,
}: {
  settings: any[];
  endpoint: string;
  queryKey: any[];
}) {
  const qc = useQueryClient();
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const add = useMutation({
    mutationFn: (s: Record<string, string>) =>
      api(endpoint, { method: "PATCH", body: JSON.stringify({ settings: s }) }),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const addNew = () => {
    if (!newKey.trim()) return;
    add.mutate({ [newKey.trim()]: newVal });
    setNewKey("");
    setNewVal("");
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {settings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">No settings yet.</TableCell>
            </TableRow>
          ) : (
            settings.map((s: any) => (
              <SettingsRow key={s.key} s={s} endpoint={endpoint} queryKey={queryKey} />
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="ns-key">New key</Label>
          <Input id="ns-key" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="key.name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-val">Value</Label>
          <Input id="ns-val" value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="value" />
        </div>
        <Button disabled={add.isPending || !newKey.trim()} onClick={addNew}>Add</Button>
      </div>
    </div>
  );
}

function SettingsRow({ s, endpoint, queryKey }: { s: any; endpoint: string; queryKey: any[] }) {
  const qc = useQueryClient();
  const [v, setV] = useState(s.value ?? "");
  useEffect(() => setV(s.value ?? ""), [s.value]);

  const save = useMutation({
    mutationFn: (value: string) =>
      api(endpoint, { method: "PATCH", body: JSON.stringify({ settings: { [s.key]: value } }) }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{s.key}</TableCell>
      <TableCell>
        <Input value={v} onChange={(e) => setV(e.target.value)} className="max-w-md" />
      </TableCell>
      <TableCell>
        <Button size="sm" variant="outline" disabled={save.isPending} onClick={() => save.mutate(v)}>
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}
