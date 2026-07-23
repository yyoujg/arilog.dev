import type { Metadata } from "next";

import { getAllProjects, getAllStacks } from "@/lib/projects";
import { Container } from "@/components/layout/container";
import { ProjectCard } from "@/components/project/project-card";
import { StackFilter } from "@/components/project/stack-filter";

export const metadata: Metadata = {
  title: "Projects",
  description: "아리가 만든 프로젝트 모음.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const stacks = getAllStacks();

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <div className="mt-6">
        <StackFilter stacks={stacks} />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Container>
  );
}
