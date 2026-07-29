import type { NextAuthConfig } from "next-auth";

// proxy.ts와 auth.ts가 공유하는 최소 설정. Next 16 proxy.ts는 Edge가 아니라
// Node.js 런타임에서 실행되지만, providers/DB 관련 설정 없이 가볍게 유지해
// proxy.ts가 불필요한 코드를 끌어오지 않게 분리한다. 1차 방어(경로 게이팅)만 담당.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/admin") &&
        nextUrl.pathname !== "/admin/login";
      return isProtected ? isLoggedIn : true;
    },
  },
} satisfies NextAuthConfig;
