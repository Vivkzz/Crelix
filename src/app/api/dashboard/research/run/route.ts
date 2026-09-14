import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { spendCredits } from "@/lib/credits";
import { CREDIT_COSTS } from "@/lib/constants";
import { runResearch } from "@/lib/integrations/search";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const topic: string = (body.topic || "").trim();
  if (!topic) return NextResponse.json({ error: "Enter a topic" }, { status: 400 });

  try {
    await spendCredits(user.id, CREDIT_COSTS.researchRun, "Market research", undefined);
  } catch {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const result = await runResearch(topic);

  const research = await db.research.create({
    data: {
      userId: user.id,
      topic: result.topic,
      status: "complete",
      data: JSON.stringify(result),
    },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      type: "research",
      title: "Research ready",
      body: result.topic,
    },
  });

  return NextResponse.json({ research });
}
