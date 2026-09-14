import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function key(): Buffer {
  return createHash("sha256")
    .update(process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "ekamai-dev-key")
    .digest();
}

export function encryptKey(plain: string): { cipher: string; iv: string; tag: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { cipher: enc.toString("base64"), iv: iv.toString("base64"), tag: tag.toString("base64") };
}

export function decryptKey(enc: { cipher: string; iv: string; tag: string }): string {
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(enc.iv, "base64"));
  decipher.setAuthTag(Buffer.from(enc.tag, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(enc.cipher, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
