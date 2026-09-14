import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PROVIDERS = ["playbook", "openai", "anthropic"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await db.agentTemplate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    data.name = name;
  }
  if (body.description !== undefined)
    data.description =
      (typeof body.description === "string" ? body.description.trim() : "") || null;
  if (body.category !== undefined)
    data.category =
      (typeof body.category === "string" ? body.category.trim() : "") || "General";
  if (body.provider !== undefined) {
    if (!PROVIDERS.includes(body.provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }
    data.provider = body.provider;
  }
  if (body.model !== undefined)
    data.model = (typeof body.model === "string" ? body.model.trim() : "") || null;
  if (body.playbookId !== undefined)
    data.playbookId =
      (typeof body.playbookId === "string" ? body.playbookId.trim() : "") || null;
  if (body.systemPrompt !== undefined)
    data.systemPrompt =
      (typeof body.systemPrompt === "string" ? body.systemPrompt : "") || null;
  if (body.tools !== undefined)
    data.tools = JSON.stringify(
      Array.isArray(body.tools) ? body.tools.filter((t: unknown) => typeof t === "string") : [],
    );
  if (body.active !== undefined) data.active = !!body.active;

  const t = await db.agentTemplate.update({ where: { id }, data });
  await audit(admin.id, "agenttemplate.update", "AgentTemplate", id);

  return NextResponse.json({ template: { ...t, tools: JSON.parse(t.tools || "[]") } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await db.agentTemplate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.agentTemplate.delete({ where: { id } });
  await audit(admin.id, "agenttemplate.delete", "AgentTemplate", id);

  return NextResponse.json({ ok: true });
}
