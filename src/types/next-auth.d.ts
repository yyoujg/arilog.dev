// GitHub 로그인명(login)을 세션/JWT에 실어 나르기 위한 타입 확장.
// admin layout/서버 액션에서 ADMIN_GITHUB_USERNAME과 재비교하는 근거로 쓴다.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { login: string };
  }
  interface User {
    login?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login?: string;
  }
}
