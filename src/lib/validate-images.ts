import { inspectImage } from "@/lib/image-size";

export interface ImageRef {
  file: string; // MDX 파일 경로 (예: react/use-memo.mdx)
  src: string; // MDX에 적힌 이미지 경로
}

// 본문 마크다운 이미지 ![alt](src "title") 의 src 추출.
export function extractImageSrcs(content: string): string[] {
  const srcs: string[] = [];
  const re = /!\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)[^)]*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    srcs.push(m[1].replace(/^<|>$/g, ""));
  }
  return srcs;
}

function formatError(file: string, src: string, detail: string): string {
  return `  - ${file}\n      이미지: ${src}\n      ${detail}`;
}

/**
 * 본문·thumbnail 이미지를 전부 검증한다.
 * - dev: 실패해도 빌드를 막지 않고 warn만 (초안 작성 흐름 보호)
 * - production: 전체를 스캔해 누락 목록을 모아 한 번에 출력하고 빌드 실패
 * - 원격 URL은 스킵하고 remotePatterns 안내만 남긴다
 */
export function validateImages(refs: ImageRef[]): void {
  const errors: string[] = [];
  const remotes: ImageRef[] = [];

  for (const { file, src } of refs) {
    const info = inspectImage(src);
    switch (info.status) {
      case "ok":
      case "svg":
        break;
      case "remote":
        remotes.push({ file, src });
        break;
      case "missing":
        errors.push(
          formatError(file, src, `해석 경로: ${info.resolved} (파일 없음)`),
        );
        break;
      case "case":
        errors.push(
          formatError(
            file,
            src,
            `대소문자 불일치: ${src} → 실제 파일은 ${info.actual}`,
          ),
        );
        break;
      case "unsupported":
        errors.push(
          formatError(file, src, `지원하지 않는 포맷: ${info.resolved}`),
        );
        break;
    }
  }

  for (const r of remotes) {
    console.warn(
      `[image] 원격 이미지 스킵: ${r.src} (${r.file}) — next.config images.remotePatterns 설정 필요`,
    );
  }

  if (!errors.length) return;

  const message = `이미지 검증 실패 (${errors.length}건):\n${errors.join("\n")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(`[image] ${message}`);
}
