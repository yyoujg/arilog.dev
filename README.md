# Ari.dev ([arilog.dev](https://arilog.dev))

3년차 프론트엔드 개발자의 기술 블로그 겸 포트폴리오.

## 스택

- **Next.js 16** (App Router, Turbopack)
- **React 19.2** / **TypeScript** (strict)
- **TailwindCSS v4** + **shadcn/ui**
- **next-themes** (system / light / dark)
- **Pretendard** (`next/font/local`)
- 배포: **Vercel**

## 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 실행
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run format       # Prettier 포맷팅
npm run format:check # Prettier 검사
```

## 폴더 구조

```
src/
  app/          라우트
  components/   common/ layout/ ui/ ...
  lib/          유틸, 폰트
  constants/    사이트 메타, 네비
  styles/       (예정)
  assets/fonts/ Pretendard woff2 (README 참고)
content/        MDX 콘텐츠 (Sprint 2~)
```

## 환경변수

`.env.example` 참고. `.env.local` 에 값을 넣는다.

| 변수                   | 설명                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | 사이트 절대 URL(프로토콜 포함). canonical·OG·sitemap·RSS 기준. 미설정 시 `VERCEL_PROJECT_PRODUCTION_URL` → `localhost` 순. |
| `SITE_INDEXABLE`       | `"true"`/`"false"` 색인 허용 강제. 미설정 시 `VERCEL_ENV === "production"` 에서만 허용(그 외 차단).                        |

`VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL` 은 Vercel이 자동 주입한다. 프리뷰 배포(`VERCEL_ENV=preview`)는 robots·robots meta 로 색인이 차단된다.

## 폰트 설정

`src/assets/fonts/README.md` 참고. `PretendardVariable.woff2` 를 넣고 `layout.tsx` 2줄을 활성화한다.

## 개발 규칙

프로젝트 규칙은 [`CLAUDE.md`](./CLAUDE.md) 를 따른다.
