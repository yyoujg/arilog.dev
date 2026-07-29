import { z } from "zod";

// 서버 전용. VERCEL_* 는 비-public 환경변수라 클라이언트 번들엔 없다.
// SEO(metadata/sitemap/robots/rss/og)는 전부 서버에서 실행되므로 문제 없다.

const schema = z.object({
  // 명시 우선. 전체 URL(프로토콜 포함).
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  // Vercel 제공: 프로토콜 없는 프로덕션 도메인. 프리뷰에서도 항상 세팅됨.
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  // production | preview | development. 커스텀 환경도 preview로 보고됨.
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  // Vercel 외 환경 대비 강제 색인 허용/차단 override.
  SITE_INDEXABLE: z.enum(["true", "false"]).optional(),

  // --- admin CMS (GitHub OAuth + Octokit 커밋) ---
  // 미설정이어도 build/CI는 통과해야 한다: /admin은 정적 생성되지 않고,
  // 로그인/커밋 시점에만 실제로 필요하다.
  NEXTAUTH_SECRET: z.string().optional(),
  // GitHub OAuth App의 Client ID/Secret. GITHUB_TOKEN(커밋용 PAT)과는 별개 자격증명.
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  // signIn 콜백에서 profile.login과 비교해 이 계정만 허용.
  ADMIN_GITHUB_USERNAME: z.string().optional(),
  // fine-grained PAT, contents:write 권한만. Octokit 커밋에 사용.
  GITHUB_TOKEN: z.string().optional(),
  // "owner/repo" 형식. 커밋 대상 레포.
  GITHUB_REPO: z
    .string()
    .regex(/^[^/\s]+\/[^/\s]+$/)
    .optional(),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  const details = result.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`환경변수 검증 실패:\n${details}`);
}
const parsed = result.data;

function resolveSiteUrl(): string {
  const raw =
    parsed.NEXT_PUBLIC_SITE_URL ??
    (parsed.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${parsed.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return raw.replace(/\/$/, ""); // 후행 슬래시 제거
}

// 색인 허용: SITE_INDEXABLE override > production > 차단(fail-safe).
// 로컬 빌드는 VERCEL_ENV가 undefined이므로 차단 방향이 안전하다.
function resolveIndexable(): boolean {
  if (parsed.SITE_INDEXABLE) return parsed.SITE_INDEXABLE === "true";
  return parsed.VERCEL_ENV === "production";
}

export const env = {
  SITE_URL: resolveSiteUrl(),
  IS_INDEXABLE: resolveIndexable(),
  VERCEL_ENV: parsed.VERCEL_ENV,
  NEXTAUTH_SECRET: parsed.NEXTAUTH_SECRET,
  AUTH_GITHUB_ID: parsed.AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET: parsed.AUTH_GITHUB_SECRET,
  ADMIN_GITHUB_USERNAME: parsed.ADMIN_GITHUB_USERNAME,
  GITHUB_TOKEN: parsed.GITHUB_TOKEN,
  GITHUB_REPO: parsed.GITHUB_REPO,
} as const;
