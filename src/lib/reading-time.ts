// 읽는 시간(분) 추정. 한글(CJK)과 라틴을 분리해 가중한다.
// 한글 ~500자/분, 영어 ~200단어/분. 코드/기호는 대략 무시.
// ponytail: 정확한 리딩속도는 개인차가 있으니 상수 두 개를 조절 노브로 남긴다.
const CJK_PER_MIN = 500;
const WORDS_PER_MIN = 200;

export function readingTime(content: string): number {
  // 코드펜스 제거 (읽는 시간 왜곡 방지)
  const text = content.replace(/```[\s\S]*?```/g, "");
  const cjk = (text.match(/[ㄱ-힝一-鿿぀-ヿ]/g) || []).length;
  const words = (
    text.replace(/[ㄱ-힝一-鿿぀-ヿ]/g, " ").match(/\b[\w'-]+\b/g) || []
  ).length;
  const minutes = cjk / CJK_PER_MIN + words / WORDS_PER_MIN;
  return Math.max(1, Math.round(minutes));
}

// self-check: node --experimental-strip-types src/lib/reading-time.ts
if (process.argv[1]?.endsWith("reading-time.ts")) {
  const en = Array(400).fill("word").join(" "); // 400 words -> 2분
  const ko = "가".repeat(1000); // 1000자 -> 2분
  console.assert(readingTime(en) === 2, `en: ${readingTime(en)}`);
  console.assert(readingTime(ko) === 2, `ko: ${readingTime(ko)}`);
  console.assert(readingTime("short") === 1, "min 1분");
  console.log("reading-time ok");
}
