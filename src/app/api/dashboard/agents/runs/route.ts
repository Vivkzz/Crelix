import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const sp = url.searchParams;
  const agentId = sp.get("agentId") || undefined;
  const status = sp.get("status") || undefined;
  const provider = sp.get("provider") || undefined;
  const q = (sp.get("q") || "").trim() || undefined;

  const runs = await db.agentRun.findMany({
    where: {
      userId: user.id,
      ...(agentId ? { agentId } : {}),
      ...(status ? { status } : {}),
      ...(provider ? { provider } : {}),
      ...(q ? { input: { contains: q } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      agentId: true,
      status: true,
      provider: true,
      model: true,
      input: true,
      finalMessage: true,
      error: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ runs });
}
