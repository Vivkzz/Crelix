import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const n = await db.notification.findUnique({ where: { id } });
  if (!n || n.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const updated = await db.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ notification: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const n = await db.notification.findUnique({ where: { id } });
  if (!n || n.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.notification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
