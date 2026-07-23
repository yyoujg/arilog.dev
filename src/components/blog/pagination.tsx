import Link from "next/link";

import { cn } from "@/lib/utils";

function pageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="페이지네이션"
      className="mt-10 flex items-center justify-center gap-1"
    >
      {hasPrev && (
        <Link
          href={pageHref(currentPage - 1)}
          rel="prev"
          className="border-border hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
        >
          이전
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            page === currentPage
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted",
          )}
        >
          {page}
        </Link>
      ))}
      {hasNext && (
        <Link
          href={pageHref(currentPage + 1)}
          rel="next"
          className="border-border hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
        >
          다음
        </Link>
      )}
    </nav>
  );
}
