import type { Metadata } from "next";

import { getAllProjects, getAllStacks } from "@/lib/projects";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { ProjectCard } from "@/components/project/project-card";
import { StackFilter } from "@/components/project/stack-filter";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description: "아리가 만든 프로젝트 모음.",
  path: "/projects",
});

export default function ProjectsPage() {
  const projects = getAllProjects();
  const stacks = getAllStacks();
  const companyProjects = projects.filter((p) => p.category === "company");
  const personalProjects = projects.filter((p) => p.category === "personal");

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <div className="mt-6">
        <StackFilter stacks={stacks} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">회사 프로젝트</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companyProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">개인 프로젝트</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personalProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </Container>
  );
}
