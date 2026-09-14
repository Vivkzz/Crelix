import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { platformAgentStats } from "@/lib/agent-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = await platformAgentStats();
  return NextResponse.json({ stats });
}
