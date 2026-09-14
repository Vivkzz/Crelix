import { NextResponse } from "next/server";
import { getCurrentUser, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PROVIDERS = ["playbook", "openai", "anthropic"];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const rawProvider = typeof body.provider === "string" ? body.provider : undefined;
  const provider = rawProvider || "playbook";
  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const name =
    typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Imported agent";
  const systemPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt : null;
  const model = typeof body.model === "string" && body.model.trim() ? body.model.trim() : null;
  const tools = Array.isArray(body.tools)
    ? JSON.stringify(body.tools.filter((t: unknown) => typeof t === "string"))
    : "[]";
  const playbookId = typeof body.playbookId === "string" && body.playbookId.trim() ? body.playbookId.trim() : null;

  const agent = await db.agent.create({
    data: {
      userId: user.id,
      name,
      systemPrompt: systemPrompt || null,
      provider,
      model: model || null,
      tools,
      playbookId: provider === "playbook" ? (playbookId || "launch") : null,
    },
  });

  await audit(user.id, "agent.create", "Agent", agent.id);

  return NextResponse.json(
    {
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
    },
    { status: 201 },
  );
}
