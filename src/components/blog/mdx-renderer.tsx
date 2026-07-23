import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { rehypeCodeMeta } from "@/lib/rehype-code-meta";
import { rehypeImageSize } from "@/lib/rehype-image-size";
import { rehypeUnwrapImages } from "@/lib/rehype-unwrap-images";
import { mdxComponents } from "@/components/blog/mdx/mdx-components";

export function MdxRenderer({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        // next-mdx-remote는 기본으로 JS 표현식을 제거한다(removeJavaScriptExpressions).
        // 그 결과 {expr} 자식과 prop={expr} 표현식 속성이 조용히 사라진다.
        // 기본값에 의존하지 않고 명시한다(향후 기본값 변경 대비 + 자기문서화).
        // 표현식이 필요 없는 대신, 삭제되는 표현식은 빌드타임 lintMdx가 사전에 잡는다.
        blockJS: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            rehypeCodeMeta,
            // image-size는 img에 크기/마커를, unwrap-images는 data-block을 심는다.
            // 서로 다른 property를 노드 정체성 유지한 채 건드리므로 순서 무관.
            rehypeImageSize,
            rehypeUnwrapImages,
          ],
        },
      }}
    />
  );
}
