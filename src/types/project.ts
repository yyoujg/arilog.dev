export interface ProjectFrontmatter {
  title: string;
  summary: string;
  period: string; // 자유 형식 문자열 (예: "2024.01 - 2024.06")
  role: string;
  stack: string[];
  github?: string;
  demo?: string;
  thumbnail: string;
  featured: boolean;
  order: number; // 오름차순 정렬 기준
}

export interface Project extends ProjectFrontmatter {
  slug: string; // content/projects/arilog-dev.mdx -> "arilog-dev"
  content: string;
}

export type ProjectMeta = Omit<Project, "content">;
