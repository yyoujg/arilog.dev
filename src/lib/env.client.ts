import { z } from "zod";

// 클라이언트에서도 읽는 NEXT_PUBLIC_* 전용 검증 모듈.
// 서버 전용 env.ts(VERCEL_* 포함)와 분리해 클라이언트 번들에 서버 값이 새지 않게 한다.
// Next는 process.env.NEXT_PUBLIC_* 를 "정적 멤버 접근"일 때만 인라인하므로,
// 스프레드가 아니라 아래처럼 키를 하나씩 명시한다.

const schema = z.object({
  // owner/repo 형식. giscus repo prop 타입(`${string}/${string}`)과 일치시킨다.
  giscusRepo: z
    .string()
    .regex(/^[^/\s]+\/[^/\s]+$/)
    .optional(),
  giscusRepoId: z.string().optional(),
  giscusCategory: z.string().optional(),
  giscusCategoryId: z.string().optional(),
  gaId: z.string().optional(),
});

const parsed = schema.parse({
  giscusRepo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  giscusRepoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
  giscusCategory: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  giscusCategoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  gaId: process.env.NEXT_PUBLIC_GA_ID,
});

export interface GiscusConfig {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
}

// 4개 값이 모두 있어야 Giscus를 켠다. 하나라도 없으면 null → 댓글 미표시.
function resolveGiscus(): GiscusConfig | null {
  const { giscusRepo, giscusRepoId, giscusCategory, giscusCategoryId } = parsed;
  if (!giscusRepo || !giscusRepoId || !giscusCategory || !giscusCategoryId) {
    return null;
  }
  return {
    // regex로 owner/repo 형식이 검증됐으므로 템플릿 리터럴 타입 단언이 안전하다.
    repo: giscusRepo as `${string}/${string}`,
    repoId: giscusRepoId,
    category: giscusCategory,
    categoryId: giscusCategoryId,
  };
}

export const clientEnv = {
  giscus: resolveGiscus(),
  gaId: parsed.gaId ?? null,
} as const;
