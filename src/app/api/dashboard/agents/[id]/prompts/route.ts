import { NextResponse } from "next/server";
import { getCurrentUser, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const prompts = await db.savedPrompt.findMany({
    where: { agentId: id, userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ prompts });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const input = typeof body.input === "string" ? body.input.trim() : "";
  if (!label || !input) {
    return NextResponse.json({ error: "label and input are required" }, { status: 400 });
  }
  const prompt = await db.savedPrompt.create({
    data: { agentId: id, userId: user.id, label, input },
  });
  await audit(user.id, "savedprompt.create", "SavedPrompt", prompt.id);
  return NextResponse.json({ prompt }, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const promptId = searchParams.get("promptId");
  if (!promptId) {
    return NextResponse.json({ error: "promptId is required" }, { status: 400 });
  }
  const existing = await db.savedPrompt.findUnique({ where: { id: promptId } });
  if (!existing || existing.userId !== user.id || existing.agentId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.savedPrompt.delete({ where: { id: promptId } });
  await audit(user.id, "savedprompt.delete", "SavedPrompt", promptId);
  return NextResponse.json({ ok: true });
}
