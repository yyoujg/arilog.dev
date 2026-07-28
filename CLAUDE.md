# Ari.dev (arilog.dev)

3년차 프론트엔드 개발자의 기술 블로그 겸 포트폴리오.
이력서에 첨부되는 사이트이므로 **코드 품질 자체가 결과물**이다. 동작만 하는 코드는 실패다.

Repo: https://github.com/yyoujg/arilog.dev

---

## 스택 (확정 — 변경이 필요하면 먼저 물어볼 것)

| 분야          | 기술                                          |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 16 App Router                         |
| React         | 19                                            |
| Language      | TypeScript (strict)                           |
| 번들러        | Turbopack (기본값)                            |
| 패키지 매니저 | **npm**                                       |
| 스타일        | **TailwindCSS v4** + shadcn/ui (new-york)     |
| 포맷터        | Prettier + prettier-plugin-tailwindcss        |
| 콘텐츠        | MDX — `gray-matter` + `next-mdx-remote/rsc`   |
| 하이라이트    | Shiki                                         |
| 폰트          | Pretendard (`next/font/local`, 400/600/700)   |
| 검색          | 빌드타임 `search-index.json` + substring 필터 |
| 댓글          | Giscus (지연 로드)                            |
| 분석          | GA4 (`@next/third-parties`)                   |
| 테스트        | Playwright (`e2e/`)                           |
| CI            | GitHub Actions (`.github/workflows/ci.yml`)   |
| 배포          | Vercel                                        |

### 검색 엔진 결정 — FlexSearch 아님

글 3~6편 규모에서는 `text.includes(query)` 클라이언트 필터가 한글 부분일치를 100% 처리하고 신규 의존성도 없다. FlexSearch의 토크나이징·랭킹은 이 규모에서 과설계이며, 한글 부분일치를 tokenize 옵션으로 검증하는 비용도 없앤다.

**글이 10편 이상 누적되면 FlexSearch(tokenize:full 또는 n-gram) 재검토.** 그 전까지는 substring을 유지한다.

### 쓰지 않는 것

- `next-sitemap` — Next 16 내장 `app/sitemap.ts` / `app/robots.ts` 사용
- Plausible — GA4 단독
- Contentlayer — 유지보수 중단
- `@next/mdx` — webpack 로더 의존, Turbopack 기본 환경과 맞지 않음
- CSS-in-JS, MUI/Chakra 등 외부 UI 라이브러리
- FlexSearch — 위 결정 참고. 글이 쌓이기 전까지 도입하지 않는다

---

## 명령어

```bash
npm run dev            # 개발 서버
npm run build           # 프로덕션 빌드 (prebuild가 search-index.json 자동 생성)
npm run start           # 프로덕션 실행
npm run lint            # ESLint
npm run typecheck       # next typegen && tsc --noEmit
npm run format           # Prettier 적용
npm run format:check     # Prettier 검사
npm run test:e2e         # Playwright 스모크 테스트
```

`next lint`는 Next 16에서 제거됐다. ESLint CLI를 직접 호출한다.

### `typecheck`가 `next typegen`을 먼저 실행하는 이유

`PageProps` 등 라우트 타입은 `next build`/`next dev`가 `.next/types/`에 생성하는 전역 타입이다. 클린 체크아웃(CI)은 이 타입이 없는 상태에서 `tsc --noEmit`이 먼저 돌면 `Cannot find name 'PageProps'`로 실패한다. 로컬은 이전 dev/build 실행으로 `.next/types`가 남아 있어 통과하는 것처럼 보이므로 속지 말 것.

**이 스크립트를 원복하지 않는다.** ci.yml 쪽에서 순서를 바꾸는 방식은 로컬 클린 클론에서는 여전히 깨진다 — 반드시 `package.json`의 `typecheck` 스크립트 자체에서 해결한다.

---

## Next.js 16 필수 규칙

동기 접근이 완전히 제거됐다. 아래는 **전부 async**다.

```ts
export default async function Page(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const query = await props.searchParams;
}
```

