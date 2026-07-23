import Link from "next/link";

import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button-variants";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-32 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-muted-foreground mt-4">
        요청하신 페이지가 없거나 이동되었습니다.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-8")}>
        홈으로
      </Link>
    </Container>
  );
}
