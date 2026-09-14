import { db } from "@/lib/db";
import { spendCredits } from "@/lib/credits";
import { CREDIT_COSTS } from "@/lib/constants";
import { runPlaybook } from "@/lib/agents/playbooks";
import { runLLMAgent } from "@/lib/agents/run";
import { decryptKey } from "@/lib/agents/crypto";
import { randomUUID } from "crypto";
import type { AgentEvent } from "@/lib/agents/types";
import type { Agent, AgentRun, User } from "@prisma/client";

/**
 * Execute an agent run to completion (no SSE streaming) and persist the result.
 * Used by the rerun, scheduled-run (cron) and programmatic (v1) paths so they
 * share identical logic to the interactive `/run` SSE route.
 *
 * - For an LLM agent with NO resolvable key: a `failed` run row is created and
 *   returned WITHOUT spending credits (caller may surface this as a 400).
 * - On insufficient credits: `spendCredits` throws "Insufficient credits" and
 *   the caller is responsible for the 402 response (no run row is created).
 * - Otherwise credits are spent, a `running` row is created, the generator is
 *   drained, and the row is updated to `completed` or `failed`.
 */
export async function executeAgentRun(agent: Agent, input: string, user: User): Promise<AgentRun> {
  // 1. Resolve key / model / tools (LLM only).
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
      return db.agentRun.create({
        data: {
          agentId: agent.id,
          userId: user.id,
          input,
          status: "failed",
          provider: agent.provider,
          model: agent.model,
          error: `No API key configured for ${agent.provider}. Add one in Agents → Keys or set the server key.`,
        },
      });
    }
    model = model || (agent.provider === "openai" ? "gpt-4o-mini" : "claude-3-5-sonnet-20241022");
    try {
      tools = JSON.parse(agent.tools || "[]");
    } catch {
      tools = [];
    }
    if (!tools.length) tools = ["web_search", "web_fetch", "research_topic", "generate_page", "run_scan"];
  }

  // 2. Spend credits (throws on insufficient → caller handles 402).
  const cost = agent.provider === "playbook" ? CREDIT_COSTS.agentPlaybook : CREDIT_COSTS.agentLLM;
  await spendCredits(user.id, cost, "agent.run", agent.id);

  // 3. Create the run row (running).
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

  // 4. Run the generator and collect events.
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

  const steps: any[] = [];
  const artifacts: any[] = [];
  let finalMessage: string | null = null;
  let errorMsg: string | null = null;

  try {
    for await (const ev of gen) {
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
      return db.agentRun.update({
        where: { id: run.id },
        data: { status: "failed", error: errorMsg, steps: JSON.stringify(steps), artifacts: JSON.stringify(artifacts) },
      });
    }
    return db.agentRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        finalMessage: finalMessage || undefined,
        steps: JSON.stringify(steps),
        artifacts: JSON.stringify(artifacts),
      },
    });
  } catch (e: any) {
    return db.agentRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        error: e?.message || "Run failed",
        steps: JSON.stringify(steps),
        artifacts: JSON.stringify(artifacts),
      },
    });
  }
}
