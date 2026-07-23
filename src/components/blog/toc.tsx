"use client";

import { useEffect, useState } from "react";
import { ListIcon } from "lucide-react";

import type { TocItem } from "@/types/post";
import { cn } from "@/lib/utils";

function useActiveHeading(ids: string[]): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // 상단 근처에 들어오는 heading을 현재 섹션으로 본다.
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function TocLinks({
  toc,
  active,
  onNavigate,
}: {
  toc: TocItem[];
  active: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1 text-sm">
      {toc.map((item) => (
        <li key={item.id} className={cn(item.level === 3 && "pl-4")}>
          <a
            href={`#${item.id}`}
            onClick={onNavigate}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "block py-1 transition-colors",
              active === item.id
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Toc({ toc }: { toc: TocItem[] }) {
  const active = useActiveHeading(toc.map((t) => t.id));
  if (!toc.length) return null;

  return (
    <>
      {/* 데스크톱: 우측 sticky */}
      <nav
        aria-label="목차"
        className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto lg:block"
      >
        <p className="text-foreground mb-2 text-sm font-semibold">목차</p>
        <TocLinks toc={toc} active={active} />
      </nav>

      {/* 모바일: 접이식 */}
      <details className="border-border bg-muted/40 group mb-8 rounded-lg border lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold">
          <ListIcon className="size-4" /> 목차
        </summary>
        <div className="px-4 pb-3">
          <TocLinks toc={toc} active={active} />
        </div>
      </details>
    </>
  );
}
