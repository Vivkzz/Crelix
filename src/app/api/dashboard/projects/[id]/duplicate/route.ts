import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const dup = await db.project.create({
    data: {
      userId: user.id,
      type: project.type,
      name: `${project.name} (copy)`,
      prompt: project.prompt,
      resultHtml: project.resultHtml,
      status: "active",
    },
  });
  return NextResponse.json({ project: dup });
}
