// MDX/마크다운에서 코드 영역(펜스 블록 + 인라인 코드)을 공백으로 마스킹한다.
// 줄 수를 보존하므로 라인 번호 기반 리포트(lint-mdx)와 전체 문자열 정규식
// 스캔(이미지 추출) 양쪽에서 재사용할 수 있다. 코드펜스 안의 이미지 문법·중괄호
// 표현식은 렌더되는 콘텐츠가 아니라 예시 텍스트이므로 두 검증기가 동일하게
// 코드 영역을 제외해야 판정이 갈리지 않는다.

const FENCE = /^\s*(`{3,}|~{3,})/;

export function maskCodeRegions(text: string): string {
  let inFence = false;
  return text
    .split("\n")
    .map((line) => {
      // 펜스 구분선 자체도 제거 — 펜스 meta의 {1,3}·백틱 오탐 방지.
      if (FENCE.test(line)) {
        inFence = !inFence;
        return "";
      }
      if (inFence) return "";
      // 인라인 코드(백틱)는 길이만큼 공백으로 치환해 오프셋을 유지한다.
      return line.replace(/`[^`]*`/g, (m) => " ".repeat(m.length));
    })
    .join("\n");
}
