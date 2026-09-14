import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [subscriptions, invoices] = await Promise.all([
    db.subscription.findMany({
      where: { status: "active" },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.invoice.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({ subscriptions, invoices });
}
