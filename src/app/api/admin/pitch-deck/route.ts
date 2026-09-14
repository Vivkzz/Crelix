import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

// The deck lives at the app source root (outside /public) so it is never
// world-readable. The standalone server runs with CWD = .next/standalone,
// so ../.. resolves back to the app root regardless of where it is deployed.
const DECK_PATH =
  process.env.PITCH_DECK_PATH ||
  path.resolve(process.cwd(), "..", "..", "data", "EKAM-AI-Pitch.pptx");

const MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export async function GET() {
  // Only authenticated admins may fetch the deck.
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let file: Buffer;
  try {
    file = await readFile(DECK_PATH);
  } catch {
    return NextResponse.json({ error: "Pitch deck not found" }, { status: 404 });
  }

  await audit(admin.id, "pitch-deck.download", "PitchDeck", null, {
    bytes: file.length,
  });

  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": MIME,
      "Content-Disposition": 'attachment; filename="EKAM-AI-Pitch.pptx"',
      "Content-Length": String(file.length),
      "Cache-Control": "no-store",
    },
  });
}
