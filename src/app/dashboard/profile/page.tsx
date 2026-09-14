"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User as UserIcon, Save } from "lucide-react";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, Spinner, EmptyState } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";

function initials(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    if (first + second) return (first + second).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

const GRADIENT_BTN = "hover:opacity-90";

export default function ProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api("/api/dashboard/profile"),
  });
  const user = data?.user;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setImage(user.image || "");
    }
  }, [user]);

  const save = useMutation({
    mutationFn: (b: any) =>
      api("/api/dashboard/profile", { method: "PATCH", body: JSON.stringify(b) }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to save profile"),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader title="Profile" description="How you appear across EKAM AI." />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading profile…
        </div>
      ) : error ? (
        <EmptyState
          icon={UserIcon}
          title="Couldn't load profile"
          description={(error as Error).message}
        />
      ) : user ? (
        <>
          <div className="flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "avatar"}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white"
                style={{ background: "var(--gradient-linear-3)" }}
              >
                {initials(user.name, user.email)}
              </div>
            )}
            <div>
              <div className="text-base font-medium">{user.name || "Unnamed"}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>

          <SectionCard
            title="Edit profile"
            description="Update your display name, bio, and avatar URL."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate({ name, bio, image });
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || ""} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image">Avatar URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://…/avatar.png"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short bio (up to 400 characters)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className={GRADIENT_BTN}
                  disabled={save.isPending}
                  style={{ background: "var(--gradient-linear-3)", color: "#fff", border: "none" }}
                >
                  <Save className="h-4 w-4" /> Save changes
                </Button>
              </div>
            </form>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
