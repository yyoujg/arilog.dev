import { z } from "zod";

import type { ProjectFrontmatter } from "@/types/project";
import { validateFrontmatter } from "@/lib/frontmatter";

// 글용 스키마와 분리된 프로젝트 전용 스키마.
const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  period: z.string().min(1),
  role: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  github: z.string().url().optional(),
  demo: z.string().url().optional(),
  thumbnail: z.string().min(1),
  featured: z.boolean(),
  order: z.number(),
});

export function parseProjectFrontmatter(
  filePath: string,
  data: unknown,
): ProjectFrontmatter {
  return validateFrontmatter(projectSchema, filePath, data);
}
