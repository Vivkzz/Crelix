import { NextResponse } from "next/server";
import { getCurrentUser, audit } from "@/lib/guards";
import { db } from "@/lib/db";

const PROVIDERS = ["playbook", "openai", "anthropic"];

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const tag = sp.get("tag") || undefined;
  const onlyFavorite = sp.get("favorite") === "1";

  let agents = await db.agent.findMany({
    where: { userId: user.id },
    orderBy: [{ favorited: "desc" }, { createdAt: "desc" }],
  });

  if (onlyFavorite) agents = agents.filter((a) => a.favorited);
  if (tag) {
    agents = agents.filter((a) => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(a.tags || "[]");
      } catch {
        tags = [];
      }
      return Array.isArray(tags) && tags.includes(tag);
    });
  }

  return NextResponse.json({
    agents: agents.map((a) => ({
      ...a,
      tools: JSON.parse(a.tools || "[]"),
      tags: (() => {
        try {
          return JSON.parse(a.tags || "[]");
        } catch {
          return [];
        }
      })(),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!PROVIDERS.includes(body.provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const provider: string = body.provider;
  const systemPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt : undefined;
  const model = typeof body.model === "string" ? body.model : undefined;
  const tools = Array.isArray(body.tools)
    ? body.tools.filter((t: unknown) => typeof t === "string")
    : undefined;
  const playbookId = typeof body.playbookId === "string" ? body.playbookId : undefined;

  const data = {
    userId: user.id,
    name,
    systemPrompt: systemPrompt || null,
    provider,
    model: model || null,
    tools: JSON.stringify(tools || []),
    playbookId: provider === "playbook" ? (playbookId || "launch") : null,
  };

  const agent = await db.agent.create({ data });
  await audit(user.id, "agent.create", "Agent", agent.id);
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
