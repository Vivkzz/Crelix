import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { spendCredits } from "@/lib/credits";
import { CREDIT_COSTS } from "@/lib/constants";
import { runScan } from "@/lib/integrations/pentest";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const target: string = (body.target || "").trim();
  if (!target) return NextResponse.json({ error: "Enter a target URL" }, { status: 400 });

  try {
    await spendCredits(user.id, CREDIT_COSTS.scanRun, "Pentest scan", undefined);
  } catch {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const result = await runScan(target);

  const scan = await db.scan.create({
    data: {
      userId: user.id,
      targetUrl: result.target,
      status: "complete",
      score: result.score,
      findings: JSON.stringify(result),
    },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      type: "scan",
      title: "Scan complete",
      body: `${result.target} · score ${result.score}/100`,
    },
  });

  return NextResponse.json({ scan });
}
