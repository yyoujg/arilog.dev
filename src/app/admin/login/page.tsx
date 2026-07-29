import { signIn } from "@/auth";
import { buttonVariants } from "@/components/ui/button-variants";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-xl font-semibold">Admin 로그인</h1>
      <p className="text-muted-foreground text-sm">
        GitHub 계정으로 로그인하면 posts를 관리할 수 있습니다.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/admin/posts" });
        }}
      >
        <button type="submit" className={buttonVariants()}>
          GitHub으로 로그인
        </button>
      </form>
    </div>
  );
}
