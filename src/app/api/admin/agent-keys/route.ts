import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** All agent API keys across the platform, with the owning user's email. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.apiKey.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const keys = rows.map((k) => ({
    id: k.id,
    label: k.label,
    prefix: k.prefix,
    lastUsedAt: k.lastUsedAt,
    createdAt: k.createdAt,
    revokedAt: k.revokedAt,
    userEmail: k.user?.email ?? null,
  }));

  return NextResponse.json({ keys });
}

/** Revoke an agent API key by id. Idempotent: a no-op if already revoked. */
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = (body.id ?? "").toString();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await db.apiKey.findUnique({ where: { id } });
  if (existing && !existing.revokedAt) {
    await db.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  await audit(admin.id, "agentkey.revoke", "ApiKey", id);
  return NextResponse.json({ ok: true });
}
