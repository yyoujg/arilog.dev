# Ari.dev (arilog.dev)

3년차 프론트엔드 개발자의 기술 블로그 겸 포트폴리오.
이력서에 첨부되는 사이트이므로 **코드 품질 자체가 결과물**이다. 동작만 하는 코드는 실패다.

Repo: https://github.com/yyoujg/arilog.dev

---

## 스택 (확정 — 변경이 필요하면 먼저 물어볼 것)

| 분야 | 기술 |
|---|---|
| Framework | Next.js 16 App Router |
| React | 19.2 |
| Language | TypeScript (strict) |
| 번들러 | Turbopack (기본값) |
| 패키지 매니저 | **npm** |
| 스타일 | TailwindCSS + shadcn/ui |
| 콘텐츠 | MDX — `gray-matter` + `next-mdx-remote/rsc` |
| 하이라이트 | Shiki |
| 폰트 | Pretendard (`next/font/local`) |
| 검색 | 빌드타임 `search-index.json` + FlexSearch |
| 댓글 | Giscus |
| 분석 | GA4 (`@next/third-parties`) |
| 배포 | Vercel |

### 쓰지 않는 것

- `next-sitemap` — Next 16 내장 `app/sitemap.ts` / `app/robots.ts` 사용
- Plausible — GA4 단독
- Contentlayer — 유지보수 중단
- `@next/mdx` — webpack 로더 의존, Turbopack 기본 환경과 맞지 않음
- CSS-in-JS, MUI/Chakra 등 외부 UI 라이브러리

---

## 명령어

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 실행
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest (Sprint 5 이후)
```

`next lint`는 Next 16에서 제거됐다. ESLint CLI를 직접 호출한다.

---

## Next.js 16 필수 규칙

동기 접근이 완전히 제거됐다. 아래는 **전부 async**다.

```ts
// params, searchParams, cookies, headers
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const query = await props.searchParams;
}
```

- 라우트 타입은 Next 16 헬퍼(`PageProps<'...'>`, `LayoutProps<'...'>`)를 사용한다. 수동 인터페이스 정의 금지.
- `next.config.ts`에 커스텀 webpack 설정을 추가하지 않는다. Turbopack이 무시한다.
- 미들웨어가 필요하면 `middleware.ts`가 아니라 `proxy.ts`. (현재 미사용)
- 캐싱은 명시적으로 한다. 블로그 글은 `generateStaticParams`로 정적 생성한다.

---

## 아키텍처 규칙

- **Server Component가 기본.** `"use client"`는 상태·이벤트 핸들러·브라우저 API가 필요할 때만 붙인다. 붙일 때는 컴포넌트 트리 최하단에 붙여 경계를 최소화한다.
- 데이터 접근(fs, 파싱, 인덱싱)은 `src/lib/` 안에서만. 컴포넌트에서 `fs` 직접 호출 금지.
- 컴포넌트 파일 1개당 export 1개. 파일명 kebab-case, 컴포넌트명 PascalCase.
- `any` 금지. 불가피하면 `unknown` + 타입가드. `as` 단언은 근거를 주석으로 남긴다.
- 하드코딩 문자열·URL·설정값은 `src/constants/`로 분리.
- 환경변수는 `src/lib/env.ts`에서 zod로 검증 후 export. `process.env` 직접 참조 금지.

## 스타일 규칙

- Tailwind 유틸리티만 사용.
- 색상은 **CSS 변수 토큰으로만** 참조한다. `#hex`, `bg-slate-700` 같은 Tailwind 기본 팔레트 직접 사용 금지.
- 다크모드는 `next-themes`. 클래스 기반(`.dark`).
- 애니메이션은 `prefers-reduced-motion`을 반드시 존중한다.

---

## 폴더 구조

```
src/
  app/                  라우트, sitemap.ts, robots.ts, rss.xml/route.ts
  components/
    common/  layout/  blog/  project/  ui/  seo/
  lib/                  mdx, search, seo, env
  hooks/  utils/  styles/  constants/  types/
content/
  react/  nextjs/  typescript/  ...   글 MDX
  projects/                           프로젝트 MDX
scripts/                              빌드 스크립트
```

---

## 콘텐츠 스키마

Frontmatter는 zod로 검증하고, **검증 실패 시 빌드를 실패시킨다.**

```yaml
---
title: string          # 필수
description: string    # 필수, 메타 description으로 사용
date: YYYY-MM-DD       # 필수
category: string       # 필수
tags: string[]         # 필수
thumbnail: string?     # 선택
series: string?        # 선택
draft: boolean         # 필수
---
```

- slug는 파일 경로 기반. `content/react/usememo.mdx` → `react/usememo`
- `draft: true`는 production 빌드에서 제외, dev에서는 표시.

---

## 금지사항

1. 지시하지 않은 npm 패키지 추가 금지. 필요하면 **이유 + 대안 + 번들 영향**을 먼저 제시하고 승인받는다.
2. 지시 범위 밖 파일 수정 금지.
3. 기존 파일 대량 재작성 금지. **최소 diff 원칙.**
4. `eslint-disable`, `@ts-ignore`, `any` 캐스팅으로 에러를 덮지 않는다.
5. 플레이스홀더 텍스트를 최종 코드에 남기지 않는다. 미완성은 `// TODO:`로 명시.
6. **내가 제공하지 않은 경력·수치·실적을 지어내지 않는다.** 이력서·프로젝트 페이지는 특히 엄격히 적용.
7. 빌드가 깨진 상태로 다음 작업으로 넘어가지 않는다.

---

## 작업 방식

1. 코드 작성 전 **변경할 파일 목록과 계획**을 제시하고 승인을 받는다.
2. 구현 후 반드시 실행한다: `npm run typecheck && npm run lint && npm run build`
3. 완료 시 **변경 요약 + 남은 TODO + 추가한 의존성**을 보고한다.
4. 판단이 갈리는 지점(라이브러리 선택, 아키텍처 분기)은 임의 결정하지 말고 선택지와 트레이드오프를 제시한다.
5. 추측을 사실처럼 쓰지 않는다. 확인이 필요하면 "확인 필요"로 표시한다.

---

## 커밋

Conventional Commits. 한 커밋 = 한 논리 단위.

```
feat: 블로그 목록 페이지 구현
fix: 다크모드 초기 렌더 깜빡임 제거
perf: 코드블록 컴포넌트 지연 로드
chore: eslint 설정 정리
docs: README 배포 절차 추가
```

---

## AGENTS.md 와의 관계

`AGENTS.md`는 create-next-app이 생성한 Next.js 공식 가이드다.
프레임워크 사용법은 `AGENTS.md`를 따르되, **충돌 시 이 문서(CLAUDE.md)가 우선한다.**

---

## 성능·접근성 목표 (Sprint 5 기준)

| 항목 | 목표 |
|---|---|
| Lighthouse Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| CLS | < 0.1 |
| LCP | < 2.5s |
| INP | < 200ms |

---

## 스프린트

| Sprint | 범위 |
|---|---|
| 1 | 세팅, 디자인 토큰, 레이아웃, 다크모드 |
| 2 | MDX 파이프라인, 블로그 목록·상세, Shiki, TOC |
| 3 | Projects, Resume, About, Home |
| 4 | SEO, RSS, sitemap, 검색, Giscus, GA4 |
| 5 | 성능, 접근성, 테스트, CI/CD |

**현재 진행 중: Sprint 1**
