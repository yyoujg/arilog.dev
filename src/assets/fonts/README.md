# 폰트 파일

이 디렉터리에 **`PretendardVariable.woff2`** 를 넣어야 한다.

- 출처: Pretendard 공식 배포 (https://github.com/orioncactus/pretendard/releases)
  - `packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`
- 파일명 그대로 `src/assets/fonts/PretendardVariable.woff2` 로 저장.

## 활성화 방법

파일을 넣은 뒤 `src/app/layout.tsx` 에서 2줄만 주석 해제한다:

```ts
import { pretendard } from "@/lib/fonts";
// ...
<html lang="ko" suppressHydrationWarning className={pretendard.variable}>
```

(현재는 파일이 없어 빌드가 깨지지 않도록 system-ui fallback으로 동작한다.)
