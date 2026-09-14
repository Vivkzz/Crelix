import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tickets = await db.ticket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const subject: string = (body.subject || "").trim();
  const message: string = (body.message || "").trim();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }
  const ticket = await db.ticket.create({
    data: {
      userId: user.id,
      type: body.type === "feedback" ? "feedback" : "support",
      subject: subject.slice(0, 160),
      message: message.slice(0, 4000),
      status: "open",
    },
  });
  return NextResponse.json({ ticket });
}
