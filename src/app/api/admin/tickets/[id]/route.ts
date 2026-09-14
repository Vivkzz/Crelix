import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await db.ticket.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (body.reply !== undefined) data.reply = String(body.reply);
  if (body.status !== undefined) {
    data.status = body.status;
  } else if (body.reply !== undefined) {
    data.status = "replied";
  }

  const ticket = await db.ticket.update({ where: { id }, data });

  const meta: Record<string, unknown> = {};
  if (body.reply !== undefined) meta.reply = body.reply;
  if (body.status !== undefined) meta.status = body.status;
  await audit(admin.id, "ticket.update", "Ticket", id, meta);

  return NextResponse.json({ ticket });
}
