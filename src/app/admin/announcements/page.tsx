"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner, BadgePill } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Megaphone, Pencil, Trash2 } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleString() : "—";

const LEVEL_COLOR: Record<string, string> = {
  info: "var(--color-2)",
  warning: "var(--color-5)",
  success: "var(--color-1)",
};

export default function AdminAnnouncementsPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => api<any>("/api/admin/announcements"),
  });

  const create = useMutation({
    mutationFn: (b: any) =>
      api("/api/admin/announcements", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: () => {
      toast.success("Announcement created");
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      resetForm();
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      api(`/api/admin/announcements/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/admin/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState("info");
  const [active, setActive] = useState(true);
  const [delId, setDelId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setLevel("info");
    setActive(true);
  };

  const announcements = data?.announcements ?? [];
  const editing = announcements.find((a: any) => a.id === editId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Announcements" description="Post and manage platform-wide announcements." />

      <SectionCard title="New announcement" description="Visible to users across the site and dashboard.">
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="a-title">Title</Label>
            <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-body">Body</Label>
            <Textarea id="a-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Optional message" rows={3} />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Checkbox id="a-active" checked={active} onCheckedChange={(v) => setActive(!!v)} />
              <Label htmlFor="a-active">Active</Label>
            </div>
            <Button
              disabled={create.isPending || !title.trim()}
              onClick={() => create.mutate({ title, body, level, active })}
            >
              {create.isPending ? "Posting…" : "Post announcement"}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="All announcements" description="Toggle active state, edit, or delete.">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <EmptyState icon={Megaphone} title="Couldn't load announcements" />}
        {!isLoading && !isError && (
          announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements" description="Create one above." />
          ) : (
            <div className="divide-y divide-border">
              {announcements.map((a: any) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{a.title}</span>
                      <BadgePill color={LEVEL_COLOR[a.level]}>{a.level || "info"}</BadgePill>
                    </div>
                    {a.body && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{a.body}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">{fmtDate(a.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!a.active}
                      onCheckedChange={(v) => patch.mutate({ id: a.id, body: { active: v } })}
                    />
                    <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditId(a.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDelId(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </SectionCard>

      <EditAnnouncementDialog
        key={editId || "none"}
        announcement={editing}
        open={!!editId}
        onOpenChange={(o) => !o && setEditId(null)}
        onSave={(b) => editId && patch.mutate({ id: editId, body: b })}
        saving={patch.isPending}
      />

      <Dialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this announcement?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => delId && remove.mutate(delId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditAnnouncementDialog({
  announcement,
  open,
  onOpenChange,
  onSave,
  saving,
}: {
  announcement?: any;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (b: any) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState("info");

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || "");
      setBody(announcement.body || "");
      setLevel(announcement.level || "info");
    }
  }, [announcement]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit announcement</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label>Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={saving || !title.trim()} onClick={() => onSave({ title, body, level })}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
