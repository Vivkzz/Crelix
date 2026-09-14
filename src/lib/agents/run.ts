import { callLLM } from "@/lib/agents/llm";
import { anthropicToolSchemas, executeTool, openaiToolSchemas } from "@/lib/agents/tools";
import type { AgentEvent } from "@/lib/agents/types";

export async function* runLLMAgent(opts: {
  systemPrompt?: string;
  input: string;
  tools: string[];
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
}): AsyncGenerator<AgentEvent> {
  const messages: any[] = [
    {
      role: "system",
      content:
        opts.systemPrompt ||
        "You are EKAM AI, an autonomous agent. Use the available tools to accomplish the user's goal. Be concise. When finished, reply with a short summary.",
    },
    { role: "user", content: opts.input },
  ];
  const toolSchemas =
    opts.provider === "openai" ? openaiToolSchemas(opts.tools) : anthropicToolSchemas(opts.tools);

  let stopped = false;
  for (let i = 0; i < 12; i++) {
    const resp = await callLLM({
      provider: opts.provider,
      apiKey: opts.apiKey,
      model: opts.model,
      messages,
      tools: toolSchemas,
    });

    messages.push({
      role: "assistant",
      content: resp.content || null,
      tool_calls: resp.tool_calls?.map((tc) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.name, arguments: tc.arguments },
      })),
    });

    if (resp.content) yield { type: "message", content: resp.content };
    if (!resp.tool_calls?.length) {
      stopped = true;
      break;
    }

    for (const tc of resp.tool_calls) {
      const name = tc.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.arguments || "{}");
      } catch {
        args = {};
      }
      yield { type: "tool_call", tool: name, args };
      const result = await executeTool(name, args);
      yield { type: "tool_result", tool: name, result };

      if (name === "generate_page" && result?.html) {
        yield {
          type: "artifact",
          artifact: { title: result.title || "Generated page", type: "html", content: result.html },
        };
      }
      if (name === "run_scan" && result?.findings) {
        yield {
          type: "artifact",
          artifact: { title: "Scan: " + result.target, type: "json", content: JSON.stringify(result, null, 2) },
        };
      }
      if (name === "research_topic" && result?.markdown) {
        yield {
          type: "artifact",
          artifact: { title: "Research: " + result.topic, type: "markdown", content: result.markdown },
        };
      }

      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result).slice(0, 4000),
      });
    }
  }

  if (!stopped) {
    yield { type: "message", content: "Reached the maximum number of steps." };
  }
}
