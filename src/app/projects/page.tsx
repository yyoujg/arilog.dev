import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Projects",
  description: "아리가 만든 프로젝트 모음.",
};

export default function ProjectsPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <p className="text-muted-foreground mt-4">준비 중입니다.</p>
    </Container>
  );
}
