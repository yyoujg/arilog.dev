# 폰트 파일

Pretendard (OFL-1.1, `LICENSE.txt`).

## 본문 (next/font/local, `src/lib/fonts.ts`)

지원 웨이트 **400 / 600 / 700**. 서브셋 woff2:

- `Pretendard-Regular.subset.woff2` (400)
- `Pretendard-SemiBold.subset.woff2` (600)
- `Pretendard-Bold.subset.woff2` (700)

`font-medium`(500)·`font-light`(300)은 쓰지 않는다(한글 육안 무구분 + 각 261K).
자세한 규칙은 루트 `CLAUDE.md`의 "폰트 웨이트" 참고.

## OG 이미지 (`src/lib/og.tsx`)

satori는 woff2 미지원 → OTF 사용. 전체 글리프 파일을 두고 `subset-font`가
빌드타임에 제목별로 서브셋한다.

- `Pretendard-Regular.otf`, `Pretendard-Bold.otf`