- 라우트 타입은 Next 16 헬퍼(`PageProps<'...'>`, `LayoutProps<'...'>`)를 사용한다. 수동 인터페이스 정의 금지.
- `next.config.ts`에 커스텀 webpack 설정을 추가하지 않는다. Turbopack이 무시한다.
- 미들웨어가 필요하면 `middleware.ts`가 아니라 `proxy.ts`. (현재 미사용)
- 정적 라우트는 `metadata` export를 쓴다. `generateMetadata`는 동적 라우트 전용.
- 블로그 글은 `generateStaticParams`로 정적 생성한다.

---

## Tailwind v4 규칙

**v3 방식으로 작성하지 말 것.**

- `tailwind.config.ts` / `tailwind.config.js`를 만들지 않는다. 설정은 `globals.css`의 `@theme inline` 블록에 있다.
- 플러그인은 PostCSS(`@tailwindcss/postcss`) 경유. 애니메이션은 `tw-animate-css`.
- 색상은 **CSS 변수 토큰으로만** 참조한다. `#hex`, `bg-slate-700` 같은 기본 팔레트 직접 사용 금지.
- 토큰은 shadcn 규격 풀세트 + 프로젝트 전용(`code-bg`, `code-border`)을 쓴다. 새 토큰이 필요하면 먼저 제안할 것.

---

## RSC 경계 규칙 (중요 — 위반 시 빌드 실패)

**Server Component가 기본.** `"use client"`는 상태·이벤트 핸들러·브라우저 API가 필요할 때만,
컴포넌트 트리 최하단에 붙여 경계를 최소화한다.

### Button

`@radix-ui/react-slot`이 `"use client"` 없이 top-level에서 `createContext`를 호출한다
(`index.mjs`: `var SlotContext = React.createContext(mergeProps)`).
따라서 **`Button`을 import하는 서버 컴포넌트는 `createContext is not a function`으로 빌드 실패한다.**

| 상황                                            | 사용                             |
| ----------------------------------------------- | -------------------------------- |
| 서버 컴포넌트에서 링크 버튼이 필요              | `buttonVariants()` + `next/link` |
| client 컴포넌트에서 실제 버튼(onClick, asChild) | `Button`                         |

- `buttonVariants`는 Slot을 import하지 않는 **`src/components/ui/button-variants.ts`** 에서 가져온다.
  `button.tsx`에서 가져오면 같은 모듈 그래프라 동일하게 깨진다. (트리셰이킹은 이 문제를 막지 못한다 — 오염은 import 단위로 일어난다.)
- `button.tsx`에 `"use client"`를 붙여 우회하지 않는다. 클라이언트 경계가 불필요하게 늘어난다.

### lucide-react

lucide는 RSC 호환된다(`Icon.mjs`/`context.mjs`에 `"use client"` 존재). 서버 컴포넌트에서 렌더 가능.
단 **브랜드 아이콘(GitHub, LinkedIn 등)은 제공하지 않으므로** 인라인 SVG를 쓴다.

### 새 shadcn 컴포넌트 추가 시

Radix 의존성이 RSC 안전한지 먼저 확인하고, 서버/클라이언트 어느 쪽에서 쓸지 명시할 것. "use client" 유무를 추측하지 말고 패키지 소스(node_modules 또는 npm registry tarball)를 직접 열어 확인한다.

### client 경계는 이미지 로딩 타이밍에도 영향을 준다

`next/image`가 client 컴포넌트 경계 뒤에서 렌더되면 하이드레이션 이후에야 이미지가 요청될 수 있다. LCP 요소가 이미지인 페이지에서는 그 이미지까지의 컴포넌트 트리가 서버에서 렌더되는지 먼저 확인한다.

---

## 아키텍처 규칙

- 데이터 접근(fs, 파싱, 인덱싱)은 `src/lib/` 안에서만. 컴포넌트에서 `fs` 직접 호출 금지.
- 컴포넌트 파일 1개당 export 1개. 파일명 kebab-case, 컴포넌트명 PascalCase.
- `any` 금지. 불가피하면 `unknown` + 타입가드. `as` 단언은 근거를 주석으로 남긴다.
- 하드코딩 문자열·URL·설정값은 `src/constants/`로 분리.
- 환경변수는 zod로 검증 후 export한다. `process.env` 직접 참조 금지.
  - `src/lib/env.ts` — 서버 전용 값
  - `src/lib/env.client.ts` — `NEXT_PUBLIC_*` 전용. 서버 값이 클라이언트 번들에 새지 않도록 반드시 분리한다
  - Giscus·GA4처럼 값이 없어도 되는 기능은 해당 변수를 `.optional()`로 선언해, 값이 없을 때 기능이 조용히 비활성화되게 만든다(빌드·CI가 시크릿 없이도 통과해야 한다)
