import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [subscription, invoices] = await Promise.all([
    db.subscription.findFirst({ where: { userId: user.id, status: "active" } }),
    db.invoice.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ subscription, invoices });
}
