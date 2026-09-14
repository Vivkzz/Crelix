import { db } from "@/lib/db";

type RunRow = {
  id: string;
  status: string;
  provider: string;
  model: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function runsByDay(runs: RunRow[], days = 14): { date: string; count: number }[] {
  const map = new Map<string, number>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of runs) {
    const key = new Date(r.createdAt).toISOString().slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n / d) * 1000) / 10;
}

export async function agentStats(userId: string, agentId: string) {
  const runs = (await db.agentRun.findMany({
    where: { userId, agentId },
    select: { id: true, status: true, provider: true, model: true, createdAt: true, updatedAt: true },
  })) as RunRow[];

  const total = runs.length;
  const completed = runs.filter((r) => r.status === "completed").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  const running = runs.filter((r) => r.status === "running").length;
  const successRate = pct(completed, completed + failed || 0);

  const durations = runs
    .filter((r) => (r.status === "completed" || r.status === "failed"))
    .map((r) => (r.updatedAt?.getTime() || 0) - (r.createdAt?.getTime() || 0))
    .filter((d) => d > 0);
  const avgDurationMs = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  const txns = await db.creditTxn.findMany({
    where: { userId, reason: "agent.run", refId: agentId },
    select: { delta: true },
  });
  const creditSpend = txns.reduce((sum, t) => sum + Math.abs(t.delta), 0);

  return {
    total,
    completed,
    failed,
    running,
    successRate,
    avgDurationMs,
    creditSpend,
    runsByDay: runsByDay(runs),
  };
}

export async function platformAgentStats() {
  const runs = (await db.agentRun.findMany({
    select: { id: true, status: true, provider: true, model: true, createdAt: true, updatedAt: true },
  })) as RunRow[];

  const totalRuns = runs.length;
  const completed = runs.filter((r) => r.status === "completed").length;
  const failed = runs.filter((r) => r.status === "failed").length;

  const provMap = new Map<string, number>();
  for (const r of runs) provMap.set(r.provider, (provMap.get(r.provider) || 0) + 1);
  const byProvider = Array.from(provMap.entries()).map(([provider, count]) => ({ provider, count }));

  const txns = await db.creditTxn.findMany({
    where: { reason: "agent.run" },
    select: { delta: true },
  });
  const creditSpend = txns.reduce((sum, t) => sum + Math.abs(t.delta), 0);

  const agentRunCounts = await db.agentRun.groupBy({
    by: ["agentId"],
    _count: { agentId: true },
    orderBy: { _count: { agentId: "desc" } },
    take: 8,
  });
  const topAgentIds = agentRunCounts.map((g) => g.agentId);
  const topAgentsRows = await db.agent.findMany({
    where: { id: { in: topAgentIds } },
    select: { id: true, name: true },
  });
  const topAgents = agentRunCounts.map((g) => ({
    agentId: g.agentId,
    name: topAgentsRows.find((a) => a.id === g.agentId)?.name || "Deleted agent",
    runs: g._count.agentId,
  }));

  return {
    totalRuns,
    completed,
    failed,
    byProvider,
    runsByDay: runsByDay(runs, 14),
    creditSpend,
    topAgents,
  };
}

export async function platformAgentCreditSpend() {
  const txns = await db.creditTxn.findMany({
    where: { reason: "agent.run" },
    select: { id: true, userId: true, delta: true, balanceAfter: true, refId: true, createdAt: true },
  });
  const byUserMap = new Map<string, number>();
  for (const t of txns) byUserMap.set(t.userId, (byUserMap.get(t.userId) || 0) + Math.abs(t.delta));
  const userIds = Array.from(byUserMap.keys());
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, name: true },
  });
  const byUser = Array.from(byUserMap.entries())
    .map(([userId, spend]) => ({
      userId,
      email: users.find((u) => u.id === userId)?.email || "—",
      name: users.find((u) => u.id === userId)?.name || null,
      spend,
    }))
    .sort((a, b) => b.spend - a.spend);
  return {
    totalSpend: txns.reduce((sum, t) => sum + Math.abs(t.delta), 0),
    txnCount: txns.length,
    txns: txns
      .map((t) => ({ id: t.id, userId: t.userId, delta: t.delta, balanceAfter: t.balanceAfter, refId: t.refId, createdAt: t.createdAt }))
      .sort((a, b) => (b.createdAt.getTime() - a.createdAt.getTime()))
      .slice(0, 100),
    byUser,
  };
}