- 애니메이션은 `prefers-reduced-motion`을 존중한다.
- 외부 링크 클릭 등 컴포넌트별로 흩어지는 이벤트는 각 컴포넌트를 client로 전환하기보다, 문서 레벨 위임 리스너 하나로 처리해 client 경계 증가를 최소화한다.

---

## 폴더 구조

```
src/
  app/                  라우트, sitemap.ts, robots.ts, rss.xml/route.ts
  components/
    common/             theme-provider, theme-toggle, external-link-tracker 등
    layout/             header, footer, container, mobile-nav, search-dialog
    blog/                comments.tsx(Giscus) 등
    project/  seo/
    ui/                 shadcn 컴포넌트 + button-variants.ts
  lib/                  utils(cn), fonts, mdx, search, seo, analytics, env, env.client
  hooks/  utils/  styles/  constants/  types/  assets/
content/
  react/  nextjs/  typescript/ ...    글 MDX
  projects/                           프로젝트 MDX
scripts/                              빌드 스크립트 (build-search-index.mts 등)
e2e/                                  Playwright 스모크 테스트
.github/workflows/                    ci.yml
```

---

## 콘텐츠 스키마

Frontmatter는 zod로 검증하고, **검증 실패 시 빌드를 실패시킨다.**

```yaml
---
title: string # 필수
description: string # 필수, 메타 description으로 사용
date: YYYY-MM-DD # 필수
category: string # 필수
tags: string[] # 필수
thumbnail: string? # 선택
series: string? # 선택
draft: boolean # 필수
---
```

- slug는 파일 경로 기반. `content/react/usememo.mdx` → `react/usememo`
- `draft: true`는 production 빌드에서 제외, dev에서는 표시.

---

## 금지사항

1. 지시하지 않은 npm 패키지 추가 금지. 필요하면 **이유 + 대안 + 번들 영향**을 먼저 제시하고 승인받는다.
2. 지시 범위 밖 파일 수정 금지.
3. 기존 파일 대량 재작성 금지. **최소 diff 원칙.**
4. `eslint-disable`, `@ts-ignore`, `any` 캐스팅, 불필요한 `"use client"`로 에러를 덮지 않는다.
   에러는 원인을 특정해서 고친다.
5. 플레이스홀더 텍스트를 최종 코드에 남기지 않는다. 미완성은 `// TODO:`로 명시.
6. **내가 제공하지 않은 경력·수치·실적·URL을 지어내지 않는다.** 모르면 `// TODO`로 남긴다.
   이력서·프로젝트 페이지에 특히 엄격히 적용.
7. 빌드가 깨진 상태로 다음 작업으로 넘어가지 않는다.
8. 근거 없이 재푸시하지 않는다. CI가 실패하면 로그를 직접 확인(`gh run view --log-failed`)하거나 사람에게 요청하고, 가설은 코드·로컬 재현으로 검증한 뒤에만 수정한다.

---

## 작업 방식

1. 코드 작성 전 **변경할 파일 목록과 계획**을 제시하고 승인을 받는다.
2. 구현 후 반드시 실행한다:
   `npm run typecheck && npm run lint && npm run format:check && npm run build`
   화면·상호작용이 걸린 작업은 `npm run test:e2e`도 실행한다.
3. 완료 시 **변경 요약 + 남은 TODO + 추가한 의존성**을 보고한다.
4. 판단이 갈리는 지점(라이브러리 선택, 아키텍처 분기)은 임의 결정하지 말고 선택지와 트레이드오프를 제시한다.
5. **추측을 사실처럼 쓰지 않는다.** 라이브러리 동작을 근거로 들 때는 실제 패키지 내용을 확인하고,
   확인하지 못했으면 "확인 필요"로 표시한다.
