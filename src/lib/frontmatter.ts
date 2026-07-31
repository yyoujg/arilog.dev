import { z } from "zod";

import type { Frontmatter } from "@/types/post";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// 필드 하나 빠졌다고 글이 목록에서 조용히 사라지면 안 된다 — category/draft가
// 없는 파일도 파싱은 통과시키고 기본값으로 채운다. description의 구 필드명
// summary도 여기서 흡수한다. admin 저장 시 필수값 강제는 이 스키마가 아니라
// src/lib/admin/actions.tsx의 명시적 사전 검증이 맡는다(이 스키마를 다시
// required로 되돌리면 과거 글 하나가 스키마와 안 맞을 때 빌드 전체가 깨진다).
function normalizeFrontmatterInput(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const data = raw as Record<string, unknown>;
  if (
    typeof data.description !== "string" &&
    typeof data.summary === "string"
  ) {
    return { ...data, description: data.summary };
  }
  return data;
}

export const frontmatterSchema = z.preprocess(
  normalizeFrontmatterInput,
  z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    // YAML은 따옴표 없는 날짜를 Date로 파싱하므로 문자열로 정규화한다.
    date: z.preprocess(
      (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
      z
        .string()
        .regex(dateRegex, "YYYY-MM-DD 형식이어야 함")
        .refine((v) => !Number.isNaN(Date.parse(v)), "유효한 날짜가 아님"),
    ),
    category: z.string().min(1).default("미분류"),
    tags: z.array(z.string().min(1)).min(1),
    thumbnail: z.string().optional(),
    series: z.string().optional(),
    draft: z.boolean().default(false),
  }),
);

/**
 * zod 스키마로 frontmatter를 검증한다. 실패하면 어느 파일의 어느 필드가
 * 문제인지 명시하고 throw → 빌드를 실패시킨다. (포스트/프로젝트 공용)
 */
export function validateFrontmatter<S extends z.ZodType>(
  schema: S,
  filePath: string,
  data: unknown,
): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const field = issue.path.join(".") || "(root)";
        return `  - ${field}: ${issue.message}`;
      })
      .join("\n");
    throw new Error(`Frontmatter 검증 실패: ${filePath}\n${details}`);
  }
  return result.data;
}

export function parseFrontmatter(filePath: string, data: unknown): Frontmatter {
  return validateFrontmatter(frontmatterSchema, filePath, data);
}
