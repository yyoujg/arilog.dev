// 빌드타임 MDX 린트. next-mdx-remote(blockJS:true)가 JS 표현식을 조용히
// 삭제하므로, 작성자가 표현식/import/export를 쓰면 사전에 잡아준다.
// - JSX 표현식 속성(prop={...}), 본문 표현식({...}), import/export 를 에러로
// - 코드블록(펜스)·인라인 코드는 검사 제외 (오탐 방지)
// - 이미지 검증과 동일: dev warn / prod 집계 후 빌드 실패

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

const FENCE = /^\s*(`{3,}|~{3,})/;

function stripInlineCode(line: string): string {
  return line.replace(/`[^`]*`/g, (m) => " ".repeat(m.length));
}

function lintOne(file: string, raw: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = raw.split("\n");

  let inFrontmatter = lines[0]?.trim() === "---";
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNo = i + 1;

    // frontmatter 블록 스킵
    if (inFrontmatter) {
      if (i > 0 && rawLine.trim() === "---") inFrontmatter = false;
      continue;
    }

    // 코드펜스 토글 (구분선 자체도 검사 제외 — 펜스 meta의 {1,3} 오탐 방지)
    if (FENCE.test(rawLine)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const line = stripInlineCode(rawLine);

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
