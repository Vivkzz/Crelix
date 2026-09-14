import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { createHash, randomBytes } from "node:crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const keys = await db.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, prefix: true, lastUsedAt: true, createdAt: true, revokedAt: true },
  });
  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const label: string = (body.label || "Default").trim().slice(0, 40);

  const raw = `eai_${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12);

  await db.apiKey.create({
    data: { userId: user.id, label, keyHash, prefix },
  });
  // The raw key is returned exactly once; only the hash is persisted.
  return NextResponse.json({ key: raw, label, prefix });
}
