import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";
import { createMagicLink } from "@/lib/magic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw = await createMagicLink(target.email, target.name ?? undefined);
  const link = `/verify?token=${raw}`;

  await audit(admin.id, "user.impersonate", "User", id, { email: target.email });

  return NextResponse.json({ link });
}
