import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Blog",
  description: "프론트엔드 기술 블로그 글 목록.",
};

export default function BlogPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="text-muted-foreground mt-4">준비 중입니다.</p>
    </Container>
  );
}
