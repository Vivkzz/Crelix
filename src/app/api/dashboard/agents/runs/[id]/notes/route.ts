import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getOwnedRun(id: string, userId: string) {
  const run = await db.agentRun.findUnique({ where: { id } });
  if (!run || run.userId !== userId) return null;
  return run;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const run = await getOwnedRun(id, user.id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const notes = await db.agentRunNote.findMany({
    where: { runId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const run = await getOwnedRun(id, user.id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const text = (body.body ?? "").toString().trim();
  if (!text) return NextResponse.json({ error: "Note body is required" }, { status: 400 });

  const note = await db.agentRunNote.create({
    data: { runId: id, userId: user.id, body: text },
  });

  return NextResponse.json({ note }, { status: 201 });
}
