"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";

const PROVIDERS = ["playbook", "openai", "anthropic"] as const;
type Provider = (typeof PROVIDERS)[number];

const PLAYBOOK_IDS = ["launch", "security-audit", "market-research", "site-check"];
const TOOL_NAMES = ["web_search", "web_fetch", "research_topic", "generate_page", "run_scan"];

const PROVIDER_BADGE: Record<Provider, { label: string; color: string }> = {
  playbook: { label: "Playbook", color: "var(--color-2)" },
  openai: { label: "OpenAI", color: "#10b981" },
  anthropic: { label: "Anthropic", color: "#f97316" },
};

const fmtDate = (s?: string | number | Date | null) =>
  s
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(s))
    : "—";

export default function AdminAgentTemplatesPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-agent-templates"],
    queryFn: () => api<{ templates: any[] }>("/api/admin/agent-templates"),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/agent-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Template deleted");
      qc.invalidateQueries({ queryKey: ["admin-agent-templates"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const templates = data?.templates ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Agent templates"
        description="Manage prebuilt agent configurations available to users."
        action={
          <Button
            onClick={() => {
              setEditingTemplate(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New template
          </Button>
        }
      />

      <SectionCard title="Templates" description="Create, edit, or remove agent templates.">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <EmptyState icon={LayoutTemplate} title="Couldn't load templates" />}
        {!isLoading && !isError &&
          (templates.length === 0 ? (
            <EmptyState
              icon={LayoutTemplate}
              title="No templates yet"
              description="Create one to get started."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t: any) => {
                  const pb =
                    PROVIDER_BADGE[t.provider as Provider] ?? {
                      label: t.provider,
                      color: "var(--color-4)",
                    };
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.category || "—"}</TableCell>
                      <TableCell>
                        <BadgePill color={pb.color}>{pb.label}</BadgePill>
                      </TableCell>
                      <TableCell>
                        <BadgePill color={t.active ? "var(--color-1)" : "var(--color-5)"}>
                          {t.active ? "Active" : "Inactive"}
                        </BadgePill>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDate(t.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit"
                            onClick={() => {
                              setEditingTemplate(t);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => setDelId(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ))}
      </SectionCard>

      <TemplateFormDialog
        template={editingTemplate}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <Dialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this template?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => delId && remove.mutate(delId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateFormDialog({
  template,
  open,
  onOpenChange,
}: {
  template: any | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const editing = !!template;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [provider, setProvider] = useState<Provider>("playbook");
  const [model, setModel] = useState("");
  const [playbookId, setPlaybookId] = useState("none");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (template) {
      setName(template.name || "");
      setDescription(template.description || "");
      setCategory(template.category || "General");
      setProvider(
        (PROVIDERS as readonly string[]).includes(template.provider)
          ? template.provider
          : "playbook",
      );
      setModel(template.model || "");
      setPlaybookId(template.playbookId || "none");
      setSystemPrompt(template.systemPrompt || "");
      setTools(Array.isArray(template.tools) ? template.tools : []);
      setActive(template.active !== false);
    } else {
      setName("");
      setDescription("");
      setCategory("General");
      setProvider("playbook");
      setModel("");
      setPlaybookId("none");
      setSystemPrompt("");
      setTools([]);
      setActive(true);
    }
  }, [open, template]);

  const mutation = useMutation({
    mutationFn: (b: any) =>
      editing
        ? api(`/api/admin/agent-templates/${template.id}`, {
            method: "PATCH",
            body: JSON.stringify(b),
          })
        : api("/api/admin/agent-templates", {
            method: "POST",
            body: JSON.stringify(b),
          }),
    onSuccess: () => {
      toast.success(editing ? "Template updated" : "Template created");
      qc.invalidateQueries({ queryKey: ["admin-agent-templates"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const toggleTool = (tool: string) =>
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );

  const submit = () => {
    mutation.mutate({
      name: name.trim(),
      description,
      category,
      provider,
      model,
      playbookId: playbookId === "none" ? "" : playbookId,
      systemPrompt,
      tools,
      active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this agent template."
              : "Configure a new prebuilt agent."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label>
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short summary shown in the gallery"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Security"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playbook">Playbook</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. gpt-4o"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Playbook</Label>
              <Select value={playbookId} onValueChange={setPlaybookId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="launch">Launch</SelectItem>
                  <SelectItem value="security-audit">Security audit</SelectItem>
                  <SelectItem value="market-research">Market research</SelectItem>
                  <SelectItem value="site-check">Site check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>System prompt</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              placeholder="Optional system prompt for the agent"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tools</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {TOOL_NAMES.map((tool) => {
                const id = `t-tool-${tool}`;
                return (
                  <div key={tool} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={tools.includes(tool)}
                      onCheckedChange={() => toggleTool(tool)}
                    />
                    <Label htmlFor={id} className="cursor-pointer font-mono text-xs">
                      {tool}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="t-active"
              checked={active}
              onCheckedChange={(v) => setActive(!!v)}
            />
            <Label htmlFor="t-active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={mutation.isPending || !name.trim()} onClick={submit}>
            {mutation.isPending
              ? editing
                ? "Saving…"
                : "Creating…"
              : editing
                ? "Save changes"
                : "Create template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