6. 브라우저 시각·상호작용 검증이 필요한 항목은 "미검증"으로 명시해 보고한다.
7. 빌드 통과는 완료가 아니다. 정적 HTML grep으로는 클라이언트 런타임 에러가 잡히지 않는다.
   화면을 만드는 작업은 dev 서버를 띄워 **브라우저 콘솔 에러 0개**를 확인하고 보고한다.
   확인하지 못했으면 "브라우저 미검증"으로 명시한다.

### 완료 보고 전 자가 점검

보고하기 전에 아래를 스스로 확인하고, 결과를 보고에 포함한다.

- [ ] 새로 만든 코드 경로가 실제로 실행됐는가? (샘플 데이터가 적어 분기를 안 탄 경우 데이터를 임시로 조정해 강제 실행할 것)
- [ ] `npm ci` 클린 설치에서도 빌드가 통과하는가?
- [ ] `npm run test:e2e`가 통과하는가?
- [ ] 라이브러리 동작을 근거로 들었다면 실제 패키지 내용을 확인했는가?
- [ ] 설정 완화로 문제를 덮지 않았는가?
- [ ] 검증하지 못한 항목을 "미검증"으로 명시했는가?

---

## 커밋

Conventional Commits. **타입 접두사는 영문, 본문은 한글.** 한 커밋 = 한 논리 단위.

```
feat: 블로그 목록 페이지 구현
fix: 다크모드 초기 렌더 깜빡임 제거
perf: 코드블록 컴포넌트 지연 로드
refactor: MDX 파싱 로직을 lib으로 분리
chore: ESLint 설정 정리
docs: README에 배포 절차 추가
test: 검색 인덱스 생성 유닛 테스트 추가
ci: GitHub Actions 워크플로 추가
```

- 본문은 "무엇을"보다 "왜"가 드러나게 쓴다.
- 마침표를 붙이지 않는다.
- 여러 논리 단위(기능 구현 + CI 연동 등)가 섞이면 별도 커밋으로 분리한다. 한 커밋에 성격이 다른 변경을 섞지 않는다.
- 새 기능이 다른 파일의 커밋을 전제로 한다면(예: e2e 테스트 커밋 없이 ci.yml만 커밋) 그 워크플로가 첫 실행부터 실패한다. 커밋 순서·의존관계를 미리 확인한다.
- 지시 없이 임의로 커밋·푸시하지 않는다.

---

## AGENTS.md 와의 관계

`AGENTS.md`는 create-next-app이 생성한 Next.js 공식 가이드다.
프레임워크 사용법은 `AGENTS.md`를 따르되, **충돌 시 이 문서(CLAUDE.md)가 우선한다.**

---

## 성능·접근성 목표

| 항목                   | 목표    |
| ---------------------- | ------- |
| Lighthouse Performance | 95+     |
| Accessibility          | 100     |
| Best Practices         | 100     |
| SEO                    | 100     |
| CLS                    | < 0.1   |
| LCP                    | < 2.5s  |
| INP                    | < 200ms |

### 측정 주의

- **localhost Lighthouse는 세션 간 편차가 크다** — 동일 HTML에 73~97 관측됨.
  성능 판단은 반드시 **배포 환경(프리뷰/프로덕션)** 에서 측정한다. localhost 수치로
  최적화 여부를 결정하지 않는다.
- **`next/font`의 `preload: false`는 Next 16에서 preload `<link>`를 제거하지 못한다**
  (실측 확인). 폰트 preload를 선택 제어하려면 next/font 옵션이 아니라 다른 방법이 필요하다.
- **Lighthouse 랩 데이터(특히 Slow-4G 시뮬레이션)를 실제 결함으로 단정하지 않는다.**
  실측(실제 이미지 로드 시간, 네트워크 워터폴)으로 재확인하고, 시뮬레이션 아티팩트인지
  구조적 문제인지 구분한 뒤 대응한다. 폰트가 원인이라는 가설도 반드시 되돌리기 가능한
  실험으로 검증하고, 효과가 없으면 즉시 원복한다.
