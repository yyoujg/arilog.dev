// JSON-LD 주입. XSS 방어: JSON 안의 '<'를 유니코드 이스케이프해
// </script> 나 <!-- 로 스크립트 컨텍스트를 탈출하지 못하게 한다.
// 데이터는 1차 콘텐츠(frontmatter/상수)지만 방어를 기본 적용한다.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
