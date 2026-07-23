// 단독 줄 이미지는 remark가 <p>로 감싼다. MdxImage가 <figure>를 렌더하면
// <p> 안에 <figure>가 들어가 HTML 명세 위반 → hydration 불일치가 난다.
// 이 플러그인은 "이미지 하나만 든 <p>"를 해제하고 그 img에 data-block 마커를 심는다.
// 텍스트가 섞인 문단은 건드리지 않는다(인라인 이미지). 무의존성 수동 워크.

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

// 공백만 있는 텍스트 노드는 무시하고 의미 있는 자식만 센다.
function meaningful(node: HastNode): HastNode[] {
  return (node.children ?? []).filter(
    (c) => !(c.type === "text" && /^\s*$/.test(c.value ?? "")),
  );
}

// p의 의미 있는 자식이 img 하나뿐이거나, img 하나만 감싼 <a> 하나뿐이면
// 그 img를 반환한다. (링크 이미지 [![]()]()도 동일 처리 — 근거는 보고 참고)
function blockImageOf(p: HastNode): HastNode | null {
  const kids = meaningful(p);
  if (kids.length !== 1) return null;
  const only = kids[0];
  if (only.type === "element" && only.tagName === "img") return only;
  if (only.type === "element" && only.tagName === "a") {
    const inner = meaningful(only);
    if (inner.length === 1 && inner[0].tagName === "img") return inner[0];
  }
  return null;
}

function visit(node: HastNode) {
  if (node.children) {
    node.children = node.children.map((child) => {
      if (child.type === "element" && child.tagName === "p") {
        const img = blockImageOf(child);
        if (img) {
          (img.properties ??= {})["data-block"] = "true";
          // p를 해제하고 의미 있는 단일 자식(img 또는 a)을 승격.
          return meaningful(child)[0];
        }
      }
      return child;
    });
    node.children.forEach(visit);
  }
}

export function rehypeUnwrapImages() {
  return (tree: HastNode) => visit(tree);
}
