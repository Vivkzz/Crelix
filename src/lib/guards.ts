import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/** Current authenticated, active user — or null (not logged in / suspended / session revoked). */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id;
  if (!id) return null;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return null;
  if (user.status === "SUSPENDED") return null;
  const tokenVersion = (session?.user as any)?.sessionVersion;
  if (tokenVersion !== undefined && tokenVersion !== user.sessionVersion) return null;
  return user;
}

export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

/** Append to the audit trail. actorUserId may be null for system actions. */
export async function audit(
  actorUserId: string | null,
  action: string,
  targetType: string,
  targetId?: string | null,
  meta?: Record<string, unknown>
) {
  try {
    await db.auditLog.create({
      data: {
        actorUserId,
        action,
        targetType,
        targetId: targetId ?? null,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch {
    // never let audit logging break a request
  }
}
