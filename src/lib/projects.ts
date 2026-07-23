import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import type { Project, ProjectMeta } from "@/types/project";
import type { CountItem } from "@/types/post";
import { parseProjectFrontmatter } from "@/lib/project-frontmatter";
import { validateImages, extractImageSrcs } from "@/lib/validate-images";
import { lintMdx } from "@/lib/lint-mdx";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

// /projects 아래 정적 자식 세그먼트. 프로젝트 slug로 쓰이면 라우트가 충돌하므로
// 예약어로 강제한다(빌드 실패). 세그먼트를 추가하면 여기에도 반영한다.
const RESERVED_SLUGS = new Set(["stack"]);

function loadProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const entries = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
    .map((e) => {
      const file = path.join(PROJECTS_DIR, e.name);
      const raw = fs.readFileSync(file, "utf8");
      const { data, content } = matter(raw);
      const relative = path.join("projects", e.name);
      const fm = parseProjectFrontmatter(relative, data);
      const slug = e.name.replace(/\.mdx$/, "");
      if (RESERVED_SLUGS.has(slug)) {
        throw new Error(
          `프로젝트 slug 충돌: "${slug}"는 /projects/${slug} 라우트와 겹치는 예약어다. 파일명을 바꿔라. (${relative})`,
        );
      }
      return {
        project: { ...fm, slug, content } satisfies Project,
        relative,
        raw,
      };
    });

  const projects = entries
    .map((e) => e.project)
    .sort((a, b) => a.order - b.order);

  // 블로그와 동일한 MDX 린트 + 이미지 검증을 프로젝트에도 적용.
  lintMdx(entries.map((e) => ({ file: e.relative, raw: e.raw })));
  validateImages(
    entries.flatMap((e) => {
      const srcs = extractImageSrcs(e.project.content);
      srcs.push(e.project.thumbnail);
      return srcs.map((src) => ({ file: e.relative, src }));
    }),
  );

  return projects;
}

let cache: Project[] | null = null;
function allProjects(): Project[] {
  if (!cache) cache = loadProjects();
  return cache;
}

function toMeta({ content: _content, ...meta }: Project): ProjectMeta {
  return meta;
}

export function getAllProjects(): ProjectMeta[] {
  return allProjects().map(toMeta);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return allProjects().find((p) => p.slug === slug);
}

export function getFeaturedProjects(): ProjectMeta[] {
  return getAllProjects().filter((p) => p.featured);
}

export function getProjectsByStack(stack: string): ProjectMeta[] {
  return getAllProjects().filter((p) => p.stack.includes(stack));
}

export function getAllStacks(): CountItem[] {
  const map = new Map<string, number>();
  for (const p of getAllProjects()) {
    for (const s of p.stack) map.set(s, (map.get(s) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
