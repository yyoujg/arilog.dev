import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllStacks, getProjectsByStack } from "@/lib/projects";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { ProjectCard } from "@/components/project/project-card";
import { StackFilter } from "@/components/project/stack-filter";

export function generateStaticParams() {
  return getAllStacks().map((s) => ({ stack: s.name }));
}

export async function generateMetadata(
  props: PageProps<"/projects/stack/[stack]">,
): Promise<Metadata> {
  const { stack } = await props.params;
  const name = decodeURIComponent(stack);
  return buildMetadata({
    title: `${name} 프로젝트`,
    description: `${name}를 사용한 프로젝트.`,
    path: `/projects/stack/${encodeURIComponent(name)}`,
  });
}

export default async function StackPage(
  props: PageProps<"/projects/stack/[stack]">,
) {
  const { stack } = await props.params;
  const name = decodeURIComponent(stack);
  const projects = getProjectsByStack(name);
  if (!projects.length) notFound();

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
      <p className="text-muted-foreground mt-2">
        {projects.length}개의 프로젝트
      </p>
      <div className="mt-6">
        <StackFilter stacks={getAllStacks()} active={name} />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Container>
  );
}
