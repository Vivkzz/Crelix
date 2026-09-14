import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyMagicToken } from "@/lib/magic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login", verifyRequest: "/verify", error: "/login" },
  providers: [
    CredentialsProvider({
      id: "magic-link",
      name: "Magic Link",
      credentials: { token: { label: "Token", type: "text" } },
      async authorize(credentials) {
        const raw = credentials?.token;
        if (!raw || typeof raw !== "string") return null;
        const res = await verifyMagicToken(raw);
        if (!res || !res.ok || !res.token) return null;
        const { token } = res;
        const email = token.email.toLowerCase().trim();

        // Mark the token used immediately (single use).
        await db.magicToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });

        const existing = await db.user.findUnique({ where: { email } });
        let user;
        if (existing) {
          if (existing.status === "SUSPENDED") return null;
          user = await db.user.update({
            where: { id: existing.id },
            data: { lastLoginAt: new Date() },
          });
        } else {
          const count = await db.user.count();
          const role = count === 0 || email === ADMIN_EMAIL ? "ADMIN" : "USER";
          user = await db.user.create({
            data: {
              email,
              name: token.name || email.split("@")[0],
              role,
              plan: "FREE",
              credits: 5,
              status: "ACTIVE",
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          sessionVersion: user.sessionVersion,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
        token.sessionVersion = (user as any).sessionVersion ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).plan = token.plan;
        (session.user as any).sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
};
