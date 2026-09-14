import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { planById } from "@/lib/constants";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const members = await db.teamMember.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const plan = planById(user.plan);
  const seatsUsed = members.filter((m) => m.status !== "revoked").length;
  return NextResponse.json({ members, seatsUsed, seatsLimit: plan.seats });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const email: string = (body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (email === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "You can't invite yourself" }, { status: 400 });
  }

  const plan = planById(user.plan);
  if (typeof plan.seats === "number") {
    const seatsUsed = await db.teamMember.count({
      where: { ownerId: user.id, status: { not: "revoked" } },
    });
    if (seatsUsed >= plan.seats) {
      return NextResponse.json({ error: "Seat limit reached for your plan" }, { status: 402 });
    }
  }

  try {
    const member = await db.teamMember.create({
      data: { ownerId: user.id, inviteeEmail: email, role: body.role || "MEMBER", status: "pending" },
    });
    return NextResponse.json({ member });
  } catch {
    return NextResponse.json({ error: "That email has already been invited" }, { status: 409 });
  }
}
