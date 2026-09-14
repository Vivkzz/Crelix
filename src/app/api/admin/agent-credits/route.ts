import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { platformAgentCreditSpend } from "@/lib/agent-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await platformAgentCreditSpend();
  return NextResponse.json({ data });
}
