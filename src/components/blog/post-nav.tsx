import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import type { PostMeta } from "@/types/post";

// 이전글(더 오래된) / 다음글(더 최신).
export function PostNav({
  prev,
  next,
}: {
  prev: PostMeta | null;
  next: PostMeta | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="이전/다음 글"
      className="border-border mt-12 grid grid-cols-1 gap-4 border-t pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          rel="prev"
          className="border-border hover:bg-muted group rounded-lg border p-4 transition-colors"
        >
          <span className="text-muted-foreground flex items-center gap-1 text-sm">
            <ArrowLeftIcon className="size-4" /> 이전 글
          </span>
          <span className="group-hover:text-primary mt-1 block font-medium">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          rel="next"
          className="border-border hover:bg-muted group rounded-lg border p-4 text-right transition-colors"
        >
          <span className="text-muted-foreground flex items-center justify-end gap-1 text-sm">
            다음 글 <ArrowRightIcon className="size-4" />
          </span>
          <span className="group-hover:text-primary mt-1 block font-medium">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
