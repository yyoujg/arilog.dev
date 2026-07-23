import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { getAllPosts } from "@/lib/mdx";
import { getFeaturedProjects } from "@/lib/projects";
import { RESUME } from "@/constants/resume";
import { Container } from "@/components/layout/container";
import { Hero } from "@/components/home/hero";
import { PostCard } from "@/components/blog/post-card";
import { ProjectCard } from "@/components/project/project-card";
import { Badge } from "@/components/ui/badge";

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <Link
        href={href}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        더보기 <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);
  const featured = getFeaturedProjects().slice(0, 3);

  return (
    <Container>
      <Hero />

      {featured.length > 0 && (
        <section className="py-12">
          <SectionHeader title="Featured Projects" href="/projects" />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section className="py-12">
          <SectionHeader title="Recent Posts" href="/blog" />
          <div className="mt-2">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      <section className="py-12">
        <h2 className="text-2xl font-bold tracking-tight">Tech Stack</h2>
        <div className="mt-6 space-y-3">
          {RESUME.skills.map((group) => (
            <div
              key={group.category}
              className="flex flex-col gap-1 sm:flex-row"
            >
              <h3 className="text-muted-foreground w-28 shrink-0 text-sm">
                {group.category}
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li key={item}>
                    <Badge variant="muted">{item}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
