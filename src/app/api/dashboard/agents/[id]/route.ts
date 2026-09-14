import { NextResponse } from "next/server";
import { getCurrentUser, audit } from "@/lib/guards";
import { db } from "@/lib/db";

const PROVIDERS = ["playbook", "openai", "anthropic"];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    agent: {
      ...agent,
      tools: JSON.parse(agent.tools || "[]"),
      tags: (() => {
        try {
          return JSON.parse(agent.tags || "[]");
        } catch {
          return [];
        }
      })(),
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.systemPrompt === "string") data.systemPrompt = body.systemPrompt || null;
  if (typeof body.model === "string") data.model = body.model || null;
  if (typeof body.playbookId === "string") data.playbookId = body.playbookId || null;
  if (PROVIDERS.includes(body.provider)) data.provider = body.provider;
  if (Array.isArray(body.tools)) {
    data.tools = JSON.stringify(body.tools.filter((t: unknown) => typeof t === "string"));
  }
  if (Array.isArray(body.tags)) {
    data.tags = JSON.stringify(
      body.tags.filter((t: unknown) => typeof t === "string").map((t: string) => t.trim()).filter(Boolean)
    );
  }
  if (typeof body.favorited === "boolean") data.favorited = body.favorited;

  const updated = await db.agent.update({ where: { id }, data });
  await audit(user.id, "agent.update", "Agent", id);
  return NextResponse.json({
    agent: {
      ...updated,
      tools: JSON.parse(updated.tools || "[]"),
      tags: (() => {
        try {
          return JSON.parse(updated.tags || "[]");
        } catch {
          return [];
        }
      })(),
    },
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.agent.delete({ where: { id } });
  await audit(user.id, "agent.delete", "Agent", id);
  return NextResponse.json({ ok: true });
}
