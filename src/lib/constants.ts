// Plans, credit costs, and roles used across dashboard + admin + billing.
// Prices are in cents so mock invoices look like real money.

export const PLANS = {
  FREE: { id: "FREE", name: "Free trial", price: 0, credits: 5, seats: 1, period: "/14 days" },
  STARTER: { id: "STARTER", name: "Starter", price: 2900, credits: 75, seats: 2, period: "/month" },
  PRO: { id: "PRO", name: "Pro", price: 9900, credits: 350, seats: 10, period: "/month" },
  ENTERPRISE: { id: "ENTERPRISE", name: "Enterprise", price: 29900, credits: 1200, seats: Infinity, period: "/month" },
} as const;

export type PlanId = keyof typeof PLANS;

export const PLAN_LIST = Object.values(PLANS);

export function planById(id: string) {
  return (PLANS as Record<string, (typeof PLANS)[PlanId]>)[id] ?? PLANS.FREE;
}

export const CREDIT_COSTS = {
  flowGenerate: 1,
  scanRun: 5,
  researchRun: 3,
  agentPlaybook: 3,
  agentLLM: 5,
} as const;

export const CREDIT_PACKS = [
  { id: "pack25", credits: 25, price: 1500, label: "25 credits" },
  { id: "pack100", credits: 100, price: 4900, label: "100 credits", popular: true },
  { id: "pack400", credits: 400, price: 15900, label: "400 credits" },
];

export const ROLES = { USER: "USER", ADMIN: "ADMIN" } as const;
export type Role = keyof typeof ROLES;

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}
