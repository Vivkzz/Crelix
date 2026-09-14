import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  const tickets = await db.ticket.findMany({
    where: status ? { status } : {},
    include: { user: { select: { email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ tickets });
}
