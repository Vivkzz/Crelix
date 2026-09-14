export type Artifact = {
  title: string;
  type: "html" | "markdown" | "json" | "text";
  content: string;
};

export type RunStep = { id: string; title: string; status: "running" | "done" | "error" };

export type AgentEvent =
  | { type: "run_started"; runId: string }
  | { type: "step"; step: RunStep }
  | { type: "tool_call"; tool: string; args: Record<string, unknown> }
  | { type: "tool_result"; tool: string; result: unknown }
  | { type: "message"; content: string }
  | { type: "artifact"; artifact: Artifact }
  | { type: "done"; runId: string; finalMessage?: string }
  | { type: "error"; message: string };