- Render Delay 등 세부 지표가 측정마다 크게 요동치면(예: 3배 이상) "구조적 지연"이 아니라
  측정 자체의 불안정성(캐시 상태, on-demand 이미지 생성 등)을 먼저 의심한다.

### 측정 전 필수 절차

브라우저·curl·Lighthouse로 측정하기 전에 **반드시 기존 서버 프로세스를 완전히 종료**한다.
포트 3000에 남은 이전 빌드 프로세스가 옛 HTML을 서빙해 측정을 오염시킨 사례가
이 프로젝트에서 3회 발생했다(OG 헤더, priority 배선, robots 매트릭스).

- pkill만으로는 놓치는 프로세스가 있다. lsof로 포트 점유를 직접 확인하고 종료할 것
- 측정 결과가 코드와 모순되면 배선 버그를 의심하기 전에 stale 서버를 먼저 의심한다
- 임시 data 속성을 노출해 HTML이 최신인지 확인하는 것이 빠른 판별법이다

---

## Playwright / E2E 규칙

- 라우트 커버리지는 `sitemap.xml`을 파싱해 수집한다. 라우트 목록을 하드코딩하지 않는다.
- 검사 항목: HTTP 200, 콘솔 error/warning, hydration 경고, `<p>` 안 블록 요소 중첩(원본 SSR HTML을 대상으로 — 라이브 DOM은 브라우저가 복구해버려 못 잡는다), 375/768/1440 가로 오버플로우.
- **dev 서버로 실행한다.** 하이드레이션 경고와 잘못된 DOM 중첩 경고는 React가 development에서만 콘솔에 낸다. prod 빌드로는 못 잡는다.
- dev 전용 성능 힌트(예: LCP 이미지 조언)처럼 정확성과 무관한 경고는 정확히 좁은 패턴으로만 필터링한다. 실제 하이드레이션 경고까지 삼킬 만큼 넓은 키워드 매칭을 쓰지 않는다.
- **페이지 상태 확인 시 재시도 없는 동기 게터(`page.url()`, `element.textContent` 등)를 `.not.toBe()`류와 직접 비교하지 않는다.** 가능하면 auto-retry 단언(`expect(page).toHaveURL(...)`, `expect(locator).toHaveText(...)`)을 쓴다. 콜드 CI는 로컬(웜 `.next`)보다 라우트 컴파일·클라이언트 내비게이션이 느려, 동기 비교가 레이스로 실패할 수 있다.
- `search-index.json`은 gitignore 대상이고 `next dev`는 `prebuild`를 실행하지 않는다. CI에서 검색 관련 테스트를 돌리려면 테스트 실행 전에 `npm run prebuild`(또는 인덱스 생성 스크립트)를 명시적으로 실행해야 한다.

---

## CI (GitHub Actions)

- `.github/workflows/ci.yml`: `quality`(typecheck→lint→build) + `e2e`(playwright install → prebuild → test:e2e) 두 job, 병렬 실행.
- 시크릿 없이 통과해야 한다. Giscus/GA4 값이 없어도 `.optional()` env로 빌드·테스트가 깨지지 않는 구조를 유지한다. 새 환경변수를 추가할 때도 이 원칙을 지킬 것 — CI 시크릿이 꼭 필요해지는 경우가 아니면 optional로 설계한다.
- `run:` 스텝에 PR 제목 등 신뢰할 수 없는 입력을 그대로 사용하지 않는다(인젝션 방지).

### CI 로그 접근

`gh` CLI 인증이 안 되어 있으면 작업 시작 전에 알린다.

- 세션 시작 시 `gh auth status`로 인증 여부를 확인할 것
- Actions 로그·아티팩트는 공개 저장소여도 인증 없이 조회 불가하다(비대화형 세션에서 `gh auth login` 실행 불가). 인증돼 있으면 `gh run view --log-failed`로 직접 읽고 진단한다
- 로그를 못 읽는 상태에서 추측으로 재푸시하지 않는다. 유력 가설도 코드 근거로 먼저 검증하고, 그래도 원인이 안 좁혀지면 사람에게 정확한 로그를 요청한다

---

## 개발 환경 주의사항

