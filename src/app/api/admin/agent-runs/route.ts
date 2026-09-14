import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const agentId = searchParams.get("agentId") || undefined;

  const rows = await db.agentRun.findMany({
    where: {
      AND: [
        ...(status ? [{ status }] : []),
        ...(userId ? [{ userId }] : []),
        ...(agentId ? [{ agentId }] : []),
      ],
    },
    include: {
      agent: { select: { name: true } },
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const runs = rows.map((r) => ({
    id: r.id,
    agentId: r.agentId,
    userId: r.userId,
    status: r.status,
    provider: r.provider,
    model: r.model,
    input: r.input,
    finalMessage: r.finalMessage,
    error: r.error,
    createdAt: r.createdAt,
    agentName: r.agent?.name,
    userEmail: r.user?.email,
  }));

  return NextResponse.json({ runs });
}
