"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert, LogOut, KeyRound } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { api } from "@/lib/client-api";
import { Toaster } from "@/components/ui/sonner";

export default function SecurityPage() {
  const [open, setOpen] = useState(false);

  const revoke = useMutation({
    mutationFn: () => api("/api/dashboard/security/revoke-sessions", { method: "POST" }),
    onSuccess: () => {
      // Current session is invalidated — leave the app.
      window.location.href = "/";
    },
    onError: (e: any) => {
      setOpen(false);
      toast.error(e.message || "Failed to revoke sessions");
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader title="Security" description="Manage your active sessions and sign-out controls." />

      <SectionCard
        title="Active sessions"
        description="Signing out everywhere invalidates all sessions, including this one — you'll be returned to the home page and asked to sign in again."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: "color-mix(in srgb, var(--color-5) 14%, transparent)",
                color: "var(--color-5)",
              }}
            >
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium">Sign out everywhere</div>
              <p className="text-sm text-muted-foreground">
                Ends every active session on all devices and browsers.
              </p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <LogOut className="h-4 w-4" /> Sign out everywhere
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sign out everywhere?</DialogTitle>
                <DialogDescription>
                  This will sign you out of all devices and browsers, including this session. You'll
                  need to sign in again to continue.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate()}
                >
                  {revoke.isPending ? "Signing out…" : "Yes, sign out everywhere"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SectionCard>

      <SectionCard
        title="Session"
        description="Your current browser session is the one you're using right now."
      >
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            When you sign out everywhere, we bump your session version. Any token issued before that
            moment — including the one for this browser — is rejected on the next request, so you'll
            be returned to the home page to sign in again.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
