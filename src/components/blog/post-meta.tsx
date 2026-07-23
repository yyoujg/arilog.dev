import Link from "next/link";

import { cn } from "@/lib/utils";

interface PostMetaProps {
  date: string; // YYYY-MM-DD
  readingTime: number;
  category?: string;
  className?: string;
}

export function PostMeta({
  date,
  readingTime,
  category,
  className,
}: PostMetaProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm",
        className,
      )}
    >
      <time dateTime={date}>{date.replace(/-/g, ".")}</time>
      <span aria-hidden>·</span>
      <span>{readingTime}분</span>
      {category && (
        <>
          <span aria-hidden>·</span>
          <Link
            href={`/categories/${encodeURIComponent(category)}`}
            className="hover:text-foreground transition-colors"
          >
            {category}
          </Link>
        </>
      )}
    </div>
  );
}
