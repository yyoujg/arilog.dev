import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { env } from "@/lib/env";
import { buttonVariants } from "@/components/ui/button-variants";
import { MdxRenderer } from "@/components/blog/mdx-renderer";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  if (!session?.user || session.user.login !== env.ADMIN_GITHUB_USERNAME) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/admin/posts" className="font-semibold">
          arilog admin
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            로그아웃
          </button>
        </form>
      </header>
      {children}

      {/* 왜 존재하는가: renderPreviewAction(src/lib/admin/actions.tsx)이 반환하는
          MdxRenderer는 CopyButton 같은 클라이언트 컴포넌트를 포함한다. 이 admin
          라우트 그룹의 어떤 page.tsx도 MdxRenderer를 직접 참조하지 않으면, 그
          Server Action 응답을 만드는 React Client Manifest에 CopyButton
          엔트리가 통째로 빠진다. 이 렌더는 그 엔트리를 라우트 모듈 그래프에
          강제로 포함시키기 위한 것 — 실제로 보여줄 내용은 없다.
          지우면 안 되는 이유: 지우면 프로덕션 빌드에서만
          "Could not find the module ... in the React Client Manifest" 에러가
          재발한다. dev 서버는 이 매니페스트 최적화를 하지 않아 재현되지 않으므로,
          로컬 dev 확인만으로는 이 회귀를 잡을 수 없다.
          hidden + aria-hidden으로 시각·접근성 트리 양쪽에서 완전히 제외된다
          (display: none이라 레이아웃 공간도 차지하지 않는다). */}
      <div hidden aria-hidden="true">
        <MdxRenderer source="" />
      </div>
    </div>
  );
}
