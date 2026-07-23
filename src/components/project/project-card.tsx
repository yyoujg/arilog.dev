import Link from "next/link";
import Image from "next/image";
import { ExternalLinkIcon } from "lucide-react";

import type { ProjectMeta } from "@/types/project";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { GithubIcon } from "@/components/common/brand-icons";

export function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <article className="border-border bg-card group flex flex-col overflow-hidden rounded-xl border">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="bg-muted relative aspect-[16/9] overflow-hidden">
          <Image
            src={project.thumbnail}
            alt={`${project.title} 썸네일`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <p className="text-muted-foreground text-xs">{project.period}</p>
          <h2 className="group-hover:text-primary mt-1 text-lg font-semibold tracking-tight transition-colors">
            {project.title}
          </h2>
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
            {project.summary}
          </p>
        </div>
      </Link>

      <div className="mt-auto flex flex-col gap-4 px-5 pb-5">
        <ul className="flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <li key={s}>
              <Badge variant="outline">{s}</Badge>
            </li>
          ))}
        </ul>
        {(project.github || project.demo) && (
          <div className="flex gap-2">
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
      </div>
    </article>
  );
}
