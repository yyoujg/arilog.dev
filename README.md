# Ari.dev ([arilog.dev](https://arilog.dev))

MDX 기반 기술 블로그 겸 포트폴리오. Next.js 16 App Router로 만들었다.

## 왜 만들었나

이력서에 함께 첨부하는 개인 사이트로, 글 발행과 프로젝트 기록을 위한 블로그 겸
포트폴리오가 필요해서 시작했다. 동시에 Next.js 16(App Router, Turbopack)과
React 19, Tailwind v4처럼 최신 스택을 실제 프로덕션 빌드·배포 과정까지 직접
겪어보기 위한 학습 목적도 있다.

TODO: 확인 필요 — 그 외 제작 동기(예: 특정 사이드 프로젝트 소개, 이직 준비 시점 등)는
코드만으로 확인할 수 없음.

## 기술적으로 신경 쓴 부분

- **빌드타임 콘텐츠 검증** — MDX frontmatter는 zod 스키마로 검증하고
  ([`src/lib/frontmatter.ts`](src/lib/frontmatter.ts)), 실패하면 빌드 자체를
  실패시킨다. 본문에서 참조하는 이미지 존재 여부([`src/lib/validate-images.ts`](src/lib/validate-images.ts)),
  글 slug가 `<카테고리>/<파일>` 2단계 구조를 지키는지도 로드 시점에 검사한다
  ([`src/lib/mdx.ts`](src/lib/mdx.ts)).
- **MDX 안전장치** — `next-mdx-remote`의 `blockJS`(기본 true)는 JSX 표현식·
  import/export를 경고 없이 조용히 제거한다. 이 실수를 빌드 시점에 잡기 위해
  자체 린터([`src/lib/lint-mdx.ts`](src/lib/lint-mdx.ts))를 만들어 금지 문법이
  섞이면 빌드를 실패시킨다.
- **검색은 인덱스 엔진 대신 substring 필터** — 글이 소수(10편 미만) 규모일 때는
  `text.includes()` 기반 부분일치가 한글 검색을 충분히 처리하고 런타임 의존성도
  없다고 판단해 FlexSearch 등을 붙이지 않았다([`src/lib/search.ts`](src/lib/search.ts)).
  빌드타임에 `search-index.json`을 생성해([`scripts/build-search-index.mts`](scripts/build-search-index.mts))
  Cmd/Ctrl+K 검색 다이얼로그가 최초 오픈 시에만 fetch한다.
- **RSC 경계 최소화** — `@radix-ui/react-slot`이 `"use client"` 없이 top-level에서
  `createContext`를 호출하는 탓에, 이를 import하는 서버 컴포넌트는 빌드가 깨진다.
  `Button` 컴포넌트를 서버 트리에서 직접 쓰지 않고 `buttonVariants`만 별도 모듈
  ([`src/components/ui/button-variants.ts`](src/components/ui/button-variants.ts))로
  분리해, 서버 컴포넌트는 이 모듈만 참조하도록 했다.
- **OG 이미지 생성** — `next/og`(Satori)로 페이지별 OG 이미지를 런타임 생성한다.
  Satori가 woff2를 지원하지 않아 Pretendard OTF를 쓰고, 이미지마다 실제로 쓰인
  글자만 `subset-font`로 서브셋해 폰트 용량을 줄인다([`src/lib/og.tsx`](src/lib/og.tsx)).
- **환경변수는 zod로 검증 후 export** — 서버 전용 값(`src/lib/env.ts`)과
  `NEXT_PUBLIC_*` 클라이언트 값(`src/lib/env.client.ts`)을 분리해 서버 값이
  클라이언트 번들에 섞이지 않게 한다. Giscus·GA4처럼 값이 없어도 되는 기능은
  `.optional()`로 선언해, 시크릿 없이도 CI 빌드가 통과하고 해당 기능은 조용히
  꺼지도록 설계했다.
- **색인 허용 여부는 fail-safe 기본값** — `SITE_INDEXABLE`을 명시하지 않으면
  `VERCEL_ENV === "production"`일 때만 색인을 허용한다. 로컬·프리뷰 빌드가
  실수로 색인되는 상황을 기본값으로 차단한다([`src/lib/env.ts`](src/lib/env.ts)).
- **Playwright 스모크 테스트가 라우트를 하드코딩하지 않음** — `sitemap.xml`을
  파싱해 전체 라우트를 수집한 뒤 순회하며 HTTP 200, 콘솔 에러/경고(하이드레이션
  경고 포함), SSR HTML상의 `<p>` 안 블록 요소 중첩, 375/768/1440px 가로
  오버플로우를 검사한다([`e2e/smoke.spec.ts`](e2e/smoke.spec.ts)).
