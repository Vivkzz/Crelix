import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/guards";
import { spendCredits } from "@/lib/credits";
import { CREDIT_COSTS } from "@/lib/constants";
import { runPlaybook } from "@/lib/agents/playbooks";
import { runLLMAgent } from "@/lib/agents/run";
import { decryptKey } from "@/lib/agents/crypto";
import type { AgentEvent } from "@/lib/agents/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-store, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent || agent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const input = ((body.input as string) || "").trim() || agent.systemPrompt || "Run the agent.";

  // Resolve the LLM key/model/tools BEFORE charging, so a missing key is a
  // clean config error (400, no credits spent, no run row) rather than a
  // charged failure streamed over SSE.
  let apiKey = "";
  let model = agent.model || "";
  let tools: string[] = [];
  if (agent.provider !== "playbook") {
    const userKey = await db.userKey.findUnique({
      where: { userId_provider: { userId: user.id, provider: agent.provider } },
    });
    if (userKey) {
      try {
        apiKey = decryptKey({ cipher: userKey.keyCipher, iv: userKey.keyIv, tag: userKey.keyTag });
      } catch {
        apiKey = "";
      }
    }
    if (!apiKey) {
      apiKey =
        agent.provider === "openai" ? process.env.OPENAI_API_KEY || "" : process.env.ANTHROPIC_API_KEY || "";
    }
    if (!apiKey) {
      return NextResponse.json(
        {
          error: `No API key configured for ${agent.provider}. Add one in Agents \u2192 Keys or set the server key.`,
        },
        { status: 400 },
      );
    }
    model = model || (agent.provider === "openai" ? "gpt-4o-mini" : "claude-3-5-sonnet-20241022");
    try {
      tools = JSON.parse(agent.tools || "[]");
    } catch {
      tools = [];
    }
    if (!tools.length) tools = ["web_search", "web_fetch", "research_topic", "generate_page", "run_scan"];
  }

  const cost = agent.provider === "playbook" ? CREDIT_COSTS.agentPlaybook : CREDIT_COSTS.agentLLM;
  try {
    await spendCredits(user.id, cost, "agent.run", id);
  } catch {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const run = await db.agentRun.create({
    data: {
      agentId: agent.id,
      userId: user.id,
      input,
      status: "running",
      provider: agent.provider,
      model: agent.provider === "playbook" ? agent.model : model,
    },
  });

  const gen: AsyncGenerator<AgentEvent> =
    agent.provider === "playbook"
      ? runPlaybook(agent.playbookId || "launch", input)
      : runLLMAgent({
          systemPrompt: agent.systemPrompt || undefined,
          input,
          tools,
          provider: agent.provider as "openai" | "anthropic",
          model,
          apiKey,
        });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const push = (ev: AgentEvent) =>
        controller.enqueue(enc.encode("data: " + JSON.stringify(ev) + "\n\n"));
      const steps: any[] = [];
      const artifacts: any[] = [];
      let finalMessage: string | null = null;
      let errorMsg: string | null = null;

      push({ type: "run_started", runId: run.id });
      try {
        for await (const ev of gen) {
          push(ev);
          if (ev.type === "step") {
            steps.push(ev.step);
          } else if (ev.type === "tool_call") {
            steps.push({ id: randomUUID(), title: "Tool: " + ev.tool, status: "done" });
          } else if (ev.type === "artifact") {
            artifacts.push(ev.artifact);
          } else if (ev.type === "message") {
            finalMessage = ev.content;
          } else if (ev.type === "error") {
            errorMsg = ev.message;
          }
        }
        if (errorMsg) {
          await db.agentRun.update({
            where: { id: run.id },
            data: {
              status: "failed",
              error: errorMsg,
              steps: JSON.stringify(steps),
              artifacts: JSON.stringify(artifacts),
            },
          });
          push({ type: "error", message: errorMsg });
        } else {
          await db.agentRun.update({
            where: { id: run.id },
            data: {
              status: "completed",
              finalMessage: finalMessage || undefined,
              steps: JSON.stringify(steps),
              artifacts: JSON.stringify(artifacts),
            },
          });
          push({ type: "done", runId: run.id, finalMessage: finalMessage || undefined });
        }
      } catch (e: any) {
        await db.agentRun.update({
          where: { id: run.id },
          data: {
            status: "failed",
            error: e?.message || "Run failed",
            steps: JSON.stringify(steps),
            artifacts: JSON.stringify(artifacts),
          },
        });
        push({ type: "error", message: e?.message || "Run failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
