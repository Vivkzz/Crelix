import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";
import { planById } from "@/lib/constants";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const u = await db.user.findUnique({
    where: { id },
    include: {
      _count: { select: { projects: true, scans: true } },
      creditTxns: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { creditTxns, ...rest } = u;
  return NextResponse.json({ user: { ...rest, txns: creditTxns } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  // Self-protection: an admin cannot strip their own admin access or suspend themselves.
  if (id === admin.id) {
    const removingAdmin = body.role !== undefined && body.role !== "ADMIN";
    const suspendingSelf = body.status !== undefined && body.status === "SUSPENDED";
    if (removingAdmin || suspendingSelf) {
      return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
    }
  }

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (body.role !== undefined) {
    if (!["USER", "ADMIN"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    data.role = body.role;
  }

  if (body.status !== undefined) {
    if (!["ACTIVE", "SUSPENDED"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
    if (body.status === "SUSPENDED") {
      data.suspendedAt = new Date();
      data.sessionVersion = (existing.sessionVersion ?? 0) + 1;
    } else {
      data.suspendedAt = null;
    }
  }

  if (body.plan !== undefined) {
    const p = planById(body.plan);
    if (p.id !== body.plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    data.plan = body.plan;
  }

  const creditDeltaProvided = body.creditDelta !== undefined;
  const include = { _count: { select: { projects: true, scans: true } } } as const;

  let updated;
  if (creditDeltaProvided) {
    const n = Number(body.creditDelta);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      return NextResponse.json({ error: "creditDelta must be an integer" }, { status: 400 });
    }
    const newCredits = Math.max(0, existing.credits + n);
    const [u] = await db.$transaction([
      db.user.update({ where: { id }, data: { ...data, credits: newCredits }, include }),
      db.creditTxn.create({
        data: { userId: id, delta: n, balanceAfter: newCredits, reason: "Admin adjustment", refId: id },
      }),
    ]);
    updated = u;
  } else {
    updated = await db.user.update({ where: { id }, data, include });
  }

  const meta: Record<string, unknown> = {};
  if (body.role !== undefined) meta.role = body.role;
  if (body.status !== undefined) meta.status = body.status;
  if (body.plan !== undefined) meta.plan = body.plan;
  if (creditDeltaProvided) meta.creditDelta = body.creditDelta;
  await audit(admin.id, "user.update", "User", id, meta);

  return NextResponse.json({ user: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.user.delete({ where: { id } });
  await audit(admin.id, "user.delete", "User", id);

  return NextResponse.json({ ok: true });
}
