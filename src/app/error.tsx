"use client";

import { useEffect } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Sprint 4에서 에러 리포팅 연동
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center py-32 text-center">
      <h1 className="text-3xl font-bold tracking-tight">문제가 발생했습니다</h1>
      <p className="text-muted-foreground mt-4">잠시 후 다시 시도해 주세요.</p>
      <Button onClick={reset} className="mt-8">
        다시 시도
      </Button>
    </Container>
  );
}