- **zsh 인터랙티브 모드는 `#`를 주석으로 처리하지 않는다.** 인라인 주석이 붙은 명령을 그대로 실행하면 에러가 난다. zsh 인터랙티브 명령에는 인라인 주석을 넣지 않는다.

---

## 세션 운영 규칙

| 상황                                  | 대응                                                  |
| ------------------------------------- | ----------------------------------------------------- |
| 응답이 길어지고 파일을 잘못 짚기 시작 | 세션 종료 → 커밋 → 새 세션                            |
| 지시 안 한 패키지를 설치함            | 즉시 되돌리고 이 문서의 금지사항 재확인               |
| 한 스프린트가 안 끝남                 | 범위를 절반으로 쪼개서 재의뢰                         |
| 빌드 깨진 채 다음 작업 진행           | 절대 금지. 항상 green 상태에서 커밋                   |
| CI가 실패함                           | 로그부터 확보(위 CI 로그 접근 절차). 추측 재푸시 금지 |

---

## 스프린트

| Sprint | 범위                                                   | 상태 |
| ------ | ------------------------------------------------------ | ---- |
| 1      | 세팅, 디자인 토큰, 레이아웃, 다크모드, 라우트 스켈레톤 | 완료 |
| 2      | MDX 파이프라인, 블로그 목록·상세, Shiki, TOC           | 완료 |
| 3      | Projects, Resume, About, Home                          | 완료 |
| 4a     | SEO, sitemap, robots, RSS, OG 이미지                   | 완료 |
| 4b     | 검색(substring), Giscus, GA4                           | 완료 |
| 5      | Playwright 스모크, GitHub Actions CI                   | 완료 |

### 열린 TODO

- Giscus `repoId`/`categoryId`, GA4 Measurement ID를 Vercel 환경변수에 입력 — 넣기 전까지 댓글·분석은 조용히 비활성 상태(정상 동작)
- `error.tsx` 에러 리포팅 연동
- `blogsumnail` 프로젝트 상세 페이지 — 본인 트러블슈팅 1건·지표 준비되면 착수
- 검색: 글 10편 이상 누적 시 FlexSearch 재검토

---

## MDX 작성 제약 (next-mdx-remote blockJS)

`blockJS: true`(기본값)가 JSX의 표현식 속성과 본문 JS 표현식을 **경고 없이 제거**한다.

- MDX 컴포넌트 속성은 **문자열 리터럴 또는 불리언만** 사용한다.
  `<Callout type="info">` ✅ / `<Callout level={2}>` ❌ (속성이 조용히 사라짐)
- 본문에 `{expression}` 을 쓰지 않는다.
- import / export 를 쓰지 않는다.
- 숫자·계산값이 필요하면 rehype 플러그인으로 빌드타임에 주입한다
  (`rehype-image-size`, `rehype-code-meta` 참고).
- blockJS를 끄지 않는다. 끄면 콘텐츠에서 임의 JS 실행이 가능해진다.
- MDX 본문에서 JSX 문법·중괄호 표현식을 언급할 때는 **반드시 인라인 코드(백틱)로 감싼다.**
  감싸지 않으면 lint-mdx가 빌드를 실패시킨다. 표 셀 안에서도 동일하다.
- 린트를 완화해서 우회하지 않는다. 감싸는 쪽이 타이포그래피상으로도 옳다.
- 커스텀 MDX 컴포넌트가 블록 요소(figure, div, table 등)를 렌더할 때는
  HTML 중첩 규칙 위반(`<p>` 안의 블록 요소)이 없는지 확인한다.
  이 오류는 빌드를 통과하고 hydration 단계에서만 드러난다.

---

## 폰트 웨이트

지원 웨이트는 **400 / 600 / 700 뿐이다.** 각 웨이트마다 서브셋 파일이 261K씩 추가되므로
임의로 늘리지 않는다.

- `font-medium`(500), `font-light`(300) 사용 금지 → 600 또는 색상 위계로 대체
- 새 웨이트가 필요하면 먼저 제안하고 승인받는다
- 한글은 중간 웨이트 차이가 육안으로 구분되지 않으므로 굵기보다 색(text-muted-foreground)으로
  위계를 만든다
