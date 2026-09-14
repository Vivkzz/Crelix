import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.siteSetting.findMany({ where: { key: { startsWith: "flag." } } });
  const flags: Record<string, boolean> = {};
  for (const r of rows) flags[r.key.slice(5)] = r.value === "true";
  return NextResponse.json({ flags });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const flags = body.flags;
  if (!flags || typeof flags !== "object") {
    return NextResponse.json({ error: "flags object required" }, { status: 400 });
  }

  for (const [k, v] of Object.entries(flags)) {
    const key = `flag.${k}`;
    const value = String(v);
    await db.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  await audit(admin.id, "flags.update", "SiteSetting", null, { flags });
  const rows = await db.siteSetting.findMany({ where: { key: { startsWith: "flag." } } });
  const out: Record<string, boolean> = {};
  for (const r of rows) out[r.key.slice(5)] = r.value === "true";
  return NextResponse.json({ flags: out });
}
