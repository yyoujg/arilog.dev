import type { Metadata } from "next";
import { ExternalLinkIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { GithubIcon } from "@/components/common/brand-icons";
import { MdxRenderer } from "@/components/blog/mdx-renderer";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Container className="py-12">
      <article className="mx-auto max-w-3xl">
        <header className="border-border mb-8 border-b pb-8">
          <p className="text-muted-foreground text-sm">{project.period}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            {project.summary}
          </p>
          <dl className="mt-4 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">역할</dt>
              <dd>{project.role}</dd>
            </div>
          </dl>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <li key={s}>
                <Badge variant="outline">{s}</Badge>
              </li>
            ))}
          </ul>
          {(project.github || project.demo) && (
            <div className="mt-5 flex gap-2">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <GithubIcon className="size-4" /> GitHub
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <ExternalLinkIcon className="size-4" /> Demo
                </a>
              )}
            </div>
          )}
        </header>

        <div className="prose">
          <MdxRenderer source={project.content} />
        </div>
      </article>
    </Container>
  );
}
