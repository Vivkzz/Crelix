import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  if (body.action !== "cancel") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const run = await db.agentRun.findUnique({ where: { id } });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (run.status === "running") {
    await db.agentRun.update({
      where: { id },
      data: { status: "failed", error: "Cancelled by admin" },
    });
  }

  await audit(admin.id, "admin.agentrun.cancel", "AgentRun", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  await db.agentRun.delete({ where: { id } });
  await audit(admin.id, "admin.agentrun.delete", "AgentRun", id);

  return NextResponse.json({ ok: true });
}
