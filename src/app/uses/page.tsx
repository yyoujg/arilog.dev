import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Uses",
  description: "아리가 사용하는 도구와 장비.",
};

export default function UsesPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Uses</h1>
      <p className="text-muted-foreground mt-4">준비 중입니다.</p>
    </Container>
  );
}
