"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const [status, setStatus] = useState<"verifying" | "error" | "done" | "idle">(
    token ? "verifying" : "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    signIn("magic-link", { token, redirect: false })
      .then((res) => {
        if (!active) return;
        if (res?.error) {
          setStatus("error");
          setError("This link is invalid, expired, or already used.");
        } else {
          setStatus("done");
          router.push(callbackUrl);
          router.refresh();
        }
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setError("Verification failed.");
      });
    return () => {
      active = false;
    };
  }, [token, callbackUrl, router]);

  return (
    <AuthCard
      title={token ? "Verifying…" : "Check your inbox"}
      subtitle={
        token
          ? "Signing you in."
          : email
            ? `We sent a sign-in link to ${email}.`
            : "We sent a sign-in link."
      }
      footer={<Link href="/login" className="hover:underline">Use a different email</Link>}
    >
      {status === "verifying" && <p className="text-sm text-muted-foreground">One moment…</p>}
      {status === "done" && <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>}
      {status === "error" && <p className="text-sm text-destructive">{error}</p>}
      {status === "idle" && (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>The link expires in 15 minutes and works once. Open it in the same browser.</p>
          <Button asChild variant="outline">
            <Link href="/login">Resend link</Link>
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
