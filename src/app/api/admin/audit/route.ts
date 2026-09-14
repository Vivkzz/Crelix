import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let limit = parseInt(searchParams.get("limit") || "100", 10) || 100;
  limit = Math.min(200, Math.max(1, limit));

  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return NextResponse.json({ logs });
}
