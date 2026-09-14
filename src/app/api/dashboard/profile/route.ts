import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, image: user.image, bio: user.bio },
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name).slice(0, 80) || null } : {}),
      ...(body.bio !== undefined ? { bio: String(body.bio).slice(0, 400) || null } : {}),
      ...(body.image !== undefined ? { image: String(body.image).slice(0, 500) || null } : {}),
    },
  });
  return NextResponse.json({
    user: { id: updated.id, name: updated.name, email: updated.email, image: updated.image, bio: updated.bio },
  });
}
