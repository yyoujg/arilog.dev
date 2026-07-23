import Link from "next/link";

import type { CountItem } from "@/types/post";
import { cn } from "@/lib/utils";

// 쿼리스트링이 아니라 /projects/stack/[stack] 정적 라우트로 이동하는 링크형 필터.
export function StackFilter({
  stacks,
  active,
}: {
  stacks: CountItem[];
  active?: string;
}) {
  return (
    <nav aria-label="스택 필터" className="flex flex-wrap gap-2">
      <FilterLink href="/projects" label="전체" active={!active} />
      {stacks.map((s) => (
        <FilterLink
          key={s.name}
          href={`/projects/stack/${encodeURIComponent(s.name)}`}
          label={`${s.name} (${s.count})`}
          active={active === s.name}
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
