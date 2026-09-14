import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { executeAgentRun } from "@/lib/agents/execute";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function runTick(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await db.agentSchedule.findMany({
    where: { active: true },
    include: { agent: true, user: true },
    take: 500,
  });

  let fired = 0;
  let skipped = 0;
  let errors = 0;

  for (const schedule of schedules) {
    if (fired >= 20) break;

    const due =
      !schedule.lastRunAt ||
      Date.now() - schedule.lastRunAt.getTime() >= schedule.intervalMinutes * 60 * 1000;
    if (!due) continue;

    if (schedule.user.status !== "ACTIVE") continue;

    try {
      await executeAgentRun(schedule.agent, schedule.prompt, schedule.user);
      await db.agentSchedule.update({
        where: { id: schedule.id },
        data: { lastRunAt: new Date() },
      });
      fired++;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e ?? "");
      if (message.includes("Insufficient")) {
        await db.notification.create({
          data: {
            userId: schedule.userId,
            type: "agent_schedule",
            title: "Scheduled run skipped",
            body: `Insufficient credits for scheduled run of "${schedule.agent.name}".`,
          },
        });
        skipped++;
      } else {
        await db.notification.create({
          data: {
            userId: schedule.userId,
            type: "agent_schedule",
            title: "Scheduled run failed",
            body: `Scheduled run of "${schedule.agent.name}" failed: ${message}`,
          },
        });
        errors++;
      }
    }
  }

  return NextResponse.json({ fired, skipped, errors });
}

export async function GET(req: Request) {
  return runTick(req);
}

export async function POST(req: Request) {
  return runTick(req);
}
