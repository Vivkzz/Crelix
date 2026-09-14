import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "";
  const userId = url.searchParams.get("user") || "";

  const runs = await db.agentRun.findMany({
    where: { ...(userId ? { userId } : {}) },
    select: {
      id: true,
      artifacts: true,
      createdAt: true,
      userId: true,
      // Nested relation select (Prisma forbids top-level include + select together).
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const artifacts: any[] = [];
  for (const run of runs) {
    let items: any[] = [];
    try {
      items = JSON.parse(run.artifacts || "[]");
    } catch {
      items = [];
    }
    for (const a of items) {
      if (type && a.type !== type) continue;
      artifacts.push({
        runId: run.id,
        title: a.title || "Untitled",
        type: a.type,
        content: a.content ?? "",
        createdAt: run.createdAt,
        userEmail: run.user?.email ?? "—",
      });
    }
  }

  return NextResponse.json({ artifacts: artifacts.slice(0, 1000) });
}
