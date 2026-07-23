import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = buildMetadata({
  title: "Uses",
  description: "아리가 사용하는 도구와 장비.",
  path: "/uses",
});

export default function UsesPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Uses</h1>
      <p className="text-muted-foreground mt-4">준비 중입니다.</p>
    </Container>
  );
}
