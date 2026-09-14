import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = new URL(req.url).searchParams.get("type") || "";

  const runs = await db.agentRun.findMany({
    where: { userId: user.id },
    select: { id: true, artifacts: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const artifacts: any[] = [];
  for (const run of runs) {
    let items: any[] = [];
    try {
      items = JSON.parse(run.artifacts || "[]");
    } catch {
      items = [];
    }
    items.forEach((a, i) => {
      if (type && a.type !== type) return;
      artifacts.push({
        runId: run.id,
        idx: i,
        title: a.title || "Untitled",
        type: a.type,
        content: a.content ?? "",
        createdAt: run.createdAt,
      });
    });
  }

  return NextResponse.json({ artifacts: artifacts.slice(0, 500) });
}
