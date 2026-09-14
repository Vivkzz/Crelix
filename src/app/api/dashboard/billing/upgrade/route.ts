import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { addCredits } from "@/lib/credits";
import { planById } from "@/lib/constants";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan = planById(body.planId);
  if (!plan) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  const changed = user.plan !== plan.id;
  const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const existing = await db.subscription.findFirst({
    where: { userId: user.id, status: "active" },
  });

  if (plan.id === "FREE") {
    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: { status: "canceled", currentPeriodEnd: null },
      });
    }
  } else {
    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: { plan: plan.id, currentPeriodEnd: periodEnd },
      });
    } else {
      await db.subscription.create({
        data: { userId: user.id, plan: plan.id, status: "active", currentPeriodEnd: periodEnd },
      });
    }
    if (changed) {
      await db.invoice.create({
        data: { userId: user.id, amount: plan.price, currency: "usd", plan: plan.id, status: "paid" },
      });
      await addCredits(user.id, plan.credits, `Plan credits: ${plan.name}`);
    }
  }

  const updated = await db.user.update({ where: { id: user.id }, data: { plan: plan.id } });
  await db.notification.create({
    data: { userId: user.id, type: "billing", title: "Plan updated", body: plan.name },
  });
  return NextResponse.json({ user: { id: updated.id, plan: updated.plan, credits: updated.credits } });
}
