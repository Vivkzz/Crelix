import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await db.scan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.scan.delete({ where: { id } });
  await audit(admin.id, "scan.delete", "Scan", id);

  return NextResponse.json({ ok: true });
}
