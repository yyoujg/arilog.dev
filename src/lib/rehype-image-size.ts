import { inspectImage } from "@/lib/image-size";

// 마크다운 이미지(img)에 실제 파일 크기를 주입한다. rehype가 세팅한 property는
// MDX 컴포넌트 props로 정상 전달되므로(표현식 속성 유실 문제 회피), 이 경로로 넣는다.
// 크기를 못 얻는 경우는 마커를 달아 MdxImage가 폴백(plain/placeholder) 렌더하게 한다.

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function visit(node: HastNode) {
  if (node.type === "element" && node.tagName === "img") {
    const props = (node.properties ??= {});
    const src = typeof props.src === "string" ? props.src : "";
    const info = inspectImage(src);
    switch (info.status) {
      case "ok":
        props.width = info.width;
        props.height = info.height;
        break;
      case "svg":
      case "remote":
        // 크기 주입 없이 plain <img>로 렌더 (next/image 미사용).
        props["data-plain"] = "true";
        break;
      default:
        // missing / case / unsupported — prod에선 loadPosts에서 이미 빌드 실패.
        // dev에서만 도달하며 플레이스홀더로 렌더한다.
        props["data-missing"] = "true";
        break;
    }
  }
  node.children?.forEach(visit);
}

export function rehypeImageSize() {
  return (tree: HastNode) => visit(tree);
}
