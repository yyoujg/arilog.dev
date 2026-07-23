import type { ReactElement } from "react";

import { highlightCode } from "@/lib/shiki";
import { CopyButton } from "@/components/blog/mdx/copy-button";

interface CodeChildProps {
  className?: string;
  children?: string;
}

interface CodeBlockProps {
  children?: ReactElement<CodeChildProps>;
  "data-title"?: string;
  "data-highlight"?: string;
  "data-line-numbers"?: string;
}

// MDX <pre> override. 서버에서 Shiki로 하이라이트하고, 복사 버튼만 client.
export async function CodeBlock({
  children,
  "data-title": title,
  "data-highlight": highlight,
  "data-line-numbers": lineNumbers,
}: CodeBlockProps) {
  const codeProps = children?.props;
  const raw = String(codeProps?.children ?? "").replace(/\n$/, "");
  const lang = codeProps?.className?.replace(/^language-/, "");

  const html = await highlightCode(raw, lang, {
    highlight,
    showLineNumbers: lineNumbers === "true",
  });

  return (
    <figure className="border-code-border bg-code-bg not-prose my-6 overflow-hidden rounded-lg border text-sm">
      {title && (
        <figcaption className="border-code-border text-muted-foreground border-b px-4 py-2 font-mono text-xs">
          {title}
        </figcaption>
      )}
      <div className="relative">
        <CopyButton code={raw} />
        {/* html은 빌드타임 1차 콘텐츠(우리 MDX)를 Shiki가 escape해 생성한 것.
            사용자 입력이 아니므로 sanitize 불필요 — 표준 하이라이트 패턴. */}
        <div
          className="shiki-container overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </figure>
  );
}
