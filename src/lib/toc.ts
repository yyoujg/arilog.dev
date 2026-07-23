import GithubSlugger from "github-slugger";

import type { TocItem } from "@/types/post";

// 인라인 마크다운(`code`, **bold**, [text](url)) 흔적 제거해 표시 텍스트만 남긴다.
function stripInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

/**
 * 본문에서 h2/h3를 추출한다. id는 rehype-slug와 동일한 github-slugger로 생성.
 * ponytail: 모든 heading(h1~h6)을 순서대로 slugger에 먹여 dedup 카운터를
 * rehype-slug와 일치시킨다. 코드펜스 안의 '#'은 먼저 제거한다.
 */
export function extractToc(content: string): TocItem[] {
  const withoutCode = content.replace(/```[\s\S]*?```/g, "");
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];

  for (const line of withoutCode.split("\n")) {
    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const level = match[1].length;
    const text = stripInline(match[2]);
    const id = slugger.slug(text); // h1~h6 전부 순서대로 소비
    if (level === 2 || level === 3) {
      toc.push({ id, text, level });
    }
  }
  return toc;
}
