import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const run = await db.agentRun.findUnique({ where: { shareToken: token } });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Public-safe payload: never expose userId or the error field.
  return NextResponse.json({
    run: {
      id: run.id,
      status: run.status,
      provider: run.provider,
      model: run.model,
      input: run.input,
      steps: run.steps,
      artifacts: run.artifacts,
      finalMessage: run.finalMessage,
      createdAt: run.createdAt,
    },
  });
}
