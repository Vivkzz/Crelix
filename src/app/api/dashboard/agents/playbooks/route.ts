import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/guards";
import { PLAYBOOKS } from "@/lib/agents/playbooks";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ playbooks: PLAYBOOKS });
}
