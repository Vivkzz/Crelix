import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";

export const MAGIC_TTL_MS = 15 * 60 * 1000; // 15 minutes

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

/** Create a single-use magic link token and return the raw token (to embed in a link). */
export async function createMagicLink(email: string, name?: string) {
  const raw = randomBytes(32).toString("hex");
  const tokenHash = hashToken(raw);
  await db.magicToken.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      tokenHash,
      expiresAt: new Date(Date.now() + MAGIC_TTL_MS),
    },
  });
  return raw;
}

export function isSmtpConfigured() {
  return !!(
    process.env.EMAIL_SMTP_HOST &&
    process.env.EMAIL_SMTP_USER &&
    process.env.EMAIL_SMTP_PASS
  );
}

export function isResendConfigured() {
  return !!process.env.RESEND_API_KEY;
}

function signLink(rawToken: string) {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}/verify?token=${rawToken}`;
}

function emailHtml(link: string) {
  return `<!doctype html><html><head><meta charset="utf-8"/></head><body style="margin:0;background:#f2f1f1">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#13121f">
  <div style="font-weight:700;letter-spacing:-0.02em;font-size:20px;margin-bottom:24px">EKAM AI</div>
  <h1 style="font-size:24px;letter-spacing:-0.02em;margin:0 0 12px">Sign in to EKAM AI</h1>
  <p style="color:#444;line-height:1.6;margin:0 0 24px">Click the button below to sign in. This link expires in 15 minutes and can be used only once.</p>
  <a href="${link}" style="display:inline-block;background:linear-gradient(90deg,#91e500,#12bcff);color:#13121f;font-weight:600;text-decoration:none;padding:14px 30px;border-radius:999px;font-size:15px">Sign in</a>
  <p style="color:#7f7f7f;font-size:13px;margin:24px 0 0;line-height:1.6">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${link}" style="color:#2f44ff;word-break:break-all">${link}</a></p>
  <p style="color:#9a9a9a;font-size:12px;margin-top:24px">If you didn't request this link, you can safely ignore this email.</p>
  <hr style="border:none;border-top:1px solid #e3e3e3;margin:28px 0"/>
  <p style="color:#9a9a9a;font-size:12px">EKAM INNOVATIONS LLP &middot; GIFT City, Gandhinagar, India</p>
</div>
</body></html>`;
}

/** Deliver via Resend's HTTP API (no extra dependency). Returns true on success (2xx). */
async function sendViaResend(to: string, rawToken: string): Promise<boolean> {
  const link = signLink(rawToken);
  const from = process.env.EMAIL_FROM || "EKAM AI <noreply@ekamai.in>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: "Your EKAM AI sign-in link",
        html: emailHtml(link),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[auth] Resend delivery failed:", res.status, detail);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[auth] Resend request error:", e);
    return false;
  }
}

/**
 * Deliver the magic link. Priority:
 *  1. Resend HTTP API (when RESEND_API_KEY is set) — real email, never leaks the in-app link.
 *  2. SMTP via nodemailer (when EMAIL_SMTP_* set) — real email.
 *  3. Demo mode — returns the raw token so the UI can surface an in-app link (dev only).
 */
export async function sendMagicLink(email: string, rawToken: string): Promise<{
  delivered: boolean;
  demoToken: string | null;
}> {
  if (isResendConfigured()) {
    const ok = await sendViaResend(email, rawToken);
    // With real email configured, never return the raw token to the client.
    return { delivered: ok, demoToken: null };
  }

  if (isSmtpConfigured()) {
    const link = signLink(rawToken);
    try {
      // Non-static module specifier so the build doesn't require nodemailer to be installed.
      const mailerModule = "nodemailer";
      const nodemailer: any = await import(mailerModule);
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST!,
        port: Number(process.env.EMAIL_SMTP_PORT || 587),
        secure: process.env.EMAIL_SMTP_SECURE === "true",
        auth: { user: process.env.EMAIL_SMTP_USER!, pass: process.env.EMAIL_SMTP_PASS! },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "EKAM AI <no-reply@ekamai.in>",
        to: email,
        subject: "Your EKAM AI sign-in link",
        html: emailHtml(link),
      });
      return { delivered: true, demoToken: null };
    } catch (e) {
      console.error("[auth] SMTP delivery failed:", e);
    }
  }

  return { delivered: false, demoToken: rawToken };
}

export async function verifyMagicToken(raw: string) {
  const tokenHash = hashToken(raw);
  const token = await db.magicToken.findUnique({ where: { tokenHash } });
  if (!token) return null;
  if (token.usedAt) return { token, reused: true as const, ok: false as const };
  if (token.expiresAt.getTime() < Date.now()) return { token, expired: true as const, ok: false as const };
  return { token, ok: true as const };
}
