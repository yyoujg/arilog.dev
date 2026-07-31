// actions.tsx는 "use server" 파일이라 export가 전부 서버 액션(async)이어야 한다.
// 덮어쓰기 가드의 판단 로직 자체는 I/O 없는 순수 함수라 여기 분리해
// Octokit/auth 없이 바로 단위 테스트할 수 있게 한다(scripts/test-post-guards.mts).

// 신규 글: 저장하려는 slug 경로에 파일이 이미 있으면 차단.
export function checkCreateSlugConflict(
  slugExists: boolean,
  slug: string,
): string | null {
  if (!slugExists) return null;
  return `이미 존재하는 slug입니다: ${slug}. 다른 slug를 쓰거나 해당 글을 편집하세요.`;
}

// 편집: 저장 대상이 편집을 시작한 글과 다르면 차단(클라이언트 상태가 어떤
// 이유로든 어긋난 경우의 안전망 — slug input은 disabled라 정상 경로로는
// 발생하지 않는다).
export function checkUpdateTarget(
  inputSlug: string,
  originalSlug: string,
): string | null {
  if (inputSlug === originalSlug) return null;
  return `편집을 시작한 글(${originalSlug})과 저장 대상(${inputSlug})이 다릅니다. 새로고침 후 다시 시도하세요.`;
}

// 편집: 저장 직전 대상 파일이 이미 존재하고 그 title이 이 편집 세션을
// 시작했을 때의 title과 다르면(다른 글이거나 그 사이 변경됨) confirmOverwrite
// 없이는 차단.
export function checkUpdateConflict(
  currentTitle: string | null,
  originalTitle: string,
  confirmOverwrite: boolean,
): string | null {
  if (confirmOverwrite) return null;
  if (currentTitle === null) return null;
  if (currentTitle === originalTitle) return null;
  return `저장 대상 파일의 현재 제목("${currentTitle}")이 편집을 시작했을 때와 다릅니다. 다른 글이거나 그 사이 변경됐을 수 있습니다. 확인 후 다시 저장하세요.`;
}
