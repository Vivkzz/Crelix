import { NextResponse } from "next/server";
import { getCurrentUser, audit } from "@/lib/guards";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const run = await db.agentRun.findUnique({ where: { id } });
  if (!run || run.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Already shared — return the existing token without regenerating.
  if (run.shareToken) {
    return NextResponse.json({ shareToken: run.shareToken, url: `/share/runs/${run.shareToken}` });
  }

  const token = "shr_" + randomBytes(16).toString("hex");
  await db.agentRun.update({ where: { id }, data: { shareToken: token } });
  await audit(user.id, "agentrun.share", "AgentRun", id);

  return NextResponse.json({ shareToken: token, url: `/share/runs/${token}` });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const run = await db.agentRun.findUnique({ where: { id } });
  if (!run || run.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.agentRun.update({ where: { id }, data: { shareToken: null } });
  await audit(user.id, "agentrun.unshare", "AgentRun", id);

  return NextResponse.json({ ok: true });
}
