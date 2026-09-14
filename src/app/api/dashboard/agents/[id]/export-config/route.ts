import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
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

  let tools: unknown = [];
  try {
    tools = JSON.parse(agent.tools || "[]");
  } catch {
    tools = [];
  }

  const config = {
    name: agent.name,
    systemPrompt: agent.systemPrompt,
    provider: agent.provider,
    model: agent.model,
    tools,
    playbookId: agent.playbookId,
  };

  const body = JSON.stringify(config, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="agent.json"',
    },
  });
}
