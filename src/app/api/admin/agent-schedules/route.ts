import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedules = await db.agentSchedule.findMany({
    include: {
      agent: { select: { name: true } },
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json({
    schedules: schedules.map(({ agent, user, ...rest }) => ({
      ...rest,
      agentName: agent?.name ?? null,
      userEmail: user?.email ?? null,
    })),
  });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.agentSchedule.update({
    where: { id },
    data: { active: !!body.active },
  });

  await audit(admin.id, "admin.agentschedule.toggle", "AgentSchedule", id);
  return NextResponse.json({ ok: true });
}
