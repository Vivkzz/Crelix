import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const get = async (k: string, d: number) => {
    const s = await db.siteSetting.findUnique({ where: { key: k } });
    return s ? Number(s.value) : d;
  };

  const maxPerUser = await get("agents.maxPerUser", 20);
  const maxRunsPerDay = await get("agents.maxRunsPerDay", 100);

  return NextResponse.json({ maxPerUser, maxRunsPerDay });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const maxPerUser = Math.floor(Number(body.maxPerUser));
  const maxRunsPerDay = Math.floor(Number(body.maxRunsPerDay));

  if (Number.isNaN(maxPerUser) || Number.isNaN(maxRunsPerDay)) {
    return NextResponse.json({ error: "maxPerUser and maxRunsPerDay must be numbers" }, { status: 400 });
  }

  await db.siteSetting.upsert({
    where: { key: "agents.maxPerUser" },
    create: { key: "agents.maxPerUser", value: String(maxPerUser) },
    update: { value: String(maxPerUser) },
  });
  await db.siteSetting.upsert({
    where: { key: "agents.maxRunsPerDay" },
    create: { key: "agents.maxRunsPerDay", value: String(maxRunsPerDay) },
    update: { value: String(maxRunsPerDay) },
  });

  await audit(admin.id, "admin.agentlimits.update", "SiteSetting", null, { maxPerUser, maxRunsPerDay });

  return NextResponse.json({ ok: true, maxPerUser, maxRunsPerDay });
}
