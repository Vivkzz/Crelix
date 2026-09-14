import { NextResponse } from "next/server";
import { z } from "zod";
import { createMagicLink, sendMagicLink } from "@/lib/magic";

const body = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"),
  name: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    const { email, name } = parsed.data;
    const clean = email.toLowerCase().trim();
    const raw = await createMagicLink(clean, name);
    const { delivered, demoToken } = await sendMagicLink(clean, raw);
    return NextResponse.json({
      sent: true,
      delivered,
      demoLink: demoToken ? `/verify?token=${demoToken}` : null,
    });
  } catch (e) {
    return NextResponse.json({ error: "Could not send sign-in link." }, { status: 500 });
  }
}
