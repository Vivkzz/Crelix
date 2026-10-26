import { randomUUID } from "crypto";
import { generateLaunchPage } from "@/lib/integrations/flow";
import { runScan } from "@/lib/integrations/pentest";
import { runResearch } from "@/lib/integrations/search";
import type { AgentEvent } from "@/lib/agents/types";

export type Playbook = {
  id: string;
  name: string;
  description: string;
  steps: string[];
  tools: string[];
};

export const PLAYBOOKS: Playbook[] = [
  {
    id: "launch",
    name: "Launch a product",
    description: "Research the market, generate a landing page, and compile a launch report.",
    steps: ["Research market", "Generate landing page", "Compile report"],
    tools: ["research_topic", "generate_page"],
  },
  {
    id: "security-audit",
    name: "Security audit",
    description: "Run a security scan on a URL, research best practices, and summarize findings.",
    steps: ["Scan target", "Research best practices", "Summarize findings"],
    tools: ["run_scan", "research_topic"],
  },
  {
    id: "market-research",
    name: "Market research",
    description: "Deep market/competitive research on a topic with sources and keywords.",
    steps: ["Run research", "Compile report"],
    tools: ["research_topic"],
  },
  {
    id: "site-check",
    name: "Site check",
    description: "Run a security scan on a target URL and produce a findings report.",
    steps: ["Scan target", "Compile report"],
    tools: ["run_scan"],
  },
];

function step(id: string, title: string, status: "running" | "done" | "error"): AgentEvent {
  return { type: "step", step: { id, title, status } };
}

