import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authByApiKey } from "@/lib/auth-apikey";
import { executeAgentRun } from "@/lib/agents/execute";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Programmatic agent run endpoint. Authenticated by an `eai_` API key
 * (Authorization: Bearer eai_… or x-api-key). The key's owner must own the
 * agent. Shares the same execution path as the interactive /run SSE route.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authByApiKey(req);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized — provide a valid eai_ API key" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  if (agent.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const input =
    (typeof body.input === "string" ? body.input.trim() : "") ||
    agent.systemPrompt ||
    "Run the agent.";

  let run;
  try {
    run = await executeAgentRun(agent, input, user);
  } catch (e: any) {
    if (e?.message?.includes("Insufficient")) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
    return NextResponse.json(
      { error: e?.message || "Run failed" },
      { status: 500 },
    );
  }

  if (run.status === "failed" && run.error?.startsWith("No API key")) {
    return NextResponse.json({ error: run.error }, { status: 400 });
  }

  let artifacts: any[] = [];
  try {
    artifacts = JSON.parse(run.artifacts || "[]");
  } catch {
    artifacts = [];
  }

  return NextResponse.json({
    runId: run.id,
    status: run.status,
    finalMessage: run.finalMessage,
    artifacts,
  });
}
