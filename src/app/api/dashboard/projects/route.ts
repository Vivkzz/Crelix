import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const projects = await db.project.findMany({
    where: { userId: user.id, ...(type ? { type } : {}) },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const project = await db.project.create({
    data: {
      userId: user.id,
      type: body.type || "flow",
      name: body.name || "Untitled project",
      prompt: body.prompt || null,
    },
  });
  await db.notification.create({
    data: { userId: user.id, type: "project", title: "Project created", body: project.name },
  });
  return NextResponse.json({ project });
}
