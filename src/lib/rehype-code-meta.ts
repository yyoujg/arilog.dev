// 코드펜스 meta(`title="x" {1,3-5} showLineNumbers`)를 부모 <pre>의 속성으로
// 옮긴다. CodeBlock(pre override)이 자기 props에서 바로 읽을 수 있게 한다.
// unist-util-visit 없이 수동 트리 워크(무의존성).

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  data?: { meta?: string };
  children?: HastNode[];
  value?: string;
}

function parseMeta(meta: string) {
  const title = /title="([^"]*)"/.exec(meta)?.[1];
  const highlight = /\{([\d,\-\s]+)\}/.exec(meta)?.[1]?.replace(/\s/g, "");
  const showLineNumbers = /\bshowLineNumbers\b/.test(meta);
  return { title, highlight, showLineNumbers };
}

function visit(node: HastNode) {
  if (node.type === "element" && node.tagName === "pre") {
    const code = node.children?.find(
      (c) => c.type === "element" && c.tagName === "code",
    );
    const meta = code?.data?.meta;
    if (code && meta) {
      const { title, highlight, showLineNumbers } = parseMeta(meta);
      node.properties ??= {};
      if (title) node.properties["data-title"] = title;
      if (highlight) node.properties["data-highlight"] = highlight;
      if (showLineNumbers) node.properties["data-line-numbers"] = "true";
    }
  }
  node.children?.forEach(visit);
}

export function rehypeCodeMeta() {
  return (tree: HastNode) => visit(tree);
}
