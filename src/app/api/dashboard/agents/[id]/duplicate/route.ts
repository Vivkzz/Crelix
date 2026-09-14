import { NextResponse } from "next/server";
import { getCurrentUser, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const created = await db.agent.create({
    data: {
      userId: user.id,
      name: `${agent.name} (copy)`,
      systemPrompt: agent.systemPrompt,
      provider: agent.provider,
      model: agent.model,
      tools: agent.tools,
      playbookId: agent.playbookId,
      tags: agent.tags,
    },
  });

  await audit(user.id, "agent.create", "Agent", created.id);

  return NextResponse.json(
    {
      agent: {
        ...created,
        tools: JSON.parse(created.tools || "[]"),
        tags: (() => {
          try {
            return JSON.parse(created.tags || "[]");
          } catch {
            return [];
          }
        })(),
      },
    },
    { status: 201 },
  );
}
