import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// 1차 방어. providers가 없는 authConfig만 써서 가볍게 유지한다.
// 실제 계정 검증(2차: layout, 3차: server action)은 auth.ts에서 별도로 재확인한다.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
