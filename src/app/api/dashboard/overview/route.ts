import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [projects, scans, research, txns] = await Promise.all([
    db.project.count({ where: { userId: user.id } }),
    db.scan.count({ where: { userId: user.id } }),
    db.research.count({ where: { userId: user.id } }),
    db.creditTxn.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 14 }),
  ]);

  const creditSeries = [...txns].reverse().map((t) => ({
    label: new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    credits: t.balanceAfter,
  }));

  const byType = await db.project.groupBy({
    by: ["type"],
    where: { userId: user.id },
    _count: true,
  });

  const recent = txns.slice(0, 6).map((t) => ({
    id: t.id,
    reason: t.reason,
    delta: t.delta,
    balanceAfter: t.balanceAfter,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({
    user: {
      credits: user.credits,
      plan: user.plan,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    counts: { projects, scans, research },
    creditSeries,
    byType: byType.map((b) => ({ type: b.type, count: b._count })),
    recent,
  });
}
