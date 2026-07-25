// 빌드타임 MDX 린트. next-mdx-remote(blockJS:true)가 JS 표현식을 조용히
// 삭제하므로, 작성자가 표현식/import/export를 쓰면 사전에 잡아준다.
// - JSX 표현식 속성(prop={...}), 본문 표현식({...}), import/export 를 에러로
// - 코드블록(펜스)·인라인 코드는 검사 제외 (오탐 방지) — 이미지 검증과 동일한
//   maskCodeRegions로 코드 영역 판정을 공유한다.
// - 이미지 검증과 동일: dev warn / prod 집계 후 빌드 실패

import { maskCodeRegions } from "@/lib/mdx-code-mask";

export interface MdxSource {
  file: string; // MDX 파일 경로
  raw: string; // 원본 파일 텍스트 (frontmatter 포함)
}

interface LintIssue {
  file: string;
  line: number; // 1-based, 파일 기준
  text: string;
  message: string;
}

// frontmatter(선두 --- ... ---) 영역을 라인 수를 유지한 채 공백 처리한다.
// 본문 첫 줄이 우연히 --- 인 경우(수평선)와 구분하려고 선두 블록만 다룬다.
function blankFrontmatter(raw: string): string {
  const lines = raw.split("\n");
  if (lines[0]?.trim() !== "---") return raw;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      for (let j = 0; j <= i; j++) lines[j] = "";
      break;
    }
  }
  return lines.join("\n");
}

function lintOne(file: string, raw: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const rawLines = raw.split("\n");
  // frontmatter 제거 후 코드 영역 마스킹 — 두 단계 모두 라인 수를 보존하므로
  // scan[i]는 rawLines[i]와 정확히 대응한다(리포트는 원문 rawLines[i]로).
  const scan = maskCodeRegions(blankFrontmatter(raw)).split("\n");

  for (let i = 0; i < scan.length; i++) {
    const rawLine = rawLines[i];
    const lineNo = i + 1;
    const line = scan[i];

    if (/^\s*(import|export)\b/.test(line)) {
      issues.push({
        file,
        line: lineNo,
        text: rawLine,
        message: "import/export 문은 blockJS로 제거됨",
      });
      continue;
    }
    if (/=\{/.test(line)) {
      issues.push({
        file,
        line: lineNo,
        text: rawLine,
        message: "JSX 표현식 속성(prop={...})은 blockJS로 제거됨",
      });
      continue;
    }
    if (/\{\s*\.\.\./.test(line)) {
      issues.push({
        file,
        line: lineNo,
        text: rawLine,
        message: "JSX 스프레드 속성({...props})은 blockJS로 제거됨",
      });
      continue;
    }
    if (/(^|[^\\])\{/.test(line)) {
      issues.push({
        file,
        line: lineNo,
        text: rawLine,
        message: "본문 JS 표현식({...})은 blockJS로 제거됨",
      });
    }
  }

  return issues;
}

export function lintMdx(sources: MdxSource[]): void {
  const issues = sources.flatMap((s) => lintOne(s.file, s.raw));
  if (!issues.length) return;

  const body = issues
    .map(
      (x) =>
        `  - ${x.file}:${x.line}\n      ${x.message}\n      | ${x.text.trim()}`,
    )
    .join("\n");
  const message = `MDX 린트 실패 (${issues.length}건):\n${body}`;

  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(`[mdx-lint] ${message}`);
}
