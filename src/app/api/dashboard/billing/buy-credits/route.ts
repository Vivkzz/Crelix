import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { addCredits } from "@/lib/credits";
import { CREDIT_PACKS } from "@/lib/constants";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const pack = CREDIT_PACKS.find((p) => p.id === body.packId);
  if (!pack) return NextResponse.json({ error: "Unknown pack" }, { status: 400 });

  const updated = await addCredits(user.id, pack.credits, `Credit pack: ${pack.label}`);
  await db.invoice.create({
    data: { userId: user.id, amount: pack.price, currency: "usd", plan: "credits", status: "paid" },
  });
  await db.notification.create({
    data: { userId: user.id, type: "billing", title: "Credits added", body: `+${pack.credits} credits` },
  });
  return NextResponse.json({ credits: updated.credits });
}
