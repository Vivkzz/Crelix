"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { PLAN_LIST, formatPrice } from "@/lib/constants";
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
import { Coins } from "lucide-react";

export default function AdminPlansPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => api<any>("/api/admin/plans"),
  });

  const settings = data?.settings ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Plans" description="Review plan tiers and tune pricing settings." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLAN_LIST.map((p) => (
          <SectionCard key={p.id} title={p.name} description={p.period}>
            <div className="text-2xl font-semibold tracking-tight">{formatPrice(p.price)}</div>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div>{p.credits} credits / period</div>
              <div>
                {p.seats === Infinity ? "Unlimited seats" : `${p.seats} seat${p.seats === 1 ? "" : "s"}`}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard title="Plan settings" description="Key/value overrides for pricing and limits.">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <EmptyState icon={Coins} title="Couldn't load settings" />}
        {!isLoading && !isError && (
          <SettingsEditor settings={settings} endpoint="/api/admin/plans" queryKey={["admin-plans"]} />
        )}
      </SectionCard>
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
          <Label htmlFor="p-new-key">New key</Label>
          <Input id="p-new-key" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="key.name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-new-val">Value</Label>
          <Input id="p-new-val" value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="value" />
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
