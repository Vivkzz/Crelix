import { db } from "@/lib/db";

/** Atomically spend credits + write a ledger entry. Throws if insufficient. */
export async function spendCredits(
  userId: string,
  amount: number,
  reason: string,
  refId?: string
) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.credits < amount) throw new Error("Insufficient credits");
  const balanceAfter = user.credits - amount;
  const [updated] = await db.$transaction([
    db.user.update({ where: { id: userId }, data: { credits: balanceAfter } }),
    db.creditTxn.create({ data: { userId, delta: -amount, balanceAfter, reason, refId } }),
  ]);
  return updated;
}

/** Add credits (purchase / grant / refund) + write a ledger entry. */
export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
  refId?: string
) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  const balanceAfter = user.credits + amount;
  const [updated] = await db.$transaction([
    db.user.update({ where: { id: userId }, data: { credits: balanceAfter } }),
    db.creditTxn.create({ data: { userId, delta: amount, balanceAfter, reason, refId } }),
  ]);
  return updated;
}
