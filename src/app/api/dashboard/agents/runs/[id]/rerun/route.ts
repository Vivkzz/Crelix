import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { executeAgentRun } from "@/lib/agents/execute";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Load the original run; only its owner may rerun it.
  const run = await db.agentRun.findUnique({ where: { id } });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (run.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // The agent must still exist (it may have been deleted since the original run).
  const agent = await db.agent.findUnique({ where: { id: run.agentId } });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const result = await executeAgentRun(agent, run.input, user);
    // An LLM agent with no resolvable key returns a (uncharged) failed run —
    // surface it as a clean 400 so the client can prompt for a key.
    if (result.status === "failed" && (result.error || "").startsWith("No API key")) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ runId: result.id, status: result.status }, { status: 201 });
  } catch (e: any) {
    if (e?.message?.includes("Insufficient")) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
    return NextResponse.json({ error: e?.message || "Run failed" }, { status: 500 });
  }
}
