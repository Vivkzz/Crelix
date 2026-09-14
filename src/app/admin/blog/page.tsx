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
import { Newspaper, Pencil, Trash2 } from "lucide-react";

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Date(s).toLocaleString() : "—";

export default function AdminBlogPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => api<any>("/api/admin/blog"),
  });

  const create = useMutation({
    mutationFn: (b: any) =>
      api("/api/admin/blog", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: () => {
      toast.success("Post created");
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      reset();
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("");
    setAuthor("");
    setPublished(false);
  };

  const posts = data?.posts ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Blog" description="Author and manage blog posts." />

      <SectionCard title="New post" description="Create a new blog entry.">
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Security" />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Excerpt</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="Short summary" />
          </div>
          <div className="space-y-1.5">
            <Label>Content</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Post body (markdown)" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="b-pub" checked={published} onCheckedChange={(v) => setPublished(!!v)} />
            <Label htmlFor="b-pub">Published</Label>
          </div>
          <div>
            <Button
              disabled={create.isPending || !title.trim()}
              onClick={() => create.mutate({ title, excerpt, content, category, author, published })}
            >
              {create.isPending ? "Saving…" : "Create post"}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Posts" description="Edit or delete existing posts.">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <EmptyState icon={Newspaper} title="Couldn't load posts" />}
        {!isLoading && !isError && (
          posts.length === 0 ? (
            <EmptyState icon={Newspaper} title="No posts yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.category || "—"}</TableCell>
                    <TableCell>
                      <BadgePill color={p.published ? "var(--color-1)" : "var(--color-5)"}>
                        {p.published ? "Published" : "Draft"}
                      </BadgePill>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(p.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditId(p.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDelId(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </SectionCard>

      <EditPostDialog id={editId} open={!!editId} onOpenChange={(o) => !o && setEditId(null)} />

      <DeletePostDialog id={delId} open={!!delId} onOpenChange={(o) => !o && setDelId(null)} />
    </div>
  );
}

function EditPostDialog({
  id,
  open,
  onOpenChange,
}: {
  id: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog", id],
    queryFn: () => api<any>(`/api/admin/blog/${id}`),
    enabled: !!id && open,
  });
  const post = data?.post;

  const patch = useMutation({
    mutationFn: (b: any) =>
      api(`/api/admin/blog/${id}`, { method: "PATCH", body: JSON.stringify(b) }),
    onSuccess: () => {
      toast.success("Post updated");
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      qc.invalidateQueries({ queryKey: ["admin-blog", id] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setExcerpt(post.excerpt || "");
      setContent(post.content || "");
      setCategory(post.category || "");
      setAuthor(post.author || "");
      setPublished(!!post.published);
    }
  }, [post]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Author</Label>
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Excerpt</Label>
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="e-pub" checked={published} onCheckedChange={(v) => setPublished(!!v)} />
              <Label htmlFor="e-pub">Published</Label>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={patch.isPending || !title.trim()}
            onClick={() => patch.mutate({ title, excerpt, content, category, author, published })}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeletePostDialog({
  id,
  open,
  onOpenChange,
}: {
  id: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: () => api(`/api/admin/blog/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Post deleted");
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this post?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={del.isPending} onClick={() => del.mutate()}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
