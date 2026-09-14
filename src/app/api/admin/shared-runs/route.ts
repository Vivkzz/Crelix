import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const runs = await db.agentRun.findMany({
    where: { NOT: { shareToken: null } },
    include: {
      agent: { select: { name: true } },
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    runs: runs.map((r) => ({
      id: r.id,
      agentId: r.agentId,
      agentName: r.agent?.name ?? null,
      userEmail: r.user?.email ?? null,
      shareToken: r.shareToken,
      createdAt: r.createdAt,
      status: r.status,
    })),
  });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = (body.id ?? "").toString();
  if (!id) return NextResponse.json({ error: "Run id is required" }, { status: 400 });
  if (body.revoke !== true) {
    return NextResponse.json({ error: "Nothing to do" }, { status: 400 });
  }

  const existing = await db.agentRun.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.agentRun.update({ where: { id }, data: { shareToken: null } });
  await audit(admin.id, "admin.sharedruns.revoke", "AgentRun", id);

  return NextResponse.json({ ok: true });
}
