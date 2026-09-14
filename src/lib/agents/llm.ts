type LLMResult = {
  content: string | null;
  tool_calls?: { id: string; name: string; arguments: string }[];
};

function safeParse(s: string): any {
  try {
    return JSON.parse(s || "{}");
  } catch {
    return {};
  }
}

export async function callLLM(opts: {
  provider: "openai" | "anthropic";
  apiKey: string;
  model: string;
  messages: any[];
  tools?: any[];
}): Promise<LLMResult> {
  return opts.provider === "openai" ? callOpenAI(opts) : callAnthropic(opts);
}

async function callOpenAI(opts: {
  apiKey: string;
  model: string;
  messages: any[];
  tools?: any[];
}): Promise<LLMResult> {
  const model = opts.model || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + opts.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      tools: opts.tools,
      tool_choice: "auto",
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error("OpenAI error: " + (await res.text()));
  const data: any = await res.json();
  const msg = data.choices?.[0]?.message;
  const tool_calls = msg?.tool_calls?.map((tc: any) => ({
    id: tc.id,
    name: tc.function.name,
    arguments: tc.function.arguments,
  }));
  return { content: msg?.content || null, tool_calls: tool_calls?.length ? tool_calls : undefined };
}

async function callAnthropic(opts: {
  apiKey: string;
  model: string;
  messages: any[];
  tools?: any[];
}): Promise<LLMResult> {
  const model = opts.model || "claude-3-5-sonnet-20241022";
  const systemParts: string[] = [];
  const translated: any[] = [];
  for (const m of opts.messages) {
    if (m.role === "system") {
      if (m.content) systemParts.push(typeof m.content === "string" ? m.content : String(m.content));
      continue;
    }
    if (m.role === "user") {
      translated.push({
        role: "user",
        content: Array.isArray(m.content) ? m.content : [{ type: "text", text: m.content }],
      });
    } else if (m.role === "assistant") {
      if (m.tool_calls && m.tool_calls.length) {
        translated.push({
          role: "assistant",
          content: [
            { type: "text", text: m.content || "" },
            ...m.tool_calls.map((tc: any) => ({
              type: "tool_use",
              id: tc.id,
              name: tc.function.name,
              input: safeParse(tc.function.arguments),
            })),
          ],
        });
      } else {
        translated.push({ role: "assistant", content: [{ type: "text", text: m.content || "" }] });
      }
    } else if (m.role === "tool") {
      translated.push({
        role: "user",
        content: [{ type: "tool_result", tool_use_id: m.tool_call_id, content: String(m.content) }],
      });
    }
  }
  const system = systemParts.join("\n");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      system,
      messages: translated,
      max_tokens: 4096,
      tools: opts.tools,
    }),
  });
  if (!res.ok) throw new Error("Anthropic error: " + (await res.text()));
  const data: any = await res.json();
  const text = (data.content || [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");
  const tool_calls = (data.content || [])
    .filter((b: any) => b.type === "tool_use")
    .map((b: any) => ({ id: b.id, name: b.name, arguments: JSON.stringify(b.input) }));
  return { content: text || null, tool_calls: tool_calls.length ? tool_calls : undefined };
}
