import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

// Sign out everywhere: bumping sessionVersion invalidates all existing JWTs
// (getCurrentUser rejects tokens whose sessionVersion no longer matches the DB).
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.user.update({
    where: { id: user.id },
    data: { sessionVersion: { increment: 1 } },
  });
  await db.notification.create({
    data: { userId: user.id, type: "security", title: "Sessions revoked", body: "All sessions were signed out." },
  });
  return NextResponse.json({ ok: true });
}
