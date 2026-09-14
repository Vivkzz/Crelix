import { NextResponse } from "next/server";
import { getCurrentUser, audit } from "@/lib/guards";
import { db } from "@/lib/db";
import { encryptKey } from "@/lib/agents/crypto";

const KEY_PROVIDERS = ["openai", "anthropic"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userKeys = await db.userKey.findMany({ where: { userId: user.id } });
  const keys = userKeys.map((k) => ({
    provider: k.provider,
    hasKey: true,
    createdAt: k.createdAt,
  }));
  const serverKeys = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  };
  return NextResponse.json({ keys, serverKeys });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const provider = body.provider;
  if (!KEY_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (!apiKey) return NextResponse.json({ error: "API key is required" }, { status: 400 });

  const enc = encryptKey(apiKey);
  await db.userKey.upsert({
    where: { userId_provider: { userId: user.id, provider } },
    create: {
      userId: user.id,
      provider,
      keyCipher: enc.cipher,
      keyIv: enc.iv,
      keyTag: enc.tag,
    },
    update: {
      keyCipher: enc.cipher,
      keyIv: enc.iv,
      keyTag: enc.tag,
    },
  });
  await audit(user.id, "userkey.set", "UserKey", undefined, { provider });
  return NextResponse.json({ ok: true, provider });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const provider = body.provider;
  if (!KEY_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  await db.userKey.deleteMany({ where: { userId: user.id, provider } });
  await audit(user.id, "userkey.delete", "UserKey", undefined, { provider });
  return NextResponse.json({ ok: true });
}
