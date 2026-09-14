import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseArr<T>(s: string | null | undefined): T[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

// A fenced-code marker longer than any backtick run inside the content,
// so artifact bodies that contain ``` don't break the markdown.
function fence(content: string): string {
  const runs = content.match(/`+/g) || [];
  const max = runs.reduce((m, s) => Math.max(m, s.length), 0);
  return "`".repeat(Math.max(3, max + 1));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  const run = await db.agentRun.findUnique({ where: { id } });
  if (!run || run.userId !== user.id) return new Response("Not found", { status: 404 });

  const steps = parseArr<{ title?: string }>(run.steps);
  const artifacts = parseArr<{ title?: string; type?: string; content?: string }>(run.artifacts);

  const lines: string[] = [];
  lines.push(`# Run ${id}`, "");
  lines.push("## Input", run.input || "_(no input recorded)_", "");

  lines.push("## Steps");
  if (steps.length === 0) {
    lines.push("_(no steps recorded)_");
  } else {
    for (const s of steps) lines.push(`- ${s.title || "Untitled step"}`);
  }
  lines.push("");

  lines.push("## Artifacts");
  if (artifacts.length === 0) {
    lines.push("_(no artifacts)_", "");
  } else {
    for (const a of artifacts) {
      lines.push(`### ${a.title || "Artifact"}`);
      lines.push(`Type: ${a.type || "text"}`, "");
      const content = a.content ?? "";
      const f = fence(content);
      lines.push(f, content, f, "");
    }
  }

  lines.push("## Final answer", run.finalMessage || "_(no final answer recorded)_", "");

  const md = lines.join("\n");
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="run-${id}.md"`,
    },
  });
}
