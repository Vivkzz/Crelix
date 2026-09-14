import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";
import { planById } from "@/lib/constants";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 14 daily signup buckets ending today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = new Date(today);
  since.setDate(since.getDate() - 13);

  const [
    users,
    projects,
    scans,
    research,
    subs,
    recentUsers,
    recentAudit,
    txns,
    signupsUsers,
  ] = await Promise.all([
    db.user.count(),
    db.project.count(),
    db.scan.count(),
    db.research.count(),
    db.subscription.findMany({ where: { status: "active" } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, email: true, name: true, role: true, plan: true, status: true, createdAt: true },
    }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.creditTxn.findMany({ select: { delta: true } }),
    db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const mrr = subs.reduce((sum, s) => sum + planById(s.plan).price, 0);
  const activeSubs = subs.length;

  const issued = txns.filter((t) => t.delta > 0).reduce((s, t) => s + t.delta, 0);
  const used = txns.filter((t) => t.delta < 0).reduce((s, t) => s + Math.abs(t.delta), 0);

  const buckets = [] as { start: number; label: string; count: number }[];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({
      start: d.getTime(),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  for (const u of signupsUsers) {
    const t = new Date(u.createdAt);
    t.setHours(0, 0, 0, 0);
    const bucket = buckets.find((b) => b.start === t.getTime());
    if (bucket) bucket.count++;
  }

  return NextResponse.json({
    kpis: { users, projects, scans, research, activeSubs, mrr },
    signups: buckets.map((b) => ({ label: b.label, count: b.count })),
    credits: { issued, used },
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      plan: u.plan,
      status: u.status,
      createdAt: u.createdAt,
    })),
    recentAudit: recentAudit.map((a) => ({
      id: a.id,
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      actorUserId: a.actorUserId,
      createdAt: a.createdAt,
    })),
  });
}
