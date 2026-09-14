import { NextResponse } from "next/server";
import { getCurrentUser, audit } from "@/lib/guards";
import { db } from "@/lib/db";
import { encryptKey } from "@/lib/agents/crypto";

export const dynamic = "force-dynamic";

/** List the current user's secret names (values are never returned). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secrets = await db.userSecret.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ secrets });
}

/** Create or update a secret by name. The value is encrypted at rest and never read back. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "").toString().trim();
  const value = String(body.value ?? "");

  if (!name || /\s/.test(name)) {
    return NextResponse.json(
      { error: "Name is required and must not contain spaces" },
      { status: 400 },
    );
  }
  if (!value) {
    return NextResponse.json({ error: "Value is required" }, { status: 400 });
  }

  const enc = encryptKey(value);
  const secret = await db.userSecret.upsert({
    where: { userId_name: { userId: user.id, name } },
    create: {
      userId: user.id,
      name,
      valueCipher: enc.cipher,
      valueIv: enc.iv,
      valueTag: enc.tag,
    },
    update: {
      valueCipher: enc.cipher,
      valueIv: enc.iv,
      valueTag: enc.tag,
    },
  });

  await audit(user.id, "usersecret.upsert", "UserSecret", name);
  return NextResponse.json({ id: secret.id, name }, { status: 201 });
}

/** Delete a secret by id. Scoped to the current user so ids can't be cross-used. */
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const res = await db.userSecret.deleteMany({ where: { id, userId: user.id } });
  if (res.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await audit(user.id, "usersecret.delete", "UserSecret", id);
  return NextResponse.json({ ok: true });
}
