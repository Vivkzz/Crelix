import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PROVIDERS = ["playbook", "openai", "anthropic"];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.agentTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    templates: rows.map((t) => ({ ...t, tools: JSON.parse(t.tools || "[]") })),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    (typeof body.description === "string" ? body.description.trim() : "") || null;
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const provider = typeof body.provider === "string" ? body.provider : "";
  const model = typeof body.model === "string" ? body.model.trim() : "";
  const playbookId = typeof body.playbookId === "string" ? body.playbookId.trim() : "";
  const systemPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt : "";
  const tools = Array.isArray(body.tools)
    ? body.tools.filter((t: unknown) => typeof t === "string")
    : [];
  const active = body.active !== undefined ? !!body.active : true;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const t = await db.agentTemplate.create({
    data: {
      name,
      description,
      category: category || "General",
      provider,
      model: model || null,
      tools: JSON.stringify(tools || []),
      playbookId: playbookId || null,
      systemPrompt: systemPrompt || null,
      active: active !== false,
    },
  });

  await audit(admin.id, "agenttemplate.create", "AgentTemplate", t.id);
  return NextResponse.json(
    { template: { ...t, tools: JSON.parse(t.tools || "[]") } },
    { status: 201 },
  );
}
