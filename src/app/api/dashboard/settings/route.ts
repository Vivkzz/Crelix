import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let prefs: Record<string, any> = {};
  try {
    prefs = user.prefs ? JSON.parse(user.prefs) : {};
  } catch {
    prefs = {};
  }
  return NextResponse.json({ prefs });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  let current: Record<string, any> = {};
  try {
    current = user.prefs ? JSON.parse(user.prefs) : {};
  } catch {
    current = {};
  }
  const merged = { ...current, ...body };
  await db.user.update({ where: { id: user.id }, data: { prefs: JSON.stringify(merged) } });
  return NextResponse.json({ prefs: merged });
}
