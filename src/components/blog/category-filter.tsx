import Link from "next/link";

import type { CountItem } from "@/types/post";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: CountItem[];
  active?: string; // 현재 카테고리. 없으면 "전체"
}

// 쿼리스트링이 아니라 /categories/[category] 라우트로 이동하는 링크형 필터.
export function CategoryFilter({ categories, active }: CategoryFilterProps) {
  return (
    <nav aria-label="카테고리 필터" className="flex flex-wrap gap-2">
      <FilterLink href="/blog" label="전체" active={!active} />
      {categories.map((c) => (
        <FilterLink
          key={c.name}
          href={`/categories/${encodeURIComponent(c.name)}`}
          label={`${c.name} (${c.count})`}
          active={active === c.name}
        />
      ))}
    </nav>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
