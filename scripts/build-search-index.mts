// 빌드타임 검색 인덱스 생성. prebuild 훅에서 실행 → public/search-index.json.
// 실행: node --experimental-strip-types scripts/build-search-index.ts
//
// mdx.ts의 로더를 재사용하지 않는다: 그쪽은 "@/" alias + 무거운 검증(lint/이미지)에
// 묶여 있어 standalone 스크립트에서 못 돌린다. 검색 인덱싱에 필요한 최소 파싱만 자체 구현.
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

// 글당 본문 상한. 검색 매칭엔 앞부분이면 충분하고, 파일 크기를 선형으로 묶는다.
// ponytail: 글이 길어지면 이 값만 올린다. 3편 기준 현재 전부 상한 미만.
const MAX_BODY_CHARS = 3000;

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_FILE = path.join(ROOT, "public", "search-index.json");

interface SearchDoc {
  slug: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    // 프로젝트는 블로그 검색 대상이 아니다(mdx.ts walk와 동일 규칙).
    if (entry.isDirectory() && entry.name === "projects") return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".mdx") ? [full] : [];
  });
}

// MDX 본문 → plain text. frontmatter는 이미 matter로 분리됨.
function toPlainText(mdx: string): string {
  return (
    mdx
      // 코드펜스(내용 통째로)
      .replace(/```[\s\S]*?```/g, " ")
      // 인라인 코드
      .replace(/`[^`]*`/g, " ")
      // 이미지: ![alt](url) → 제거
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      // 링크: [text](url) → text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // JSX/HTML 태그: <Callout ...>, </figure> 등
      .replace(/<[^>]+>/g, " ")
      // 헤딩/인용/리스트 마커, 강조 기호
      .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
      .replace(/^[ \t]*>[ \t]?/gm, "")
      .replace(/^[ \t]*[-*+][ \t]+/gm, "")
      .replace(/^[ \t]*\d+\.[ \t]+/gm, "")
      .replace(/[*_~]/g, "")
      // 표 구분선 |---|, 셀 파이프
      .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, " ")
      .replace(/\|/g, " ")
      // 공백 정리
      .replace(/\s+/g, " ")
      .trim()
  );
}

function build(): SearchDoc[] {
  return (
    walk(CONTENT_DIR)
      .map((file) => {
        const raw = fs.readFileSync(file, "utf8");
        const { data, content } = matter(raw);
        const slug = path
          .relative(CONTENT_DIR, file)
          .replace(/\.mdx$/, "")
          .split(path.sep)
          .join("/");
        return { data, content, slug };
      })
      // draft는 검색에서 제외(dev 포함). 미발행 글을 검색으로 노출하지 않는다.
      .filter((e) => e.data.draft !== true)
      .map((e): SearchDoc => ({
        slug: e.slug,
        url: `/blog/${e.slug}`,
        title: String(e.data.title ?? ""),
        description: String(e.data.description ?? ""),
        category: String(e.data.category ?? ""),
        tags: Array.isArray(e.data.tags) ? e.data.tags.map(String) : [],
        body: toPlainText(e.content).slice(0, MAX_BODY_CHARS),
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug))
  );
}

function main(): void {
  const docs = build();
  const json = JSON.stringify(docs);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, json, "utf8");
  const kb = (Buffer.byteLength(json, "utf8") / 1024).toFixed(1);
  console.log(`[search-index] ${docs.length} docs → ${OUT_FILE} (${kb} KB)`);
}

main();
