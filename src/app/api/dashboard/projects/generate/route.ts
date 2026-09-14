import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { spendCredits } from "@/lib/credits";
import { CREDIT_COSTS } from "@/lib/constants";
import { generateLaunchPage } from "@/lib/integrations/flow";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const prompt: string = (body.prompt || "").trim();
  if (!prompt) return NextResponse.json({ error: "Enter a prompt" }, { status: 400 });
  const projectId: string | undefined = body.projectId;

  try {
    await spendCredits(user.id, CREDIT_COSTS.flowGenerate, "Flow generate", projectId);
  } catch {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const { html, title } = generateLaunchPage(prompt);

  let project;
  if (projectId) {
    const existing = await db.project.findUnique({ where: { id: projectId } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const count = await db.projectVersion.count({ where: { projectId } });
    await db.projectVersion.create({
      data: { projectId, version: count + 1, html, snapshot: existing.resultHtml },
    });
    project = await db.project.update({
      where: { id: projectId },
      data: { resultHtml: html, prompt, name: existing.name || title },
    });
  } else {
    project = await db.project.create({
      data: { userId: user.id, type: "flow", name: title, prompt, resultHtml: html, status: "active" },
    });
    await db.projectVersion.create({ data: { projectId: project.id, version: 1, html } });
  }

  await db.notification.create({
    data: { userId: user.id, type: "flow", title: "Flow generation complete", body: title },
  });

  return NextResponse.json({ project });
}
