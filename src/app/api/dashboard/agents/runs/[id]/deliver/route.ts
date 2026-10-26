import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseArr<T>(s: string | null | undefined): T[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const run = await db.agentRun.findUnique({ where: { id } });
  if (!run || run.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const to = body.to;

  if (to === "email") {
    const email = (body.email ?? "").toString().trim();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const artifacts = parseArr<{ title?: string; type?: string }>(run.artifacts);
    const html = `
<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;color:#0a0a0a">
  <h2 style="margin-bottom:4px">Your Crelix AI run result</h2>
  <p style="color:#666;margin-top:0">Run <code>${escapeHtml(run.id)}</code> &middot; ${escapeHtml(run.status)}</p>
  ${run.finalMessage ? `<h3>Final answer</h3><div style="white-space:pre-wrap;border-left:3px solid #eee;padding-left:12px;margin-bottom:16px">${escapeHtml(run.finalMessage)}</div>` : ""}
  ${artifacts.length ? `<h3>Artifacts</h3><ul style="padding-left:18px">${artifacts.map((a) => `<li>${escapeHtml(a.title || a.type || "artifact")}</li>`).join("")}</ul>` : ""}
  <p style="margin-top:24px;color:#999;font-size:12px">Sent via Crelix AI</p>
</div>`;

    const ok = await sendEmail(email, "Your Crelix AI run result", html);
    return NextResponse.json({ ok, delivered: ok });
  }

  if (to === "webhook") {
    const webhookUrl = (body.webhookUrl ?? "").toString().trim();
    if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
      return NextResponse.json({ error: "A valid webhook URL is required" }, { status: 400 });
    }

    let artifacts: unknown[] = [];
    try {
      artifacts = JSON.parse(run.artifacts || "[]");
    } catch {
      artifacts = [];
    }

    let res: Response;
    try {
      res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: run.id,
          status: run.status,
          finalMessage: run.finalMessage,
          artifacts,
        }),
      });
    } catch {
      return NextResponse.json({ ok: false }, { status: 502 });
    }

    return NextResponse.json({ ok: res.ok });
  }

  return NextResponse.json({ error: "Unknown delivery target" }, { status: 400 });
}