- **CI는 시크릿 없이 통과** — GitHub Actions에서 `quality`(typecheck → lint →
  build)와 `e2e`(prebuild → playwright) 두 job을 병렬 실행하며, 위 optional
  환경변수 설계 덕분에 Giscus/GA4 키가 없어도 빌드·테스트가 깨지지 않는다
  ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## 구현된 기능

- **블로그** — MDX 글, 카테고리·태그·시리즈, 페이지네이션(`/blog/page/[page]`),
  읽는 시간, TOC, 이전/다음 글 내비게이션, Shiki 코드 하이라이팅.
- **프로젝트** — 별도 콘텐츠 소스(`content/projects`)로 관리되는 프로젝트 상세
  페이지. 프로젝트별 OG 이미지 자동 생성.
- **검색** — Cmd/Ctrl+K 다이얼로그, 빌드타임 인덱스 + substring 필터.
- **다크모드** — `next-themes` 기반 시스템/라이트/다크 전환.
- **SEO** — `sitemap.ts`/`robots.ts`(파일 기반 App Router 규약), RSS 피드
  (`feed` 패키지), 페이지별 OG 이미지 자동 생성, JSON-LD(Person/BlogPosting/
  TechArticle).
- **댓글** — Giscus, 스크롤 근접 시에만 지연 마운트(IntersectionObserver).
  환경변수 미설정 시 댓글 영역 자체가 렌더되지 않는다.
- **분석** — GA4(`@next/third-parties`), 검색어·외부 링크 클릭 이벤트 트래킹.
- **Guestbook / Uses** — 라우트만 존재, 페이지 내용은 "준비 중" 상태.

## 스택

`package.json` 기준.

| 분야          | 기술                                                       |
| ------------- | ---------------------------------------------------------- |
| Framework     | Next.js 16.2 (App Router, Turbopack)                       |
| React         | 19.2                                                       |
| Language      | TypeScript (strict)                                        |
| 패키지 매니저 | npm                                                        |
| 스타일        | TailwindCSS v4 + shadcn/ui (Radix 프리미티브)              |
| 콘텐츠        | MDX — `gray-matter` + `next-mdx-remote`                    |
| 하이라이트    | Shiki                                                      |
| 검증          | zod (frontmatter, 환경변수)                                |
| 폰트          | Pretendard (`next/font/local`), `subset-font`(OG 이미지용) |
| 검색          | 빌드타임 인덱스 + substring 필터 (`cmdk` UI)               |
| 댓글          | Giscus (`@giscus/react`)                                   |
| 분석          | GA4 (`@next/third-parties`)                                |
| RSS           | `feed`                                                     |
| 테스트        | Playwright (`e2e/`)                                        |
| CI            | GitHub Actions                                             |
| 배포          | Vercel                                                     |

## 로컬 실행 방법

```bash
npm install
npm run dev
```

기타 명령어:

```bash
npm run build          # 프로덕션 빌드 (prebuild가 search-index.json 자동 생성)
npm run start           # 프로덕션 실행
npm run lint             # ESLint
npm run typecheck       # next typegen && tsc --noEmit
npm run format           # Prettier 적용
npm run format:check     # Prettier 검사
npm run test:e2e         # Playwright 스모크 테스트 (dev 서버 대상)
```

`next lint`는 Next 16에서 제거되어 ESLint CLI를 직접 호출한다. `typecheck`가
`next typegen`을 먼저 실행하는 이유는 라우트 타입(`PageProps` 등)이
`.next/types/`에 빌드·dev 실행 시 생성되는 전역 타입이라서다 — 클린
체크아웃에서 `tsc --noEmit`만 먼저 돌리면 실패한다.

### 환경변수

`.env.example` 참고. 전부 optional이며, 값이 없으면 해당 기능만 조용히 꺼진다
(빌드는 항상 통과한다).

| 변수                             | 설명                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | 사이트 절대 URL. canonical/OG/sitemap/RSS 기준. 미설정 시 Vercel 프로덕션 URL → localhost 순 |
| `SITE_INDEXABLE`                 | 색인 허용 강제(`"true"`/`"false"`). 미설정 시 production 환경에서만 허용                     |
| `NEXT_PUBLIC_GA_ID`              | GA4 Measurement ID                                                                           |
| `NEXT_PUBLIC_GISCUS_REPO`        | Giscus 저장소 (`owner/repo`)                                                                 |
| `NEXT_PUBLIC_GISCUS_REPO_ID`     | Giscus repo ID                                                                               |
| `NEXT_PUBLIC_GISCUS_CATEGORY`    | Giscus 카테고리                                                                              |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | Giscus 카테고리 ID                                                                           |

`VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`은 Vercel이 자동 주입한다.

### 폰트 설정

`src/assets/fonts/README.md` 참고. Pretendard 파일을 로컬에 두고
`layout.tsx`에서 활성화한다.

## 개발 규칙

프로젝트 규칙은 [`CLAUDE.md`](./CLAUDE.md)를 따른다.
