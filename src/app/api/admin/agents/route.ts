import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const userId = searchParams.get("userId") || undefined;

  const rows = await db.agent.findMany({
    where: {
      AND: [
        ...(userId ? [{ userId }] : []),
        ...(q ? [{ name: { contains: q } }] : []),
      ],
    },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const agents = rows.map((a) => ({
    ...a,
    tools: JSON.parse(a.tools || "[]"),
    tags: (() => {
      try {
        return JSON.parse(a.tags || "[]");
      } catch {
        return [];
      }
    })(),
    userEmail: a.user.email,
    userName: a.user.name,
  }));

  return NextResponse.json({ agents });
}
