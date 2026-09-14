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

  const schedules = await db.agentSchedule.findMany({
    where: { agentId: id, userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ schedules });
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
  const intervalMinutes = Number(body.intervalMinutes);
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!Number.isFinite(intervalMinutes) || intervalMinutes < 5) {
    return NextResponse.json({ error: "Interval must be at least 5 minutes" }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const schedule = await db.agentSchedule.create({
    data: {
      agentId: id,
      userId: user.id,
      intervalMinutes: Math.floor(intervalMinutes),
      prompt,
      active: true,
    },
  });

  await audit(user.id, "agentschedule.create", "AgentSchedule", schedule.id);
  return NextResponse.json({ schedule }, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const scheduleId = new URL(req.url).searchParams.get("scheduleId");
  if (!scheduleId) return NextResponse.json({ error: "scheduleId is required" }, { status: 400 });

  const schedule = await db.agentSchedule.findUnique({ where: { id: scheduleId } });
  if (!schedule || schedule.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.agentSchedule.delete({ where: { id: scheduleId } });
  await audit(user.id, "agentschedule.delete", "AgentSchedule", scheduleId);
  return NextResponse.json({ ok: true });
}
