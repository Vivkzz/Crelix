"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LifeBuoy, Send, MessageSquare } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

function timeAgo(d: string | number | Date) {
  const date = new Date(d);
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const GRADIENT_BTN = "hover:opacity-90";

function statusColor(s: string) {
  if (s === "open") return "var(--color-2)";
  if (s === "replied") return "var(--color-1)";
  if (s === "closed") return "var(--color-5)";
  return undefined;
}

export default function SupportPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api("/api/dashboard/tickets"),
  });

  const [sSubject, setSSubject] = useState("");
  const [sMessage, setSMessage] = useState("");
  const [fSubject, setFSubject] = useState("");
  const [fMessage, setFMessage] = useState("");

  const create = useMutation({
    mutationFn: (b: { subject: string; message: string; type?: string }) =>
      api("/api/dashboard/tickets", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: () => {
      toast.success("Submitted. We'll get back to you.");
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to submit"),
  });

  const close = useMutation({
    mutationFn: (id: string) =>
      api(`/api/dashboard/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "closed" }),
      }),
    onSuccess: () => {
      toast.success("Ticket closed");
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to close ticket"),
  });

  const tickets: any[] = data?.tickets ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <Toaster richColors position="bottom-right" />
      <PageHeader
        title="Support"
        description="Get help or share feedback with the EKAM AI team."
      />

      <Tabs defaultValue="support">
        <TabsList>
          <TabsTrigger value="support">
            <LifeBuoy className="h-4 w-4" /> Support
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4" /> Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support">
          <SectionCard
            title="Open a support ticket"
            description="Tell us what's going wrong and we'll look into it."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!sSubject || !sMessage) return;
                create.mutate({ subject: sSubject, message: sMessage, type: "support" });
                setSSubject("");
                setSMessage("");
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="s-subject">Subject</Label>
                <Input
                  id="s-subject"
                  value={sSubject}
                  onChange={(e) => setSSubject(e.target.value)}
                  placeholder="Brief summary of the issue"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-message">Message</Label>
                <Textarea
                  id="s-message"
                  value={sMessage}
                  onChange={(e) => setSMessage(e.target.value)}
                  placeholder="Describe what happened, steps to reproduce, and what you expected."
                  rows={5}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className={GRADIENT_BTN}
                  disabled={create.isPending || !sSubject || !sMessage}
                  style={{ background: "var(--gradient-linear-3)", color: "#fff", border: "none" }}
                >
                  <Send className="h-4 w-4" /> Submit ticket
                </Button>
              </div>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="feedback">
          <SectionCard
            title="Share feedback"
            description="Ideas, feature requests, or things you love."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!fSubject || !fMessage) return;
                create.mutate({ subject: fSubject, message: fMessage, type: "feedback" });
                setFSubject("");
                setFMessage("");
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="f-subject">Subject</Label>
                <Input
                  id="f-subject"
                  value={fSubject}
                  onChange={(e) => setFSubject(e.target.value)}
                  placeholder="What's this about?"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-message">Message</Label>
                <Textarea
                  id="f-message"
                  value={fMessage}
                  onChange={(e) => setFMessage(e.target.value)}
                  placeholder="Tell us what you think."
                  rows={5}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className={GRADIENT_BTN}
                  disabled={create.isPending || !fSubject || !fMessage}
                  style={{ background: "var(--gradient-linear-3)", color: "#fff", border: "none" }}
                >
                  <Send className="h-4 w-4" /> Send feedback
                </Button>
              </div>
            </form>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <SectionCard title="My tickets" description="Tickets you've submitted, newest first.">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading tickets…
          </div>
        ) : error ? (
          <EmptyState
            icon={LifeBuoy}
            title="Couldn't load tickets"
            description={(error as Error).message}
          />
        ) : tickets.length ? (
          <div className="divide-y divide-border">
            {tickets.map((t: any) => (
              <div key={t.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <BadgePill color={statusColor(t.status)}>{t.status}</BadgePill>
                    <BadgePill>{t.type}</BadgePill>
                    <span className="text-sm font-medium">{t.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{timeAgo(t.createdAt)}</span>
                    {t.status !== "closed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={close.isPending}
                        onClick={() => close.mutate(t.id)}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {t.message}
                </p>
                {t.reply && (
                  <div className="mt-2 rounded-md border border-border bg-muted/40 p-3 text-sm">
                    <div className="text-xs font-medium text-muted-foreground">
                      Reply from EKAM AI
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{t.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={LifeBuoy}
            title="No tickets yet"
            description="Submit a ticket above and it'll show up here."
          />
        )}
      </SectionCard>
    </div>
  );
}
