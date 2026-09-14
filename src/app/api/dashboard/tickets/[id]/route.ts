import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ticket = await db.ticket.findUnique({ where: { id } });
  if (!ticket || ticket.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const updated = await db.ticket.update({
    where: { id },
    data: { ...(body.status !== undefined ? { status: body.status } : {}) },
  });
  return NextResponse.json({ ticket: updated });
}
