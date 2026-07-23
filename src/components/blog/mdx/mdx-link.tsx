import type { AnchorHTMLAttributes } from "react";
import Link from "next/link";

// 외부 링크는 target=_blank + rel 보안 속성 자동. 내부 링크는 next/link.
export function MdxLink({
  href = "",
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = /^https?:\/\//.test(href);
  const isHash = href.startsWith("#");

  // 해시 링크(autolink-headings가 만든 앵커 포함)는 plain <a>.
  if (isHash) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
