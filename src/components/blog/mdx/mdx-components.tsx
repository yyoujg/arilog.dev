import type { HTMLAttributes } from "react";
import type { MDXComponents } from "mdx/types";

import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/blog/mdx/code-block";
import { Callout } from "@/components/blog/mdx/callout";
import { MdxImage } from "@/components/blog/mdx/mdx-image";
import { MdxLink } from "@/components/blog/mdx/mdx-link";

// 표는 not-prose 스크롤 컨테이너로 감싸고, 표 스타일은 토큰으로 직접 지정한다.
function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse text-sm",
          "[&_th]:border-border [&_th]:border-b [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
          "[&_td]:border-border [&_td]:border-b [&_td]:px-3 [&_td]:py-2",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  pre: CodeBlock,
  a: MdxLink,
  table: Table,
  // 마크다운 이미지 ![](): rehype-image-size가 크기를 주입한 img를 받는다.
  img: MdxImage,
  Callout,
};
