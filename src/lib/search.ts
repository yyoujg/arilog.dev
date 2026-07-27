import type { SearchDoc } from "@/types/post";

// substring 검색. FlexSearch 대신 부분일치로 간다 — 한글 토크나이저 이슈가 없고
// (text.includes가 자모 경계 무관하게 부분일치), 코퍼스가 작아 클라이언트 필터로 충분하다.
// ponytail: 글이 수백 편으로 늘면 그때 인덱스형 엔진 재검토. 현재 오버킬.

export interface SearchResult {
  doc: SearchDoc;
  score: number;
  // 본문 매칭 시 매칭 위치 주변 발췌(하이라이트용). 없으면 description으로 대체.
  snippet: string;
}

const SNIPPET_RADIUS = 40;

// 필드별 가중치. 제목 > 태그/설명 > 본문.
function scoreField(hay: string, needle: string, weight: number): number {
  return hay.toLowerCase().includes(needle) ? weight : 0;
}

function makeSnippet(body: string, needle: string): string | null {
  const i = body.toLowerCase().indexOf(needle);
  if (i === -1) return null;
  const start = Math.max(0, i - SNIPPET_RADIUS);
  const end = Math.min(body.length, i + needle.length + SNIPPET_RADIUS);
  return (
    (start > 0 ? "…" : "") +
    body.slice(start, end) +
    (end < body.length ? "…" : "")
  );
}

export function searchDocs(docs: SearchDoc[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];
  for (const doc of docs) {
    const score =
      scoreField(doc.title, q, 5) +
      scoreField(doc.tags.join(" "), q, 3) +
      scoreField(doc.description, q, 3) +
      scoreField(doc.body, q, 1);
    if (score === 0) continue;

    const snippet = makeSnippet(doc.body, q) ?? doc.description;
    results.push({ doc, score, snippet });
  }

  return results.sort(
    (a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title),
  );
}

// 텍스트를 질의어 기준으로 분할. UI가 hit 조각을 <mark>로 감싼다.
export function splitByQuery(
  text: string,
  query: string,
): Array<{ text: string; hit: boolean }> {
  const q = query.trim();
  if (!q) return [{ text, hit: false }];

  const parts: Array<{ text: string; hit: boolean }> = [];
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  let from = 0;
  for (;;) {
    const i = lower.indexOf(needle, from);
    if (i === -1) {
      if (from < text.length)
        parts.push({ text: text.slice(from), hit: false });
      break;
    }
    if (i > from) parts.push({ text: text.slice(from, i), hit: false });
    parts.push({ text: text.slice(i, i + needle.length), hit: true });
    from = i + needle.length;
  }
  return parts;
}

// self-check: node --experimental-strip-types src/lib/search.ts
if (process.argv[1]?.endsWith("search.ts")) {
  const docs: SearchDoc[] = [
    {
      slug: "react/rsc",
      url: "/blog/react/rsc",
      title: "createContext 서버 컴포넌트",
      description: "shadcn Button 빌드 에러",
      category: "react",
      tags: ["React", "RSC"],
      body: "서버 컴포넌트에서 Button을 쓰면 빌드가 깨진다",
    },
    {
      slug: "nextjs/mdx",
      url: "/blog/nextjs/mdx",
      title: "next-mdx-remote props",
      description: "표현식이 사라진다",
      category: "nextjs",
      tags: ["MDX"],
      body: "blockJS 보안 기능이 임의 JS 실행을 막는다",
    },
  ];

  // 한글 부분일치(자모/단어 경계 무관)
  console.assert(searchDocs(docs, "컨텍").length === 0, "컨텍: 없음"); // '컨텍'은 본문에 없음
  console.assert(searchDocs(docs, "빌드").length === 1, "빌드: 1건(doc1만)");
  console.assert(
    searchDocs(docs, "서버 컴포").length === 1,
    "공백 포함 부분일치",
  );
  console.assert(
    searchDocs(docs, "createcontext").length === 1,
    "영문 대소문자 무시",
  );
  // 제목 매칭이 본문 매칭보다 위
  const r = searchDocs(docs, "button" /* title+body vs body */);
  console.assert(r[0].doc.slug === "react/rsc", "제목 가중치 우선");
  // splitByQuery
  const parts = splitByQuery("빌드가 깨진다", "빌드");
  console.assert(parts[0].hit && parts[0].text === "빌드", "하이라이트 분할");
  console.log("search ok");
}
