import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import { env } from "@/lib/env";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // ADMIN_GITHUB_USERNAME 계정만 로그인 허용. profile은 GitHub API 원본 응답(login 포함).
    async signIn({ profile }) {
      return profile?.login === env.ADMIN_GITHUB_USERNAME;
    },
    async jwt({ token, profile }) {
      if (profile) token.login = profile.login as string;
      return token;
    },
    async session({ session, token }) {
      session.user.login = token.login as string;
      return session;
    },
  },
});
