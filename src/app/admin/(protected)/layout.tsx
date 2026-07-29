import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { env } from "@/lib/env";
import { buttonVariants } from "@/components/ui/button-variants";

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
    </div>
  );
}
