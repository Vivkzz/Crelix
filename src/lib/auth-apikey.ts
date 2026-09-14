import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/**
 * Authenticate a request by an `eai_` API key. Accepts either an
 * `Authorization: Bearer eai_...` header or an `x-api-key` header.
 * Looks the key up by its sha256 hash, requires it to be non-revoked and
 * owned by an ACTIVE user, stamps lastUsedAt, and returns the user (or null).
 */
export async function authByApiKey(req: Request): Promise<User | null> {
  const auth = req.headers.get("authorization") || "";
  let raw: string | null = null;
  if (auth.startsWith("Bearer ")) {
    raw = auth.slice("Bearer ".length).trim();
  }
  if (!raw) {
    raw = req.headers.get("x-api-key");
  }
  if (!raw || !raw.startsWith("eai_")) return null;

  const keyHash = createHash("sha256").update(raw).digest("hex");
  const apiKey = await db.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey || apiKey.revokedAt) return null;

  const user = await db.user.findUnique({ where: { id: apiKey.userId } });
  if (!user || user.status !== "ACTIVE") return null;

  // Best-effort stamp; never block on failure.
  db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  return user;
}