export async function* runPlaybook(id: string, input: string): AsyncGenerator<AgentEvent> {
  const playbook = PLAYBOOKS.find((p) => p.id === id) || PLAYBOOKS[0];

  if (playbook.id === "launch") {
    let research: any = null;
    let page: any = null;

    const s1 = randomUUID();
    yield step(s1, "Research market", "running");
    try {
      yield { type: "tool_call", tool: "research_topic", args: { topic: input } };
      research = await runResearch(input);
      yield { type: "tool_result", tool: "research_topic", result: research };
      yield {
        type: "artifact",
        artifact: { title: "Research: " + input, type: "markdown", content: research.markdown },
      };
      yield {
        type: "message",
        content: `Researched "${input}". Found ${research.sources.length} sources and ${research.news.length} recent discussions.`,
      };
      yield step(s1, "Research market", "done");
    } catch (e: any) {
      yield step(s1, "Research market", "error");
      yield { type: "error", message: e?.message || "Research market failed" };
      return;
    }

    const s2 = randomUUID();
    yield step(s2, "Generate landing page", "running");
    try {
      yield { type: "tool_call", tool: "generate_page", args: { prompt: input } };
      page = await generateLaunchPage(input);
      yield {
        type: "tool_result",
        tool: "generate_page",
        result: { title: page.title, html: page.html, htmlLength: page.html.length },
      };
      yield {
        type: "artifact",
        artifact: { title: page.title || "Landing page", type: "html", content: page.html },
      };
      yield { type: "message", content: `Generated a landing page for "${page.title}".` };
      yield step(s2, "Generate landing page", "done");
    } catch (e: any) {
      yield step(s2, "Generate landing page", "error");
      yield { type: "error", message: e?.message || "Page generation failed" };
      return;
    }

    const s3 = randomUUID();
    yield step(s3, "Compile report", "running");
    try {
      const report = `# Launch report: ${input}

## Market research
${research?.markdown || "No research available."}

## Landing page
A landing page titled "${page?.title || "Untitled"}" was generated (${page?.html?.length || 0} chars of HTML), ready to preview and deploy.

## Recommended next steps
1. Review the market research above and refine your positioning.
2. Edit the landing page copy to match your brand voice.
3. Run a security scan on the deployed page (Crelix AI \u2192 Scans).
4. Set up a custom domain with HTTPS.
5. Announce the launch and track conversions.
`;
      yield { type: "artifact", artifact: { title: "Launch report", type: "markdown", content: report } };
      yield { type: "message", content: "Launch plan ready." };
      yield step(s3, "Compile report", "done");
    } catch (e: any) {
      yield step(s3, "Compile report", "error");
      yield { type: "error", message: e?.message || "Compile report failed" };
      return;
    }
    return;
  }

  if (playbook.id === "security-audit") {
    let scan: any = null;
    let research: any = null;

    const s1 = randomUUID();
    yield step(s1, "Scan target", "running");
    try {
      yield { type: "tool_call", tool: "run_scan", args: { target: input } };
      scan = await runScan(input);
      yield {
        type: "tool_result",
        tool: "run_scan",
        result: { target: scan.target, score: scan.score, summary: scan.summary, findings: scan.findings },
      };
      yield {
        type: "artifact",
        artifact: { title: "Scan: " + input, type: "json", content: JSON.stringify(scan, null, 2) },
      };
      const high = scan.summary.Critical + scan.summary.High;
      yield {
        type: "message",
        content: `Scanned ${scan.target}: score ${scan.score}/100 with ${high} critical/high findings.`,
      };
      yield step(s1, "Scan target", "done");
    } catch (e: any) {
      yield step(s1, "Scan target", "error");
      yield { type: "error", message: e?.message || "Scan target failed" };
      return;
    }

    const s2 = randomUUID();
    yield step(s2, "Research best practices", "running");
    try {
      yield { type: "tool_call", tool: "research_topic", args: { topic: "security best practices " + input } };
      research = await runResearch("security best practices " + input);
      yield { type: "tool_result", tool: "research_topic", result: research };
      yield {
        type: "artifact",
        artifact: { title: "Best practices: " + input, type: "markdown", content: research.markdown },
      };
      yield { type: "message", content: `Researched security best practices for ${input}.` };
      yield step(s2, "Research best practices", "done");
    } catch (e: any) {
      yield step(s2, "Research best practices", "error");
      yield { type: "error", message: e?.message || "Research best practices failed" };
      return;
    }

    const s3 = randomUUID();
    yield step(s3, "Summarize findings", "running");
    try {
      const s = scan?.summary || {};
      yield {
        type: "message",
        content: `Security audit complete. Target ${scan?.target} scored ${scan?.score}/100 with ${s.Critical || 0} critical, ${s.High || 0} high, ${s.Medium || 0} medium, and ${s.Low || 0} low findings. Prioritize missing security headers and HTTPS enforcement; see the research above for best-practice guidance.`,
      };
      yield step(s3, "Summarize findings", "done");
    } catch (e: any) {
      yield step(s3, "Summarize findings", "error");
      yield { type: "error", message: e?.message || "Summarize findings failed" };
      return;
    }
    return;
  }

  if (playbook.id === "market-research") {
    let research: any = null;

    const s1 = randomUUID();
    yield step(s1, "Run research", "running");
    try {
      yield { type: "tool_call", tool: "research_topic", args: { topic: input } };
      research = await runResearch(input);
      yield { type: "tool_result", tool: "research_topic", result: research };
      yield {
        type: "artifact",
        artifact: { title: "Research: " + input, type: "markdown", content: research.markdown },
      };
      yield {
        type: "message",
        content: `Researched "${input}". Found ${research.sources.length} sources and ${research.news.length} recent discussions.`,
      };
      yield step(s1, "Run research", "done");
    } catch (e: any) {
      yield step(s1, "Run research", "error");
      yield { type: "error", message: e?.message || "Run research failed" };
      return;
    }

    const s2 = randomUUID();
    yield step(s2, "Compile report", "running");
    try {
      yield { type: "message", content: "Market research report compiled from the sources above." };
      yield step(s2, "Compile report", "done");
    } catch (e: any) {
      yield step(s2, "Compile report", "error");
      yield { type: "error", message: e?.message || "Compile report failed" };
      return;
    }
    return;
  }

  if (playbook.id === "site-check") {
    let scan: any = null;

    const s1 = randomUUID();
    yield step(s1, "Scan target", "running");
    try {
      yield { type: "tool_call", tool: "run_scan", args: { target: input } };
      scan = await runScan(input);
      yield {
        type: "tool_result",
        tool: "run_scan",
        result: { target: scan.target, score: scan.score, summary: scan.summary, findings: scan.findings },
      };
      yield {
        type: "artifact",
        artifact: { title: "Scan: " + input, type: "json", content: JSON.stringify(scan, null, 2) },
      };
      const s = scan.summary || {};
      yield {
        type: "message",
        content: `Scanned ${scan.target}: score ${scan.score}/100 with ${s.Critical || 0} critical, ${s.High || 0} high, ${s.Medium || 0} medium, and ${s.Low || 0} low findings.`,
      };
      yield step(s1, "Scan target", "done");
    } catch (e: any) {
      yield step(s1, "Scan target", "error");
      yield { type: "error", message: e?.message || "Scan target failed" };
      return;
    }

    const s2 = randomUUID();
    yield step(s2, "Compile report", "running");
    try {
      yield { type: "message", content: "Findings report compiled from the scan above." };
      yield step(s2, "Compile report", "done");
    } catch (e: any) {
      yield step(s2, "Compile report", "error");
      yield { type: "error", message: e?.message || "Compile report failed" };
      return;
    }
    return;
  }

  // Unknown playbook id: emit a single message and stop.
  yield { type: "message", content: "Unknown playbook." };
}
